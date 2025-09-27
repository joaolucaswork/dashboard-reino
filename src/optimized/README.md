# SVGs Otimizados - Logos de Bancos

Este diretório contém versões otimizadas dos logos de bancos, convertidos para usar `currentColor` e com elementos desnecessários removidos.

## Resumo das Otimizações

### Reduções de Tamanho de Arquivo

| Arquivo | Original | Otimizado | Redução |
|---------|----------|-----------|---------|
| BTG.svg | 4,517 bytes | 4,350 bytes | 3.7% |
| Banco do brasil.svg | 1,145 bytes | 778 bytes | 32.1% |
| Bradesco.svg | 4,440 bytes | 4,056 bytes | 8.6% |
| Caixa.svg | 1,377 bytes | 1,287 bytes | 6.5% |
| Itau.svg | 2,233 bytes | 2,229 bytes | 0.2% |
| XP CORRETORA.svg | 1,196 bytes | 1,201 bytes | -0.4% |
| ÁGORA.svg | 4,326 bytes | 3,881 bytes | 10.3% |

**Total:** 19,234 bytes → 17,782 bytes (**7.6% de redução**)

## Principais Otimizações Realizadas

### 1. Remoção de Elementos Desnecessários

- **clipPath** e **mask** removidos quando não essenciais
- **defs** vazios ou redundantes eliminados
- Atributos desnecessários limpos

### 2. Conversão para currentColor

- Todas as cores fixas (`fill="#color"`) convertidas para `fill="currentColor"`
- Para SVGs multicoloridos, implementadas classes CSS com opacidade diferente

### 3. Estrutura Simplificada

- Grupos (`<g>`) desnecessários removidos
- Estrutura XML otimizada

## Como Usar os SVGs com currentColor

### Uso Básico

```html
<!-- O SVG herdará a cor do texto do elemento pai -->
<div style="color: #003399;">
  <img src="optimized/BTG.svg" alt="BTG Logo">
</div>
```

### Com CSS

```css
.logo-azul {
  color: #003399;
}

.logo-vermelho {
  color: #e51736;
}

.logo-amarelo {
  color: #ffc709;
}
```

```html
<div class="logo-azul">
  <img src="optimized/Itau.svg" alt="Itaú Logo">
</div>
```

### SVGs Multicoloridos

Alguns SVGs (Itaú, Caixa, ÁGORA) mantêm diferenciação de cores através de classes CSS internas:

```css
/* Para personalizar as cores do Itaú */
.custom-itau .itau-bg { fill: #003399; }
.custom-itau .itau-text { fill: #ffff00; }
.custom-itau .itau-accent { fill: #003399; }

/* Para personalizar as cores do ÁGORA */
.custom-agora .agora-bg { fill: #00C88D; }      /* Fundo verde */
.custom-agora .agora-arrow { fill: #175459; }   /* Seta/Logo "A" */
.custom-agora .agora-text { fill: white; }      /* Texto "ÁGORA" */

/* Para personalizar as cores da Caixa */
.custom-caixa .caixa-blue { fill: #0070AF; }
.custom-caixa .caixa-orange { fill: #F6822A; }
```

## Compatibilidade

- ✅ Todos os navegadores modernos
- ✅ Suporte completo ao `currentColor`
- ✅ Funciona com `<img>`, `<svg>` inline, e CSS background
- ✅ Responsivo e escalável

## Benefícios

1. **Flexibilidade de Cores**: Fácil mudança de cores via CSS
2. **Tamanho Reduzido**: Arquivos menores para carregamento mais rápido
3. **Manutenibilidade**: Código mais limpo e fácil de manter
4. **Acessibilidade**: Melhor suporte a temas escuros/claros
5. **Performance**: Menos elementos DOM para processar

## Arquivos Originais

Os arquivos originais foram mantidos no diretório raiz para referência e backup.
