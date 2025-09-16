#!/usr/bin/env node

/**
 * Script de Verificação de Componentes UI
 *
 * Este script verifica automaticamente por padrões problemáticos
 * que podem causar erros de SSR e hidratação.
 *
 * Uso: node scripts/check-ui-patterns.js
 *
 * Adicione ao package.json:
 * "scripts": {
 *   "check-ui": "node scripts/check-ui-patterns.js",
 *   "pre-commit": "npm run check-ui && npm run lint"
 * }
 */

import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Padrões problemáticos que devem ser detectados
const PROBLEMATIC_PATTERNS = [
  {
    name: "Botão aninhado em Tooltip",
    pattern: /<Tooltip\.Trigger[^>]*>\s*<Button/gi,
    severity: "error",
    message:
      "Tooltip.Trigger não deve conter Button. Use o Trigger diretamente.",
  },
  {
    name: "Botão aninhado em Popover",
    pattern: /<PopoverTrigger[^>]*>\s*<Button/gi,
    severity: "error",
    message:
      "PopoverTrigger não deve conter Button. Use o Trigger diretamente.",
  },
  {
    name: "Link aninhado em Trigger",
    pattern: /<(Tooltip\.Trigger|PopoverTrigger|.*Trigger)[^>]*>\s*<a\s+href/gi,
    severity: "error",
    message:
      "Triggers não devem conter links. Use onclick com window.location.href.",
  },
  {
    name: "Padrão asChild obsoleto",
    pattern: /asChild\s+let:builder/gi,
    severity: "error",
    message:
      "Padrão asChild let:builder é obsoleto no Svelte 5. Use triggers diretamente.",
  },
  {
    name: "Button envolvendo link",
    pattern: /<Button[^>]*>\s*<a\s+href/gi,
    severity: "error",
    message:
      "Button não deve envolver links. Use onclick ou converta para link estilizado.",
  },
  {
    name: "Label aninhado em Trigger",
    pattern: /<(Tooltip\.Trigger|PopoverTrigger)[^>]*>\s*<Label/gi,
    severity: "warning",
    message:
      "Labels em triggers podem causar problemas. Considere tooltip separado.",
  },
  {
    name: "use:builder sem asChild",
    pattern: /use:builder\.action/gi,
    severity: "warning",
    message: "use:builder.action sem asChild pode indicar padrão obsoleto.",
  },
];

// Extensões de arquivo para verificar
const EXTENSIONS_TO_CHECK = [".svelte", ".ts", ".js"];

// Diretórios para ignorar
const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", ".svelte-kit"];

class UIPatternChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.filesChecked = 0;
  }

  async checkDirectory(dirPath) {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory() && !IGNORE_DIRS.includes(entry.name)) {
          await this.checkDirectory(fullPath);
        } else if (entry.isFile() && this.shouldCheckFile(entry.name)) {
          await this.checkFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar diretório ${dirPath}:`, error.message);
    }
  }

  shouldCheckFile(filename) {
    return EXTENSIONS_TO_CHECK.some((ext) => filename.endsWith(ext));
  }

  async checkFile(filePath) {
    try {
      const content = await readFile(filePath, "utf-8");
      this.filesChecked++;

      for (const patternConfig of PROBLEMATIC_PATTERNS) {
        const matches = [...content.matchAll(patternConfig.pattern)];

        if (matches.length > 0) {
          for (const match of matches) {
            const lineNumber = this.getLineNumber(content, match.index);
            const issue = {
              file: filePath,
              line: lineNumber,
              pattern: patternConfig.name,
              message: patternConfig.message,
              code: match[0].trim(),
              severity: patternConfig.severity,
            };

            if (patternConfig.severity === "error") {
              this.errors.push(issue);
            } else {
              this.warnings.push(issue);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar arquivo ${filePath}:`, error.message);
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split("\n").length;
  }

  generateReport() {
    console.log("\n🔍 RELATÓRIO DE VERIFICAÇÃO DE COMPONENTES UI\n");
    console.log(`📁 Arquivos verificados: ${this.filesChecked}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    console.log(`⚠️  Avisos encontrados: ${this.warnings.length}\n`);

    if (this.errors.length > 0) {
      console.log("🚨 ERROS CRÍTICOS (devem ser corrigidos):\n");
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.pattern}`);
        console.log(`   📄 Arquivo: ${error.file}`);
        console.log(`   📍 Linha: ${error.line}`);
        console.log(`   💬 Mensagem: ${error.message}`);
        console.log(`   📝 Código: ${error.code}`);
        console.log("");
      });
    }

    if (this.warnings.length > 0) {
      console.log("⚠️  AVISOS (recomendado corrigir):\n");
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.pattern}`);
        console.log(`   📄 Arquivo: ${warning.file}`);
        console.log(`   📍 Linha: ${warning.line}`);
        console.log(`   💬 Mensagem: ${warning.message}`);
        console.log(`   📝 Código: ${warning.code}`);
        console.log("");
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(
        "✅ Nenhum problema encontrado! Componentes UI estão seguindo as boas práticas."
      );
    }

    // Mostrar sugestões
    this.showSuggestions();

    return this.errors.length === 0;
  }

  showSuggestions() {
    if (this.errors.length > 0 || this.warnings.length > 0) {
      console.log("\n💡 SUGESTÕES PARA CORREÇÃO:\n");

      console.log("1. 🔧 Para botões aninhados:");
      console.log("   - Remova o componente Button interno");
      console.log("   - Aplique as classes do button diretamente no Trigger");
      console.log(
        '   - Use classes utilitárias como "trigger-button-outline"\n'
      );

      console.log("2. 🔗 Para links aninhados:");
      console.log(
        '   - Substitua href por onclick={() => window.location.href = "/path"}'
      );
      console.log("   - Mantenha acessibilidade com aria-label adequado\n");

      console.log("3. 📝 Para labels aninhados:");
      console.log("   - Mova tooltip para fora do label");
      console.log(
        "   - Use tooltip como elemento irmão com ícone de informação\n"
      );

      console.log("4. 🔄 Para padrões obsoletos:");
      console.log("   - Remova asChild e let:builder");
      console.log("   - Use triggers diretamente com onclick handlers\n");

      console.log(
        "📚 Consulte: docs/ui-components-best-practices.md para exemplos completos"
      );
    }
  }
}

// Função principal
async function main() {
  const checker = new UIPatternChecker();
  const srcPath = join(__dirname, "..", "src");

  console.log("🚀 Iniciando verificação de padrões de componentes UI...");
  console.log(`📂 Verificando diretório: ${srcPath}\n`);

  await checker.checkDirectory(srcPath);
  const success = checker.generateReport();

  // Exit com código de erro se houver problemas críticos
  process.exit(success ? 0 : 1);
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Erro durante a verificação:", error);
    process.exit(1);
  });
}

export { UIPatternChecker, PROBLEMATIC_PATTERNS };
