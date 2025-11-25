import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const YAMPI_BASE_URL = 'https://api.dooki.com.br/v2';

// Função helper para adicionar delay entre requisições
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const merchantAlias = Deno.env.get('YAMPI_MERCHANT_ALIAS');
        const userToken = Deno.env.get('YAMPI_USER_TOKEN');
        const userSecretKey = Deno.env.get('YAMPI_USER_SECRET_KEY');

        if (!merchantAlias || !userToken || !userSecretKey) {
            return Response.json({ 
                error: 'Credenciais Yampi não configuradas' 
            }, { status: 500 });
        }

        const headers = {
            'Content-Type': 'application/json',
            'User-Token': userToken,
            'User-Secret-Key': userSecretKey
        };

        // Buscar produtos com scroll pagination
        let allProducts = [];
        let scrollId = null;
        let hasMore = true;
        let requestCount = 0;
        const DELAY_BETWEEN_REQUESTS = 1000; // 1 segundo entre requisições

        console.log('🚀 Iniciando sincronização de produtos com scroll_id...');

        while (hasMore) {
            requestCount++;
            
            // CORRIGIDO: sempre usar scroll=true
            const url = scrollId 
                ? `${YAMPI_BASE_URL}/${merchantAlias}/catalog/products?scroll=true&scroll_id=${scrollId}&include=brand,images,skus`
                : `${YAMPI_BASE_URL}/${merchantAlias}/catalog/products?scroll=true&include=brand,images,skus`;

            console.log(`📥 Requisição ${requestCount}${scrollId ? ` (scroll_id: ${scrollId.substring(0, 15)}...)` : ' (inicial)'}...`);

            let retries = 0;
            const MAX_RETRIES = 3;
            let response;
            
            // Implementar retry com backoff exponencial
            while (retries <= MAX_RETRIES) {
                try {
                    response = await fetch(url, { headers });
                    
                    if (response.status === 429) {
                        const waitTime = Math.pow(2, retries) * 2000;
                        console.log(`⚠️  Rate limit atingido. Aguardando ${waitTime/1000}s...`);
                        await delay(waitTime);
                        retries++;
                        continue;
                    }
                    
                    if (!response.ok) {
                        throw new Error(`${response.status} - ${response.statusText}`);
                    }
                    
                    break;
                    
                } catch (error) {
                    if (retries === MAX_RETRIES) {
                        throw new Error(`Erro ao buscar produtos após ${MAX_RETRIES} tentativas: ${error.message}`);
                    }
                    retries++;
                    const waitTime = Math.pow(2, retries) * 1000;
                    console.log(`❌ Erro na requisição. Tentativa ${retries}/${MAX_RETRIES}. Aguardando ${waitTime/1000}s...`);
                    await delay(waitTime);
                }
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                hasMore = false;
                console.log('✅ Não há mais produtos para buscar');
                break;
            }
            
            allProducts = [...allProducts, ...data.data];
            console.log(`✅ Requisição ${requestCount}: ${data.data.length} produtos | Total: ${allProducts.length}`);
            
            scrollId = data.scroll_id;
            
            if (!scrollId) {
                hasMore = false;
            } else {
                // Delay entre requisições
                console.log(`⏳ Aguardando ${DELAY_BETWEEN_REQUESTS/1000}s antes da próxima requisição...`);
                await delay(DELAY_BETWEEN_REQUESTS);
            }
        }

        console.log(`\n🎯 Total de produtos encontrados: ${allProducts.length}`);
        console.log('💾 Iniciando gravação no Base44...\n');

        // Sincronizar produtos com Base44
        const syncResults = [];
        
        for (const produto of allProducts) {
            try {
                const imagemPrincipal = produto.images?.data?.[0]?.url || '';
                const todasImagens = produto.images?.data?.map(img => img.url) || [];
                
                const produtoData = {
                    yampi_id: produto.id,
                    nome: produto.name,
                    descricao: produto.description || '',
                    preco: parseFloat(produto.price || 0),
                    preco_promocional: produto.promotional_price ? parseFloat(produto.promotional_price) : null,
                    sku: produto.sku || '',
                    estoque: produto.quantity || 0,
                    ativo: produto.active === 1,
                    marca: produto.brand?.data?.name || '',
                    categoria: produto.categories?.data?.[0]?.name || '',
                    imagens: todasImagens,
                    peso: produto.weight || 0,
                    altura: produto.height || 0,
                    largura: produto.width || 0,
                    comprimento: produto.length || 0,
                    url_yampi: produto.url || '',
                    ultima_sincronizacao: new Date().toISOString()
                };

                // Verificar se já existe
                const existentes = await base44.asServiceRole.entities.ProdutoYampi.filter({ 
                    yampi_id: produto.id 
                });

                if (existentes.length > 0) {
                    await base44.asServiceRole.entities.ProdutoYampi.update(
                        existentes[0].id,
                        produtoData
                    );
                    syncResults.push({ id: produto.id, status: 'updated' });
                } else {
                    await base44.asServiceRole.entities.ProdutoYampi.create(produtoData);
                    syncResults.push({ id: produto.id, status: 'created' });
                }
            } catch (error) {
                syncResults.push({ 
                    id: produto.id, 
                    status: 'error', 
                    error: error.message 
                });
            }
        }

        const summary = {
            total: allProducts.length,
            created: syncResults.filter(r => r.status === 'created').length,
            updated: syncResults.filter(r => r.status === 'updated').length,
            errors: syncResults.filter(r => r.status === 'error').length
        };

        console.log('\n🎉 Sincronização de produtos concluída!');
        console.log(`   ✅ Novos: ${summary.created}`);
        console.log(`   🔄 Atualizados: ${summary.updated}`);
        console.log(`   ❌ Erros: ${summary.errors}`);

        return Response.json({
            success: true,
            summary,
            results: syncResults
        });

    } catch (error) {
        console.error('💥 Erro na sincronização:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});