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

    // Buscar clientes da API Yampi com paginação
    let clientesNovos = 0;
    let clientesAtualizados = 0;
    let currentPage = 1;
    let hasMorePages = true;
    let totalClientes = 0;

    while (hasMorePages) {
      const response = await fetch(`https://api.dooki.com.br/v2/${alias}/customers?include=addresses&limit=100&page=${currentPage}`, {
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
          error: 'Erro ao buscar clientes da Yampi',
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();
      const clientes = data.data || [];
      const pagination = data.meta?.pagination;

      totalClientes += clientes.length;

      for (const cliente of clientes) {
      const enderecos = (cliente.addresses?.data || []).map(addr => ({
        rua: addr.street || '',
        numero: addr.number || '',
        complemento: addr.complement || '',
        bairro: addr.neighborhood || '',
        cidade: addr.city || '',
        estado: addr.state || '',
        cep: addr.zipcode || ''
      }));

      const clienteData = {
        yampi_id: String(cliente.id),
        nome: cliente.first_name && cliente.last_name 
          ? `${cliente.first_name} ${cliente.last_name}`
          : cliente.name || '',
        email: cliente.email || '',
        telefone: cliente.phone || '',
        cpf_cnpj: cliente.cpf || cliente.cnpj || '',
        data_nascimento: cliente.birth_date || null,
        total_pedidos: cliente.orders_count || 0,
        valor_total_gasto: parseFloat(cliente.total_spent || 0),
        enderecos: enderecos,
        ultima_compra: cliente.last_order_date || null,
        ultima_sincronizacao: new Date().toISOString()
      };

      // Verificar se cliente já existe
      const existente = await base44.asServiceRole.entities.ClienteYampi.filter({
        yampi_id: clienteData.yampi_id
      });

      if (existente.length > 0) {
        await base44.asServiceRole.entities.ClienteYampi.update(
          existente[0].id,
          clienteData
        );
        clientesAtualizados++;
      } else {
        await base44.asServiceRole.entities.ClienteYampi.create(clienteData);
        clientesNovos++;
      }

      // Verificar se há mais páginas
      hasMorePages = pagination && currentPage < pagination.total_pages;
      currentPage++;
    }

    return Response.json({
      success: true,
      total_clientes: totalClientes,
      novos: clientesNovos,
      atualizados: clientesAtualizados,
      mensagem: `Sincronização concluída: ${clientesNovos} novos, ${clientesAtualizados} atualizados`
    });

  } catch (error) {
    console.error('Erro na sincronização de clientes:', error);
    return Response.json({ 
      error: 'Erro interno ao sincronizar clientes',
      details: error.message 
    }, { status: 500 });
  }
});