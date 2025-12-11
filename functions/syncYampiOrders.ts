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

    // Buscar pedidos da API Yampi com paginação
    let pedidosNovos = 0;
    let pedidosAtualizados = 0;
    let currentPage = 1;
    let hasMorePages = true;
    let totalPedidos = 0;

    while (hasMorePages) {
      const response = await fetch(`https://api.dooki.com.br/v2/${alias}/orders?include=items,items.product,items.sku,customer,shipping,payment,status,transactions,status_history,coupons&limit=100&page=${currentPage}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Token': token,
          'User-Secret-Key': secretKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro Yampi:', errorData);
        return Response.json({ 
          error: 'Erro ao buscar pedidos da Yampi',
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();
      const pedidos = data.data || [];
      const pagination = data.meta?.pagination;

      totalPedidos += pedidos.length;

      for (const pedido of pedidos) {
      const itens = (pedido.items?.data || []).map(item => ({
        produto_id: item.product?.data?.id ? String(item.product.data.id) : '',
        produto_nome: item.name || '',
        sku_id: item.sku?.data?.id ? String(item.sku.data.id) : '',
        sku: item.sku_code || '',
        quantidade: item.quantity || 0,
        preco_unitario: parseFloat(item.price || 0),
        preco_total: parseFloat(item.total || 0),
        imagem_url: item.product?.data?.images?.data?.[0]?.url || ''
      }));

      const endereco = pedido.shipping?.data || {};
      const cliente = pedido.customer?.data || {};
      const transacoes = (pedido.transactions?.data || []).map(t => ({
        id: String(t.id || ''),
        gateway: t.gateway || '',
        metodo: t.payment_method || '',
        status: t.status || '',
        valor: parseFloat(t.value || 0),
        data: t.created_at?.date || ''
      }));

      const historico = (pedido.status_history?.data || []).map(h => ({
        status: h.status?.data?.name || '',
        data: h.created_at?.date || '',
        observacao: h.observation || ''
      }));

      const cupons = (pedido.coupons?.data || []).map(c => ({
        codigo: c.code || '',
        desconto: parseFloat(c.discount_value || 0)
      }));

      const pedidoData = {
        yampi_id: String(pedido.id),
        numero_pedido: String(pedido.number || pedido.id),
        cliente_nome: cliente.first_name && cliente.last_name 
          ? `${cliente.first_name} ${cliente.last_name}`
          : cliente.name || '',
        cliente_email: cliente.email || '',
        cliente_telefone: cliente.phone || '',
        cliente_cpf: cliente.cpf || '',
        status: pedido.status?.data?.name || pedido.status_name || '',
        status_pagamento: pedido.paid ? 'Pago' : 'Pendente',
        valor_total: parseFloat(pedido.value || 0),
        valor_frete: parseFloat(pedido.shipping_value || 0),
        valor_desconto: parseFloat(pedido.discount || 0),
        valor_subtotal: parseFloat(pedido.subtotal || 0),
        itens: itens,
        endereco_entrega: {
          rua: endereco.street || '',
          numero: endereco.number || '',
          complemento: endereco.complement || '',
          bairro: endereco.neighborhood || '',
          cidade: endereco.city || '',
          estado: endereco.state || '',
          cep: endereco.zipcode || '',
          destinatario: endereco.receiver || ''
        },
        data_pedido: pedido.created_at?.date || new Date().toISOString(),
        data_atualizacao: pedido.updated_at?.date || '',
        forma_pagamento: pedido.payment?.data?.name || '',
        codigo_rastreamento: endereco.tracking_code || '',
        transportadora: endereco.shipping_company || '',
        prazo_entrega: endereco.delivery_time || '',
        observacoes: pedido.observation || '',
        ip_cliente: pedido.ip || '',
        origem: pedido.utm_source || '',
        transacoes: transacoes,
        historico_status: historico,
        cupons: cupons,
        ultima_sincronizacao: new Date().toISOString()
      };

      // Verificar se pedido já existe
      const existente = await base44.asServiceRole.entities.PedidoYampi.filter({
        yampi_id: pedidoData.yampi_id
      });

      if (existente.length > 0) {
        await base44.asServiceRole.entities.PedidoYampi.update(
          existente[0].id,
          pedidoData
        );
        pedidosAtualizados++;
      } else {
        await base44.asServiceRole.entities.PedidoYampi.create(pedidoData);
        pedidosNovos++;
      }

      // Verificar se há mais páginas
      hasMorePages = pagination && currentPage < pagination.total_pages;
      currentPage++;
    }

    return Response.json({
      success: true,
      total_pedidos: totalPedidos,
      novos: pedidosNovos,
      atualizados: pedidosAtualizados,
      mensagem: `Sincronização concluída: ${pedidosNovos} novos, ${pedidosAtualizados} atualizados`
    });

  } catch (error) {
    console.error('Erro na sincronização de pedidos:', error);
    return Response.json({ 
      error: 'Erro interno ao sincronizar pedidos',
      details: error.message 
    }, { status: 500 });
  }
});