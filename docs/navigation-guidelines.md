# Guia de Navegação - SvelteKit SPA

## Resumo

Este documento estabelece as regras obrigatórias para implementação de navegação no projeto Dashboard Reino, garantindo que todas as transições sejam realizadas como Single Page Application (SPA) usando as APIs nativas do SvelteKit.

## Problema Histórico Identificado

Durante o desenvolvimento, foi identificado um problema onde a navegação na sidebar funcionava de forma inconsistente:

- **Sidebar Aberta**: Navegação SPA correta usando `<a href="...">`
- **Sidebar Collapsed**: Reload completo da página usando `window.location.href`

Isso causava diferença de performance e experiência do usuário entre os estados da sidebar.

## Regras Obrigatórias

### ✅ SEMPRE USAR - Navegação SPA Correta

#### 1. Para Elementos `<a>` Estáticos

```svelte
<!-- ✅ CORRETO: Usa navegação SPA do SvelteKit -->
<a href="/tabelas?modo=relatorio">Relatórios</a>
<a href="/settings">Configurações</a>
<a href="/">Home</a>
```

#### 2. Para Navegação Programática

```svelte
<script>
  import { goto } from '$app/navigation';
  
  function navigateToPage(url) {
    goto(url);
  }
</script>

<!-- ✅ CORRETO: Usa goto() do SvelteKit -->
<button onclick={() => goto('/tabelas')}>
  Ir para Tabelas
</button>

<button onclick={() => goto('/settings')}>
  Configurações
</button>
```

#### 3. Para Navegação Condicional

```svelte
<script>
  import { goto } from '$app/navigation';
  
  function handleNavigation(item) {
    if (item.external) {
      // Apenas para links externos
      window.open(item.href, '_blank');
    } else {
      // Para navegação interna - SEMPRE usar goto()
      goto(item.href);
    }
  }
</script>
```

### ❌ NUNCA USAR - Navegação que Quebra SPA

#### 1. window.location.href para Rotas Internas

```svelte
<!-- ❌ INCORRETO: Força reload completo da página -->
<button onclick={() => (window.location.href = '/tabelas')}>
  Tabelas
</button>

<!-- ❌ INCORRETO: Quebra a experiência SPA -->
<button onclick={() => window.location.assign('/settings')}>
  Settings
</button>
```

#### 2. location.replace para Navegação Normal

```svelte
<!-- ❌ INCORRETO: Remove histórico de navegação -->
<button onclick={() => location.replace('/home')}>
  Home
</button>
```

## Imports Necessários

### Para Navegação Programática

```svelte
<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores'; // Para acessar informações da página atual
</script>
```

### Para Manipulação de Query Parameters

```svelte
<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  function updateSearchParams(key, value) {
    const url = new URL($page.url);
    url.searchParams.set(key, value);
    goto(url.toString());
  }
</script>
```

## Casos de Uso Específicos

### 1. Navegação na Sidebar

```svelte
<!-- Sidebar Aberta -->
<a href={item.href} class="menu-item">
  {item.title}
</a>

<!-- Sidebar Collapsed -->
<button onclick={() => goto(item.href)}>
  <Icon />
</button>
```

### 2. Navegação com Parâmetros

```svelte
<script>
  import { goto } from '$app/navigation';
  
  const tableMenuItems = [
    { href: '/tabelas?modo=relatorio', title: 'Relatório' },
    { href: '/tabelas?modo=consolidado', title: 'Consolidado' },
    { href: '/tabelas?modo=movimentacoes', title: 'Movimentações' }
  ];
</script>

{#each tableMenuItems as item}
  <button onclick={() => goto(item.href)}>
    {item.title}
  </button>
{/each}
```

### 3. Navegação Condicional Baseada em Estado

```svelte
<script>
  import { goto } from '$app/navigation';
  
  function handleItemClick(item) {
    // Sempre usar goto() para rotas internas
    goto(item.href);
    
    // Fechar menus/modals se necessário
    closeModal();
  }
</script>
```

## Exceções - Quando Usar window.location

### ✅ Links Externos Apenas

```svelte
<script>
  function openExternal(url) {
    // ✅ CORRETO: Para sites externos
    window.open(url, '_blank');
  }
  
  function redirectToExternal(url) {
    // ✅ CORRETO: Para redirecionamento completo para site externo
    window.location.href = url;
  }
</script>
```

### ✅ Reload Forçado (Casos Específicos)

```svelte
<script>
  function forceReload() {
    // ✅ CORRETO: Apenas quando reload é realmente necessário
    window.location.reload();
  }
</script>
```

## Checklist de Revisão

Antes de fazer commit, verificar:

- [ ] Todos os `onclick` com navegação usam `goto()` em vez de `window.location.href`
- [ ] Import de `goto` está presente quando necessário
- [ ] Links internos usam `<a href="...">` ou `goto()`
- [ ] Navegação externa usa `window.open()` ou `window.location.href` apropriadamente
- [ ] Não há mistura de padrões de navegação no mesmo componente

## Componentes Críticos para Revisão

### Prioridade Alta

- `DashboardLayout.svelte` - Sidebar navigation
- Qualquer componente com menus de navegação
- Componentes de botões que redirecionam páginas

### Prioridade Média  

- Componentes de formulário com redirecionamento
- Cards com links para outras seções
- Breadcrumbs e navegação secundária

## Benefícios da Navegação SPA Correta

1. **Performance**: Não recarrega CSS, JS ou assets desnecessariamente
2. **Estado Preservado**: Stores e estados locais são mantidos
3. **Transições Suaves**: Animações e transições funcionam corretamente
4. **SEO**: Roteamento client-side é otimizado pelo SvelteKit
5. **Experiência**: Navegação instantânea sem flickering
6. **Consistência**: Mesmo comportamento em todos os estados da UI

## Última Atualização

- **Data**: 16 de Setembro de 2025
- **Motivo**: Correção do problema de reload na sidebar collapsed
- **Componentes Afetados**: `DashboardLayout.svelte`
- **Issue Resolvida**: Navegação inconsistente entre estados collapsed/expanded da sidebar
