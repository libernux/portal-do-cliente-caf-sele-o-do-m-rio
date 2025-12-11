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

    const { produtos } = await req.json();

    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return Response.json({ 
        error: 'Lista de produtos inválida' 
      }, { status: 400 });
    }

    const startTime = Date.now();
    let sucesso = 0;
    let erros = 0;
    const errosDetalhados = [];

    for (const produto of produtos) {
      try {
        const response = await fetch(`https://api.dooki.com.br/v2/${alias}/catalog/products/${produto.yampi_id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Token': token,
            'User-Secret-Key': secretKey
          },
          body: JSON.stringify({
            name: produto.nome,
            description: produto.descricao,
            active: produto.ativo,
            sku: produto.sku,
            prices: [{
              price: produto.preco,
              promotional_price: produto.preco_promocional || null
            }],
            skus: [{
              quantity: produto.estoque,
              weight: produto.peso,
              height: produto.altura,
              width: produto.largura,
              length: produto.comprimento
            }]
          })
        });

        if (response.ok) {
          sucesso++;
          
          // Atualizar localmente
          const produtosLocais = await base44.asServiceRole.entities.ProdutoYampi.filter({
            yampi_id: String(produto.yampi_id)
          });

          if (produtosLocais.length > 0) {
            await base44.asServiceRole.entities.ProdutoYampi.update(
              produtosLocais[0].id,
              {
                ...produto,
                ultima_sincronizacao: new Date().toISOString()
              }
            );
          }
        } else {
          erros++;
          const errorData = await response.json().catch(() => ({}));
          errosDetalhados.push({
            item_id: produto.yampi_id,
            mensagem_erro: errorData.message || 'Erro desconhecido'
          });
        }
      } catch (error) {
        erros++;
        errosDetalhados.push({
          item_id: produto.yampi_id,
          mensagem_erro: error.message
        });
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    const status = erros === 0 ? 'Sucesso' : (sucesso > 0 ? 'Parcial' : 'Erro');
    const mensagem = `Atualização em massa: ${sucesso} sucesso, ${erros} erros`;

    await base44.asServiceRole.entities.LogSincronizacaoYampi.create({
      tipo: 'Produtos',
      status,
      total_itens: produtos.length,
      itens_novos: 0,
      itens_atualizados: sucesso,
      itens_erro: erros,
      erros_detalhados: errosDetalhados,
      duracao_segundos: duration,
      mensagem
    });

    return Response.json({
      success: erros === 0,
      sucesso,
      erros,
      erros_detalhados: errosDetalhados,
      mensagem
    });

  } catch (error) {
    console.error('Erro na atualização em massa:', error);
    return Response.json({ 
      error: 'Erro interno na atualização em massa',
      details: error.message 
    }, { status: 500 });
  }
});