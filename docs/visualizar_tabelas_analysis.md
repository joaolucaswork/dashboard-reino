# Análise Completa do Template visualizar_tabelas.html

## 1. Estrutura da Página

### 1.1 Modos de Visualização Identificados

O template suporta 5 modos principais de visualização através de radio buttons:

1. **Relatório** (`relatorio`)
   - Exibe dados agrupados por instituição financeira
   - Mostra cabeçalho principal com carteira, data e total geral
   - Agrupa dados por banco com totais individuais

2. **Posição Consolidada** (`consolidado`)
   - Sistema de accordion hierárquico: Banco → Categoria → Tipo de Ativo
   - Navegação expansível com ícones de toggle (+/-)
   - Totais calculados em cada nível da hierarquia

3. **Movimentações** (`movimentacoes`)
   - Tabela de transações com filtros por banco e operação
   - Campos de data inicial e final obrigatórios
   - Filtros por tipo de operação (Compras, Vendas, Todas)

4. **Análises** (`analise`)
   - Sistema de abas: Gráficos e Tabelas
   - Gráficos interativos usando Chart.js
   - Múltiplas visualizações: Rentabilidade, PL, por Instituição, por Tipo de Ativo

5. **Asset Allocation** (`asset_allocation`)
   - Gráficos de pizza comparativos (Atual vs Referência)
   - Tabelas de distribuição e rebalanceamento
   - Sistema de edição para perfis personalizados

### 1.2 Componentes de Interface Principais

#### Formulário de Consulta

- **Radio Group**: Seleção do tipo de visualização
- **Campo Carteira**: Input com datalist + popup de seleção
- **Seletores Condicionais**: Banco, Operação, Perfil de Referência
- **Campos de Data**: Data inicial (condicional) e data final (obrigatória)
- **Botão Consultar**: Com validação e loading spinner

#### Sistema de Navegação

- **Botões de Retorno**: Menu principal e Balanceamento
- **Exportação**: Link para Excel quando há dados
- **Indicadores de Estado**: Loading, erro, sucesso

## 2. Componentes UI Detalhados

### 2.1 Popup de Seleção de Carteiras (`carteiras_popup.html`)

**Funcionalidades:**

- Modal overlay com backdrop escuro
- Campo de busca com filtro em tempo real
- Lista dinâmica carregada via API (`/obter_carteiras_sales`)
- Seleção por clique com fechamento automático

**Estrutura de Dados:**

```javascript
// Resposta da API
{
  success: boolean,
  carteiras: string[],
  message?: string
}
```

### 2.2 Sistema de Accordion (Modo Consolidado)

**Hierarquia:**

```text
Banco (header-banco)
├── Categoria (header-categoria)
    ├── Tipo de Ativo (tipo-ativo-header)
        └── Tabela de Ativos (ativos-list)
```

**Funcionalidades:**

- Toggle individual por seção
- Expansão automática de subníveis ao abrir banco
- Ícones animados (fa-plus/fa-minus)
- Totais calculados em cada nível

### 2.3 Sistema de Abas (Modo Análise)

**Abas Disponíveis:**

- **Gráficos**: Visualizações Chart.js + tabelas resumo
- **Tabelas**: Dados tabulares detalhados

**Gráficos Implementados:**

1. **Rentabilidade e PL**: Linha temporal com duplo eixo Y
2. **Por Instituição**: Múltiplas séries com cores HSL geradas
3. **Por Tipo de Ativo**: Comparativo de performance

### 2.4 Asset Allocation (Modo Avançado)

**Componentes:**

- **Gráficos de Pizza**: Atual vs Referência (Chart.js doughnut)
- **Tabela de Distribuição**: Valores e percentuais atuais
- **Tabela de Rebalanceamento**: Ajustes necessários
- **Editor de Perfil**: Formulário para perfis personalizados
- **Botão de Salvamento**: Persistência de balanceamento

## 3. Estruturas de Dados

### 3.1 Estrutura Principal de Dados

```javascript
// Estrutura base para todos os modos
data = {
  tables: {
    tab0: {
      lin0: { col1: "Header1", col2: "Header2", ... }, // Cabeçalhos
      lin1: { col1: "Value1", col2: "Value2", ... },   // Dados
      // ... mais linhas
    }
  },
  agrupados?: {}, // Para modo consolidado
  data?: {},       // Para análises (tabela 1)
  data2?: {},      // Para análises (tabela 2)
  data3?: {},      // Para gráfico de rentabilidade
  data4?: {},      // Para gráfico por instituição
  data5?: {}       // Para gráfico por tipo de ativo
}
```

### 3.2 Asset Allocation Data

```javascript
asset_allocation_data = {
  saldo_bruto: number,
  rentabilidade_ano: string,
  grafico1: {
    "Pré-fixado": number,
    "Pós-fixado": number,
    "IPCA": number,
    "RV": number,
    "Global": number
  }
}

perfil_data = {
  perfil: string,
  pre: number,
  pos: number,
  ipca: number,
  rv_mm: number,
  global: number
}
```

### 3.3 Dados de Gráficos (Chart.js)

```javascript
// Gráfico de rentabilidade
data3.grafico = {
  datas: string[],
  carteira: number[],
  cdi: number[],
  pl: number[]
}

// Gráficos por instituição/tipo
data4.grafico = {
  labels: string[],
  series: [{
    label: string,
    data: number[],
    hidden: boolean
  }]
}
```

## 4. Funcionalidades Interativas

### 4.1 JavaScript Principal

**Funções de Controle:**

- `toggleFields()`: Controla visibilidade de campos baseado no modo
- `checkFormAndShowLoading()`: Validação e loading
- `toggleSection(id)`: Controle do accordion
- `mostrarAba(aba)`: Alternância entre abas

**Funções de Asset Allocation:**

- `toggleEditAssetMode()`: Modo de edição de perfis
- `updateAssetTotal()`: Validação em tempo real
- `saveAssetAllocation()`: Persistência via API
- `salvarBalanceamento()`: Cálculo e salvamento de rebalanceamento

### 4.2 Integrações de API

**Endpoints Identificados:**

- `POST /visualizar_tabelas`: Consulta principal
- `GET /obter_carteiras_sales`: Lista de carteiras
- `GET /exportar_excel`: Exportação de dados
- `POST /save_carteira_asset_allocation`: Salvar perfil personalizado
- `POST /save_balanceamento_carteira`: Salvar balanceamento

## 5. Padrões de Estilo e Layout

### 5.1 Sistema de Cores

**Paleta Principal:**

- Dourado: `#A67C00`, `#BF9200`, `#D4A017`
- Azul: `#007bff`, `#004a8d`
- Verde: `#28a745`
- Cinza: `#6c757d`, `#343a40`

**Classes de Header:**

- `.header-principal`: Cabeçalho principal (cinza escuro)
- `.header-banco`: Cabeçalho de banco (azul)
- `.header-categoria`: Cabeçalho de categoria (verde)
- `.header-tipo-ativo`: Cabeçalho de tipo (cinza)

### 5.2 Componentes de Estilo

**Botões:**

- `.btn`: Botão principal dourado
- `.btn-back`: Botão de retorno
- `.exportar-btn`: Botão de exportação menor

**Tabelas:**

- Zebra striping automático
- Hover effects
- Bordas arredondadas
- Box shadow sutil

**Animações:**

- Spinner de loading
- Hover transforms
- Transições suaves (0.2s-0.3s)

## 6. Requisitos para Componentes SvelteKit

### 6.1 Componentes Base Necessários

1. **FormularioConsulta.svelte**
   - Radio group para modos
   - Campos condicionais
   - Validação integrada
   - Loading states

2. **SeletorCarteira.svelte**
   - Input com autocomplete
   - Modal de seleção
   - Integração com API

3. **TabelaConsolidada.svelte**
   - Accordion hierárquico
   - Totais calculados
   - Estados de expansão

4. **GraficosAnalise.svelte**
   - Wrapper para Chart.js
   - Sistema de abas
   - Múltiplos tipos de gráfico

5. **AssetAllocation.svelte**
   - Gráficos comparativos
   - Editor de perfis
   - Cálculos de rebalanceamento

### 6.2 Stores e Estados

```javascript
// Stores necessários
export const modoVisualizacao = writable('relatorio');
export const dadosConsulta = writable(null);
export const carteiraAtual = writable('');
export const loadingState = writable(false);
export const perfilAssetAllocation = writable(null);
```

### 6.3 Dados Mock Recomendados

Para desenvolvimento inicial, criar mocks para:

- Lista de carteiras
- Dados de tabelas por modo
- Dados de gráficos
- Perfis de asset allocation
- Dados de rebalanceamento

## 7. Estruturas de Mock Data Detalhadas

### 7.1 Mock para Modo Relatório

```javascript
const mockRelatorioData = {
  tables: {
    tab0: {
      lin0: {
        col1: "Instituição Financeira",
        col2: "Tipo de Ativo",
        col3: "Ativo",
        col4: "Quantidade",
        col5: "Valor Atual (R$)",
        col6: "% da Carteira"
      },
      lin1: {
        col1: "Itaú",
        col2: "Renda Fixa",
        col3: "CDB Itaú",
        col4: "1000",
        col5: 105000.50,
        col6: "15.2%"
      },
      lin2: {
        col1: "BTG",
        col2: "Renda Variável",
        col3: "PETR4",
        col4: "500",
        col5: 87500.00,
        col6: "12.7%"
      }
      // ... mais linhas
    }
  },
  total_geral: "692,450.75",
  carteira: "João_Silva",
  data_final: "2024-01-15"
};
```

### 7.2 Mock para Modo Consolidado

```javascript
const mockConsolidadoData = {
  agrupados: {
    "Itaú": {
      "_total_banco": 250000.00,
      "Renda Fixa": {
        "_total_categoria": 150000.00,
        "CDB": {
          "_total_tipo": 100000.00,
          "linhas": [
            {
              col2: "CDB Itaú 120% CDI",
              col3: "1000",
              col4: 100000.00,
              col5: "14.5%"
            }
          ]
        },
        "LCI": {
          "_total_tipo": 50000.00,
          "linhas": [
            {
              col2: "LCI Itaú",
              col3: "500",
              col4: 50000.00,
              col5: "7.2%"
            }
          ]
        }
      },
      "Renda Variável": {
        "_total_categoria": 100000.00,
        "Ações": {
          "_total_tipo": 100000.00,
          "linhas": [
            {
              col2: "ITUB4",
              col3: "1000",
              col4: 35000.00,
              col5: "5.1%"
            },
            {
              col2: "BBDC4",
              col3: "800",
              col4: 65000.00,
              col5: "9.4%"
            }
          ]
        }
      }
    },
    "BTG": {
      "_total_banco": 180000.00,
      "Renda Variável": {
        "_total_categoria": 180000.00,
        "Ações": {
          "_total_tipo": 120000.00,
          "linhas": [
            {
              col2: "PETR4",
              col3: "2000",
              col4: 120000.00,
              col5: "17.3%"
            }
          ]
        },
        "FIIs": {
          "_total_tipo": 60000.00,
          "linhas": [
            {
              col2: "HGLG11",
              col3: "500",
              col4: 60000.00,
              col5: "8.7%"
            }
          ]
        }
      }
    }
  },
  cabecalho: {
    col2: "Ativo",
    col3: "Quantidade",
    col4: "Valor (R$)",
    col5: "% Carteira"
  },
  total_geral: "430,000.00",
  carteira: "João_Silva",
  data_final: "2024-01-15"
};
```

### 7.3 Mock para Movimentações

```javascript
const mockMovimentacoesData = {
  tables: {
    tab0: {
      lin0: {
        col1: "Data",
        col2: "Instituição",
        col3: "Operação",
        col6: "Ativo",
        col7: "Quantidade",
        col8: "Preço Unitário",
        col9: "Valor Total",
        col10: "Taxa",
        col11: "Valor Líquido"
      },
      lin1: {
        col1: "15/01/2024",
        col2: "Itaú",
        col3: "Compra",
        col6: "PETR4",
        col7: "100",
        col8: "35.50",
        col9: "3,550.00",
        col10: "7.10",
        col11: "3,542.90"
      },
      lin2: {
        col1: "14/01/2024",
        col2: "BTG",
        col3: "Venda",
        col6: "VALE3",
        col7: "200",
        col8: "68.20",
        col9: "13,640.00",
        col10: "27.28",
        col11: "13,612.72"
      }
      // ... mais movimentações
    }
  }
};
```

### 7.4 Mock para Análises

```javascript
const mockAnaliseData = {
  data: {
    tables: {
      tab0: {
        lin0: {
          col1: "Período",
          col2: "Rentabilidade Carteira (%)",
          col3: "CDI (%)",
          col4: "Diferença (%)",
          col5: "PL (R$)"
        },
        lin1: {
          col1: "Jan/2024",
          col2: "2.45",
          col3: "1.02",
          col4: "1.43",
          col5: "692,450.75"
        },
        lin2: {
          col1: "Dez/2023",
          col2: "1.87",
          col3: "1.15",
          col4: "0.72",
          col5: "675,230.20"
        }
      }
    }
  },
  data2: {
    tables: {
      tab0: {
        lin0: {
          col1: "Instituição",
          col2: "Rentabilidade (%)",
          col3: "Patrimônio (R$)",
          col4: "% do Total"
        },
        lin1: {
          col1: "Itaú",
          col2: "2.1",
          col3: "250,000.00",
          col4: "36.1"
        },
        lin2: {
          col1: "BTG",
          col2: "2.8",
          col3: "180,000.00",
          col4: "26.0"
        }
      }
    }
  },
  data3: {
    grafico: {
      datas: ["Jan/23", "Fev/23", "Mar/23", "Abr/23", "Mai/23", "Jun/23"],
      carteira: [1.2, 2.1, 1.8, 2.5, 1.9, 2.3],
      cdi: [1.0, 1.1, 1.0, 1.2, 1.1, 1.1],
      pl: [650, 665, 670, 680, 685, 692]
    }
  },
  data4: {
    grafico: {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
      series: [
        {
          label: "Itaú",
          data: [1.1, 2.0, 1.5, 2.2, 1.8, 2.1],
          hidden: false
        },
        {
          label: "BTG",
          data: [1.5, 2.3, 2.1, 2.8, 2.2, 2.8],
          hidden: false
        },
        {
          label: "XP",
          data: [0.8, 1.5, 1.2, 1.9, 1.4, 1.7],
          hidden: false
        }
      ]
    }
  },
  data5: {
    grafico: {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
      series: [
        {
          label: "Renda Fixa",
          data: [1.0, 1.1, 1.0, 1.2, 1.1, 1.1],
          hidden: false
        },
        {
          label: "Renda Variável",
          data: [2.5, 3.2, 2.8, 3.5, 2.9, 3.1],
          hidden: false
        },
        {
          label: "FIIs",
          data: [1.8, 2.1, 1.9, 2.3, 2.0, 2.2],
          hidden: false
        }
      ]
    }
  }
};
```

### 7.5 Mock para Asset Allocation

```javascript
const mockAssetAllocationData = {
  saldo_bruto: 692450.75,
  rentabilidade_ano: "125.3% do CDI",
  grafico1: {
    "Pré-fixado": 25.5,
    "Pós-fixado": 30.2,
    "IPCA": 20.8,
    "RV": 18.5,
    "Global": 5.0
  }
};

const mockPerfilData = {
  perfil: "moderado",
  pre: 20.0,
  pos: 25.0,
  ipca: 30.0,
  rv_mm: 20.0,
  global: 5.0
};

// Perfis padrão para referência
const perfisReferencia = {
  conservador: {
    pre: 30,
    pos: 30,
    ipca: 30,
    rv_mm: 10,
    global: 0
  },
  moderado: {
    pre: 20,
    pos: 25,
    ipca: 30,
    rv_mm: 20,
    global: 5
  },
  sofisticado: {
    pre: 10,
    pos: 15,
    ipca: 25,
    rv_mm: 40,
    global: 10
  }
};
```

## 8. Guia de Implementação SvelteKit

### 8.1 Estrutura de Arquivos Recomendada

```text
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte components
│   │   ├── tabelas/      # Componentes específicos
│   │   │   ├── FormularioConsulta.svelte
│   │   │   ├── SeletorCarteira.svelte
│   │   │   ├── TabelaConsolidada.svelte
│   │   │   ├── GraficosAnalise.svelte
│   │   │   ├── AssetAllocation.svelte
│   │   │   └── ExportacaoExcel.svelte
│   │   └── charts/       # Wrappers Chart.js
│   │       ├── LineChart.svelte
│   │       ├── DoughnutChart.svelte
│   │       └── MultiSeriesChart.svelte
│   ├── stores/
│   │   ├── tabelas.js    # Estados da aplicação
│   │   ├── carteiras.js  # Gestão de carteiras
│   │   └── charts.js     # Estados dos gráficos
│   ├── utils/
│   │   ├── formatters.js # Formatação de números/datas
│   │   ├── validators.js # Validações de formulário
│   │   └── calculations.js # Cálculos de rebalanceamento
│   └── mocks/
│       ├── tabelas.js    # Dados mock
│       ├── carteiras.js  # Lista de carteiras mock
│       └── profiles.js   # Perfis de asset allocation
└── routes/
    └── tabelas/
        └── +page.svelte  # Página principal
```

### 8.2 Stores Principais

```javascript
// src/lib/stores/tabelas.js
import { writable, derived } from 'svelte/store';

export const modoVisualizacao = writable('relatorio');
export const carteiraAtual = writable('');
export const dataFinal = writable('');
export const dataInicial = writable('');
export const bancoSelecionado = writable('');
export const operacaoSelecionada = writable('C+V');
export const perfilReferencia = writable('');

export const dadosConsulta = writable(null);
export const loadingState = writable(false);
export const errorState = writable(null);

// Store derivado para controlar visibilidade de campos
export const camposVisiveis = derived(
  modoVisualizacao,
  ($modo) => ({
    banco: $modo === 'movimentacoes',
    dataInicial: ['movimentacoes', 'analise'].includes($modo),
    operacao: $modo === 'movimentacoes',
    perfil: $modo === 'asset_allocation'
  })
);

// Store para validação do formulário
export const formularioValido = derived(
  [modoVisualizacao, carteiraAtual, dataFinal, dataInicial, bancoSelecionado, perfilReferencia],
  ([$modo, $carteira, $dataFinal, $dataInicial, $banco, $perfil]) => {
    if (!$carteira || !$dataFinal) return false;

    if ($modo === 'movimentacoes' && !$banco) return false;
    if ($modo === 'analise' && !$dataInicial) return false;
    if ($modo === 'asset_allocation' && !$perfil) return false;

    return true;
  }
);
```

### 8.3 Componente Principal

```svelte
<!-- src/routes/tabelas/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { modoVisualizacao, dadosConsulta } from '$lib/stores/tabelas.js';

  import FormularioConsulta from '$lib/components/tabelas/FormularioConsulta.svelte';
  import TabelaRelatorio from '$lib/components/tabelas/TabelaRelatorio.svelte';
  import TabelaConsolidada from '$lib/components/tabelas/TabelaConsolidada.svelte';
  import TabelaMovimentacoes from '$lib/components/tabelas/TabelaMovimentacoes.svelte';
  import GraficosAnalise from '$lib/components/tabelas/GraficosAnalise.svelte';
  import AssetAllocation from '$lib/components/tabelas/AssetAllocation.svelte';
  import ExportacaoExcel from '$lib/components/tabelas/ExportacaoExcel.svelte';

  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<div class="container mx-auto p-6 max-w-7xl">
  <!-- Navegação -->
  <div class="flex gap-4 mb-6">
    <Button variant="outline" href="/" class="btn-secondary">
      <i class="fas fa-home mr-2"></i>
      Voltar ao Menu
    </Button>
    <Button variant="outline" href="/balanceamento" class="btn-secondary">
      <i class="fas fa-chart-pie mr-2"></i>
      Voltar ao Balanceamento
    </Button>
  </div>

  <!-- Título -->
  <Card class="card-premium mb-6">
    <CardHeader class="text-center">
      <CardTitle class="text-3xl font-bold text-white">
        Tabelas ComDinheiro
      </CardTitle>
    </CardHeader>
  </Card>

  <!-- Formulário de Consulta -->
  <FormularioConsulta />

  <!-- Exportação -->
  {#if $dadosConsulta}
    <ExportacaoExcel />
  {/if}

  <!-- Exibição dos Dados -->
  {#if $dadosConsulta}
    {#if $modoVisualizacao === 'relatorio'}
      <TabelaRelatorio data={$dadosConsulta} />
    {:else if $modoVisualizacao === 'consolidado'}
      <TabelaConsolidada data={$dadosConsulta} />
    {:else if $modoVisualizacao === 'movimentacoes'}
      <TabelaMovimentacoes data={$dadosConsulta} />
    {:else if $modoVisualizacao === 'analise'}
      <GraficosAnalise data={$dadosConsulta} />
    {:else if $modoVisualizacao === 'asset_allocation'}
      <AssetAllocation data={$dadosConsulta} />
    {/if}
  {/if}
</div>
```

Esta análise completa fornece toda a base necessária para recriar a funcionalidade como componentes SvelteKit modernos e reutilizáveis, incluindo estruturas de dados mock detalhadas e guias de implementação específicos.
