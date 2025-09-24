# 📋 Descobertas das Queries do Workspace `comdinheiro_api`

> **Data da Análise**: 22 de setembro de 2025  
> **Fonte**: Workspace Postman `comdinheiro_api`  
> **API Key**: PMAK-68d18814fc1f20000199fa65-e8c21206fdd58faed092e78edfe9e48d02

## 🔍 Visão Geral

O workspace `comdinheiro_api` contém **2 coleções principais** com um total de **8 queries** que cobrem todas as operações CRUD para carteiras e importação/exportação de dados financeiros.

### Estrutura do Workspace

```
comdinheiro_api/
├── Manual_Comdinheiro (3 queries)
│   ├── CRIAR_NOVA_CARTEIRA
│   ├── Import Data (Endpoint)
│   └── Teste (Similar ao Import)
└── CadastroGeral001 (5 queries)
    ├── 1 - Get JWT
    ├── 2 - Criar Nova Carteira Onshore Não Isenta
    ├── 2 - Criar Nova Carteira Onshore Isenta
    ├── 2 - Criar Nova Carteira Offshore
    ├── 3 - Atualiza Carteira Existente
    ├── 4 - Puxa dados de Carteiras Existentes
    └── 5 - Deleta Carteira
```

---

## 📂 Coleção 1: Manual_Comdinheiro

### 1. CRIAR_NOVA_CARTEIRA

**Detalhes da Query:**

- **Método**: `POST`
- **Endpoint**: `https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php?code=export_data`
- **Tipo de Dados**: Form-data
- **Função**: Exporta operações para criar nova carteira

**Credenciais:**

```
username: placido.nilo
password: Comdinheiro24!
```

**Estrutura de Dados:**

```json
{
  "nome_portfolio": "CarteiraPostman",
  "ativo": "ITSA3",
  "tipo_ativo": "acao",
  "CV": "C",
  "preco_unitario": 26.35,
  "quantidade": 500,
  "total_bruto": 13175,
  "alt_caixa": 0,
  "custo_transacao": 0,
  "campo_preciso": "quant"
}
```

**Parâmetros de Controle:**

- `email_log`: 1 (Envia log por e-mail)
- `on_error`: 0 (Ignora dados com erro)

### 2. Import Data (2 queries similares)

**Detalhes da Query:**

- **Método**: `POST`
- **Endpoint**: `https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php?code=import_data`
- **Tipo de Dados**: URL-encoded
- **Função**: Importa dados de posição consolidada

**Parâmetros da URL:**

```
PosicaoConsolidada001.php?
&nome_portfolio=Carteira_Placido_Nilo
&data_ini=14012025
&data_fim=14032025
&classe=TIPO
&layout=1
&exibir_day_trade_data_ini=0
&exibicao=default
&num_casas=2
&ord_classe=alfc
&ord_ativo=alfc
&opcao_tabela=ativos
&valores=0
&estilo_pdf=pb0001
&numeracao_pdf=2
&format=JSON3
```

---

## 📂 Coleção 2: CadastroGeral001

### 1. Get JWT (Autenticação)

**Detalhes da Query:**

- **Método**: `POST`
- **Endpoint**: `https://www.comdinheiro.com.br/api/auth/jwt`
- **Função**: Obtém token JWT para autenticação
- **Retorno**: `access_token` salvo como variável global `jwtCadastroGeralCarteira`

**Script de Teste:**

```javascript
var jsonData = JSON.parse(responseBody);
postman.setGlobalVariable("jwtCadastroGeralCarteira", jsonData.access_token);
```

### 2. Criar Nova Carteira - Onshore Não Isenta

**Detalhes da Query:**

- **Método**: `POST`
- **Endpoint**: `https://www.comdinheiro.com.br/Clientes/API/EndPoint002.php?code=CADASTRO_GERAL_CARTEIRAS001`
- **Auth**: Bearer Token (`{{jwtCadastroGeralCarteira}}`)
- **Perfil**: `CA` (Carteira Administrada)

**Parâmetros Principais:**

```
nome_portfolio: nova_carteira_onshore_nao_isenta
perfil_carteira: CA
cadastro_automatico_proventos: 0
cadastro_automatico_vencimentos: 0
impede_mudancas: 0
discrimina_caixa: 1
omitir_retornos: 0
```

### 3. Criar Nova Carteira - Onshore Isenta

**Detalhes da Query:**

- **Método**: `POST`
- **Endpoint**: Mesmo da query anterior
- **Perfil**: `CAI` (Carteira Administrada Isenta)
- **Diferença**: Perfil tributário isento

### 4. Criar Nova Carteira - Offshore

**Detalhes da Query:**

- **Método**: `POST`
- **Endpoint**: Mesmo das queries anteriores
- **Perfil**: `OFF` (Offshore)

**Parâmetros Específicos:**

```
perfil_carteira: OFF
perfil_tributario: 0 (Isento) / 1 (Não Isento)
unidade: USD (Pode ser USD, EUR...)
```

### 5. Atualizar Carteira Existente

**Detalhes da Query:**

- **Método**: `PATCH`
- **Endpoint**: `https://www.comdinheiro.com.br/Clientes/API/EndPoint002.php?code=CADASTRO_GERAL_CARTEIRAS001&nome_portfolio=nova_carteira_onshore_nao_isenta`
- **Função**: Atualiza configurações de carteira existente

### 6. Consultar Dados de Carteira

**Detalhes da Query:**

- **Método**: `GET`
- **Endpoint**: Mesmo da query anterior
- **Função**: Recupera dados de carteira específica

### 7. Deletar Carteira

**Detalhes da Query:**

- **Método**: `DELETE`
- **Endpoint**: Mesmo das queries anteriores
- **Função**: Remove carteira específica

---

## 🔗 Endpoints Principais

### EndPoint001.php - Operações de Dados

```
https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php
```

**Códigos:**

- `export_data`: Exporta operações
- `import_data`: Importa posições consolidadas

### EndPoint002.php - CRUD de Carteiras

```
https://www.comdinheiro.com.br/Clientes/API/EndPoint002.php
```

**Código:**

- `CADASTRO_GERAL_CARTEIRAS001`: Operações CRUD

### JWT Authentication

```
https://www.comdinheiro.com.br/api/auth/jwt
```

---

## 🏦 Tipos de Carteiras Suportadas

| Código | Tipo | Descrição |
|--------|------|-----------|
| `CA` | Onshore Não Isenta | Carteira administrada nacional com tributação |
| `CAI` | Onshore Isenta | Carteira administrada nacional isenta |
| `OFF` | Offshore | Carteira internacional (USD, EUR, etc.) |

---

## ⚙️ Configurações Disponíveis

### Cadastros Automáticos

- **Proventos**: 0 (Não cadastra), 1 (Cadastra sem enviar ao caixa), 2 (Cadastra enviando ao caixa)
- **Vencimentos**: Mesmas opções dos proventos

### Controles de Acesso

- **Impede Mudanças**: 0 (Não impede), 1 (Impede)
- **Data de Impedimento**: Formato DD/MM/AAAA

### Visualização

- **Discrimina Caixa**: 0 (Não discrimina), 1 (Discrimina)
- **Omitir Retornos**: 0 (Não omite), 1 (Omite retornos anteriores à data de acompanhamento)

---

## 📊 Dados de Operação Suportados

### Campos Obrigatórios

- `nome_portfolio`: Nome da carteira
- `ativo`: Código do ativo (ex: ITSA3)
- `tipo_ativo`: acao, fii, tesouro, etc.
- `CV`: C (Compra) / V (Venda)
- `preco_unitario`: Preço por unidade
- `quantidade`: Quantidade de ativos
- `total_bruto`: Valor total da operação

### Campos Opcionais

- `data_operacao`, `data_cotizacao`, `data_liquidacao`
- `custo_transacao`, `alt_caixa`
- `flag_tribut`, `marcacao`, `indexador`
- `instituicao_financeira`, `banco`
- `IR`, `IOF`, `total_liquido`

---

## 🚀 Próximos Passos para Integração

### 1. Implementar Autenticação JWT

```typescript
const getJWTToken = async (username: string, password: string) => {
  const response = await fetch('https://www.comdinheiro.com.br/api/auth/jwt', {
    method: 'POST',
    body: new URLSearchParams({ username, password })
  });
  return response.json();
};
```

### 2. Criar Interface para CRUD de Carteiras

```typescript
interface CarteiraConfig {
  nome_portfolio: string;
  perfil_carteira: 'CA' | 'CAI' | 'OFF';
  cadastro_automatico_proventos: 0 | 1 | 2;
  discrimina_caixa: 0 | 1;
  // ... outros campos
}
```

### 3. Implementar Import/Export de Dados

```typescript
const exportOperacoes = async (operacoes: Operacao[]) => {
  // Usar EndPoint001.php com code=export_data
};

const importPosicao = async (portfolio: string, dataIni: string, dataFim: string) => {
  // Usar EndPoint001.php com code=import_data
};
```

---

## 🔐 Credenciais de Teste

**Usuário Master:**

- Username: `placido.nilo`
- Password: `Comdinheiro24!`

**API Key Postman:**

- `PMAK-68d18814fc1f20000199fa65-e8c21206fdd58faed092e78edfe9e48d02`

---

## 📝 Observações Importantes

1. **Autenticação**: Todas as operações de carteira (EndPoint002) requerem JWT
2. **Formato de Datas**: DD/MM/AAAA
3. **Moedas Offshore**: USD, EUR e outras suportadas
4. **Logs**: Sistema de email_log disponível para auditoria
5. **Tratamento de Erros**: Configurável via parâmetro `on_error`

---

*Documento gerado automaticamente via análise do workspace Postman `comdinheiro_api`*
