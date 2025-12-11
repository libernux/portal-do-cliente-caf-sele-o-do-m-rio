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

    const { tipo } = await req.json();

    let endpoint = '';
    let include = '';

    switch (tipo) {
      case 'produtos':
        endpoint = 'catalog/products';
        include = 'skus,prices,images,categories';
        break;
      case 'pedidos':
        endpoint = 'orders';
        include = 'items,customer,shipping,payment,status';
        break;
      case 'clientes':
        endpoint = 'customers';
        include = 'addresses';
        break;
      case 'categorias':
        endpoint = 'catalog/categories';
        include = '';
        break;
      default:
        return Response.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    // Buscar apenas os primeiros 100 itens para preview
    const includeParam = include ? `&include=${include}` : '';
    const response = await fetch(
      `https://api.dooki.com.br/v2/${alias}/${endpoint}?limit=100${includeParam}`,
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
      console.error('Erro Yampi:', errorData);
      return Response.json({ 
        error: 'Erro ao buscar dados da Yampi',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    const items = data.data || [];
    const totalCount = data.meta?.pagination?.total || items.length;

    return Response.json({
      success: true,
      items,
      total: totalCount,
      preview: items.length
    });

  } catch (error) {
    console.error('Erro ao buscar preview:', error);
    return Response.json({ 
      error: 'Erro interno ao buscar preview',
      details: error.message 
    }, { status: 500 });
  }
});