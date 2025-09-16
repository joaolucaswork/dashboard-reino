# Documentação: Correção de Erros de Tooltip e Popover (SSR e Hidratação)

## Resumo dos Problemas

Durante o desenvolvimento, foram encontrados três tipos de erros relacionados aos componentes de UI:

1. **Erro SSR**: `node_invalid_placement_ssr` - botões aninhados (`<button>` dentro de `<button>`)
2. **Erro Svelte**: `invalid_default_snippet` - uso incorreto de `asChild` com `let:` directives
3. **Erro Hidratação**: `hydration_mismatch` - descompasso entre renderização server-side e client-side

## Análise dos Problemas

### Problema 1: Botões Aninhados (SSR Warning)

**Causa**: O componente `Tooltip.Trigger` do bits-ui renderiza como um `<button>` por padrão. Quando outros elementos interativos eram colocados dentro dele, criava HTML inválido.

**Erro Original**:

```
node_invalid_placement_ssr: `<button>` cannot be a descendant of `<button>`
```

### Problema 2: Snippet Inválido

**Causa**: Uso do padrão `asChild let:builder` que é incompatível com a versão atual do bits-ui e Svelte 5.

**Erro Original**:

```
invalid_default_snippet: Cannot use `{@render children(...)}` if the parent component uses `let:` directives
```

## Soluções Implementadas

### Solução 1: Reestruturação de Tooltips com Elementos Interativos

#### ❌ **ANTES (Não Funciona)**

```svelte
<!-- Tooltip envolvendo um Label (cria botão aninhado) -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <Label for="radio-input" class="cursor-pointer">
      <Icon />
      <span>Texto do Label</span>
    </Label>
  </Tooltip.Trigger>
  <Tooltip.Content>Descrição</Tooltip.Content>
</Tooltip.Root>

<!-- Tooltip envolvendo um link (cria botão que envolve link) -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <a href="/page" class="nav-link">
      <Icon />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>Ir para página</Tooltip.Content>
</Tooltip.Root>

<!-- Tooltip envolvendo outro botão (botão duplo) -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <button onclick={handleClick}>
      <Icon />
    </button>
  </Tooltip.Trigger>
  <Tooltip.Content>Clique aqui</Tooltip.Content>
</Tooltip.Root>
```

#### ✅ **DEPOIS (Funciona)**

**Opção A: Tooltip Separado**

```svelte
<!-- Tooltip como elemento separado, não envolvendo o controle principal -->
<div class="relative">
  <Label for="radio-input" class="cursor-pointer">
    <Icon />
    <span>Texto do Label</span>
    <!-- Tooltip em elemento separado -->
    <Tooltip.Root>
      <Tooltip.Trigger
        class="ml-2 p-1 rounded-full opacity-60 hover:opacity-100"
        aria-label="More information"
      >
        <div class="w-3 h-3 rounded-full border border-current">?</div>
      </Tooltip.Trigger>
      <Tooltip.Content>Descrição detalhada</Tooltip.Content>
    </Tooltip.Root>
  </Label>
</div>
```

**Opção B: Converter para Button com onclick**

```svelte
<!-- Para links: usar onclick em vez de href -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="nav-link"
    onclick={() => window.location.href = '/page'}
    aria-label="Ir para página"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Ir para página</Tooltip.Content>
</Tooltip.Root>

<!-- Para botões: usar o Trigger diretamente -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="button-styles"
    onclick={handleClick}
    aria-label="Clique aqui"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Clique aqui</Tooltip.Content>
</Tooltip.Root>
```

### Solução 2: Remoção do Padrão asChild

#### ❌ **ANTES (Não Funciona)**

```svelte
<!-- Padrão asChild com let:builder (incompatível) -->
<Tooltip.Root>
  <Tooltip.Trigger asChild let:builder>
    <a 
      href="/page"
      use:builder.action
      {...builder}
      class="nav-link"
    >
      <Icon />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>Conteúdo</Tooltip.Content>
</Tooltip.Root>
```

#### ✅ **DEPOIS (Funciona)**

```svelte
<!-- Usar Tooltip.Trigger diretamente -->
<Tooltip.Root>
  <Tooltip.Trigger
    class="nav-link"
    onclick={() => window.location.href = '/page'}
    aria-label="Navegar para página"
  >
    <Icon />
  </Tooltip.Trigger>
  <Tooltip.Content>Conteúdo</Tooltip.Content>
</Tooltip.Root>
```

## Exemplos Práticos de Correções

### Exemplo 1: FormularioConsulta.svelte

**ANTES**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger>
    <Label for={modo.value} class="...">
      <Icon />
      <span>{modo.label}</span>
    </Label>
  </Tooltip.Trigger>
  <Tooltip.Content>{modo.description}</Tooltip.Content>
</Tooltip.Root>
```

**DEPOIS**:

```svelte
<div class="relative">
  <Label for={modo.value} class="...">
    <Icon />
    <span>{modo.label}</span>
    <!-- Tooltip separado -->
    <Tooltip.Root>
      <Tooltip.Trigger
        class="ml-2 p-1 rounded-full opacity-60 hover:opacity-100"
        aria-label="More information about {modo.label}"
      >
        <div class="w-3 h-3 rounded-full border border-current">?</div>
      </Tooltip.Trigger>
      <Tooltip.Content>{modo.description}</Tooltip.Content>
    </Tooltip.Root>
  </Label>
</div>
```

### Exemplo 2: DashboardLayout.svelte - Links de Navegação

**ANTES**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger class="inline-flex">
    <a href="/" class="nav-button">
      <House size={20} />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>Home</Tooltip.Content>
</Tooltip.Root>
```

**DEPOIS**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger
    class="nav-button"
    onclick={() => window.location.href = '/'}
    aria-label="Home"
  >
    <House size={20} />
  </Tooltip.Trigger>
  <Tooltip.Content>Home</Tooltip.Content>
</Tooltip.Root>
```

### Exemplo 3: DashboardLayout.svelte - Padrão asChild

**ANTES**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger asChild let:builder>
    <a
      href={integration.href}
      use:builder.action
      {...builder}
      class="integration-link"
    >
      <div class="color-indicator {integration.color}"></div>
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content>{integration.name}</Tooltip.Content>
</Tooltip.Root>
```

**DEPOIS**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger
    class="integration-link"
    onclick={() => window.location.href = integration.href}
    aria-label={integration.name}
  >
    <div class="color-indicator {integration.color}"></div>
  </Tooltip.Trigger>
  <Tooltip.Content>{integration.name}</Tooltip.Content>
</Tooltip.Root>
```

## Regras Gerais Para Tooltips

### ✅ **FAÇA (Padrões que Funcionam)**

1. **Use Tooltip.Trigger diretamente como botão**:

```svelte
<Tooltip.Root>
  <Tooltip.Trigger class="..." onclick={handler}>
    Conteúdo do botão
  </Tooltip.Trigger>
  <Tooltip.Content>Tooltip content</Tooltip.Content>
</Tooltip.Root>
```

2. **Para navegação, use onclick com window.location**:

```svelte
<Tooltip.Trigger onclick={() => window.location.href = '/path'}>
```

3. **Separe tooltips informativos de controles principais**:

```svelte
<div class="form-control">
  <Label>Campo</Label>
  <Input />
  <Tooltip.Root>
    <Tooltip.Trigger class="info-icon">?</Tooltip.Trigger>
    <Tooltip.Content>Informação adicional</Tooltip.Content>
  </Tooltip.Root>
</div>
```

### ❌ **NÃO FAÇA (Padrões que Quebram)**

1. **Não aninhie elementos interativos dentro de Tooltip.Trigger**:

```svelte
<!-- ERRADO -->
<Tooltip.Trigger>
  <button>Botão</button>
</Tooltip.Trigger>

<Tooltip.Trigger>
  <a href="/">Link</a>
</Tooltip.Trigger>

<Tooltip.Trigger>
  <Label for="input">Label</Label>
</Tooltip.Trigger>
```

2. **Não use o padrão asChild com let:builder**:

```svelte
<!-- ERRADO -->
<Tooltip.Trigger asChild let:builder>
  <a use:builder.action {...builder}>Link</a>
</Tooltip.Trigger>
```

3. **Não wrapeie formulários ou controles complexos**:

```svelte
<!-- ERRADO -->
<Tooltip.Trigger>
  <form>
    <input />
    <button>Submit</button>
  </form>
</Tooltip.Trigger>
```

## Benefícios das Correções

1. **HTML Válido**: Elimina botões aninhados que causam problemas de SSR
2. **Compatibilidade**: Remove dependências de padrões obsoletos do bits-ui
3. **Acessibilidade**: Mantém semântica correta com `aria-label` adequados
4. **Performance**: Evita problemas de hidratação no SSR
5. **Manutenibilidade**: Código mais simples e direto

## Arquivos Modificados

- `src/lib/components/tabelas/FormularioConsulta.svelte`
- `src/lib/components/DashboardLayout.svelte`

## Testes Recomendados

1. Verificar se não há warnings de SSR no console
2. Testar navegação com tooltips funcionando
3. Verificar acessibilidade com screen readers
4. Confirmar que tooltips aparecem corretamente em hover/focus
5. Testar em diferentes dispositivos (desktop/mobile)
