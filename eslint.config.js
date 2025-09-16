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
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "ui-patterns/no-nested-interactive": "error",
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
