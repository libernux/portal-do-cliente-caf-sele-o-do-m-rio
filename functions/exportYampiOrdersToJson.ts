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

    console.log('🚀 Iniciando exportação de pedidos...');
    
    let allOrders = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`📥 Buscando página ${currentPage}...`);
      
      const response = await fetch(
        `https://api.dooki.com.br/v2/${alias}/orders?include=items,items.product,items.sku,customer,shipping,payment,status,transactions,status_history,coupons&limit=100&page=${currentPage}`,
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
        console.error('❌ Erro Yampi:', errorData);
        return Response.json({ 
          error: 'Erro ao buscar pedidos da Yampi',
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();
      const orders = data.data || [];
      const pagination = data.meta?.pagination;

      allOrders = allOrders.concat(orders);
      console.log(`✅ Página ${currentPage}: ${orders.length} pedidos (Total: ${allOrders.length})`);

      hasMorePages = pagination && currentPage < pagination.total_pages;
      currentPage++;

      // Delay para não sobrecarregar a API
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`🎉 Exportação concluída: ${allOrders.length} pedidos`);

    // Criar arquivo JSON
    const jsonContent = JSON.stringify(allOrders, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });

    return new Response(blob, {
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