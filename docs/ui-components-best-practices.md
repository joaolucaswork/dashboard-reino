# Guia de Boas Práticas: Componentes UI e Prevenção de Erros SSR/Hidratação

## 🚨 Regras Críticas - SEMPRE Seguir

### 1. **NUNCA Aninhe Elementos Interativos**

❌ **JAMAIS FAÇA ISSO:**

```svelte
<!-- Button dentro de Button -->
<Tooltip.Trigger>
  <Button>Clique aqui</Button>
</Tooltip.Trigger>

<!-- Link dentro de Button -->
<PopoverTrigger>
  <a href="/page">Link</a>
</PopoverTrigger>

<!-- Label dentro de Button -->
<Tooltip.Trigger>
  <Label for="input">Campo</Label>
</Tooltip.Trigger>

<!-- Button dentro de Link -->
<a href="/page">
  <Button>Navegar</Button>
</a>
```

✅ **SEMPRE FAÇA ASSIM:**

```svelte
<!-- Use o trigger diretamente -->
<Tooltip.Trigger onclick={() => handleClick()}>
  Clique aqui
</Tooltip.Trigger>

<!-- Para navegação -->
<PopoverTrigger onclick={() => window.location.href = '/page'}>
  Ir para página
</PopoverTrigger>

<!-- Tooltip separado do controle -->
<div class="flex items-center gap-2">
  <Label for="input">Campo</Label>
  <Tooltip.Root>
    <Tooltip.Trigger class="info-icon">?</Tooltip.Trigger>
    <Tooltip.Content>Informação adicional</Tooltip.Content>
  </Tooltip.Root>
</div>
```

### 2. **Componentes bits-ui São Elementos Nativos**

**LEMBRE-SE:** Todos os componentes trigger do bits-ui renderizam como elementos HTML nativos:

- `Tooltip.Trigger` → `<button>`
- `PopoverTrigger` → `<button>`
- `DropdownMenu.Trigger` → `<button>`
- `Dialog.Trigger` → `<button>`
- `Sheet.Trigger` → `<button>`

**REGRA:** Se você precisa de um elemento interativo, use o trigger diretamente, não wrapeie outro elemento dentro dele.

### 3. **Padrão asChild/let:builder É OBSOLETO**

❌ **NÃO USE (Obsoleto no Svelte 5):**

```svelte
<Tooltip.Trigger asChild let:builder>
  <a href="/page" use:builder.action {...builder}>
    Link
  </a>
</Tooltip.Trigger>
```

✅ **USE INSTEAD:**

```svelte
<Tooltip.Trigger onclick={() => window.location.href = '/page'}>
  Link
</Tooltip.Trigger>
```

## 📋 Checklist de Desenvolvimento

Antes de commitar qualquer componente, verifique:

### ✅ Checklist SSR/Hidratação

- [ ] Não há elementos interativos aninhados
- [ ] Triggers são usados diretamente sem wrappers
- [ ] Não uso padrões `asChild` ou `let:builder`
- [ ] Componentes renderizam igual no server e client
- [ ] Não há conditional rendering baseado em `browser` sem `$effect`

### ✅ Checklist de Acessibilidade

- [ ] Todos os triggers têm `aria-label` adequados
- [ ] Navegação por teclado funciona corretamente
- [ ] Estados disabled são tratados adequadamente
- [ ] Foco visual é mantido após interações

### ✅ Checklist de Performance

- [ ] Não há re-renderizações desnecessárias
- [ ] Event handlers não são criados inline em loops
- [ ] Estados são derivados quando possível
- [ ] Imports são otimizados

## 🏗️ Padrões Aprovados

### Padrão 1: Tooltip Informativo

```svelte
<!-- Para tooltips que só mostram informação -->
<div class="flex items-center gap-2">
  <Label>Campo Principal</Label>
  <Tooltip.Root>
    <Tooltip.Trigger class="w-4 h-4 rounded-full border border-current flex items-center justify-center text-xs opacity-60 hover:opacity-100">
      ?
    </Tooltip.Trigger>
    <Tooltip.Content>Informação adicional sobre o campo</Tooltip.Content>
  </Tooltip.Root>
</div>
```

### Padrão 2: Trigger para Navegação

```svelte
<!-- Para triggers que navegam -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="nav-button-styles"
    onclick={() => window.location.href = '/destination'}
    aria-label="Ir para destino"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Navegar para destino</Tooltip.Content>
</Tooltip.Root>
```

### Padrão 3: Trigger para Ações

```svelte
<!-- Para triggers que executam ações -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="action-button-styles"
    onclick={() => handleAction()}
    aria-label="Executar ação"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Executar ação específica</Tooltip.Content>
</Tooltip.Root>
```

### Padrão 4: Popover/Dropdown com Estilos

```svelte
<!-- Para popovers que precisam aparentar botões customizados -->
<Popover>
  <PopoverTrigger
    class={cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
      "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border h-9 px-4 py-2",
      customClasses
    )}
    {disabled}
    {...restProps}
  >
    {label}
    <ChevronDown class="h-4 w-4" />
  </PopoverTrigger>
  <PopoverContent>
    <!-- Conteúdo -->
  </PopoverContent>
</Popover>
```

## 🔧 Ferramentas de Verificação

### Script para Detecção de Problemas

Crie um script `scripts/check-nested-elements.js`:

```javascript
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const problematicPatterns = [
  /<Tooltip\.Trigger[^>]*>\s*<Button/g,
  /<PopoverTrigger[^>]*>\s*<Button/g,
  /<Tooltip\.Trigger[^>]*>\s*<a\s+href/g,
  /<PopoverTrigger[^>]*>\s*<a\s+href/g,
  /asChild\s+let:builder/g,
  /<Button[^>]*>\s*<a\s+href/g,
];

async function checkFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const issues = [];
  
  problematicPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        pattern: pattern.source,
        matches: matches.length,
        file: filePath
      });
    }
  });
  
  return issues;
}

// Use este script em CI/CD para detectar problemas automaticamente
```

### Regras ESLint Customizadas

```javascript
// .eslintrc.js - adicione regras customizadas
module.exports = {
  rules: {
    'no-nested-interactive': {
      create(context) {
        return {
          JSXElement(node) {
            // Implementar verificação de elementos aninhados
          }
        };
      }
    }
  }
};
```

## 🚫 Anti-Padrões Comuns

### Anti-Padrão 1: Button Wrapper

```svelte
<!-- ❌ ERRADO -->
<Tooltip.Trigger>
  <Button variant="outline">
    Conteúdo
  </Button>
</Tooltip.Trigger>

<!-- ✅ CORRETO -->
<Tooltip.Trigger class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border h-9 px-4 py-2">
  Conteúdo
</Tooltip.Trigger>
```

### Anti-Padrão 2: Link Wrapper

```svelte
<!-- ❌ ERRADO -->
<PopoverTrigger>
  <a href="/page" class="nav-link">
    <Icon />
    Texto
  </a>
</PopoverTrigger>

<!-- ✅ CORRETO -->
<PopoverTrigger 
  class="nav-link"
  onclick={() => window.location.href = '/page'}
>
  <Icon />
  Texto
</PopoverTrigger>
```

### Anti-Padrão 3: Conditional Rendering Sem Cuidado

```svelte
<!-- ❌ ERRADO -->
{#if browser}
  <Tooltip.Trigger>Conteúdo A</Tooltip.Trigger>
{:else}
  <div>Conteúdo B</div>
{/if}

<!-- ✅ CORRETO -->
<Tooltip.Trigger>
  {#if browser}Conteúdo A{:else}Conteúdo B{/if}
</Tooltip.Trigger>
```

## 🎯 Classes Utilitárias Reutilizáveis

Crie classes CSS reutilizáveis para estilos de botão comuns:

```css
/* globals.css */
.trigger-button-primary {
  @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2;
}

.trigger-button-outline {
  @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border h-9 px-4 py-2;
}

.trigger-button-ghost {
  @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2;
}

.trigger-icon-button {
  @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-9;
}
```

Uso:

```svelte
<Tooltip.Trigger class="trigger-button-outline">
  Botão com Tooltip
</Tooltip.Trigger>

<PopoverTrigger class="trigger-button-primary">
  Abrir Popover
</PopoverTrigger>
```

## 📚 Referências de Exemplo

### Estrutura de Componente Segura

```svelte
<script lang="ts">
  // 1. Imports organizados
  import { Tooltip } from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  
  // 2. Props tipadas
  interface Props {
    label: string;
    action: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    className?: string;
  }
  
  let {
    label,
    action,
    disabled = false,
    variant = 'outline',
    className,
    ...restProps
  }: Props = $props();
  
  // 3. Classes computadas
  const triggerClasses = $derived(cn(
    'trigger-button-' + variant,
    className
  ));
</script>

<!-- 4. Markup limpo -->
<Tooltip.Root>
  <Tooltip.Trigger
    class={triggerClasses}
    onclick={action}
    {disabled}
    {...restProps}
  >
    {label}
  </Tooltip.Trigger>
  <Tooltip.Content>
    {label} - Informação adicional
  </Tooltip.Content>
</Tooltip.Root>
```

## 🔄 Migração de Código Legado

Se você encontrar código com padrões antigos:

1. **Identifique o padrão problemático**
2. **Extraia estilos e funcionalidades**
3. **Aplique ao trigger diretamente**
4. **Teste SSR e hidratação**
5. **Valide acessibilidade**

### Exemplo de Migração

```svelte
<!-- ANTES -->
<Tooltip.Root>
  <Tooltip.Trigger asChild let:builder>
    <Button 
      variant="outline"
      use:builder.action
      {...builder}
      onclick={() => window.location.href = '/page'}
    >
      <Icon />
      Texto
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Descrição</Tooltip.Content>
</Tooltip.Root>

<!-- DEPOIS -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="trigger-button-outline"
    onclick={() => window.location.href = '/page'}
    aria-label="Navegar para página"
  >
    <Icon />
    Texto
  </Tooltip.Trigger>
  <Tooltip.Content>Descrição</Tooltip.Content>
</Tooltip.Root>
```

## ⚡ Comandos de Verificação Rápida

```bash
# Buscar padrões problemáticos
grep -r "asChild let:builder" src/
grep -r "<Tooltip.Trigger><Button" src/
grep -r "<PopoverTrigger><Button" src/
grep -r "<.*Trigger.*><a href" src/

# Verificar arquivos modificados
git diff --name-only | xargs grep -l "Trigger.*>" | xargs cat
```

---

## 🎖️ Resumo das Regras de Ouro

1. **Triggers são elementos nativos** - use-os diretamente
2. **Nunca aninhie elementos interativos** - HTML inválido = problemas de SSR
3. **asChild/let:builder é obsoleto** - não use no Svelte 5
4. **Teste sempre em SSR** - garanta que server e client rendem igual
5. **Use classes utilitárias** - mantenha estilos consistentes
6. **Documente desvios** - se precisar quebrar regras, documente por quê

**Lembre-se:** Um minuto extra de planejamento evita horas de debugging de hidratação! 🐛
