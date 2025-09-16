import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/table-core";

// Create a simple table factory function for Svelte
export function createSvelteTable(options) {
  // This is a simplified implementation
  // In a real implementation, you'd need to properly integrate with Svelte's reactivity
  return {
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => ({ rows: [] }),
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getAllColumns: () => [],
    getColumn: () => null,
    previousPage: () => {},
    nextPage: () => {},
    getCanPreviousPage: () => false,
    getCanNextPage: () => false,
    ...options,
  };
}
import { createRawSnippet } from "svelte";

// Re-export TanStack Table utilities
export {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
};

// FlexRender component for rendering dynamic content
export function FlexRender(content, context) {
  if (typeof content === "function") {
    return content(context);
  }
  return content;
}

// Helper to render Svelte components in table cells
export function renderComponent(component, props = {}) {
  return createRawSnippet(() => ({
    render: () => {
      // This will be handled by the FlexRender component
      return { component, props };
    },
  }));
}

// Helper to render raw snippets in table cells
export function renderSnippet(snippet, ...args) {
  return snippet(...args);
}

// Utility functions for table data formatting
export function formatCurrency(value, currency = "BRL") {
  if (typeof value !== "number") return value;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value);
}

export function formatPercentage(value) {
  if (typeof value !== "number") return value;

  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value) {
  if (typeof value !== "number") return value;

  return new Intl.NumberFormat("pt-BR").format(value);
}
