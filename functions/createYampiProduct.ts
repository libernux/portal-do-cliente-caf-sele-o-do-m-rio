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

    const { productData } = await req.json();

    // Criar produto na Yampi
    const response = await fetch(`https://api.dooki.com.br/v2/${alias}/catalog/products`, {
      method: 'POST',
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
        }],
        categories: productData.categoria_id ? [{ id: productData.categoria_id }] : []
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro Yampi:', errorData);
      return Response.json({ 
        error: 'Erro ao criar produto na Yampi',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    const novoProduto = data.data;

    // Salvar produto localmente
    await base44.asServiceRole.entities.ProdutoYampi.create({
      yampi_id: String(novoProduto.id),
      sku: novoProduto.sku || '',
      nome: novoProduto.name || '',
      descricao: novoProduto.description || '',
      preco: parseFloat(novoProduto.prices?.data?.[0]?.price || 0),
      preco_promocional: parseFloat(novoProduto.prices?.data?.[0]?.promotional_price || 0),
      estoque: novoProduto.skus?.data?.[0]?.quantity || 0,
      imagem_url: novoProduto.images?.data?.[0]?.url || '',
      categoria: novoProduto.categories?.data?.[0]?.name || '',
      ativo: novoProduto.active || false,
      peso: parseFloat(novoProduto.skus?.data?.[0]?.weight || 0),
      altura: parseFloat(novoProduto.skus?.data?.[0]?.height || 0),
      largura: parseFloat(novoProduto.skus?.data?.[0]?.width || 0),
      comprimento: parseFloat(novoProduto.skus?.data?.[0]?.length || 0),
      ultima_sincronizacao: new Date().toISOString()
    });

    return Response.json({
      success: true,
      produto: novoProduto,
      mensagem: 'Produto criado com sucesso na Yampi'
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return Response.json({ 
      error: 'Erro interno ao criar produto',
      details: error.message 
    }, { status: 500 });
  }
});