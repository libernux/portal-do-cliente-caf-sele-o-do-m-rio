import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    console.log('Webhook Autentique recebido:', payload);

    const { event, data } = payload;

    if (!event || !data) {
      return Response.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // Buscar contrato pelo document_id
    const contratos = await base44.asServiceRole.entities.ContratoRPA.filter({
      autentique_document_id: data.document.id
    });

    if (!contratos || contratos.length === 0) {
      console.log('Contrato não encontrado para document_id:', data.document.id);
      return Response.json({ message: 'Contrato não encontrado' }, { status: 200 });
    }

    const contrato = contratos[0];

    // Processar eventos
    switch (event) {
      case 'document.signed':
        // Documento totalmente assinado
        await base44.asServiceRole.entities.ContratoRPA.update(contrato.id, {
          status: 'Assinado',
          autentique_signed_url: data.document.files?.signed || '',
          data_assinatura: new Date().toISOString()
        });

        // Atualizar todos os signatários
        const signatarios = await base44.asServiceRole.entities.SignatarioContrato.filter({
          contrato_id: contrato.id
        });

        for (const sig of signatarios) {
          await base44.asServiceRole.entities.SignatarioContrato.update(sig.id, {
            status_assinatura: 'Assinado'
          });
        }
        break;

      case 'signature.signed':
        // Assinatura individual
        const signatariosInd = await base44.asServiceRole.entities.SignatarioContrato.filter({
          contrato_id: contrato.id,
          autentique_signer_id: data.signature.public_id
        });

        if (signatariosInd.length > 0) {
          await base44.asServiceRole.entities.SignatarioContrato.update(signatariosInd[0].id, {
            status_assinatura: 'Assinado',
            data_assinatura: new Date().toISOString(),
            ip_assinatura: data.signature.signed?.ip || '',
            geolocation: data.signature.signed?.geolocation || ''
          });
        }
        break;

      case 'signature.viewed':
        // Documento visualizado
        const signatariosView = await base44.asServiceRole.entities.SignatarioContrato.filter({
          contrato_id: contrato.id,
          autentique_signer_id: data.signature.public_id
        });

        if (signatariosView.length > 0) {
          await base44.asServiceRole.entities.SignatarioContrato.update(signatariosView[0].id, {
            status_assinatura: 'Visualizado',
            data_visualizacao: new Date().toISOString()
          });
        }
        break;

      case 'signature.rejected':
        // Assinatura recusada
        const signatariosRej = await base44.asServiceRole.entities.SignatarioContrato.filter({
          contrato_id: contrato.id,
          autentique_signer_id: data.signature.public_id
        });

        if (signatariosRej.length > 0) {
          await base44.asServiceRole.entities.SignatarioContrato.update(signatariosRej[0].id, {
            status_assinatura: 'Recusado'
          });
        }

        await base44.asServiceRole.entities.ContratoRPA.update(contrato.id, {
          status: 'Cancelado'
        });
        break;
    }

    return Response.json({ 
      success: true,
      message: 'Webhook processado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return Response.json({ 
      error: 'Erro interno',
      details: error.message 
    }, { status: 500 });
  }
});