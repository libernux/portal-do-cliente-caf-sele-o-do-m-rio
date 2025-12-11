import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = Deno.env.get('YAMPI_USER_TOKEN');
    const secretKey = Deno.env.get('YAMPI_USER_SECRET_KEY');
    const alias = Deno.env.get('YAMPI_MERCHANT_ALIAS');

    if (!token || !secretKey || !alias) {
      return Response.json({ 
        error: 'Credenciais da Yampi não configuradas' 
      }, { status: 500 });
    }

    // Limites da API Yampi: 120 requisições por minuto
    const REQUESTS_PER_MINUTE = 120;
    const DELAY_BETWEEN_REQUESTS = (60 * 1000) / REQUESTS_PER_MINUTE; // ~500ms
    const ITEMS_PER_PAGE = 100;

    console.log('🚀 Iniciando coleta de pedidos da API Yampi...');
    console.log(`⏱️ Rate limit: ${REQUESTS_PER_MINUTE} req/min (${DELAY_BETWEEN_REQUESTS}ms entre requisições)`);
    
    let allOrders = [];
    let currentPage = 1;
    let hasMorePages = true;
    let totalPages = 0;
    const startTime = Date.now();

    while (hasMorePages) {
      const pageStartTime = Date.now();
      console.log(`📥 Coletando página ${currentPage}${totalPages > 0 ? `/${totalPages}` : ''}...`);
      
      try {
        const response = await fetch(
          `https://api.dooki.com.br/v2/${alias}/orders?include=items,items.product,items.sku,customer,shipping,payment,status,transactions,status_history,coupons&limit=${ITEMS_PER_PAGE}&page=${currentPage}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Token': token,
              'User-Secret-Key': secretKey
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Erro na página', currentPage, ':', errorData);
          
          // Se for erro de rate limit (429), aguardar 1 minuto
          if (response.status === 429) {
            console.log('⏸️ Rate limit atingido. Aguardando 60 segundos...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            continue; // Tentar novamente
          }
          
          return Response.json({ 
            error: 'Erro ao buscar pedidos da Yampi',
            details: errorData,
            partial_data: allOrders.length > 0 ? allOrders : null
          }, { status: response.status });
        }

        const data = await response.json();
        const orders = data.data || [];
        const pagination = data.meta?.pagination;

        if (pagination && totalPages === 0) {
          totalPages = pagination.total_pages;
          console.log(`📊 Total de páginas: ${totalPages} (${pagination.total} pedidos)`);
        }

        allOrders = allOrders.concat(orders);
        
        const pageEndTime = Date.now();
        const pageTime = pageEndTime - pageStartTime;
        const totalTime = (pageEndTime - startTime) / 1000;
        const avgTimePerPage = totalTime / currentPage;
        const estimatedTimeLeft = totalPages > 0 ? (totalPages - currentPage) * avgTimePerPage : 0;
        
        console.log(`✅ Página ${currentPage}: ${orders.length} pedidos | Total coletado: ${allOrders.length} | Tempo: ${pageTime}ms`);
        if (totalPages > 0) {
          console.log(`⏱️ Progresso: ${Math.round((currentPage / totalPages) * 100)}% | Tempo estimado restante: ${Math.round(estimatedTimeLeft)}s`);
        }

        hasMorePages = pagination && currentPage < pagination.total_pages;
        currentPage++;

        // Respeitar rate limit com delay progressivo
        if (hasMorePages) {
          const elapsedTime = pageEndTime - pageStartTime;
          const delayNeeded = Math.max(DELAY_BETWEEN_REQUESTS - elapsedTime, 0);
          
          if (delayNeeded > 0) {
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
          }
        }
      } catch (fetchError) {
        console.error(`❌ Erro ao buscar página ${currentPage}:`, fetchError.message);
        
        // Aguardar e tentar novamente em caso de erro de rede
        console.log('⏸️ Aguardando 5 segundos antes de tentar novamente...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`🎉 Coleta concluída: ${allOrders.length} pedidos em ${Math.round(totalTime)}s`);

    // Organizar dados antes de salvar
    const organizedData = {
      metadata: {
        total_pedidos: allOrders.length,
        data_coleta: new Date().toISOString(),
        tempo_coleta_segundos: Math.round(totalTime),
        alias_loja: alias
      },
      pedidos: allOrders
    };

    // Criar arquivo JSON
    const jsonContent = JSON.stringify(organizedData, null, 2);

    return new Response(jsonContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=yampi_pedidos_${Date.now()}.json`
      }
    });

  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    return Response.json({ 
      error: 'Erro interno ao exportar pedidos',
      details: error.message 
    }, { status: 500 });
  }
});