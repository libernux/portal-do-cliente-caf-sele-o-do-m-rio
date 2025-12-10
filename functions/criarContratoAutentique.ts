import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiToken = Deno.env.get('AUTENTIQUE_API_TOKEN');
    if (!apiToken) {
      return Response.json({ 
        error: 'Token do Autentique não configurado' 
      }, { status: 500 });
    }

    const { contratoId, signatarios } = await req.json();

    // Buscar dados do contrato
    const contratos = await base44.asServiceRole.entities.ContratoRPA.filter({
      id: contratoId
    });

    if (!contratos || contratos.length === 0) {
      return Response.json({ error: 'Contrato não encontrado' }, { status: 404 });
    }

    const contrato = contratos[0];

    // Gerar HTML do contrato
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    h1 { text-align: center; color: #333; }
    h2 { color: #555; margin-top: 30px; }
    .clausula { margin: 20px 0; }
    .assinatura { margin-top: 60px; border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS - RPA</h1>
  <p><strong>Número do Contrato:</strong> ${contrato.numero_contrato}</p>
  
  <h2>1. PARTES CONTRATANTES</h2>
  <div class="clausula">
    <p><strong>CONTRATANTE:</strong></p>
    <p>Nome: ${contrato.contratante_nome}</p>
    <p>CPF: ${contrato.contratante_cpf}</p>
    <p>Email: ${contrato.contratante_email}</p>
    <p>Telefone: ${contrato.contratante_telefone || 'Não informado'}</p>
    <p>Endereço: ${contrato.contratante_endereco || 'Não informado'}</p>
  </div>
  
  <div class="clausula">
    <p><strong>CONTRATADA:</strong></p>
    <p>Nome: ${contrato.contratada_nome || 'Café Seleção do Mário'}</p>
    <p>CNPJ: ${contrato.contratada_cnpj || 'A definir'}</p>
    <p>Representante: ${contrato.contratada_representante || 'A definir'}</p>
  </div>

  <h2>2. OBJETO DO CONTRATO</h2>
  <div class="clausula">
    <p><strong>Tipo de Serviço:</strong> ${contrato.tipo_servico}</p>
    <p><strong>Descrição:</strong></p>
    <p>${contrato.descricao_servico}</p>
  </div>

  <h2>3. VALOR E FORMA DE PAGAMENTO</h2>
  <div class="clausula">
    <p><strong>Valor Total:</strong> R$ ${contrato.valor_contrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    <p><strong>Forma de Pagamento:</strong> ${contrato.forma_pagamento || 'A combinar'}</p>
  </div>

  <h2>4. PRAZO DE VIGÊNCIA</h2>
  <div class="clausula">
    <p><strong>Data de Início:</strong> ${contrato.data_inicio || 'A definir'}</p>
    <p><strong>Data de Término:</strong> ${contrato.data_termino || 'A definir'}</p>
    <p><strong>Prazo:</strong> ${contrato.prazo_meses || '-'} meses</p>
  </div>

  <h2>5. OBRIGAÇÕES DAS PARTES</h2>
  <div class="clausula">
    <p><strong>5.1.</strong> O CONTRATANTE obriga-se a fornecer todas as informações necessárias para a execução dos serviços.</p>
    <p><strong>5.2.</strong> A CONTRATADA obriga-se a executar os serviços com qualidade e dentro do prazo estabelecido.</p>
  </div>

  <h2>6. RESCISÃO</h2>
  <div class="clausula">
    <p>O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias.</p>
  </div>

  <h2>7. FORO</h2>
  <div class="clausula">
    <p>Fica eleito o foro da comarca de Vila Velha/ES para dirimir quaisquer dúvidas oriundas do presente contrato.</p>
  </div>

  ${contrato.observacoes ? `<h2>8. OBSERVAÇÕES</h2><div class="clausula"><p>${contrato.observacoes}</p></div>` : ''}

  <p style="margin-top: 60px;">Vila Velha/ES, ${new Date().toLocaleDateString('pt-BR')}</p>
</body>
</html>
    `;

    // Preparar signatários para o Autentique
    const signatariosAutentique = signatarios.map((sig, index) => ({
      email: sig.email,
      action: {
        name: "SIGN"
      },
      positions: [
        {
          x: "50%",
          y: `${80 + (index * 15)}%`,
          z: index + 1
        }
      ]
    }));

    // Criar documento no Autentique via GraphQL
    const mutation = `
      mutation CreateDocumentMutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
        createDocument(
          sandbox: false
          document: $document
          signers: $signers
          file: $file
        ) {
          id
          name
          refusable
          sortable
          created_at
          signatures {
            public_id
            name
            email
            created_at
            action
            link {
              short_link
            }
            user {
              id
              name
              email
            }
          }
          files {
            original
            signed
          }
        }
      }
    `;

    const variables = {
      document: {
        name: `Contrato RPA - ${contrato.numero_contrato}`
      },
      signers: signatariosAutentique,
      file: new Blob([htmlContent], { type: 'text/html' })
    };

    // Fazer requisição ao Autentique
    const formData = new FormData();
    formData.append('operations', JSON.stringify({
      query: mutation,
      variables: {
        document: variables.document,
        signers: variables.signers
      }
    }));
    formData.append('map', JSON.stringify({ "0": ["variables.file"] }));
    formData.append('0', new Blob([htmlContent], { type: 'text/html' }), 'contrato.html');

    const response = await fetch('https://api.autentique.com.br/v2/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro Autentique:', errorData);
      return Response.json({ 
        error: 'Erro ao criar documento no Autentique',
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      return Response.json({ 
        error: 'Erro no GraphQL',
        details: data.errors
      }, { status: 400 });
    }

    const document = data.data.createDocument;

    // Atualizar contrato com informações do Autentique
    await base44.asServiceRole.entities.ContratoRPA.update(contratoId, {
      autentique_document_id: document.id,
      autentique_document_url: document.signatures[0]?.link?.short_link || '',
      status: 'Aguardando Assinatura',
      data_envio_assinatura: new Date().toISOString()
    });

    // Criar/atualizar registros de signatários
    for (let i = 0; i < signatarios.length; i++) {
      const sig = signatarios[i];
      const autentiqueSig = document.signatures[i];
      
      await base44.asServiceRole.entities.SignatarioContrato.create({
        contrato_id: contratoId,
        nome: sig.nome,
        email: sig.email,
        cpf: sig.cpf || '',
        tipo: sig.tipo,
        ordem_assinatura: i + 1,
        autentique_signer_id: autentiqueSig.public_id,
        data_envio: new Date().toISOString(),
        status_assinatura: 'Pendente'
      });
    }

    return Response.json({
      success: true,
      document_id: document.id,
      document_url: document.signatures[0]?.link?.short_link,
      mensagem: 'Contrato enviado para assinatura com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return Response.json({ 
      error: 'Erro interno',
      details: error.message 
    }, { status: 500 });
  }
});