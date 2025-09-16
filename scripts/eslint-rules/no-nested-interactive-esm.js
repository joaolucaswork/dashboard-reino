export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Detecta elementos interativos aninhados que causam problemas de SSR",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    function checkNestedInteractive(node) {
      const text = sourceCode.getText(node);

      // Padrões problemáticos que causam elementos interativos aninhados
      const problematicPatterns = [
        /<Tooltip\.Trigger[^>]*>\s*<Button/i,
        /<PopoverTrigger[^>]*>\s*<Button/i,
        /<DropdownMenu\.Trigger[^>]*>\s*<Button/i,
        /<Dialog\.Trigger[^>]*>\s*<Button/i,
        /asChild\s+let:builder/i,
        /<[^>]*\s+href\s*=[^>]*>\s*<Button/i,
        /<button[^>]*>\s*<Button/i,
        /<a[^>]*>\s*<Button/i,
      ];

      for (const pattern of problematicPatterns) {
        if (pattern.test(text)) {
          context.report({
            node,
            message: `Detectado elemento interativo aninhado. Padrão problemático: "${pattern.source}". Isso pode causar erros de SSR e HTML inválido.`,
          });
          break;
        }
      }
    }

    return {
      Program(node) {
        // Para arquivos Svelte, verificamos todo o conteúdo
        if (context.getFilename().endsWith(".svelte")) {
          checkNestedInteractive(node);
        }
      },

      // Para JSX/TSX
      JSXElement(node) {
        checkNestedInteractive(node);
      },
    };
  },
};
