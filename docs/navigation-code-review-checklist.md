# Code Review Checklist - Navegação

## Checklist para Pull Requests

Use este checklist ao revisar código que envolve navegação:

### ✅ Verificações Obrigatórias

#### Imports

- [ ] `import { goto } from '$app/navigation'` está presente quando há navegação programática
- [ ] Não há imports desnecessários de navegação

#### Navegação Interna  

- [ ] Todos os `onclick` com rotas internas usam `goto()`
- [ ] Nenhum `window.location.href` para rotas internas
- [ ] Nenhum `location.replace()` para navegação normal
- [ ] Links `<a href="...">` apontam para rotas internas válidas

#### Navegação Externa

- [ ] Links externos usam `window.open()` com `_blank`
- [ ] Redirecionamentos externos usam `window.location.href` apropriadamente

#### Consistência

- [ ] Mesmo padrão de navegação em todos os estados do componente
- [ ] Sidebar collapsed e expanded usam mesmo tipo de navegação
- [ ] Modais e dropdowns seguem mesmo padrão

### 🔍 Pontos de Atenção

#### Componentes Críticos

- [ ] `DashboardLayout.svelte` - Navegação da sidebar
- [ ] Componentes de menu e navegação
- [ ] Botões que redirecionam páginas
- [ ] Cards com links internos

#### Casos Especiais

- [ ] Formulários com redirecionamento pós-submissão
- [ ] Navegação condicional baseada em auth/permissões
- [ ] Breadcrumbs e navegação hierárquica

### 🚫 Red Flags - Rejeitar PR

- ❌ `window.location.href` usado para rotas internas
- ❌ Mistura de padrões de navegação no mesmo componente  
- ❌ Navegação que quebra o estado da aplicação
- ❌ Falta de import `goto` quando necessário

### ✅ Aprovação - Padrões Corretos

- ✅ Navegação SPA consistente em todo o componente
- ✅ Uso correto de `goto()` para rotas internas
- ✅ Links externos tratados apropriadamente
- ✅ Performance preservada (sem reloads desnecessários)

### 📝 Comentários Padrão

#### Para correção

```
❌ Por favor, use `goto()` em vez de `window.location.href` para navegação interna. 
Veja: docs/navigation-quick-ref.md
```

#### Para aprovação

```
✅ Navegação SPA implementada corretamente!
```

---
**Última atualização**: 16/09/2025  
**Contexto**: Correção do bug de reload na sidebar collapsed
