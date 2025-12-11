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

    const { orderId, statusId, observacao } = await req.json();

    if (!orderId || !statusId) {
      return Response.json({ 
        error: 'ID do pedido e status são obrigatórios' 
      }, { status: 400 });
    }

    // Atualizar status do pedido na Yampi
    const response = await fetch(`https://api.dooki.com.br/v2/${alias}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Token': token,
        'User-Secret-Key': secretKey
      },
      body: JSON.stringify({
        status_id: statusId,
        observation: observacao || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro Yampi:', errorData);
      return Response.json({ 
        error: 'Erro ao atualizar status do pedido na Yampi',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();

    // Atualizar pedido localmente
    const pedidos = await base44.asServiceRole.entities.PedidoYampi.filter({
      yampi_id: String(orderId)
    });

    if (pedidos.length > 0) {
      await base44.asServiceRole.entities.PedidoYampi.update(
        pedidos[0].id,
        {
          status: data.data?.status?.data?.name || pedidos[0].status,
          ultima_sincronizacao: new Date().toISOString()
        }
      );
    }

    return Response.json({
      success: true,
      pedido: data.data,
      mensagem: 'Status do pedido atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return Response.json({ 
      error: 'Erro interno ao atualizar status',
      details: error.message 
    }, { status: 500 });
  }
});