/**
 * Utilitário para aplicar fonte monospace apenas aos números
 */

/**
 * Envolve números em um texto com spans que aplicam fonte monospace
 * @param {string} text - Texto que pode conter números
 * @returns {string} - HTML com números envolvidos em spans
 */
export function wrapNumbersWithFont(text) {
  if (!text || typeof text !== "string") return text;

  // Regex para capturar números (incluindo decimais, percentuais, moedas)
  const numberRegex =
    /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?%?|R\$\s?\d+(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+[.,]\d+|\d+)/g;

  return text.replace(numberRegex, '<span class="num">$1</span>');
}

/**
 * Aplica o wrapper de números a um elemento DOM
 * @param {HTMLElement} element - Elemento para processar
 */
export function applyNumberFontToElement(element) {
  if (!element) return;

  // Processa apenas nós de texto, não elementos filhos
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  const textNodes = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const originalText = textNode.textContent || "";
    const wrappedText = wrapNumbersWithFont(originalText);

    if (wrappedText !== originalText && textNode.parentNode) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = wrappedText;

      // Substitui o nó de texto pelos novos nós
      const parent = textNode.parentNode;
      while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, textNode);
      }
      parent.removeChild(textNode);
    }
  });
}

/**
 * Ação Svelte para aplicar fonte monospace aos números automaticamente
 * @param {HTMLElement} node - Elemento a ser processado
 */
export function numberFont(node) {
  // Aplica na montagem
  applyNumberFontToElement(node);

  // Observa mudanças para reaplicar
  const observer = new MutationObserver(() => {
    applyNumberFontToElement(node);
  });

  observer.observe(node, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return {
    destroy() {
      observer.disconnect();
    },
  };
}

/**
 * Helper para formatar números com fonte monospace em templates Svelte
 * @param {string|number} value - Valor a ser formatado
 * @returns {string} - HTML seguro para usar com {@html}
 */
export function formatNumberWithFont(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  return wrapNumbersWithFont(text);
}
