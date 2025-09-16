# Quick Reference - Navegação SvelteKit

## Regras Rápidas ⚡

### ✅ SEMPRE USAR

```svelte
<!-- Links estáticos -->
<a href="/tabelas">Tabelas</a>

<!-- Navegação programática -->
<script>
  import { goto } from '$app/navigation';
</script>
<button onclick={() => goto('/settings')}>Settings</button>
```

### ❌ NUNCA USAR (para rotas internas)

```svelte
<!-- Quebra SPA - causa reload completo -->
<button onclick={() => (window.location.href = '/tabelas')}>
```

## Import Essencial

```svelte
<script>
  import { goto } from '$app/navigation';
</script>
```

## Checklist Rápido

- [ ] Usar `goto()` em vez de `window.location.href` para rotas internas
- [ ] Import de `goto` presente quando necessário  
- [ ] Links externos usam `window.open()` ou `window.location.href`
- [ ] Navegação consistente em todos os estados do componente

## Benefício Principal

**Navegação SPA = Sem recarregamento = Performance melhor = UX consistente**

---
*Criado em 16/09/2025 - Baseado na correção do bug da sidebar collapsed*
