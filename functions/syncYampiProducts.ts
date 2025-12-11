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

    // Buscar produtos da API Yampi com paginação
    let produtosNovos = 0;
    let produtosAtualizados = 0;
    let currentPage = 1;
    let hasMorePages = true;
    let totalProdutos = 0;

    while (hasMorePages) {
      const response = await fetch(`https://api.dooki.com.br/v2/${alias}/catalog/products?include=skus,prices,images,categories,customizations,skus.images&limit=100&page=${currentPage}`, {
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
          error: 'Erro ao buscar produtos da Yampi',
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();
      const produtos = data.data || [];
      const pagination = data.meta?.pagination;

      totalProdutos += produtos.length;

      for (const produto of produtos) {
        try {
          console.log('🔍 Processando produto:', produto.id, produto.name);
          console.log('📦 SKUs encontrados:', produto.skus?.data?.length || 0);
          
          // Processar variações/SKUs
          const variacoes = produto.skus?.data?.map((sku, index) => {
            console.log(`  ↳ SKU ${index + 1}:`, sku.sku, '| Variações:', sku.variations?.length || 0);
            
            const opcoes = [];
            
            // Processar customizações (tamanho, cor, etc)
            if (sku.variations && Array.isArray(sku.variations)) {
              sku.variations.forEach(variation => {
                console.log('    ↳ Opção:', variation.name, '=', variation.value);
                opcoes.push({
                  nome: variation.name || '',
                  valor: variation.value || ''
                });
              });
            }

            return {
              sku_id: sku.id?.toString() || '',
              sku: sku.sku || '',
              titulo: sku.title || '',
              preco: parseFloat(sku.price || 0),
              preco_promocional: parseFloat(sku.price_discount || 0),
              estoque: sku.quantity || 0,
              peso: parseFloat(sku.weight || 0),
              altura: parseFloat(sku.height || 0),
              largura: parseFloat(sku.width || 0),
              comprimento: parseFloat(sku.length || 0),
              imagem_url: sku.images?.data?.[0]?.url || '',
              opcoes: opcoes
            };
          }) || [];

          console.log('✅ Variações processadas:', variacoes.length);

          // Processar todas as imagens
          const imagens = produto.images?.data?.map(img => img.url) || [];
          console.log('🖼️ Imagens processadas:', imagens.length);

          const produtoData = {
            yampi_id: String(produto.id),
            sku: produto.sku || '',
            nome: produto.name || '',
            descricao: produto.description || '',
            preco: parseFloat(produto.prices?.data?.[0]?.price || 0),
            preco_promocional: parseFloat(produto.prices?.data?.[0]?.promotional_price || 0),
            estoque: variacoes.reduce((sum, v) => sum + (v.estoque || 0), 0),
            imagem_url: produto.images?.data?.[0]?.url || '',
            categoria: produto.categories?.data?.[0]?.name || '',
            ativo: produto.active || false,
            peso: parseFloat(produto.skus?.data?.[0]?.weight || 0),
            altura: parseFloat(produto.skus?.data?.[0]?.height || 0),
            largura: parseFloat(produto.skus?.data?.[0]?.width || 0),
            comprimento: parseFloat(produto.skus?.data?.[0]?.length || 0),
            variacoes: variacoes,
            imagens: imagens,
            ultima_sincronizacao: new Date().toISOString()
          };

          console.log('💾 Dados do produto preparados, estoque total:', produtoData.estoque);

          // Verificar se produto já existe
          const existente = await base44.asServiceRole.entities.ProdutoYampi.filter({
            yampi_id: produtoData.yampi_id
          });

          if (existente.length > 0) {
            console.log('🔄 Atualizando produto existente:', existente[0].id);
            await base44.asServiceRole.entities.ProdutoYampi.update(
              existente[0].id,
              produtoData
            );
            produtosAtualizados++;
          } else {
            console.log('➕ Criando novo produto');
            await base44.asServiceRole.entities.ProdutoYampi.create(produtoData);
            produtosNovos++;
          }
          
          console.log('✅ Produto salvo com sucesso!');
          
        } catch (produtoError) {
          console.error('❌ ERRO ao processar produto:', produto.id, produto.name);
          console.error('Detalhes do erro:', produtoError.message);
          console.error('Stack trace:', produtoError.stack);
          console.error('Dados do produto que causou erro:', JSON.stringify(produto, null, 2));
          throw produtoError;
        }

      }

      // Verificar se há mais páginas
      hasMorePages = pagination && currentPage < pagination.total_pages;
      currentPage++;
    }

    return Response.json({
      success: true,
      total_produtos: totalProdutos,
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