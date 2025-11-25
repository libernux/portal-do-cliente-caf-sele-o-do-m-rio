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

        const { dataInicio, dataFim } = await req.json();

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

        // Buscar pedidos com scroll pagination
        let allOrders = [];
        let scrollId = null;
        let hasMore = true;
        let requestCount = 0;
        const DELAY_BETWEEN_REQUESTS = 1000; // 1 segundo entre requisições

        console.log('🚀 Iniciando sincronização de pedidos com scroll_id...');

        while (hasMore) {
            requestCount++;
            
            // CORRIGIDO: sempre usar scroll=true
            let url = `${YAMPI_BASE_URL}/${merchantAlias}/orders?scroll=true&include=customer,items,shipping`;
            
            // Adiciona filtros de data apenas na primeira requisição
            if (!scrollId) {
                if (dataInicio) url += `&created_at_min=${dataInicio}`;
                if (dataFim) url += `&created_at_max=${dataFim}`;
                console.log(`📥 Requisição ${requestCount} (inicial com filtros de data)...`);
            } else {
                url += `&scroll_id=${scrollId}`;
                console.log(`📥 Requisição ${requestCount} (scroll_id: ${scrollId.substring(0, 15)}...)...`);
            }

            let retries = 0;
            const MAX_RETRIES = 3;
            let response;
            
            // Implementar retry com backoff exponencial para rate limiting
            while (retries <= MAX_RETRIES) {
                try {
                    response = await fetch(url, { headers });
                    
                    // Se receber 429 (Too Many Requests), aguarda e tenta novamente
                    if (response.status === 429) {
                        const waitTime = Math.pow(2, retries) * 2000; // 2s, 4s, 8s
                        console.log(`⚠️  Rate limit atingido. Aguardando ${waitTime/1000}s antes de tentar novamente...`);
                        await delay(waitTime);
                        retries++;
                        continue;
                    }
                    
                    if (!response.ok) {
                        throw new Error(`${response.status} - ${response.statusText}`);
                    }
                    
                    break; // Sucesso, sai do loop de retry
                    
                } catch (error) {
                    if (retries === MAX_RETRIES) {
                        throw new Error(`Erro ao buscar pedidos após ${MAX_RETRIES} tentativas: ${error.message}`);
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
                console.log('✅ Não há mais pedidos para buscar');
                break;
            }
            
            allOrders = [...allOrders, ...data.data];
            console.log(`✅ Requisição ${requestCount}: ${data.data.length} pedidos | Total: ${allOrders.length}`);
            
            scrollId = data.scroll_id;
            
            if (!scrollId) {
                hasMore = false;
            } else {
                // Delay entre requisições para evitar rate limiting
                console.log(`⏳ Aguardando ${DELAY_BETWEEN_REQUESTS/1000}s antes da próxima requisição...`);
                await delay(DELAY_BETWEEN_REQUESTS);
            }
        }

        console.log(`\n🎯 Total de pedidos encontrados: ${allOrders.length}`);
        console.log('💾 Iniciando gravação no Base44...\n');

        // Sincronizar pedidos com Base44
        const syncResults = [];
        
        for (const pedido of allOrders) {
            try {
                const cliente = pedido.customer?.data;
                const shipping = pedido.shipping?.data;
                const items = pedido.items?.data || [];

                const pedidoData = {
                    yampi_id: pedido.id,
                    numero_pedido: pedido.number?.toString() || '',
                    status: pedido.status_name || '',
                    valor_total: parseFloat(pedido.value || 0),
                    valor_frete: parseFloat(pedido.shipment_value || 0),
                    cliente_nome: cliente?.name || '',
                    cliente_email: cliente?.email || '',
                    cliente_telefone: cliente?.cellphone || cliente?.homephone || '',
                    cliente_documento: cliente?.cpf || cliente?.cnpj || '',
                    endereco_entrega: shipping ? 
                        `${shipping.street}, ${shipping.number}${shipping.complement ? ' - ' + shipping.complement : ''}, ${shipping.neighborhood}` : '',
                    cidade: shipping?.city || '',
                    estado: shipping?.uf || '',
                    cep: shipping?.zip_code || '',
                    forma_pagamento: pedido.payment_method_name || '',
                    itens: items.map(item => ({
                        produto_id: item.sku_id,
                        nome: item.name,
                        sku: item.sku,
                        quantidade: item.quantity,
                        preco_unitario: parseFloat(item.unit_price || 0),
                        preco_total: parseFloat(item.price || 0)
                    })),
                    codigo_rastreamento: pedido.tracking_code || '',
                    transportadora: pedido.carrier_name || '',
                    data_pedido: pedido.created_at || '',
                    data_pagamento: pedido.paid_at || '',
                    observacoes: pedido.comments || '',
                    ultima_sincronizacao: new Date().toISOString()
                };

                // Verificar se já existe
                const existentes = await base44.asServiceRole.entities.PedidoYampi.filter({ 
                    yampi_id: pedido.id 
                });

                if (existentes.length > 0) {
                    await base44.asServiceRole.entities.PedidoYampi.update(
                        existentes[0].id,
                        pedidoData
                    );
                    syncResults.push({ id: pedido.id, status: 'updated' });
                } else {
                    await base44.asServiceRole.entities.PedidoYampi.create(pedidoData);
                    syncResults.push({ id: pedido.id, status: 'created' });
                }
            } catch (error) {
                syncResults.push({ 
                    id: pedido.id, 
                    status: 'error', 
                    error: error.message 
                });
            }
        }

        const summary = {
            total: allOrders.length,
            created: syncResults.filter(r => r.status === 'created').length,
            updated: syncResults.filter(r => r.status === 'updated').length,
            errors: syncResults.filter(r => r.status === 'error').length
        };

        console.log('\n🎉 Sincronização de pedidos concluída!');
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