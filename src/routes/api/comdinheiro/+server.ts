import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Tipos para a API do Comdinheiro
interface ComdinheirRequest {
  username: string;
  password: string;
  url: string;
  format: "JSON" | "JSON2" | "JSON3" | "XML" | "XML2";
  language?: string;
}

interface ComdinheiroResponse {
  success: boolean;
  data?: any;
  error?: string;
  format?: string;
  url?: string;
}

// Endpoint da API do Comdinheiro
const COMDINHEIRO_API_ENDPOINT =
  "https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php?code=import_data";

// Ferramentas disponíveis na API (baseado na implementação existente)
const FERRAMENTAS_DISPONIVEIS = [
  "FundScreener001",
  "HistoricoCotacao002",
  "IndicadoresEconomicos001",
  "RentabilidadeFundos001",
  "ComparacaoFundos001",
  "RelatorioGerencialCarteiras001",
  "ExtratoCarteira015",
  "ExtratoCarteira022",
  "PosicaoConsolidada001",
  "CarteiraExplodida001",
  "ComprasVendas002",
];

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    // Verificar se é uma consulta direta ou uma requisição tradicional
    if (body.action === "consultar") {
      // Nova funcionalidade: consulta posição consolidada
      const { carteira, data_final, view_type } = body;

      if (!carteira || !data_final) {
        return json(
          { success: false, error: "Carteira e data final são obrigatórias" },
          { status: 400 }
        );
      }

      // Buscar credenciais do localStorage (serão enviadas pelo frontend)
      const username = request.headers.get("x-comdinheiro-username");
      const password = request.headers.get("x-comdinheiro-password");

      console.log("🔑 Headers recebidos:", {
        hasUsername: !!username,
        hasPassword: !!password,
        usernamePreview: username ? username.substring(0, 3) + "***" : "null",
        allHeaders: Object.fromEntries(request.headers.entries()),
      });

      if (!username || !password) {
        return json(
          {
            success: false,
            error:
              "Credenciais do Comdinheiro não encontradas. Configure em /settings",
          },
          { status: 401 }
        );
      }

      // Construir URL baseada no view_type (usando lógica do sistema original)
      let url: string;
      // Formatar data para DDMMYYYY (formato esperado pelo Comdinheiro)
      const [ano, mes, dia] = data_final.split("-");
      const dataFormatada = `${dia}${mes}${ano}`;

      if (view_type === "consolidado") {
        // Usar a mesma URL do sistema original para posição consolidada
        // Codificar o nome da carteira para URL
        const carteiraEncoded = encodeURIComponent(carteira);
        // Adicionar parâmetros obrigatórios que podem estar faltando
        url = `RelatorioGerencialCarteiras001.php?ep=1&data_analise=${dataFormatada}&data_ini=&nome_portfolio=${carteiraEncoded}&variaveis=instituicao_financeira+ativo+desc+quant+saldo_bruto+tipo_ativo+saldo_liquido&filtro=all&ativo=&filtro_IF=todos&relat_alias=&layout=0&layoutB=0&num_casas=&enviar_email=0&portfolio_editavel=&filtro_id=&flag_export=JSON3`;
      } else {
        return json(
          { success: false, error: "Tipo de visualização não suportado" },
          { status: 400 }
        );
      }

      console.log("🔍 Consultando Comdinheiro:", {
        carteira,
        data_final,
        view_type,
        dataFormatada,
        url: url.substring(0, 100) + "...",
        fullUrl: url,
      });

      // Fazer requisição para a API do Comdinheiro usando GET
      // Construir URL completa com parâmetros
      const fullUrl = `${COMDINHEIRO_API_ENDPOINT}?username=${encodeURIComponent(
        username
      )}&password=${encodeURIComponent(password)}&URL=${encodeURIComponent(
        url
      )}&format=JSON3`;

      console.log(
        "🌐 URL completa da requisição:",
        fullUrl.substring(0, 200) + "..."
      );

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("❌ Erro HTTP da API Comdinheiro:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responsePreview: responseText.substring(0, 500),
        });
        throw new Error(`Erro na API Comdinheiro: ${response.status}`);
      }

      console.log("📥 Resposta bruta da API Comdinheiro:", {
        status: response.status,
        contentType: response.headers.get("content-type"),
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 500),
      });

      // Verificar se a resposta é HTML (indica erro ou página web)
      if (
        responseText.trim().startsWith("<!DOCTYPE") ||
        responseText.trim().startsWith("<html")
      ) {
        console.error(
          "❌ API retornou HTML em vez de JSON - carteira não encontrada:"
        );
        console.error(
          "📄 Resposta HTML (primeiros 500 chars):",
          responseText.substring(0, 500)
        );

        return json(
          {
            success: false,
            error: `A carteira "${carteira}" não foi encontrada no sistema Comdinheiro ou não possui dados para a data ${data_final}. Verifique se o nome da carteira está correto.`,
            details:
              "A API retornou uma página HTML em vez de dados JSON, indicando que a consulta não encontrou resultados válidos.",
          },
          { status: 404 }
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Erro ao parsear JSON:", parseError);
        console.error("📄 Resposta completa:", responseText);

        return json(
          {
            success: false,
            error: "Erro ao processar resposta da API Comdinheiro",
            details: `Resposta inválida: ${
              parseError instanceof Error
                ? parseError.message
                : "Erro desconhecido"
            }`,
          },
          { status: 500 }
        );
      }

      console.log("📥 Dados parseados da API Comdinheiro:", {
        hasTables: !!data.tables,
        tablesType: Array.isArray(data.tables) ? "array" : "object",
        tablesLength: Array.isArray(data.tables)
          ? data.tables.length
          : Object.keys(data.tables || {}).length,
        dataKeys: Object.keys(data),
      });

      return json({ success: true, data });
    }

    // Funcionalidade original: requisição direta
    const { username, password, url, format } = body as ComdinheirRequest;

    if (!username || !password || !url || !format) {
      return json(
        {
          success: false,
          error: "Parâmetros obrigatórios: username, password, url, format",
        },
        { status: 400 }
      );
    }

    // Validação do formato
    const formatosValidos = ["JSON", "JSON2", "JSON3", "XML", "XML2"];
    if (!formatosValidos.includes(format)) {
      return json(
        {
          success: false,
          error: `Formato inválido. Use: ${formatosValidos.join(", ")}`,
        },
        { status: 400 }
      );
    }

    console.log(
      `🔄 Executando consulta Comdinheiro - URL: ${url}, Formato: ${format}`
    );

    // Preparar dados para envio
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("URL", url);
    formData.append("format", format);

    // Fazer requisição para a API do Comdinheiro com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(COMDINHEIRO_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Reino-Dashboard/1.0",
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();

      // Validar se a resposta não é um erro da API
      if (
        responseText.toLowerCase().includes("erro") ||
        responseText.toLowerCase().includes("error")
      ) {
        throw new Error("API retornou erro: " + responseText.substring(0, 200));
      }

      // Processar resposta baseado no formato
      let parsedData;
      if (format.includes("JSON")) {
        try {
          parsedData = JSON.parse(responseText);
        } catch (e) {
          parsedData = responseText; // Fallback para texto se JSON inválido
        }
      } else {
        parsedData = responseText; // XML como texto
      }

      console.log(`✅ Consulta Comdinheiro executada com sucesso`);

      return json({
        success: true,
        data: parsedData,
        format,
        url,
      } as ComdinheiroResponse);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error("❌ Erro ao consultar API Comdinheiro:", error);

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      } as ComdinheiroResponse,
      { status: 500 }
    );
  }
};

export const GET: RequestHandler = async ({ url }) => {
  const action = url.searchParams.get("action");

  // Endpoint para listar ferramentas disponíveis
  if (action === "ferramentas") {
    return json({
      success: true,
      ferramentas: FERRAMENTAS_DISPONIVEIS,
      total: FERRAMENTAS_DISPONIVEIS.length,
    });
  }

  // Endpoint para buscar carteiras/usuários do Comdinheiro
  if (action === "carteiras") {
    const username = url.searchParams.get("username");
    const password = url.searchParams.get("password");

    if (!username || !password) {
      return json(
        {
          success: false,
          error: "Username e password são obrigatórios para buscar carteiras",
          carteiras: [],
        },
        { status: 400 }
      );
    }

    try {
      // Usar a ferramenta RelatorioGerencialCarteiras001 com parâmetros corretos
      const dataAnalise = new Date()
        .toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "");

      const carteirasUrl =
        `RelatorioGerencialCarteiras001.php?&data_analise=${dataAnalise}` +
        `&data_ini=&nome_portfolio=` +
        `&variaveis=nome_portfolio+saldo_bruto+instituicao_financeira&filtro=all&ativo=&filtro_IF=todos` +
        `&relat_alias=&layout=0&layoutB=0&num_casas=&enviar_email=0` +
        `&portfolio_editavel=&filtro_id=`;

      console.log("🔍 Buscando carteiras Comdinheiro:", {
        username: username.substring(0, 3) + "***",
        url: carteirasUrl,
        dataAnalise,
        format: "JSON3",
      });

      // Usar exatamente o mesmo formato do sistema original
      const payload = {
        username: username,
        password: password,
        URL: carteirasUrl,
        format: "JSON3",
      };

      console.log("📤 Payload enviado:", {
        username: username.substring(0, 3) + "***",
        URL: carteirasUrl.substring(0, 50) + "...",
        format: "JSON3",
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const response = await fetch(COMDINHEIRO_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();

        console.log("📥 Resposta da API Comdinheiro:", {
          status: response.status,
          contentType: response.headers.get("content-type"),
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200) + "...",
          fullResponse: responseText, // Temporário para debug
        });

        // Processar resposta para extrair carteiras
        let carteiras: string[] = [];
        try {
          const data = JSON.parse(responseText);
          console.log("📊 Dados parseados:", {
            hasData: !!data,
            dataType: typeof data,
            keys: Object.keys(data || {}),
            hasTables: !!data?.tables,
            hasTab0: !!data?.tables?.tab0,
            tablesKeys: data?.tables ? Object.keys(data.tables) : [],
            tablesContent: data?.tables,
          });

          // Extrair carteiras da resposta (baseado na implementação original)
          if (data.tables) {
            // Verificar se tem tab0 (estrutura esperada)
            if (data.tables.tab0) {
              const tableData = data.tables.tab0;
              console.log("📋 Processando tabela tab0:", {
                tableKeys: Object.keys(tableData),
                sampleData: Object.keys(tableData)
                  .slice(0, 3)
                  .reduce((acc, key) => {
                    acc[key] = tableData[key];
                    return acc;
                  }, {} as any),
              });

              // Extrair nomes das carteiras da coluna col0 (nome_portfolio)
              carteiras = Object.keys(tableData)
                .filter((key) => key !== "lin0")
                .map((key) => {
                  const row = tableData[key];
                  // col0 = nome_portfolio, col1 = saldo_bruto, col2 = instituicao
                  const nomeCarteira = row?.col0?.trim();
                  return nomeCarteira;
                })
                .filter(Boolean);

              console.log(
                "🎯 Carteiras extraídas da tabela tab0:",
                carteiras.slice(0, 5)
              );
            } else {
              // Verificar outras estruturas de tabela
              const tableKeys = Object.keys(data.tables);
              console.log("📋 Explorando outras tabelas:", tableKeys);

              for (const tableKey of tableKeys) {
                const tableData = data.tables[tableKey];
                console.log(`📋 Processando tabela ${tableKey}:`, {
                  tableKeys: Object.keys(tableData || {}),
                  sampleData: tableData,
                });

                if (tableData && typeof tableData === "object") {
                  // Tentar extrair carteiras desta tabela
                  const possibleCarteiras = Object.keys(tableData)
                    .filter((key) => key !== "lin0")
                    .map((key) => {
                      const row = tableData[key];
                      if (row && typeof row === "object") {
                        // Tentar diferentes colunas para nome da carteira
                        const nomeCarteira =
                          row?.col0?.trim() ||
                          row?.nome_portfolio?.trim() ||
                          row?.carteira?.trim();
                        return nomeCarteira;
                      }
                      return null;
                    })
                    .filter(Boolean);

                  if (possibleCarteiras.length > 0) {
                    carteiras = possibleCarteiras;
                    console.log(
                      `🎯 Carteiras extraídas da tabela ${tableKey}:`,
                      carteiras.slice(0, 5)
                    );
                    break;
                  }
                }
              }
            }
          } else if (Array.isArray(data)) {
            console.log("📋 Processando array:", data.slice(0, 3));
            carteiras = data.map(
              (item) => item.nome || item.carteira || item.toString()
            );
          } else if (data.carteiras) {
            console.log("📋 Processando data.carteiras:", data.carteiras);
            carteiras = Array.isArray(data.carteiras)
              ? data.carteiras
              : [data.carteiras];
          } else {
            console.log(
              "⚠️ Estrutura de dados não reconhecida:",
              Object.keys(data)
            );
          }
        } catch (e) {
          // Se não conseguir parsear, tentar extrair nomes de carteiras do texto
          const matches = responseText.match(/[A-Z_][A-Z0-9_]*_[A-Z0-9_]+/g);
          carteiras = matches ? [...new Set(matches)] : [];
        }

        console.log(
          `✅ ${carteiras.length} carteiras encontradas no Comdinheiro`
        );

        return json({
          success: true,
          carteiras: carteiras.sort(),
          total: carteiras.length,
          source: "comdinheiro",
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error("❌ Erro ao buscar carteiras Comdinheiro:", error);
      return json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Erro ao buscar carteiras",
          carteiras: [],
        },
        { status: 500 }
      );
    }
  }

  // Endpoint para gerar código (similar à ferramenta web)
  if (action === "gerar-codigo") {
    const username = url.searchParams.get("username") || "";
    const password = url.searchParams.get("password") || "";
    const urlConsulta = url.searchParams.get("url") || "";
    const format = url.searchParams.get("format") || "JSON";
    const language = url.searchParams.get("language") || "JavaScript";

    const codigo = gerarCodigo({
      username,
      password,
      url: urlConsulta,
      format: format as "JSON" | "JSON2" | "JSON3" | "XML" | "XML2",
      language,
    });

    return json({
      success: true,
      codigo,
      parametros: { username, password, url: urlConsulta, format, language },
    });
  }

  return json(
    {
      success: false,
      error:
        "Ação não encontrada. Use ?action=ferramentas ou ?action=gerar-codigo",
    },
    { status: 400 }
  );
};

// Função para gerar código em diferentes linguagens
function gerarCodigo(
  params: ComdinheirRequest & { language?: string }
): string {
  const { username, password, url, format, language = "JavaScript" } = params;

  switch (language.toLowerCase()) {
    case "javascript":
      return `// Código gerado para consulta Comdinheiro
const response = await fetch('${COMDINHEIRO_API_ENDPOINT}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    username: '${username}',
    password: '${password}',
    URL: '${url}',
    format: '${format}'
  })
});

const data = await response.text();
console.log(data);`;

    case "python":
      return `# Código gerado para consulta Comdinheiro
import requests

url = '${COMDINHEIRO_API_ENDPOINT}'
data = {
    'username': '${username}',
    'password': '${password}',
    'URL': '${url}',
    'format': '${format}'
}

response = requests.post(url, data=data)
print(response.text)`;

    case "php":
      return `<?php
// Código gerado para consulta Comdinheiro
$url = '${COMDINHEIRO_API_ENDPOINT}';
$data = array(
    'username' => '${username}',
    'password' => '${password}',
    'URL' => '${url}',
    'format' => '${format}'
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\\r\\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo $result;
?>`;

    default:
      return `// Linguagem ${language} não suportada ainda
// Use JavaScript, Python ou PHP`;
  }
}

/**
 * API para integração com Comdinheiro
 *
 * POST /api/comdinheiro
 * Body: {
 *   "username": "usuario",
 *   "password": "senha",
 *   "url": "HistoricoCotacao002.php?...",
 *   "format": "JSON"
 * }
 *
 * GET /api/comdinheiro?action=ferramentas
 * Retorna lista de ferramentas disponíveis
 *
 * GET /api/comdinheiro?action=gerar-codigo&username=...&password=...&url=...&format=...&language=...
 * Gera código para diferentes linguagens
 */
