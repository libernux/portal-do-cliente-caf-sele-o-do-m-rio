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

    const startTime = Date.now();
    let categoriasNovas = 0;
    let categoriasAtualizadas = 0;
    let currentPage = 1;
    let hasMorePages = true;
    let totalCategorias = 0;

    while (hasMorePages) {
      const response = await fetch(`https://api.dooki.com.br/v2/${alias}/catalog/categories?limit=100&page=${currentPage}`, {
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
        
        const duration = Math.round((Date.now() - startTime) / 1000);
        await base44.asServiceRole.entities.LogSincronizacaoYampi.create({
          tipo: 'Categorias',
          status: 'Erro',
          total_itens: 0,
          itens_novos: 0,
          itens_atualizados: 0,
          itens_erro: 0,
          duracao_segundos: duration,
          mensagem: 'Erro ao buscar categorias da Yampi'
        });

        return Response.json({ 
          error: 'Erro ao buscar categorias da Yampi',
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();
      const categorias = data.data || [];
      const pagination = data.meta?.pagination;

      totalCategorias += categorias.length;

      for (const categoria of categorias) {
        const categoriaData = {
          yampi_id: String(categoria.id),
          nome: categoria.name || '',
          descricao: categoria.description || '',
          slug: categoria.slug || '',
          ativo: categoria.active !== undefined ? categoria.active : true,
          ordem: categoria.order || 0,
          categoria_pai_id: categoria.parent_id ? String(categoria.parent_id) : null,
          ultima_sincronizacao: new Date().toISOString()
        };

        const existente = await base44.asServiceRole.entities.CategoriaYampi.filter({
          yampi_id: categoriaData.yampi_id
        });

        if (existente.length > 0) {
          await base44.asServiceRole.entities.CategoriaYampi.update(
            existente[0].id,
            categoriaData
          );
          categoriasAtualizadas++;
        } else {
          await base44.asServiceRole.entities.CategoriaYampi.create(categoriaData);
          categoriasNovas++;
        }
      }

      hasMorePages = pagination && currentPage < pagination.total_pages;
      currentPage++;
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    const mensagem = `Sincronização concluída: ${categoriasNovas} novos, ${categoriasAtualizadas} atualizados`;

    await base44.asServiceRole.entities.LogSincronizacaoYampi.create({
      tipo: 'Categorias',
      status: 'Sucesso',
      total_itens: totalCategorias,
      itens_novos: categoriasNovas,
      itens_atualizados: categoriasAtualizadas,
      itens_erro: 0,
      duracao_segundos: duration,
      mensagem
    });

    return Response.json({
      success: true,
      total_categorias: totalCategorias,
      novos: categoriasNovas,
      atualizados: categoriasAtualizadas,
      mensagem
    });

  } catch (error) {
    console.error('Erro na sincronização de categorias:', error);
    return Response.json({ 
      error: 'Erro interno ao sincronizar categorias',
      details: error.message 
    }, { status: 500 });
  }
});