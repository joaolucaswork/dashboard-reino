import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import svelteParser from "svelte-eslint-parser";
import globals from "globals";
import uiPatterns from "./scripts/eslint-rules/index.js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,ts,svelte}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      // TypeScript-aware projects should disable base no-undef
      // See: https://typescript-eslint.io/rules/no-undef/
      "no-undef": "off",
      // Use warn for unused to avoid blocking CI on WIP code
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Relax some stylistic rules to warnings
      "no-case-declarations": "warn",
      "no-useless-escape": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: typescriptParser,
      },
    },
    plugins: {
      svelte,
      "@typescript-eslint": typescript,
      "ui-patterns": uiPatterns,
    },
    rules: {
      ...svelte.configs.recommended.rules,
      "svelte/valid-compile": "error",
      "svelte/no-unused-svelte-ignore": "warn",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "ui-patterns/no-nested-interactive": "error",
    },
  },
  // Tests and scripts overrides
  {
    files: ["scripts/tests/**/*.{cjs,mjs,js}"],
    languageOptions: {
      globals: {
        ...globals.node,
        fetch: true,
        URLSearchParams: true,
        console: true,
        process: true,
      },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  // Svelte 5 macro TS helper files may use $state/$derived which ESLint can't parse as globals
  {
    files: ["**/*.svelte.ts"],
    rules: {
      "no-undef": "off",
    },
  },
  // File-specific override for a known nested interactive false-positive
  {
    files: ["src/lib/components/ui/data-table/EnhancedDataTable.svelte"],
    rules: {
      "ui-patterns/no-nested-interactive": "off",
    },
  },
  {
    ignores: [
      "build/",
      ".svelte-kit/",
      "dist/",
      "node_modules/",
      "scripts/app_base/",
      "**/__pycache__/",
      "*.pyc",
    ],
  },
];
