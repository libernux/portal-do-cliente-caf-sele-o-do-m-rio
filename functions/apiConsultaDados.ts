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

// Campos de resumo por entidade (para busca otimizada)
const CAMPOS_RESUMO = {
  Cafe: ["nome", "forma", "localizacao"],
  Cliente: ["nome", "email", "telefone"],
  Problema: ["nome_cliente", "tipo", "status", "prioridade"],
  Tarefa: ["titulo", "status", "prioridade", "responsavel"],
  Agendamento: ["titulo", "tipo", "status", "data_inicio"],
  Caixa: ["numero_identificacao", "origem", "destino", "status"],
  SubmissaoProdutor: ["nome_cafe", "origem", "status"],
  PedidoYampi: ["numero_pedido", "cliente_nome", "status", "valor_total"],
  AssinanteClube: ["nome", "email", "plano", "status"],
  default: ["id", "created_date"]
};

// Campos de data por entidade
const CAMPOS_DATA = {
  default: ["created_date", "updated_date"],
  Agendamento: ["data_inicio", "data_fim", "created_date"],
  Tarefa: ["prazo", "data_inicio", "data_conclusao", "created_date"],
  Problema: ["data_abertura", "data_resolucao", "created_date"],
  Caixa: ["data_envio", "data_entrega_prevista", "data_entrega_real", "created_date"],
  PedidoYampi: ["data_pedido", "data_atualizacao", "created_date"],
  EntregaClube: ["data_prevista", "data_envio", "data_entrega", "created_date"]
};

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta API.' },
        { status: 403, headers: corsHeaders }
      );
    }

    const url = new URL(req.url);
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

    // Parâmetros comuns
    const acao = body.acao || url.searchParams.get('acao') || 'listar_entidades';
    const entidade = body.entidade || url.searchParams.get('entidade');
    
    // Paginação
    const pagina = parseInt(body.pagina || url.searchParams.get('pagina') || '1');
    const porPagina = Math.min(parseInt(body.por_pagina || url.searchParams.get('por_pagina') || '50'), 500);
    const offset = (pagina - 1) * porPagina;
    
    // Ordenação
    const ordenar = body.ordenar || url.searchParams.get('ordenar') || '-created_date';
    
    // Filtros de data
    const dataInicio = body.data_inicio || url.searchParams.get('data_inicio');
    const dataFim = body.data_fim || url.searchParams.get('data_fim');
    const campoData = body.campo_data || url.searchParams.get('campo_data') || 'created_date';
    
    // Filtros de campos específicos
    const filtros = body.filtros || {};
    const campos = body.campos || null; // Campos específicos para retornar

    switch (acao) {
      case 'listar_entidades': {
        return Response.json({
          success: true,
          entidades: ENTIDADES_SISTEMA.map(e => ({
            nome: e,
            campos_data: CAMPOS_DATA[e] || CAMPOS_DATA.default,
            campos_resumo: CAMPOS_RESUMO[e] || CAMPOS_RESUMO.default
          })),
          total: ENTIDADES_SISTEMA.length,
          documentacao: {
            acoes: {
              listar_entidades: 'Lista todas as entidades disponíveis',
              consultar: 'Consulta registros com paginação e filtros',
              detalhe: 'Busca detalhes completos de um registro específico',
              exportar_completo: 'Exporta todos os dados com paginação',
              estatisticas: 'Retorna estatísticas de todas as entidades',
              buscar: 'Busca otimizada retornando IDs e resumos'
            },
            paginacao: {
              pagina: 'Número da página (padrão: 1)',
              por_pagina: 'Registros por página (padrão: 50, máximo: 500)'
            },
            filtros_data: {
              data_inicio: 'Data inicial (ISO 8601)',
              data_fim: 'Data final (ISO 8601)',
              campo_data: 'Campo de data para filtrar (padrão: created_date)'
            },
            filtros_campos: {
              filtros: 'Objeto com filtros por campo (ex: {"status": "Ativo"})',
              campos: 'Array de campos específicos para retornar'
            }
          }
        }, { headers: corsHeaders });
      }

      case 'consultar': {
        if (!entidade) {
          return Response.json(
            { error: 'Parâmetro "entidade" é obrigatório' },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!ENTIDADES_SISTEMA.includes(entidade)) {
          return Response.json(
            { error: `Entidade "${entidade}" não encontrada` },
            { status: 404, headers: corsHeaders }
          );
        }

        // Construir filtro combinado
        const filtroCompleto = { ...filtros };
        
        // Adicionar filtro de data se especificado
        if (dataInicio || dataFim) {
          filtroCompleto[campoData] = {};
          if (dataInicio) filtroCompleto[campoData].$gte = dataInicio;
          if (dataFim) filtroCompleto[campoData].$lte = dataFim;
        }

        // Buscar dados
        let dados;
        const limite = porPagina + offset + 1; // +1 para verificar se há próxima página
        
        if (Object.keys(filtroCompleto).length > 0) {
          dados = await base44.asServiceRole.entities[entidade].filter(filtroCompleto, ordenar, limite);
        } else {
          dados = await base44.asServiceRole.entities[entidade].list(ordenar, limite);
        }

        // Aplicar paginação
        const temProximaPagina = dados.length > offset + porPagina;
        const dadosPaginados = dados.slice(offset, offset + porPagina);

        // Filtrar campos se especificado
        const dadosFinais = campos 
          ? dadosPaginados.map(item => {
              const itemFiltrado = { id: item.id };
              campos.forEach(campo => {
                if (item[campo] !== undefined) itemFiltrado[campo] = item[campo];
              });
              return itemFiltrado;
            })
          : dadosPaginados;

        return Response.json({
          success: true,
          entidade,
          paginacao: {
            pagina,
            por_pagina: porPagina,
            total_pagina: dadosFinais.length,
            tem_proxima: temProximaPagina,
            tem_anterior: pagina > 1
          },
          filtros_aplicados: {
            ordenacao: ordenar,
            data_inicio: dataInicio,
            data_fim: dataFim,
            campo_data: campoData,
            filtros: Object.keys(filtros).length > 0 ? filtros : null,
            campos: campos
          },
          dados: dadosFinais
        }, { headers: corsHeaders });
      }

      case 'detalhe': {
        if (!entidade) {
          return Response.json(
            { error: 'Parâmetro "entidade" é obrigatório' },
            { status: 400, headers: corsHeaders }
          );
        }

        const id = body.id || url.searchParams.get('id');
        if (!id) {
          return Response.json(
            { error: 'Parâmetro "id" é obrigatório' },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!ENTIDADES_SISTEMA.includes(entidade)) {
          return Response.json(
            { error: `Entidade "${entidade}" não encontrada` },
            { status: 404, headers: corsHeaders }
          );
        }

        const registros = await base44.asServiceRole.entities[entidade].filter({ id });
        
        if (!registros || registros.length === 0) {
          return Response.json(
            { error: `Registro com id "${id}" não encontrado` },
            { status: 404, headers: corsHeaders }
          );
        }

        return Response.json({
          success: true,
          entidade,
          dados: registros[0]
        }, { headers: corsHeaders });
      }

      case 'exportar_completo': {
        const entidadesExportar = body.entidades || ENTIDADES_SISTEMA;
        const paginaExport = parseInt(body.pagina || '1');
        const porPaginaExport = Math.min(parseInt(body.por_pagina || '1000'), 5000);
        const offsetExport = (paginaExport - 1) * porPaginaExport;

        const dadosExportados = {
          metadata: {
            versao: "2.0",
            dataExportacao: new Date().toISOString(),
            sistema: "Cafe Selecao do Mario",
            exportadoPor: user.email,
            paginacao: {
              pagina: paginaExport,
              por_pagina: porPaginaExport
            }
          },
          dados: {},
          estatisticas: {},
          paginacao_entidades: {}
        };

        let totalRegistros = 0;

        for (const ent of entidadesExportar) {
          if (!ENTIDADES_SISTEMA.includes(ent)) continue;
          
          try {
            // Construir filtro de data se especificado
            let dados;
            if (dataInicio || dataFim) {
              const filtroData = {};
              filtroData[campoData] = {};
              if (dataInicio) filtroData[campoData].$gte = dataInicio;
              if (dataFim) filtroData[campoData].$lte = dataFim;
              dados = await base44.asServiceRole.entities[ent].filter(filtroData, ordenar, porPaginaExport + offsetExport + 1);
            } else {
              dados = await base44.asServiceRole.entities[ent].list(ordenar, porPaginaExport + offsetExport + 1);
            }

            const temProxima = dados.length > offsetExport + porPaginaExport;
            const dadosPaginados = dados.slice(offsetExport, offsetExport + porPaginaExport);

            dadosExportados.dados[ent] = dadosPaginados;
            dadosExportados.estatisticas[ent] = dadosPaginados.length;
            dadosExportados.paginacao_entidades[ent] = {
              exportados: dadosPaginados.length,
              tem_mais: temProxima
            };
            totalRegistros += dadosPaginados.length;
          } catch (error) {
            dadosExportados.dados[ent] = [];
            dadosExportados.estatisticas[ent] = 0;
            dadosExportados.paginacao_entidades[ent] = { erro: error.message };
          }
        }

        dadosExportados.metadata.totalRegistros = totalRegistros;

        return Response.json({
          success: true,
          ...dadosExportados
        }, { headers: corsHeaders });
      }

      case 'estatisticas': {
        const estatisticas = {
          dataConsulta: new Date().toISOString(),
          entidades: {},
          totalGeral: 0
        };

        // Processar em paralelo para melhor performance
        const promises = ENTIDADES_SISTEMA.map(async (ent) => {
          try {
            const dados = await base44.asServiceRole.entities[ent].list('-created_date', 10000);
            return { entidade: ent, count: dados.length };
          } catch (error) {
            return { entidade: ent, count: 0 };
          }
        });

        const resultados = await Promise.all(promises);
        
        for (const { entidade, count } of resultados) {
          estatisticas.entidades[entidade] = count;
          estatisticas.totalGeral += count;
        }

        return Response.json({
          success: true,
          ...estatisticas
        }, { headers: corsHeaders });
      }

      case 'buscar': {
        const termo = body.termo || url.searchParams.get('termo');
        const entidadesBusca = body.entidades || ENTIDADES_SISTEMA;
        const limiteBusca = Math.min(parseInt(body.limite || '20'), 100);

        if (!termo) {
          return Response.json(
            { error: 'Parâmetro "termo" é obrigatório para busca' },
            { status: 400, headers: corsHeaders }
          );
        }

        const resultados = {};
        let totalEncontrados = 0;
        const termoLower = termo.toLowerCase();

        // Processar em paralelo
        const promises = entidadesBusca.map(async (ent) => {
          if (!ENTIDADES_SISTEMA.includes(ent)) return null;
          
          try {
            const dados = await base44.asServiceRole.entities[ent].list('-created_date', 1000);
            
            const encontrados = dados.filter(item => {
              return Object.values(item).some(valor => {
                if (typeof valor === 'string') {
                  return valor.toLowerCase().includes(termoLower);
                }
                return false;
              });
            }).slice(0, limiteBusca);

            if (encontrados.length > 0) {
              // Retornar apenas resumo
              const camposResumo = CAMPOS_RESUMO[ent] || CAMPOS_RESUMO.default;
              const resumos = encontrados.map(item => {
                const resumo = { 
                  id: item.id, 
                  created_date: item.created_date,
                  _match_fields: []
                };
                
                // Adicionar campos de resumo
                camposResumo.forEach(campo => {
                  if (item[campo] !== undefined) resumo[campo] = item[campo];
                });

                // Identificar campos que deram match
                Object.entries(item).forEach(([key, valor]) => {
                  if (typeof valor === 'string' && valor.toLowerCase().includes(termoLower)) {
                    resumo._match_fields.push(key);
                  }
                });

                return resumo;
              });

              return { entidade: ent, resultados: resumos, total: encontrados.length };
            }
            return null;
          } catch (error) {
            return null;
          }
        });

        const resultadosPromises = await Promise.all(promises);
        
        for (const resultado of resultadosPromises) {
          if (resultado) {
            resultados[resultado.entidade] = {
              resumos: resultado.resultados,
              total: resultado.total
            };
            totalEncontrados += resultado.total;
          }
        }

        return Response.json({
          success: true,
          termo,
          totalEncontrados,
          entidadesPesquisadas: entidadesBusca.filter(e => ENTIDADES_SISTEMA.includes(e)).length,
          instrucao: 'Use a ação "detalhe" com entidade e id para obter o registro completo',
          resultados
        }, { headers: corsHeaders });
      }

      default:
        return Response.json(
          { 
            error: `Ação "${acao}" não reconhecida`,
            acoes_disponiveis: ['listar_entidades', 'consultar', 'detalhe', 'exportar_completo', 'estatisticas', 'buscar']
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