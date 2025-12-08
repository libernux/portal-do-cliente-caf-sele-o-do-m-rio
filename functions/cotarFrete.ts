import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      cep_origem, 
      cep_destino, 
      peso, 
      altura, 
      largura, 
      comprimento, 
      valor_declarado 
    } = await req.json();

    // Validações
    if (!cep_origem || !cep_destino) {
      return Response.json({ 
        error: 'CEP de origem e destino são obrigatórios' 
      }, { status: 400 });
    }

    if (!peso || !altura || !largura || !comprimento) {
      return Response.json({ 
        error: 'Dimensões e peso são obrigatórios' 
      }, { status: 400 });
    }

    const token = Deno.env.get('MELHOR_ENVIO_TOKEN');
    const isSandbox = Deno.env.get('MELHOR_ENVIO_SANDBOX') === 'true';

    if (!token) {
      return Response.json({ 
        error: 'Token da Melhor Envio não configurado' 
      }, { status: 500 });
    }

    // Base URL da API
    const baseUrl = isSandbox 
      ? 'https://sandbox.melhorenvio.com.br/api/v2'
      : 'https://melhorenvio.com.br/api/v2';

    // Corpo da requisição para cotação
    const payload = {
      from: {
        postal_code: cep_origem.replace(/\D/g, '')
      },
      to: {
        postal_code: cep_destino.replace(/\D/g, '')
      },
      package: {
        height: parseFloat(altura),
        width: parseFloat(largura),
        length: parseFloat(comprimento),
        weight: parseFloat(peso)
      }
    };

    if (valor_declarado) {
      payload.options = {
        insurance_value: parseFloat(valor_declarado),
        receipt: false,
        own_hand: false
      };
    }

    // Chamada à API da Melhor Envio
    const response = await fetch(`${baseUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Aplicação Café Seleção (contato@cafeselecao.com.br)'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro Melhor Envio:', errorData);
      return Response.json({ 
        error: 'Erro ao consultar Melhor Envio',
        details: errorData 
      }, { status: response.status });
    }

    const cotacoes = await response.json();

    // Formatar resultados
    const resultados = cotacoes.map(cotacao => ({
      id: cotacao.id,
      nome: cotacao.name,
      empresa: cotacao.company?.name || cotacao.company?.picture || 'N/A',
      preco: cotacao.price,
      prazo_entrega: cotacao.delivery_time,
      prazo_entrega_texto: `${cotacao.delivery_time} dia${cotacao.delivery_time > 1 ? 's' : ''} úteis`,
      preco_formatado: `R$ ${parseFloat(cotacao.price).toFixed(2).replace('.', ',')}`,
      servico: cotacao.name,
      logo: cotacao.company?.picture || null,
      informacoes_adicionais: {
        seguro: cotacao.packages?.[0]?.insurance_value || 0,
        mao_propria: cotacao.packages?.[0]?.own_hand || false,
        aviso_recebimento: cotacao.packages?.[0]?.receipt || false
      }
    }));

    // Ordenar por preço (do menor para o maior)
    resultados.sort((a, b) => a.preco - b.preco);

    return Response.json({
      success: true,
      cotacoes: resultados,
      parametros_utilizados: {
        cep_origem: cep_origem,
        cep_destino: cep_destino,
        peso: peso,
        altura: altura,
        largura: largura,
        comprimento: comprimento,
        valor_declarado: valor_declarado || 0
      }
    });

  } catch (error) {
    console.error('Erro na cotação de frete:', error);
    return Response.json({ 
      error: 'Erro interno ao processar cotação',
      details: error.message 
    }, { status: 500 });
  }
});