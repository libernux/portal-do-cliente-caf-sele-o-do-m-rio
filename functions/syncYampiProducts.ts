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

    // Buscar produtos da API Yampi
    const response = await fetch(`https://api.yampi.com.br/v3/catalog/products`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Token': token,
        'User-Secret-Key': secretKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro Yampi:', errorData);
      return Response.json({ 
        error: 'Erro ao buscar produtos da Yampi',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    const produtos = data.data || [];

    let produtosNovos = 0;
    let produtosAtualizados = 0;

    for (const produto of produtos) {
      const produtoData = {
        yampi_id: String(produto.id),
        sku: produto.sku || '',
        nome: produto.name || '',
        descricao: produto.description || '',
        preco: parseFloat(produto.prices?.data?.[0]?.price || 0),
        preco_promocional: parseFloat(produto.prices?.data?.[0]?.promotional_price || 0),
        estoque: produto.skus?.data?.[0]?.quantity || 0,
        imagem_url: produto.images?.data?.[0]?.url || '',
        categoria: produto.categories?.data?.[0]?.name || '',
        ativo: produto.active || false,
        peso: parseFloat(produto.skus?.data?.[0]?.weight || 0),
        altura: parseFloat(produto.skus?.data?.[0]?.height || 0),
        largura: parseFloat(produto.skus?.data?.[0]?.width || 0),
        comprimento: parseFloat(produto.skus?.data?.[0]?.length || 0),
        ultima_sincronizacao: new Date().toISOString()
      };

      // Verificar se produto já existe
      const existente = await base44.asServiceRole.entities.ProdutoYampi.filter({
        yampi_id: produtoData.yampi_id
      });

      if (existente.length > 0) {
        await base44.asServiceRole.entities.ProdutoYampi.update(
          existente[0].id,
          produtoData
        );
        produtosAtualizados++;
      } else {
        await base44.asServiceRole.entities.ProdutoYampi.create(produtoData);
        produtosNovos++;
      }
    }

    return Response.json({
      success: true,
      total_produtos: produtos.length,
      novos: produtosNovos,
      atualizados: produtosAtualizados,
      mensagem: `Sincronização concluída: ${produtosNovos} novos, ${produtosAtualizados} atualizados`
    });

  } catch (error) {
    console.error('Erro na sincronização de produtos:', error);
    return Response.json({ 
      error: 'Erro interno ao sincronizar produtos',
      details: error.message 
    }, { status: 500 });
  }
});