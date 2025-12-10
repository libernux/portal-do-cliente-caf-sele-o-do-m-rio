import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// ---- CONFIGURAÇÕES ----
const AUTENTIQUE_TOKEN = Deno.env.get("AUTENTIQUE_API_TOKEN");
const AUTENTIQUE_ENDPOINT = "https://api.autentique.com.br/v2/graphql";

// ---- MAP DE AÇÕES ----
const ACTION_MAP = {
  "Contratante": "SIGN",
  "Contratada": "SIGN",
  "Testemunha": "SIGN_AS_A_WITNESS",
  "Aprovador": "APPROVE",
  "Reconhecedor": "RECOGNIZE"
};

// ---- QUERY DE CRIAÇÃO DE DOCUMENTO ----
const CREATE_DOCUMENT_MUTATION = `
mutation CreateDocument(
  $document: DocumentInput!
  $signers: [SignerInput!]!
  $file: Upload!
) {
  createDocument(
    document: $document
    signers: $signers
    file: $file
  ) {
    id
    name
    created_at
    signatures {
      public_id
      name
      email
      created_at
      action {
        name
      }
      link {
        short_link
      }
    }
    files {
      original
      signed
    }
  }
}
`;

// ---- FUNÇÃO AUXILIAR PARA MULTIPART ----
function createMultipartRequest({
  query,
  variables,
  fileField,
  fileVariablePath,
  fileBuffer,
  filename
}) {
  const form = new FormData();

  // 1) Forçar variáveis com file = null
  const vars = JSON.parse(JSON.stringify(variables));
  const path = fileVariablePath.replace("variables.", "").split(".");
  let obj = vars;

  for (let i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]] = obj[path[i]] ?? {};
  }

  obj[path[path.length - 1]] = null;

  form.append(
    "operations",
    JSON.stringify({
      query,
      variables: vars
    })
  );

  form.append(
    "map",
    JSON.stringify({
      [fileField]: [`${fileVariablePath}`]
    })
  );

  form.append(fileField, new Blob([fileBuffer]), filename);

  return form;
}

// ---- FUNÇÃO PRINCIPAL ----
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!AUTENTIQUE_TOKEN) {
      return Response.json({ 
        error: 'Token do Autentique não configurado' 
      }, { status: 500 });
    }

    const { contratoId, signatarios } = await req.json();

    // 1) Buscar dados do contrato
    const contratos = await base44.asServiceRole.entities.ContratoRPA.filter({
      id: contratoId
    });

    if (!contratos || contratos.length === 0) {
      return Response.json({ error: 'Contrato não encontrado' }, { status: 404 });
    }

    const contrato = contratos[0];

    // 2) Gerar HTML do contrato
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

    // 3) Converter HTML para buffer
    const encoder = new TextEncoder();
    const htmlBuffer = encoder.encode(htmlContent);

    // 4) Converter signatários para formato do Autentique
    const signers = signatarios.map((sig, index) => ({
      email: sig.email,
      action: ACTION_MAP[sig.tipo] || "SIGN",
      positions: [
        {
          x: "50%",
          y: `${80 + (index * 15)}%`,
          z: index + 1
        }
      ]
    }));

    // 5) Criar documento com upload multipart
    const variables = {
      document: {
        name: `Contrato RPA - ${contrato.numero_contrato}`
      },
      signers,
      file: null
    };

    const form = createMultipartRequest({
      query: CREATE_DOCUMENT_MUTATION,
      variables,
      fileField: "0",
      fileVariablePath: "variables.file",
      fileBuffer: htmlBuffer,
      filename: "contrato.html"
    });

    const response = await fetch(AUTENTIQUE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTENTIQUE_TOKEN}`
      },
      body: form
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

    // 6) Atualizar contrato com informações do Autentique
    await base44.asServiceRole.entities.ContratoRPA.update(contratoId, {
      autentique_document_id: document.id,
      autentique_document_url: document.signatures[0]?.link?.short_link || '',
      status: 'Aguardando Assinatura',
      data_envio_assinatura: new Date().toISOString()
    });

    // 7) Criar registros de signatários
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
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});