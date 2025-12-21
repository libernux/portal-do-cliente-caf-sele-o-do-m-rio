import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Buscar apenas cafés aprovados
    const cafes = await base44.asServiceRole.entities.SubmissaoProdutor.filter(
      { status: "Aprovado" },
      "-created_date"
    );

    return Response.json({
      success: true,
      cafes: cafes
    });

  } catch (error) {
    console.error('Erro ao buscar cafés:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});