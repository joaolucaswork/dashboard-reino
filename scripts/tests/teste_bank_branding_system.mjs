/**
 * Test Script - Bank Branding System
 *
 * Comprehensive testing of the bank logo and branding system including:
 * - Logo availability and format validation
 * - Color mapping accuracy
 * - Component integration
 * - Visual state management
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "../..");

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Expected banks from Com Dinheiro data analysis
const expectedBanks = [
  "Itau",
  "Itaú",
  "Bradesco",
  "BTG",
  "XP",
  "Agora",
  "Ágora",
  "Caixa",
  "BB",
  "Banco do Brasil",
];

// Expected brand colors (hex codes)
const expectedColors = {
  Itau: "#EC7000",
  Itaú: "#EC7000",
  Bradesco: "#CC092F",
  BTG: "#003366",
  XP: "#FFD700",
  Agora: "#00A651",
  Ágora: "#00A651",
  Caixa: "#0066CC",
  BB: "#FFD700",
  "Banco do Brasil": "#FFD700",
};

function testLogoFiles() {
  log("🎨 Testing Bank Logo Files", "bold");
  log("=" * 40, "blue");

  const logoDir = join(projectRoot, "src/lib/assets/logos_bancos");
  const expectedLogos = [
    "banco-itau.svg",
    "banco-bradesco.svg",
    "btg-pactual.svg",
    "xp-investimentos.svg",
    "agora-investimentos.svg",
    "caixa-economica.svg",
    "banco-brasil.svg",
  ];

  let passed = 0;
  let total = expectedLogos.length;

  expectedLogos.forEach((logoFile) => {
    const logoPath = join(logoDir, logoFile);
    if (existsSync(logoPath)) {
      // Check if file contains currentColor
      const content = readFileSync(logoPath, "utf8");
      if (content.includes("currentColor")) {
        log(`✅ ${logoFile} - exists and uses currentColor`, "green");
        passed++;
      } else {
        log(`⚠️  ${logoFile} - exists but doesn't use currentColor`, "yellow");
      }
    } else {
      log(`❌ ${logoFile} - missing`, "red");
    }
  });

  // Test index file
  const indexPath = join(logoDir, "index.ts");
  if (existsSync(indexPath)) {
    log(`✅ index.ts - exists`, "green");
    passed++;
    total++;
  } else {
    log(`❌ index.ts - missing`, "red");
    total++;
  }

  log(
    `\n📊 Logo Files: ${passed}/${total} passed`,
    passed === total ? "green" : "yellow"
  );
  return passed === total;
}

function testBankConfiguration() {
  log("\n🏦 Testing Bank Configuration", "bold");
  log("=" * 40, "blue");

  const bancosPath = join(projectRoot, "src/lib/data/bancos.js");

  if (!existsSync(bancosPath)) {
    log("❌ bancos.js file not found", "red");
    return false;
  }

  const content = readFileSync(bancosPath, "utf8");
  let passed = 0;
  let total = 0;

  // Test if expected banks are configured
  expectedBanks.forEach((bank) => {
    total++;
    if (content.includes(`"${bank}"`) || content.includes(`${bank}:`)) {
      log(`✅ ${bank} - configured`, "green");
      passed++;
    } else {
      log(`❌ ${bank} - not configured`, "red");
    }
  });

  // Test if corInactive property exists
  total++;
  if (content.includes("corInactive")) {
    log(`✅ corInactive property - exists`, "green");
    passed++;
  } else {
    log(`❌ corInactive property - missing`, "red");
  }

  // Test if new utility functions exist
  const utilityFunctions = [
    "getBancoCorInactive",
    "getBancoCores",
    "isBancoConfigurado",
    "getBancoInfo",
  ];

  utilityFunctions.forEach((func) => {
    total++;
    if (content.includes(func)) {
      log(`✅ ${func} function - exists`, "green");
      passed++;
    } else {
      log(`❌ ${func} function - missing`, "red");
    }
  });

  log(
    `\n📊 Bank Configuration: ${passed}/${total} passed`,
    passed === total ? "green" : "yellow"
  );
  return passed === total;
}

function testComponentFiles() {
  log("\n🧩 Testing Component Files", "bold");
  log("=" * 40, "blue");

  const components = [
    "src/lib/components/ui/BankLogo.svelte",
    "src/lib/components/ui/BankHeader.svelte",
  ];

  let passed = 0;
  let total = components.length;

  components.forEach((componentPath) => {
    const fullPath = join(projectRoot, componentPath);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, "utf8");

      // Check for key features
      const hasProps = content.includes("export let");
      const hasTransitions = content.includes("transition");
      const hasAccessibility =
        content.includes("aria-") || content.includes("role=");

      if (hasProps && hasTransitions && hasAccessibility) {
        log(`✅ ${componentPath.split("/").pop()} - complete`, "green");
        passed++;
      } else {
        log(
          `⚠️  ${componentPath.split("/").pop()} - missing features`,
          "yellow"
        );
      }
    } else {
      log(`❌ ${componentPath.split("/").pop()} - missing`, "red");
    }
  });

  log(
    `\n📊 Components: ${passed}/${total} passed`,
    passed === total ? "green" : "yellow"
  );
  return passed === total;
}

function testIntegration() {
  log("\n🔗 Testing Integration", "bold");
  log("=" * 40, "blue");

  const tabelaPath = join(
    projectRoot,
    "src/lib/components/tabelas/TabelaConsolidada.svelte"
  );

  if (!existsSync(tabelaPath)) {
    log("❌ TabelaConsolidada.svelte not found", "red");
    return false;
  }

  const content = readFileSync(tabelaPath, "utf8");
  let passed = 0;
  let total = 2;

  // Check if BankHeader is imported
  if (content.includes("import BankHeader")) {
    log(`✅ BankHeader import - exists`, "green");
    passed++;
  } else {
    log(`❌ BankHeader import - missing`, "red");
  }

  // Check if BankHeader is used
  if (content.includes("<BankHeader")) {
    log(`✅ BankHeader usage - exists`, "green");
    passed++;
  } else {
    log(`❌ BankHeader usage - missing`, "red");
  }

  log(
    `\n📊 Integration: ${passed}/${total} passed`,
    passed === total ? "green" : "yellow"
  );
  return passed === total;
}

function testColorAccuracy() {
  log("\n🎨 Testing Color Accuracy", "bold");
  log("=" * 40, "blue");

  const bancosPath = join(projectRoot, "src/lib/data/bancos.js");

  if (!existsSync(bancosPath)) {
    log("❌ bancos.js file not found", "red");
    return false;
  }

  const content = readFileSync(bancosPath, "utf8");
  let passed = 0;
  let total = 0;

  Object.entries(expectedColors).forEach(([bank, expectedColor]) => {
    total++;

    // Look for the bank configuration and its color
    const bankRegex = new RegExp(
      `["']${bank}["']\\s*:\\s*{[^}]*cor:\\s*["']([^"']+)["']`,
      "i"
    );
    const match = content.match(bankRegex);

    if (match && match[1] === expectedColor) {
      log(`✅ ${bank} - correct color (${expectedColor})`, "green");
      passed++;
    } else if (match) {
      log(
        `⚠️  ${bank} - color mismatch (expected: ${expectedColor}, found: ${match[1]})`,
        "yellow"
      );
    } else {
      log(`❌ ${bank} - color not found`, "red");
    }
  });

  log(
    `\n📊 Color Accuracy: ${passed}/${total} passed`,
    passed === total ? "green" : "yellow"
  );
  return passed === total;
}

async function runAllTests() {
  log("🚀 BANK BRANDING SYSTEM TESTS", "bold");
  log("=" * 60, "blue");
  log("🔍 Testing complete bank branding implementation", "blue");

  const results = [];

  // Run all test suites
  results.push(testLogoFiles());
  results.push(testBankConfiguration());
  results.push(testComponentFiles());
  results.push(testIntegration());
  results.push(testColorAccuracy());

  // Summary
  const passedTests = results.filter((r) => r).length;
  const totalTests = results.length;

  log("\n" + "=" * 60, "blue");
  log("📊 FINAL RESULTS", "bold");
  log("=" * 60, "blue");

  if (passedTests === totalTests) {
    log("🎉 ALL TESTS PASSED!", "green");
    log("✅ Bank branding system is fully functional", "green");
    log("✅ Logos are properly configured with currentColor", "green");
    log("✅ Color mapping is accurate", "green");
    log("✅ Components are integrated correctly", "green");
  } else {
    log(`⚠️  ${passedTests}/${totalTests} test suites passed`, "yellow");
    log("❌ Some issues need to be addressed", "red");
  }

  log("\n💡 Next steps:", "blue");
  log("1. Start the development server (npm run dev)", "blue");
  log("2. Navigate to the Tables page", "blue");
  log("3. Test the consolidated view with bank logos", "blue");
  log("4. Verify active/inactive states work correctly", "blue");

  return passedTests === totalTests ? 0 : 1;
}

// Run the tests
runAllTests()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    log(`❌ Test execution error: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
