import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Lista de todas as entidades do sistema
const ENTIDADES_SISTEMA = [
  "Cafe",
  "Cliente",
  "ReservaCafe",
  "PrecoCafe",
  "ClienteSlug",
  "Problema",
  "AtualizacaoProblema",
  "EtiquetaProblema",
  "Tarefa",
  "Agendamento",
  "Caixa",
  "SubmissaoProdutor",
  "InfoCafe",
  "SolicitacaoEvento",
  "AtualizacaoSolicitacao",
  "SolicitacaoPatrocinio",
  "AtualizacaoPatrocinio",
  "AssinanteClube",
  "EntregaClube",
  "EmpresaPermuta",
  "DemandaExterna",
  "HistoricoDemanda",
  "ItemChecklist",
  "ClienteChecklistItem",
  "PedidoYampi",
  "ProdutoYampi",
  "ClienteYampi",
  "CategoriaYampi",
  "LogSincronizacaoYampi",
  "ContratoRPA",
  "SignatarioContrato",
  "ProdutoAgridrones",
  "CotacaoAgridrones",
  "ConfiguracaoFrete",
  "Responsavel",
  "ConfiguracaoNotificacao",
];

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verificar se é admin
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta API.' },
        { status: 403, headers: corsHeaders }
      );
    }

    const url = new URL(req.url);
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

    // Parâmetros de consulta
    const acao = body.acao || url.searchParams.get('acao') || 'listar_entidades';
    const entidade = body.entidade || url.searchParams.get('entidade');
    const filtro = body.filtro || {};
    const limite = parseInt(body.limite || url.searchParams.get('limite') || '100');
    const ordenar = body.ordenar || url.searchParams.get('ordenar') || '-created_date';
    const exportarTudo = body.exportar_tudo === true;

    // Ações disponíveis
    switch (acao) {
      case 'listar_entidades': {
        // Lista todas as entidades disponíveis
        return Response.json({
          success: true,
          entidades: ENTIDADES_SISTEMA,
          total: ENTIDADES_SISTEMA.length,
          uso: {
            listar_entidades: 'Lista todas as entidades disponíveis',
            consultar: 'Consulta registros de uma entidade específica',
            exportar_completo: 'Exporta todos os dados de todas as entidades',
            estatisticas: 'Retorna estatísticas de todas as entidades'
          }
        }, { headers: corsHeaders });
      }

      case 'consultar': {
        // Consulta uma entidade específica
        if (!entidade) {
          return Response.json(
            { error: 'Parâmetro "entidade" é obrigatório' },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!ENTIDADES_SISTEMA.includes(entidade)) {
          return Response.json(
            { error: `Entidade "${entidade}" não encontrada`, entidades_disponiveis: ENTIDADES_SISTEMA },
            { status: 404, headers: corsHeaders }
          );
        }

        let dados;
        if (Object.keys(filtro).length > 0) {
          dados = await base44.asServiceRole.entities[entidade].filter(filtro, ordenar, limite);
        } else {
          dados = await base44.asServiceRole.entities[entidade].list(ordenar, limite);
        }

        return Response.json({
          success: true,
          entidade,
          total: dados.length,
          limite,
          ordenacao: ordenar,
          filtro: Object.keys(filtro).length > 0 ? filtro : null,
          dados
        }, { headers: corsHeaders });
      }

      case 'exportar_completo': {
        // Exporta todos os dados de todas as entidades
        const dadosExportados = {
          metadata: {
            versao: "1.0",
            dataExportacao: new Date().toISOString(),
            sistema: "Cafe Selecao do Mario",
            exportadoPor: user.email,
            totalEntidades: ENTIDADES_SISTEMA.length
          },
          dados: {},
          estatisticas: {}
        };

        let totalRegistros = 0;

        for (const ent of ENTIDADES_SISTEMA) {
          try {
            const dados = await base44.asServiceRole.entities[ent].list('-created_date', 10000);
            dadosExportados.dados[ent] = dados;
            dadosExportados.estatisticas[ent] = dados.length;
            totalRegistros += dados.length;
          } catch (error) {
            dadosExportados.dados[ent] = [];
            dadosExportados.estatisticas[ent] = 0;
          }
        }

        dadosExportados.metadata.totalRegistros = totalRegistros;

        return Response.json({
          success: true,
          ...dadosExportados
        }, { headers: corsHeaders });
      }

      case 'estatisticas': {
        // Retorna estatísticas de todas as entidades
        const estatisticas = {
          dataConsulta: new Date().toISOString(),
          entidades: {},
          totalGeral: 0
        };

        for (const ent of ENTIDADES_SISTEMA) {
          try {
            const dados = await base44.asServiceRole.entities[ent].list('-created_date', 1);
            // Fazer uma contagem real
            const todosRegistros = await base44.asServiceRole.entities[ent].list('-created_date', 10000);
            estatisticas.entidades[ent] = todosRegistros.length;
            estatisticas.totalGeral += todosRegistros.length;
          } catch (error) {
            estatisticas.entidades[ent] = 0;
          }
        }

        return Response.json({
          success: true,
          ...estatisticas
        }, { headers: corsHeaders });
      }

      case 'buscar': {
        // Busca em múltiplas entidades
        const termo = body.termo || url.searchParams.get('termo');
        const entidadesBusca = body.entidades || ENTIDADES_SISTEMA;

        if (!termo) {
          return Response.json(
            { error: 'Parâmetro "termo" é obrigatório para busca' },
            { status: 400, headers: corsHeaders }
          );
        }

        const resultados = {};
        let totalEncontrados = 0;

        for (const ent of entidadesBusca) {
          if (!ENTIDADES_SISTEMA.includes(ent)) continue;
          
          try {
            const dados = await base44.asServiceRole.entities[ent].list('-created_date', 1000);
            const termoLower = termo.toLowerCase();
            
            const encontrados = dados.filter(item => {
              return Object.values(item).some(valor => {
                if (typeof valor === 'string') {
                  return valor.toLowerCase().includes(termoLower);
                }
                return false;
              });
            });

            if (encontrados.length > 0) {
              resultados[ent] = encontrados;
              totalEncontrados += encontrados.length;
            }
          } catch (error) {
            // Ignorar erros
          }
        }

        return Response.json({
          success: true,
          termo,
          totalEncontrados,
          resultados
        }, { headers: corsHeaders });
      }

      default:
        return Response.json(
          { 
            error: `Ação "${acao}" não reconhecida`,
            acoes_disponiveis: ['listar_entidades', 'consultar', 'exportar_completo', 'estatisticas', 'buscar']
          },
          { status: 400, headers: corsHeaders }
        );
    }

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});