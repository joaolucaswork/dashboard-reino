// Script para atualizar as credenciais do ComDinheiro no localStorage
// Execute este script no console do navegador na página da aplicação

console.log("🔑 Atualizando credenciais do ComDinheiro...");

// Novas credenciais fornecidas
const newCredentials = {
  username: "reino.capital",
  password: "Reino123@!",
};

// Atualizar no formato usado pelo componente de configurações
localStorage.setItem("comdinheiro_credentials", JSON.stringify(newCredentials));

// Atualizar no formato de chaves separadas (fallback)
localStorage.setItem("comdinheiro_username", newCredentials.username);
localStorage.setItem("comdinheiro_password", newCredentials.password);

console.log("✅ Credenciais atualizadas com sucesso!");
console.log("📋 Credenciais salvas:", {
  username: newCredentials.username,
  hasPassword: !!newCredentials.password,
});

console.log("🔄 Recarregue a página e teste a consulta novamente.");
