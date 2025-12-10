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

    const { documentId } = await req.json();

    // Query GraphQL para buscar status do documento
    const query = `
      query {
        document(id: "${documentId}") {
          id
          name
          created_at
          signatures {
            public_id
            name
            email
            action
            created_at
            viewed {
              created_at
            }
            signed {
              created_at
              ip
              geolocation
            }
            rejected {
              created_at
            }
          }
          files {
            original
            signed
          }
        }
      }
    `;

    const response = await fetch('https://api.autentique.com.br/v2/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return Response.json({ 
        error: 'Erro ao consultar Autentique',
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.errors) {
      return Response.json({ 
        error: 'Erro no GraphQL',
        details: data.errors
      }, { status: 400 });
    }

    const document = data.data.document;

    return Response.json({
      success: true,
      document
    });

  } catch (error) {
    console.error('Erro ao consultar status:', error);
    return Response.json({ 
      error: 'Erro interno',
      details: error.message 
    }, { status: 500 });
  }
});