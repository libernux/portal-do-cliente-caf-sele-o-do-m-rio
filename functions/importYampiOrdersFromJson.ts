import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const jsonFile = formData.get('file');

    if (!jsonFile) {
      return Response.json({ error: 'Arquivo JSON não fornecido' }, { status: 400 });
    }

    const content = await jsonFile.text();
    const jsonData = JSON.parse(content);
    
    // Suportar ambos os formatos: novo (com metadata) e antigo (array direto)
    const pedidos = jsonData.pedidos || jsonData;
    const metadata = jsonData.metadata || null;

    if (metadata) {
      console.log('📋 Metadata do arquivo:');
      console.log(`   Total de pedidos: ${metadata.total_pedidos}`);
      console.log(`   Data da coleta: ${metadata.data_coleta}`);
      console.log(`   Loja: ${metadata.alias_loja}`);
    }

    console.log(`🚀 Iniciando importação de ${pedidos.length} pedidos no banco de dados...`);

    let pedidosNovos = 0;
    let pedidosAtualizados = 0;
    let pedidosErro = 0;
    const errosDetalhados = [];
    const batchSize = 20; // Lotes menores para evitar sobrecarga
    const delayBetweenBatches = 1000; // 1 segundo entre lotes
    const totalBatches = Math.ceil(pedidos.length / batchSize);

    for (let i = 0; i < pedidos.length; i += batchSize) {
      const batch = pedidos.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const progress = Math.round((batchNumber / totalBatches) * 100);
      
      console.log(`📦 Lote ${batchNumber}/${totalBatches} (${progress}%): processando ${batch.length} pedidos...`);

      await Promise.all(batch.map(async (pedido) => {
        try {
          const itens = (pedido.items?.data || []).map(item => ({
            produto_id: String(item.product?.data?.id || ''),
            produto_nome: String(item.name || 'Produto sem nome'),
            sku_id: String(item.sku?.data?.id || ''),
            sku: String(item.sku_code || ''),
            quantidade: Number(item.quantity || 0),
            preco_unitario: parseFloat(item.price || 0),
            preco_total: parseFloat(item.total || 0),
            imagem_url: String(item.product?.data?.images?.data?.[0]?.url || '')
          }));

          const endereco = pedido.shipping?.data || {};
          const cliente = pedido.customer?.data || {};
          const transacoes = (pedido.transactions?.data || []).map(t => ({
            id: String(t.id || ''),
            gateway: t.gateway || '',
            metodo: t.payment_method || '',
            status: t.status || '',
            valor: parseFloat(t.value || 0),
            data: t.created_at?.date || ''
          }));

          const historico = (pedido.status_history?.data || []).map(h => ({
            status: h.status?.data?.name || '',
            data: h.created_at?.date || '',
            observacao: h.observation || ''
          }));

          const cupons = (pedido.coupons?.data || []).map(c => ({
            codigo: c.code || '',
            desconto: parseFloat(c.discount_value || 0)
          }));

          const pedidoData = {
            yampi_id: String(pedido.id),
            numero_pedido: String(pedido.number || pedido.id),
            cliente_nome: String(
              cliente.first_name && cliente.last_name 
                ? `${cliente.first_name} ${cliente.last_name}`
                : cliente.name || 'Cliente não identificado'
            ),
            cliente_email: String(cliente.email || ''),
            cliente_telefone: typeof cliente.phone === 'object' 
              ? String(cliente.phone?.full_number || cliente.phone?.number || '')
              : String(cliente.phone || ''),
            cliente_cpf: String(cliente.cpf || ''),
            status: pedido.status?.data?.name || pedido.status_name || '',
            status_pagamento: pedido.paid ? 'Pago' : 'Pendente',
            valor_total: parseFloat(pedido.value || 0),
            valor_frete: parseFloat(pedido.shipping_value || 0),
            valor_desconto: parseFloat(pedido.discount || 0),
            valor_subtotal: parseFloat(pedido.subtotal || 0),
            itens: itens,
            endereco_entrega: {
              rua: endereco.street || '',
              numero: endereco.number || '',
              complemento: endereco.complement || '',
              bairro: endereco.neighborhood || '',
              cidade: endereco.city || '',
              estado: endereco.state || '',
              cep: endereco.zipcode || '',
              destinatario: endereco.receiver || ''
            },
            data_pedido: pedido.created_at?.date || new Date().toISOString(),
            data_atualizacao: pedido.updated_at?.date || '',
            forma_pagamento: pedido.payment?.data?.name || '',
            codigo_rastreamento: endereco.tracking_code || '',
            transportadora: endereco.shipping_company || '',
            prazo_entrega: endereco.delivery_time || '',
            observacoes: pedido.observation || '',
            ip_cliente: pedido.ip || '',
            origem: pedido.utm_source || '',
            transacoes: transacoes,
            historico_status: historico,
            cupons: cupons,
            ultima_sincronizacao: new Date().toISOString()
          };

          const existente = await base44.asServiceRole.entities.PedidoYampi.filter({
            yampi_id: pedidoData.yampi_id
          });

          if (existente.length > 0) {
            await base44.asServiceRole.entities.PedidoYampi.update(
              existente[0].id,
              pedidoData
            );
            pedidosAtualizados++;
          } else {
            await base44.asServiceRole.entities.PedidoYampi.create(pedidoData);
            pedidosNovos++;
          }
        } catch (pedidoError) {
          pedidosErro++;
          errosDetalhados.push({
            pedido_id: String(pedido.id || ''),
            pedido_numero: String(pedido.number || pedido.id || ''),
            cliente_nome: pedido.customer?.data?.first_name 
              ? `${pedido.customer.data.first_name} ${pedido.customer.data.last_name || ''}`
              : 'N/A',
            erro: pedidoError.message || String(pedidoError)
          });
        }
      }));

      console.log(`✅ Lote ${batchNumber} concluído: ${pedidosNovos} novos, ${pedidosAtualizados} atualizados, ${pedidosErro} erros`);
      
      // Aguardar entre lotes para não sobrecarregar o banco
      if (i + batchSize < pedidos.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    await base44.asServiceRole.entities.LogSincronizacaoYampi.create({
      tipo: 'Pedidos',
      status: pedidosErro === 0 ? 'Sucesso' : pedidosErro < pedidos.length ? 'Parcial' : 'Erro',
      total_itens: pedidos.length,
      itens_novos: pedidosNovos,
      itens_atualizados: pedidosAtualizados,
      itens_erro: pedidosErro,
      erros_detalhados: errosDetalhados,
      mensagem: `Importação JSON: ${pedidosNovos} novos, ${pedidosAtualizados} atualizados, ${pedidosErro} erros`
    });

    return Response.json({
      success: true,
      total: pedidos.length,
      novos: pedidosNovos,
      atualizados: pedidosAtualizados,
      erros: pedidosErro,
      erros_detalhados: errosDetalhados,
      mensagem: `Importação concluída: ${pedidosNovos} novos, ${pedidosAtualizados} atualizados${pedidosErro > 0 ? `, ${pedidosErro} erros` : ''}`
    });

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    return Response.json({ 
      error: 'Erro interno ao importar pedidos',
      details: error.message 
    }, { status: 500 });
  }
});