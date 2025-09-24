import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import jsforce from "jsforce";

interface CarteiraDetalhada {
  id: string;
  nome: string;
  nome_comdinheiro: string | null; // Campo específico para API Comdinheiro
  numero_conta: string | null;
  banco: string | null;
  patrimonio: number;
  porcentagem: number;
  mensalidade: number;
  data_modificacao: string;
  fonte: string;
}

// Configuração do Salesforce (usando as mesmas credenciais do Python)
const SF_USERNAME = "joaosantos@reinocapital.com.br";
const SF_PASSWORD = "Casa102asd@";
const SF_SECURITY_TOKEN = "wC1EIMkOau7Lb1cBFMvJWfk3";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const source = url.searchParams.get("source") || "salesforce";

    if (source === "salesforce") {
      // Executa o script Python do Salesforce diretamente
      const carteiras = await executarScriptSalesforce();
      return json(carteiras);
    } else {
      // Mock data para database (não usado mais)
      return json({
        success: true,
        carteiras: ["Reino_Capital_Master", "Fundo_Conservador"],
        source: "database",
      });
    }
  } catch (error) {
    console.error("Erro ao buscar carteiras:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        carteiras: [],
      },
      { status: 500 }
    );
  }
};

async function executarScriptSalesforce(): Promise<{
  success: boolean;
  carteiras: string[];
  carteiras_detalhadas?: CarteiraDetalhada[];
  total: number;
  source: string;
}> {
  try {
    console.log("🔄 Conectando ao Salesforce com JSForce...");

    // Criar conexão com Salesforce
    const conn = new jsforce.Connection({
      loginUrl: "https://login.salesforce.com",
    });

    // Fazer login
    await conn.login(SF_USERNAME, SF_PASSWORD + SF_SECURITY_TOKEN);
    console.log("✅ Login no Salesforce realizado com sucesso");

    // Query para buscar carteiras do objeto customizado (incluindo nomeComDinheiro__c)
    const query = `
      SELECT Id, Name, numeroConta__c, nomeBtg__c, nomeComDinheiro__c,
             patrimonioComDinheiro__c, porcentagemCliente__c,
             mensalidadeCliente__c, banco__c, CreatedDate, LastModifiedDate, OwnerId
      FROM carteirasComDinheiro__c
      ORDER BY LastModifiedDate DESC
      LIMIT 100
    `;

    console.log("🔍 Executando query no Salesforce...");
    const result = await conn.query(query);

    // Processar resultados
    const carteiras: string[] = [];
    const carteiras_detalhadas: CarteiraDetalhada[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.records.forEach((record: any) => {
      const nome = record.Name || "Sem nome";
      const nomeComDinheiro = record.nomeComDinheiro__c || null;

      // Log para debug do mapeamento
      console.log("🔍 Processando carteira:", {
        nome,
        nomeComDinheiro,
        hasNomeComDinheiro: !!nomeComDinheiro,
      });

      // Para a lista simples, usar o nome do Comdinheiro se disponível
      carteiras.push(nomeComDinheiro || nome);

      carteiras_detalhadas.push({
        id: record.Id,
        nome: nome,
        nome_comdinheiro: nomeComDinheiro,
        numero_conta: record.numeroConta__c || null,
        banco: record.banco__c || null,
        patrimonio: parseFloat(String(record.patrimonioComDinheiro__c || "0")),
        porcentagem: parseFloat(String(record.porcentagemCliente__c || "0")),
        mensalidade: parseFloat(String(record.mensalidadeCliente__c || "0")),
        data_modificacao: record.LastModifiedDate
          ? new Date(record.LastModifiedDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fonte: "salesforce",
      });
    });

    console.log(
      `✅ ${result.totalSize} carteiras obtidas do Salesforce via JSForce`
    );

    return {
      success: true,
      carteiras,
      carteiras_detalhadas,
      total: result.totalSize,
      source: "salesforce",
    };
  } catch (error) {
    console.error("❌ Erro ao conectar com Salesforce:", error);
    throw new Error(
      `Erro JSForce: ${error instanceof Error ? error.message : error}`
    );
  }
}

/**
 * Rota para buscar carteiras do backend Python
 *
 * Parâmetros de query:
 * - source: 'salesforce' | 'database' (padrão: 'database')
 *
 * Retorno:
 * ```json
 * {
 *   "success": boolean,
 *   "carteiras": string[],
 *   "source": string,
 *   "error"?: string
 * }
 * ```
 *
 * Exemplos de uso:
 * - GET /api/carteiras - busca do database local
 * - GET /api/carteiras?source=salesforce - busca do Salesforce
 */
