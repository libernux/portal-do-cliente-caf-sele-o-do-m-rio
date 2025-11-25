import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const YAMPI_BASE_URL = 'https://api.dooki.com.br/v2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { cep, produtosIds, quantidades, valorTotal } = await req.json();

        if (!cep || !produtosIds || !quantidades) {
            return Response.json({ 
                error: 'CEP, IDs de produtos e quantidades são obrigatórios' 
            }, { status: 400 });
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

        // Calcular frete
        const response = await fetch(
            `${YAMPI_BASE_URL}/${merchantAlias}/logistics/shipping/quotes`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    zipcode: cep,
                    total: valorTotal || 0,
                    skus_ids: produtosIds,
                    quantities: quantidades,
                    origin: 'api'
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Erro ao calcular frete: ${response.statusText}`);
        }

        const data = await response.json();

        return Response.json({
            success: true,
            opcoes_frete: data.data.map(opcao => ({
                id: opcao.id,
                servico: opcao.service_name,
                tipo: opcao.service_type_name,
                preco: parseFloat(opcao.price),
                prazo_dias: opcao.delivery_time,
                transportadora: opcao.gateway,
                entrega_mesmo_dia: opcao.same_day_delivery || false
            }))
        });

    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});