# Relatório de Ligações - API Callix

## 📋 Visão Geral

O Relatório de Ligações via API conecta-se diretamente com a API da Callix para obter dados de ligações em tempo real, eliminando a necessidade de upload manual de arquivos CSV.

## 🔧 Configuração

### 1. Token da API

Para usar este relatório, você precisa configurar o token de acesso à API da Callix:

1. Acesse o painel administrativo da Callix
2. Navegue para **Configurações > API > Tokens**
3. Gere um novo token ou copie um existente
4. Configure a variável de ambiente `CALLIX_API_TOKEN` no arquivo `.env`

```bash
# No arquivo .env
CALLIX_API_TOKEN=seu_token_da_api_aqui
```

### 2. Reiniciar a Aplicação

Após configurar o token, reinicie a aplicação para que as mudanças tenham efeito.

## 🚀 Como Usar

### 1. Acessar o Relatório

- Navegue para `/relatorio-ligacoes-api` no dashboard
- Ou clique em **"Relatório de Ligações (API)"** na página inicial

### 2. Selecionar Período

- **Data Início**: Data inicial do período a consultar
- **Data Fim**: Data final do período a consultar
- **Limitação**: Máximo de 31 dias por consulta (limitação da API Callix)

### 3. Filtros Opcionais

- **Agente**: Filtrar por ID do agente específico
- **Qualificação**: Filtrar por ID da qualificação
- **Telefone**: Filtrar por número de telefone de destino

### 4. Consultar Dados

Clique em **"Consultar API"** para buscar os dados da Callix em tempo real.

## 📊 Funcionalidades

### Métricas Principais

- **Total de Ligações**: Quantidade total no período
- **Ligações Atendidas**: Ligações com conversa (talk_time > 0)
- **Não Atendeu**: Ligações não atendidas (hangup_cause = 1 ou talk_time = 0)
- **Duração Média**: Tempo médio de conversa
- **% Atendimento**: Percentual de ligações atendidas

### Análise por Agente

- **Tabela Detalhada**: Performance individual de cada agente
- **Ranking**: Ordenação por volume de ligações
- **Métricas Individuais**: 
  - Total de ligações
  - Ligações atendidas/não atendidas
  - Percentual de atendimento
  - Duração média e total
  - Clientes únicos
  - Melhor horário de atividade

### Análise de Qualificações

- **Distribuição**: Quantidade por tipo de qualificação
- **Visualização**: Cards coloridos para fácil identificação

## 🔍 Filtros da API Callix

O sistema suporta todos os filtros disponíveis na API:

| Filtro | Descrição | Tipo | Exemplo |
|--------|-----------|------|---------|
| `started_at` | Data/hora de início (obrigatório) | datetime | `2024-01-01T00:00:00.000Z,2024-01-01T23:59:59.999Z` |
| `destination_phone` | Telefone de destino | string | `987654321` |
| `call_type` | Tipo de chamada | enum | `1` |
| `extension` | Ramal | integer | `220` |
| `agent` | ID do agente | integer | `1` |
| `qualification` | ID da qualificação | integer | `1` |
| `protocol` | Protocolo específico | integer | `2` |
| `note` | Observação contém texto | string | `Chamada Muda` |
| `hangup_cause` | Causa do desligamento | enum | `1` |

## 📤 Exportação

- **Formato CSV**: Exporta todos os dados e métricas calculadas
- **Nome do Arquivo**: `relatorio-ligacoes-api-YYYY-MM-DD-YYYY-MM-DD.csv`
- **Conteúdo**: Métricas gerais, dados por agente, qualificações

## ⚠️ Limitações e Considerações

### Limitações da API Callix

- **Intervalo Máximo**: 31 dias por consulta
- **Rate Limiting**: Limite de requisições por minuto
- **Timeout**: Requisições podem falhar em períodos com muitos dados

### Tratamento de Erros

O sistema trata automaticamente:
- **401 Unauthorized**: Token inválido ou expirado
- **403 Forbidden**: Sem permissão de acesso
- **429 Too Many Requests**: Muitas requisições
- **500 Internal Server Error**: Erro interno da API

### Performance

- **Cache Local**: Dados são mantidos em memória durante a sessão
- **Loading States**: Indicadores visuais durante carregamento
- **Feedback**: Notificações de sucesso/erro para todas as operações

## 🔄 Diferenças vs Relatório CSV

| Aspecto | Relatório CSV | Relatório API |
|---------|---------------|---------------|
| **Dados** | Upload manual | Tempo real |
| **Atualização** | Manual | Automática |
| **Histórico** | Limitado ao arquivo | Limitado a 31 dias |
| **Filtros** | Pós-processamento | API nativa |
| **Performance** | Rápida (local) | Depende da API |
| **Conectividade** | Offline | Online |

## 🐛 Solução de Problemas

### Token não configurado
```
Erro: "Token da API Callix não configurado"
Solução: Configure CALLIX_API_TOKEN no arquivo .env
```

### Intervalo muito grande
```
Erro: "O intervalo máximo é de 31 dias"
Solução: Reduza o período para máximo 31 dias
```

### Erro de autenticação
```
Erro: "Token da API Callix inválido ou expirado"
Solução: Gere um novo token no painel da Callix
```

### Sem dados
```
Aviso: "Nenhuma ligação encontrada para o período"
Solução: Verifique se há ligações no período ou ajuste os filtros
```

## 🔗 Endpoints

### Frontend
- **Rota**: `/relatorio-ligacoes-api`
- **Componente**: `src/routes/relatorio-ligacoes-api/+page.svelte`

### Backend
- **API**: `/api/callix/ligacoes`
- **Método**: `GET`
- **Parâmetros**: `data_inicio`, `data_fim`, `agente`, `qualificacao`, `telefone`

### API Callix
- **URL**: `https://reinocapital.callix.com.br/api/v1/outgoing_completed_calls`
- **Autenticação**: Bearer Token
- **Documentação**: [API Callix](https://docs.callix.com.br)