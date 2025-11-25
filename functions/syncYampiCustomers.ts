import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const YAMPI_BASE_URL = 'https://api.dooki.com.br/v2';

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

        // Buscar todos os clientes da Yampi (com paginação)
        let allCustomers = [];
        let currentPage = 1;
        let hasMore = true;

        console.log('🔄 Iniciando sincronização de clientes da Yampi...');

        while (hasMore) {
            const response = await fetch(
                `${YAMPI_BASE_URL}/${merchantAlias}/customers?page=${currentPage}&include=addresses,stats,tags`,
                { headers }
            );

            if (!response.ok) {
                throw new Error(`Erro ao buscar clientes: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                allCustomers = [...allCustomers, ...data.data];
                console.log(`📦 Página ${currentPage}: ${data.data.length} clientes carregados`);
                
                // Verificar se há mais páginas
                hasMore = data.data.length === data.per_page;
                currentPage++;
            } else {
                hasMore = false;
            }
        }

        console.log(`✅ Total de ${allCustomers.length} clientes encontrados na Yampi`);

        // Sincronizar cada cliente com o Base44
        const syncResults = [];
        
        for (const cliente of allCustomers) {
            try {
                // Extrair dados relevantes
                const stats = cliente.stats?.data;
                const addresses = cliente.addresses?.data || [];
                const tags = cliente.tags?.data || [];

                const clienteData = {
                    yampi_id: cliente.id,
                    nome: cliente.name || '',
                    email: cliente.email || '',
                    documento: cliente.cpf || cliente.cnpj || '',
                    tipo_pessoa: cliente.type || 'f',
                    telefone: cliente.cellphone || '',
                    telefone_residencial: cliente.homephone || '',
                    data_nascimento: cliente.birth_date || null,
                    genero: cliente.gender || '',
                    razao_social: cliente.company_name || '',
                    nome_fantasia: cliente.trading_name || '',
                    inscricao_estadual: cliente.state_registration || '',
                    enderecos: addresses.map(addr => ({
                        id: addr.id,
                        destinatario: addr.receiver || '',
                        cep: addr.zip_code || '',
                        rua: addr.street || '',
                        numero: addr.number || '',
                        complemento: addr.complement || '',
                        bairro: addr.neighborhood || '',
                        cidade: addr.city || '',
                        estado: addr.uf || '',
                        pais: addr.country || 'BR',
                        principal: addr.default || false
                    })),
                    total_pedidos: stats?.orders_count || 0,
                    valor_total_compras: parseFloat(stats?.total_paid || 0),
                    ticket_medio: stats?.orders_count > 0 
                        ? parseFloat(stats?.total_paid || 0) / stats.orders_count 
                        : 0,
                    data_primeiro_pedido: stats?.first_order_at || null,
                    data_ultimo_pedido: stats?.last_order_at || null,
                    utm_source: cliente.utm_source || '',
                    utm_campaign: cliente.utm_campaign || '',
                    utm_medium: cliente.utm_medium || '',
                    utm_term: cliente.utm_term || '',
                    utm_content: cliente.utm_content || '',
                    tags: tags.map(tag => tag.name),
                    aceita_marketing: cliente.accepts_marketing || false,
                    data_cadastro: cliente.created_at || null,
                    ultima_sincronizacao: new Date().toISOString()
                };

                // Verificar se o cliente já existe no Base44
                const existingCustomers = await base44.asServiceRole.entities.ClienteYampi.filter({ 
                    yampi_id: cliente.id 
                });

                if (existingCustomers.length > 0) {
                    // Atualizar cliente existente
                    await base44.asServiceRole.entities.ClienteYampi.update(
                        existingCustomers[0].id,
                        clienteData
                    );
                    syncResults.push({ id: cliente.id, status: 'updated' });
                } else {
                    // Criar novo cliente
                    await base44.asServiceRole.entities.ClienteYampi.create(clienteData);
                    syncResults.push({ id: cliente.id, status: 'created' });
                }
            } catch (error) {
                console.error(`Erro ao sincronizar cliente ${cliente.id}:`, error);
                syncResults.push({ 
                    id: cliente.id, 
                    status: 'error', 
                    error: error.message 
                });
            }
        }

        const summary = {
            total: allCustomers.length,
            created: syncResults.filter(r => r.status === 'created').length,
            updated: syncResults.filter(r => r.status === 'updated').length,
            errors: syncResults.filter(r => r.status === 'error').length
        };

        console.log('📊 Resumo da sincronização:');
        console.log(`   ✅ Criados: ${summary.created}`);
        console.log(`   🔄 Atualizados: ${summary.updated}`);
        console.log(`   ❌ Erros: ${summary.errors}`);

        return Response.json({
            success: true,
            summary,
            results: syncResults
        });

    } catch (error) {
        console.error('Erro na sincronização:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});