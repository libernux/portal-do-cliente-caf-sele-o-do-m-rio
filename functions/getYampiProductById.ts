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

    const { productId } = await req.json();

    if (!productId) {
      return Response.json({ error: 'ID do produto não fornecido' }, { status: 400 });
    }

    // Buscar produto na Yampi
    const response = await fetch(`https://api.dooki.com.br/v2/${alias}/catalog/products/${productId}?include=skus,prices,images,categories`, {
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
        error: 'Erro ao buscar produto na Yampi',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();

    return Response.json({
      success: true,
      produto: data.data
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return Response.json({ 
      error: 'Erro interno ao buscar produto',
      details: error.message 
    }, { status: 500 });
  }
});