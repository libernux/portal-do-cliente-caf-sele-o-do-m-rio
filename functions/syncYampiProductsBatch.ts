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

    const { batchSize = 10 } = await req.json().catch(() => ({}));

    let produtosNovos = 0;
    let produtosAtualizados = 0;
    let produtosErro = 0;
    let errosDetalhados = [];
    let currentPage = 1;
    let hasMorePages = true;
    let totalProdutos = 0;
    let processados = 0;

    console.log('🚀 Iniciando sincronização em lotes de', batchSize);

    while (hasMorePages) {
      console.log(`📄 Processando página ${currentPage}`);
      
      const response = await fetch(
        `https://api.dooki.com.br/v2/${alias}/catalog/products?include=skus,prices,images,categories,customizations,skus.images&limit=${batchSize}&page=${currentPage}`,
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
          error: 'Erro ao buscar produtos da Yampi',
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();
      const produtos = data.data || [];
      const pagination = data.meta?.pagination;

      if (currentPage === 1 && pagination) {
        totalProdutos = pagination.total;
        console.log(`📊 Total de produtos a processar: ${totalProdutos}`);
      }

      for (const produto of produtos) {
        try {
          processados++;
          console.log(`🔍 [${processados}/${totalProdutos}] Processando: ${produto.name}`);

          // Processar SKUs individuais com seus preços e detalhes
          const skus = produto.skus?.data || [];
          const variacoes = skus.map((sku) => {
            // Extrair opções/variações do SKU (ex: Tamanho: P, Cor: Azul)
            const opcoes = [];
            if (sku.variations && Array.isArray(sku.variations)) {
              sku.variations.forEach(variation => {
                opcoes.push({
                  nome: variation.name || '',
                  valor: variation.value || ''
                });
              });
            }

            // Buscar preço específico deste SKU
            const precoSku = produto.prices?.data?.find(p => p.sku_id === sku.id);
            
            return {
              sku_id: sku.id?.toString() || '',
              sku: sku.sku || '',
              titulo: sku.title || sku.sku || '',
              descricao: sku.description || '',
              preco: parseFloat(precoSku?.price || sku.price || 0),
              preco_promocional: parseFloat(precoSku?.promotional_price || sku.price_discount || 0),
              preco_custo: parseFloat(precoSku?.cost_price || 0),
              estoque: parseInt(sku.quantity || 0),
              peso: parseFloat(sku.weight || 0),
              altura: parseFloat(sku.height || 0),
              largura: parseFloat(sku.width || 0),
              comprimento: parseFloat(sku.length || 0),
              imagem_url: sku.images?.data?.[0]?.url || '',
              imagens: sku.images?.data?.map(img => img.url) || [],
              opcoes: opcoes,
              ativo: sku.active !== false,
              referencia: sku.reference || '',
              ean: sku.ean || '',
              ncm: sku.ncm || ''
            };
          });

          // Processar todas as imagens do produto
          const imagens = produto.images?.data?.map(img => img.url) || [];

          // Calcular estoque total somando todos os SKUs
          const estoqueTotal = variacoes.reduce((sum, v) => sum + (v.estoque || 0), 0);

          // Pegar o preço do SKU principal (primeiro SKU ou com menor preço)
          const precoBase = variacoes.length > 0 
            ? Math.min(...variacoes.map(v => v.preco).filter(p => p > 0))
            : parseFloat(produto.prices?.data?.[0]?.price || 0);

          const precoPromocional = variacoes.length > 0
            ? Math.min(...variacoes.map(v => v.preco_promocional).filter(p => p > 0))
            : parseFloat(produto.prices?.data?.[0]?.promotional_price || 0);

          const produtoData = {
            yampi_id: String(produto.id),
            sku: produto.sku || variacoes[0]?.sku || '',
            nome: produto.name || '',
            descricao: produto.description || '',
            preco: precoBase,
            preco_promocional: precoPromocional || 0,
            estoque: estoqueTotal,
            imagem_url: produto.images?.data?.[0]?.url || '',
            categoria: produto.categories?.data?.[0]?.name || '',
            ativo: produto.active !== false,
            peso: parseFloat(variacoes[0]?.peso || 0),
            altura: parseFloat(variacoes[0]?.altura || 0),
            largura: parseFloat(variacoes[0]?.largura || 0),
            comprimento: parseFloat(variacoes[0]?.comprimento || 0),
            variacoes: variacoes,
            imagens: imagens,
            marca: produto.brand?.data?.name || '',
            slug: produto.slug || '',
            tem_variacoes: variacoes.length > 1,
            total_skus: variacoes.length,
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
            console.log(`✅ Atualizado: ${produto.name}`);
          } else {
            await base44.asServiceRole.entities.ProdutoYampi.create(produtoData);
            produtosNovos++;
            console.log(`➕ Criado: ${produto.name}`);
          }
          
        } catch (produtoError) {
          produtosErro++;
          const errorDetail = {
            produto_id: produto.id,
            produto_nome: produto.name,
            produto_sku: produto.sku,
            erro: produtoError.message,
            stack: produtoError.stack
          };
          errosDetalhados.push(errorDetail);
          console.error(`❌ Erro ao processar ${produto.name}:`, produtoError.message);
          console.error('Stack:', produtoError.stack);
        }
      }

      // Verificar se há mais páginas
      hasMorePages = pagination && currentPage < pagination.total_pages;
      currentPage++;
    }

    console.log('✅ Sincronização concluída!');
    console.log(`📊 Novos: ${produtosNovos} | Atualizados: ${produtosAtualizados} | Erros: ${produtosErro}`);

    if (errosDetalhados.length > 0) {
      console.error('❌ Erros detalhados:', JSON.stringify(errosDetalhados, null, 2));
    }

    return Response.json({
      success: true,
      total_produtos: totalProdutos,
      novos: produtosNovos,
      atualizados: produtosAtualizados,
      erros: produtosErro,
      erros_detalhados: errosDetalhados,
      mensagem: `Sincronização concluída: ${produtosNovos} novos, ${produtosAtualizados} atualizados${produtosErro > 0 ? `, ${produtosErro} erros` : ''}`
    });

  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error);
    return Response.json({ 
      error: 'Erro interno ao sincronizar produtos',
      details: error.message 
    }, { status: 500 });
  }
});