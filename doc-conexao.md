# Conexão entre Salesforce e ComDinheiro na Página Visualizar Tabelas

## Visão Geral

Este documento descreve como funciona exatamente a conexão entre a lista de usuários puxada da base de dados do Salesforce com os dados de posição consolidada do ComDinheiro, quando consultados na página "visualizar_tabelas".

## Arquitetura do Sistema

### 1. Fluxo de Autenticação Salesforce

#### 1.1 OAuth Callback (`/callback`)

```python
# Localização: main.py, linhas 177-210
@app.route('/callback')
def callback():
    # Autoriza o token de acesso do Salesforce
    token = salesforce.authorize_access_token()
    session['token'] = token['access_token']
    
    # Obtém informações do usuário do Salesforce
    res = salesforce.get('https://login.salesforce.com/services/oauth2/userinfo')
    userinfo = res.json()
    session['user'] = userinfo
    
    # Consulta o grupo do usuário na tabela comdinheiro_credenciais
    query = """
        SELECT grupo 
        FROM comdinheiro_credenciais 
        WHERE salesforce_user_id = %s
    """
    result = consulta_bd(query, (userinfo['email'],))
    
    if result and len(result) > 0:
        session['grupo'] = result[0][0]
    else:
        session['grupo'] = 'convidado'  # Usuário não cadastrado
```

#### 1.2 Dados Armazenados na Sessão

Após o login bem-sucedido via Salesforce, o sistema armazena na sessão:

- `session['user']`: Informações completas do usuário Salesforce (incluindo email)
- `session['grupo']`: Grupo de permissão do usuário ('admin', 'gestor', 'convidado')
- `session['token']`: Token de acesso do Salesforce

### 2. Estrutura da Tabela `comdinheiro_credenciais`

A tabela `comdinheiro_credenciais` é o ponto central que conecta usuários do Salesforce com credenciais do ComDinheiro:

```sql
CREATE TABLE comdinheiro_credenciais (
    salesforce_user_id TEXT PRIMARY KEY,     -- Email do usuário Salesforce
    comdinheiro_username TEXT,               -- Usuário do ComDinheiro
    comdinheiro_password_encrypted TEXT,     -- Senha do ComDinheiro (criptografada)
    grupo TEXT                               -- Grupo de permissão ('admin', 'gestor', etc.)
);
```

#### 2.1 Salvamento de Credenciais

```python
# Localização: consulta_bd.py, linhas 7-24
def save_comdinheiro_credentials(salesforce_user_id, username, password, grupo):
    encrypted_password = encrypt_password(password)
    query = """
        INSERT INTO comdinheiro_credenciais 
        (salesforce_user_id, comdinheiro_username, comdinheiro_password_encrypted, grupo)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (salesforce_user_id) 
        DO UPDATE SET 
            comdinheiro_username = EXCLUDED.comdinheiro_username,
            comdinheiro_password_encrypted = EXCLUDED.comdinheiro_password_encrypted,
            grupo = EXCLUDED.grupo
    """
```

#### 2.2 Recuperação de Credenciais

```python
# Localização: consulta_bd.py, linhas 26-37
def get_comdinheiro_credentials(salesforce_user_id: str) -> tuple:
    query = """
        SELECT comdinheiro_username, comdinheiro_password_encrypted 
        FROM comdinheiro_credenciais 
        WHERE salesforce_user_id = %s
    """
    result = consulta_bd(query, (salesforce_user_id,))
    if result and len(result) > 0:
        username, encrypted_password = result[0]
        return username, decrypt_password(encrypted_password)
    return None, None
```

### 3. Segurança e Criptografia

#### 3.1 Criptografia de Senhas

As senhas do ComDinheiro são armazenadas com criptografia usando a biblioteca Fernet:

```python
# Localização: credential_encryption.py
def encrypt_password(password: str) -> str:
    f = Fernet(get_encryption_key())
    return f.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_password.encode()).decode()
```

## 4. Página Visualizar Tabelas - Fluxo Completo

### 4.1 Controle de Acesso

```python
# Localização: main.py, linhas 653-656
@app.route('/visualizar_tabelas', methods=['GET', 'POST'])
def visualizar_tabelas():
    if session.get('grupo') not in ['admin', 'gestor']:
        return render_template("home.html", erro="Você não tem permissão para acessar esta funcionalidade.")
```

**Critério de Acesso**: Apenas usuários com grupo 'admin' ou 'gestor' podem acessar a funcionalidade.

### 4.2 Recuperação de Credenciais do ComDinheiro

```python
# Localização: main.py, linhas 678-688
if 'user' not in session or 'email' not in session['user']:
    return render_template("visualizar_tabelas.html", 
                         carteiras_list=carteiras_list,
                         erro="Erro: Usuário não autenticado")

username, password = get_comdinheiro_credentials(session['user']['email'])
if not username or not password:
    return render_template("visualizar_tabelas.html", 
                         carteiras_list=carteiras_list,
                         erro="Credenciais do ComDinheiro não encontradas")
```

**Processo**:

1. Verifica se o usuário está autenticado (sessão ativa)
2. Usa o email do usuário Salesforce para buscar credenciais do ComDinheiro
3. Descriptografa a senha do ComDinheiro automaticamente

### 4.3 Consulta de Carteiras Disponíveis

```python
# Localização: carteiras_db.py, linha 24-27
def get_carteiras_from_db():
    query = "SELECT nome_carteiras FROM carteiras ORDER BY nome_carteiras"
    results = consulta_bd(query)
    return [row[0] for row in results]
```

### 4.4 Consulta de Dados de Posição Consolidada

#### 4.4.1 Tipos de Visualização Disponíveis

A página suporta diferentes tipos de visualização:

- `consolidado`: Posição consolidada dos ativos
- `relatorio`: Relatório detalhado
- `analise`: Análise de rentabilidade com gráficos
- `movimentacoes`: Histórico de operações
- `asset_allocation`: Alocação de ativos

#### 4.4.2 Construção da URL da API ComDinheiro

```python
# Localização: dados_comdinheiro.py, linhas 437-995
def get_comdinheiro_data(username, password, data_inicial, data_final,
                         carteira, banco, operacao, view_type):
    
    # Diferentes URLs baseadas no tipo de visualização
    if view_type == "consolidado":
        url = (
            f"RelatorioGerencialCarteiras001.php?&data_analise={data_final_fmt}"
            f"&nome_portfolio={carteira}"
            f"&variaveis=instituicao_financeira+ativo+desc+quant+saldo_bruto+tipo_ativo+saldo_liquido"
            "&filtro=all&ativo=&filtro_IF=todos"
        )
    elif view_type == "movimentacoes":
        url = (
            f"ComprasVendas002.php?&nome_portfolio={carteira}"
            f"&data_cadastro_ini={data_inicial_fmt}"
            f"&data_cadastro_fim={data_final_fmt}"
            f"&filtro_CV={operacao}&filtro_IF={banco_fmt}"
        )
    # ... outras condições
```

#### 4.4.3 Chamada para API do ComDinheiro

```python
# Localização: recebe_comdinheiro.py, linhas 10-54
def recebe_comdinheiro(URL: str, username: str, password: str, format: str = "JSON3"):
    url_import = "https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php?code=import_data"
    
    payload = {
        "username": username,
        "password": password,
        "URL": URL,
        "format": format
    }
    
    response = requests.post(url_import, data=payload)
    
    if response.status_code == 200:
        try:
            data = response.json()
            return data
        except Exception as e:
            print("Erro ao decodificar JSON:", e)
            return None
```

### 4.5 Processamento dos Dados Retornados

#### 4.5.1 Estrutura de Dados da API ComDinheiro

A API retorna dados no formato JSON com a seguinte estrutura:

```json
{
    "tables": {
        "tab0": {
            "lin1": {
                "col0": "Nome do Ativo",
                "col1": "Quantidade",
                "col2": "Saldo Bruto",
                "col3": "Instituição"
            }
        }
    }
}
```

#### 4.5.2 Processamento para Visualização Consolidada

```python
# Para view_type == "consolidado"
if dados and 'tables' in dados and 'tab0' in dados['tables']:
    tab0 = dados['tables']['tab0']
    
    # Agrupa dados por banco
    dados_por_banco = {}
    total_geral = 0.0
    
    for key, row in tab0.items():
        if key != 'lin0':  # Ignora cabeçalho
            instituicao = row.get('col0', '').strip()
            ativo = row.get('col1', '').strip()
            descricao = row.get('col2', '').strip()
            quantidade = row.get('col3', '').strip()
            saldo_bruto = row.get('col4', '').strip()
            tipo_ativo = row.get('col5', '').strip()
            
            # Processa e agrupa os dados
            if instituicao not in dados_por_banco:
                dados_por_banco[instituicao] = {
                    'ativos': [],
                    'total_banco': 0.0
                }
            
            # Converte valores monetários
            try:
                saldo_numerico = float(saldo_bruto.replace('.', '').replace(',', '.'))
                dados_por_banco[instituicao]['total_banco'] += saldo_numerico
                total_geral += saldo_numerico
            except (ValueError, TypeError):
                saldo_numerico = 0.0
```

## 5. Diagrama de Fluxo Completo

```
[Usuário] 
    ↓ (Login via Salesforce OAuth)
[Salesforce] 
    ↓ (Callback com dados do usuário)
[Sistema Flask] 
    ↓ (Busca grupo na tabela comdinheiro_credenciais)
[PostgreSQL Database]
    ↓ (Armazena dados na sessão)
[Sessão do Usuário]
    ↓ (Acessa página visualizar_tabelas)
[Controle de Acesso] 
    ↓ (Se admin/gestor: autorizado)
[Página Visualizar Tabelas]
    ↓ (Seleciona carteira, datas, tipo de visualização)
[Sistema Flask]
    ↓ (Busca credenciais ComDinheiro usando email Salesforce)
[PostgreSQL Database]
    ↓ (Retorna credenciais criptografadas)
[Sistema Flask]
    ↓ (Descriptografa credenciais)
[Sistema Flask]
    ↓ (Constrói URL da API baseada nos parâmetros)
[Função get_comdinheiro_data]
    ↓ (Faz requisição HTTP POST)
[API ComDinheiro]
    ↓ (Retorna dados JSON)
[Sistema Flask]
    ↓ (Processa e estrutura dados)
[Sistema Flask]
    ↓ (Renderiza template com dados)
[Interface Web - Usuário]
```

## 6. Pontos Críticos da Integração

### 6.1 Dependências Críticas

1. **Email como Chave Primária**: O email do usuário Salesforce serve como chave primária para relacionar com credenciais ComDinheiro
2. **Credenciais Válidas**: O usuário deve ter credenciais válidas do ComDinheiro previamente cadastradas
3. **Grupo de Permissão**: O usuário deve ter grupo 'admin' ou 'gestor' para acessar a funcionalidade
4. **Sessão Ativa**: A sessão do usuário deve estar ativa com dados do Salesforce

### 6.2 Tratamento de Erros

```python
# Principais verificações de erro:
1. Usuário não autenticado (sessão inválida)
2. Credenciais ComDinheiro não encontradas
3. Erro na API ComDinheiro (timeout, credenciais inválidas)
4. Dados inválidos ou malformados
5. Permissões insuficientes (grupo inadequado)
```

### 6.3 Segurança

1. **Criptografia**: Senhas ComDinheiro são armazenadas criptografadas
2. **Controle de Acesso**: Verificação de grupos antes do acesso
3. **Validação de Sessão**: Verificação contínua da autenticação
4. **Sanitização**: Limpeza de dados de entrada para prevenir injection

## 7. Fluxo de Dados Detalhado

### 7.1 Login e Estabelecimento da Sessão

1. Usuário inicia login via Salesforce OAuth
2. Sistema recebe callback com dados do usuário
3. Sistema consulta tabela `comdinheiro_credenciais` usando email do usuário
4. Sistema armazena na sessão: dados do usuário + grupo de permissão

### 7.2 Acesso à Página Visualizar Tabelas

1. Usuário navega para `/visualizar_tabelas`
2. Sistema verifica se `session['grupo']` é 'admin' ou 'gestor'
3. Se autorizado, sistema carrega lista de carteiras disponíveis
4. Sistema renderiza página com formulário

### 7.3 Consulta de Dados

1. Usuário preenche formulário (carteira, datas, tipo de visualização)
2. Sistema busca credenciais ComDinheiro usando `session['user']['email']`
3. Sistema descriptografa senha do ComDinheiro
4. Sistema constrói URL da API baseada nos parâmetros selecionados
5. Sistema faz requisição para API ComDinheiro
6. Sistema processa resposta JSON e estrutura dados
7. Sistema renderiza resultados na interface

## 8. Considerações Técnicas

### 8.1 Performance

- Credenciais são buscadas a cada requisição (não há cache)
- Dados da API ComDinheiro são processados em tempo real
- Conexões de banco são abertas/fechadas a cada consulta

### 8.2 Escalabilidade

- Sistema suporta múltiplos usuários simultâneos
- Cada usuário tem suas próprias credenciais ComDinheiro
- Sessões são isoladas por usuário

### 8.3 Manutenibilidade

- Separação clara entre autenticação (Salesforce) e dados (ComDinheiro)
- Funções modulares para diferentes tipos de consulta
- Tratamento de erro centralizado

## 9. Conclusão

A integração entre Salesforce e ComDinheiro na página "visualizar_tabelas" é uma solução robusta que:

1. **Unifica a Autenticação**: Usa Salesforce como provedor único de identidade
2. **Mantém Segurança**: Credenciais ComDinheiro são criptografadas e isoladas por usuário
3. **Controla Acesso**: Sistema de grupos garante que apenas usuários autorizados acessem dados sensíveis
4. **Processa em Tempo Real**: Dados são consultados diretamente da API ComDinheiro para garantir atualização
5. **Oferece Flexibilidade**: Múltiplos tipos de visualização e filtros para análise de dados

Esta arquitetura permite que usuários autenticados via Salesforce consultem seus dados financeiros do ComDinheiro de forma segura e controlada, mantendo a rastreabilidade e o controle de acesso necessários para um sistema financeiro corporativo.
