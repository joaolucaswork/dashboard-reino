# Guia de Implementação de Tooltips para Elementos com Posicionamento Complexo

## Problema Identificado

Ao implementar tooltips do shadcn/ui em elementos com posicionamento absoluto complexo (como botões com `absolute inset-0`), os tooltips podem aparecer em posições incorretas (em cima em vez do lado direito).

## Solução Técnica

### ❌ Abordagem Incorreta
```svelte
<!-- NÃO FUNCIONA CORRETAMENTE -->
<div class="container relative">
  <Tooltip.Root>
    <Tooltip.Trigger>
      <button class="absolute inset-0 w-full h-full">
        <!-- Botão com posicionamento absoluto -->
      </button>
    </Tooltip.Trigger>
    <Tooltip.Content side="right">Tooltip</Tooltip.Content>
  </Tooltip.Root>
</div>
```

**Problema**: O tooltip é posicionado em relação ao botão com `absolute inset-0`, causando conflitos de posicionamento.

### ✅ Abordagem Correta
```svelte
<!-- FUNCIONA CORRETAMENTE -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <div class="container relative cursor-pointer">
      <button 
        class="absolute inset-0 w-full h-full cursor-pointer z-10"
        onclick={handleClick}
        aria-label="Ação"
      ></button>
      <!-- Conteúdo visual do container -->
    </div>
  </Tooltip.Trigger>
  <Tooltip.Content 
    side="right" 
    align="center" 
    sideOffset={16}
    class="bg-primary text-primary-foreground font-medium text-xs z-50"
  >
    Texto do Tooltip
  </Tooltip.Content>
</Tooltip.Root>
```

## Parâmetros Importantes

### Posicionamento
- `side="right"`: Tooltip aparece do lado direito
- `align="center"`: Alinhamento central vertical
- `sideOffset={16}`: Espaçamento de 16px do elemento trigger

### Estilo e Z-Index
- `z-50`: Garante que o tooltip apareça acima de outros elementos
- Classes do shadcn/ui: `bg-primary text-primary-foreground font-medium text-xs`

### Visibilidade Condicional
```svelte
<Tooltip.Content 
  hidden={sidebarOpen}  <!-- Só mostra quando sidebar está colapsado -->
  side="right"
>
```

## Exemplo Prático: Pasta Colapsível

```svelte
<!-- Implementação para pasta de navegação colapsível -->
<Tooltip.Root>
  <Tooltip.Trigger>
    <div class="thumbnail-preview w-14 h-14 relative cursor-pointer">
      {#if !expanded}
        <button
          class="absolute inset-0 w-full h-full cursor-pointer z-10"
          onclick={() => toggleSection("integrations")}
          aria-label="Toggle integrations menu"
        ></button>
      {/if}
      
      <!-- Conteúdo visual da pasta -->
      <DynamicFolderPreview config={integrationsConfig} />
    </div>
  </Tooltip.Trigger>
  
  <Tooltip.Content
    side="right"
    align="center"
    sideOffset={16}
    hidden={sidebarOpen}
    class="bg-primary text-primary-foreground font-medium text-xs z-50"
  >
    Integrações Bancárias
  </Tooltip.Content>
</Tooltip.Root>
```

## Princípios Fundamentais

1. **Container como Trigger**: Use o container pai como trigger do tooltip, não o elemento com posicionamento absoluto
2. **Cursor Pointer**: Adicione `cursor-pointer` ao container para indicar interatividade
3. **Z-Index Adequado**: Use `z-50` no tooltip para garantir visibilidade
4. **SideOffset Apropriado**: Use valores entre 12-16px para espaçamento adequado
5. **Visibilidade Condicional**: Implemente lógica para mostrar tooltips apenas quando necessário

## Benefícios da Abordagem

- ✅ Posicionamento correto e consistente
- ✅ Compatibilidade com elementos de posicionamento complexo
- ✅ Mantém funcionalidade de clique intacta
- ✅ Acessibilidade preservada
- ✅ Estilo consistente com design system

## Casos de Uso

- Pastas colapsíveis em sidebars
- Botões com overlay absoluto
- Cards interativos com elementos sobrepostos
- Elementos com máscaras de clique invisíveis

Esta técnica resolve problemas de posicionamento de tooltips em elementos com estruturas de DOM complexas, garantindo uma experiência de usuário consistente e profissional.
