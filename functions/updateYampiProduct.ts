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

    const { yampi_id, productData } = await req.json();

    if (!yampi_id) {
      return Response.json({ error: 'ID do produto não fornecido' }, { status: 400 });
    }

    // Atualizar produto na Yampi
    const response = await fetch(`https://api.dooki.com.br/v2/${alias}/catalog/products/${yampi_id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Token': token,
        'User-Secret-Key': secretKey
      },
      body: JSON.stringify({
        name: productData.nome,
        description: productData.descricao,
        active: productData.ativo,
        sku: productData.sku,
        prices: [{
          price: productData.preco,
          promotional_price: productData.preco_promocional || null
        }],
        skus: [{
          quantity: productData.estoque,
          weight: productData.peso,
          height: productData.altura,
          width: productData.largura,
          length: productData.comprimento
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro Yampi:', errorData);
      return Response.json({ 
        error: 'Erro ao atualizar produto na Yampi',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();

    // Atualizar produto local
    const produtosLocais = await base44.asServiceRole.entities.ProdutoYampi.filter({
      yampi_id: String(yampi_id)
    });

    if (produtosLocais.length > 0) {
      await base44.asServiceRole.entities.ProdutoYampi.update(
        produtosLocais[0].id,
        {
          ...productData,
          ultima_sincronizacao: new Date().toISOString()
        }
      );
    }

    return Response.json({
      success: true,
      produto: data.data,
      mensagem: 'Produto atualizado com sucesso na Yampi'
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return Response.json({ 
      error: 'Erro interno ao atualizar produto',
      details: error.message 
    }, { status: 500 });
  }
});