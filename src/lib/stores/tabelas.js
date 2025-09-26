import { writable, derived } from "svelte/store";
import { validarFormulario } from "$lib/utils/validators.js";
import { getMockDataByMode } from "$lib/mocks/tabelas.js";
import { toast, showToast, authShowToast } from "$lib/utils/toast.js";

// Estados principais do formulário
// TEMPORARILY CHANGED DEFAULT - was "relatorio", changed to active mode
export const modoVisualizacao = writable("consolidado");
export const carteiraAtual = writable("");
export const carteiraComdinheiroAtual = writable(""); // Nome técnico para API Comdinheiro
export const dataFinal = writable("");
export const dataInicial = writable("");
export const bancoSelecionado = writable("");
export const operacaoSelecionada = writable("C+V");
export const perfilReferencia = writable("");

// Estados de dados e UI
export const dadosConsulta = writable(/** @type {any} */ (null));
export const loadingState = writable(false);
export const errorState = writable(/** @type {string | null} */ (null));
export const validationErrors = writable(/** @type {string[]} */ ([]));

// Store derivado para controlar visibilidade de campos baseado no modo
export const camposVisiveis = derived(modoVisualizacao, ($modo) => ({
  banco: $modo === "movimentacoes",
  dataInicial: ["movimentacoes", "analise"].includes($modo),
  operacao: $modo === "movimentacoes",
  perfil: $modo === "asset_allocation",
}));

// Store para validação do formulário
export const formularioValido = derived(
  [
    modoVisualizacao,
    carteiraAtual,
    dataFinal,
    dataInicial,
    bancoSelecionado,
    perfilReferencia,
    operacaoSelecionada,
  ],
  ([
    $modo,
    $carteira,
    $dataFinal,
    $dataInicial,
    $banco,
    $perfil,
    $operacao,
  ]) => {
    const dados = {
      modoVisualizacao: $modo,
      carteira: $carteira,
      dataFinal: $dataFinal,
      dataInicial: $dataInicial,
      banco: $banco,
      operacao: $operacao,
      perfil: $perfil,
    };

    try {
      const validacao = validarFormulario(dados);
      validationErrors.set(/** @type {string[]} */ (validacao.erros || []));
      return /** @type {boolean} */ (validacao.valido || false);
    } catch (error) {
      validationErrors.set(["Erro na validação do formulário"]);
      return false;
    }
  }
);

// Note: Status messages are now handled by toast notifications
// The statusMessage derived store has been replaced with toast notifications

// Função para resetar o formulário
export function resetFormulario() {
  modoVisualizacao.set("relatorio");
  carteiraAtual.set("");
  carteiraComdinheiroAtual.set("");
  dataFinal.set("");
  dataInicial.set("");
  bancoSelecionado.set("");
  operacaoSelecionada.set("C+V");
  perfilReferencia.set("");
  dadosConsulta.set(null);
  errorState.set(null);
}

// Função para consultar dados (integração real com Comdinheiro)
export async function consultarDados() {
  loadingState.set(true);
  errorState.set(null);

  // Show loading toast (authentication-aware)
  const loadingToastId = await authShowToast.consultingData();

  try {
    // Obter valores atuais dos stores
    let modo,
      carteira,
      carteiraComdinheiro,
      dataFinalVal,
      dataInicialVal,
      banco,
      operacao,
      perfil;

    const unsubscribers = [
      modoVisualizacao.subscribe((v) => (modo = v)),
      carteiraAtual.subscribe((v) => (carteira = v)),
      carteiraComdinheiroAtual.subscribe((v) => (carteiraComdinheiro = v)),
      dataFinal.subscribe((v) => (dataFinalVal = v)),
      dataInicial.subscribe((v) => (dataInicialVal = v)),
      bancoSelecionado.subscribe((v) => (banco = v)),
      operacaoSelecionada.subscribe((v) => (operacao = v)),
      perfilReferencia.subscribe((v) => (perfil = v)),
    ];

    // Limpar subscriptions
    unsubscribers.forEach((unsub) => unsub());

    let resultData;

    // Se for "consolidado", usar API do Comdinheiro
    if (modo === "consolidado") {
      console.log("🔍 Consultando posição consolidada via API Comdinheiro...");

      // Buscar credenciais do localStorage (formato correto)
      let username, password;

      // Tentar buscar do formato usado pelo componente de configurações
      const savedCredentials = localStorage.getItem("comdinheiro_credentials");
      if (savedCredentials) {
        try {
          const credentials = JSON.parse(savedCredentials);
          username = credentials.username;
          password = credentials.password;
        } catch (error) {
          console.error("Erro ao parsear credenciais:", error);
        }
      }

      // Fallback: tentar formato de chaves separadas
      if (!username || !password) {
        username = localStorage.getItem("comdinheiro_username");
        password = localStorage.getItem("comdinheiro_password");
      }

      if (!username || !password) {
        throw new Error(
          "Credenciais do Comdinheiro não encontradas. Configure em /settings"
        );
      }

      console.log("🔑 Credenciais encontradas:", {
        username: username.substring(0, 3) + "***",
        hasPassword: !!password,
      });

      // Usar o nome técnico da carteira para a API Comdinheiro
      const nomeCarteiraParaAPI = carteiraComdinheiro || carteira;

      console.log("🎯 Mapeamento de carteiras:", {
        nomeExibicao: carteira,
        nomeComdinheiro: carteiraComdinheiro,
        nomeUsadoNaAPI: nomeCarteiraParaAPI,
      });

      // Buscar dados da API Comdinheiro
      const response = await fetch("/api/comdinheiro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-comdinheiro-username": username,
          "x-comdinheiro-password": password,
        },
        body: JSON.stringify({
          action: "posicao_consolidada",
          carteira: nomeCarteiraParaAPI,
          data_final: dataFinalVal,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const apiData = await response.json();

      if (!apiData.success) {
        throw new Error(
          apiData.error || "Erro ao consultar dados do Comdinheiro"
        );
      }

      resultData = apiData.data;
      console.log("✅ Dados obtidos da API Comdinheiro:", resultData);
    } else {
      // Para outros modos, usar dados mock
      console.log("🔍 Usando dados mock para modo:", modo);

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      resultData = getMockDataByMode(modo, {
        carteira,
        data_final: dataFinalVal,
        data_inicial: dataInicialVal,
        banco,
        operacao,
        perfil,
      });
    }

    dadosConsulta.set(resultData);

    // Dismiss loading toast and show success (authentication-aware)
    if (loadingToastId) toast.dismiss(loadingToastId);
    authShowToast.dataLoaded();

    return resultData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao consultar dados";
    errorState.set(errorMessage);

    // Dismiss loading toast and show error (authentication-aware)
    if (loadingToastId) toast.dismiss(loadingToastId);
    authShowToast.dataLoadFailed(errorMessage);

    throw error;
  } finally {
    loadingState.set(false);
  }
}
