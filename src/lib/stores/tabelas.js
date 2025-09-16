import { writable, derived } from "svelte/store";
import { validarFormulario } from "$lib/utils/validators.js";
import { getMockDataByMode } from "$lib/mocks/tabelas.js";
import { toast, showToast } from "$lib/utils/toast.js";

// Estados principais do formulário
export const modoVisualizacao = writable("relatorio");
export const carteiraAtual = writable("");
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
  dataFinal.set("");
  dataInicial.set("");
  bancoSelecionado.set("");
  operacaoSelecionada.set("C+V");
  perfilReferencia.set("");
  dadosConsulta.set(null);
  errorState.set(null);
}

// Função para simular consulta (mock)
export async function consultarDados() {
  loadingState.set(true);
  errorState.set(null);

  // Show loading toast
  const loadingToastId = showToast.consultingData();

  try {
    // Obter valores atuais dos stores
    let modo, carteira, dataFinalVal, dataInicialVal, banco, operacao, perfil;

    const unsubscribers = [
      modoVisualizacao.subscribe((v) => (modo = v)),
      carteiraAtual.subscribe((v) => (carteira = v)),
      dataFinal.subscribe((v) => (dataFinalVal = v)),
      dataInicial.subscribe((v) => (dataInicialVal = v)),
      bancoSelecionado.subscribe((v) => (banco = v)),
      operacaoSelecionada.subscribe((v) => (operacao = v)),
      perfilReferencia.subscribe((v) => (perfil = v)),
    ];

    // Limpar subscriptions
    unsubscribers.forEach((unsub) => unsub());

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Usar dados mock baseado no modo
    const mockData = getMockDataByMode(modo, {
      carteira,
      data_final: dataFinalVal,
      data_inicial: dataInicialVal,
      banco,
      operacao,
      perfil,
    });

    dadosConsulta.set(mockData);

    // Dismiss loading toast and show success
    toast.dismiss(loadingToastId);
    showToast.dataLoaded();

    return mockData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao consultar dados";
    errorState.set(errorMessage);

    // Dismiss loading toast and show error
    toast.dismiss(loadingToastId);
    showToast.dataLoadFailed(errorMessage);

    throw error;
  } finally {
    loadingState.set(false);
  }
}
