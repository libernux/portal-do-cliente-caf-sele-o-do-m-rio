import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { problemaId, tipo, emailDestinatario, nomeDestinatario } = await req.json();

        console.log('Iniciando notificação:', { problemaId, tipo, emailDestinatario });

        // Buscar dados do problema
        const problema = await base44.entities.Problema.get(problemaId);

        if (!problema) {
            return Response.json({ error: 'Problema não encontrado' }, { status: 404 });
        }

        let subject = '';
        let body = '';

        switch (tipo) {
            case 'atribuicao':
                subject = `Problema atribuído: ${problema.nome_cliente}`;
                body = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6B4423;">Novo problema atribuído a você</h2>
                        
                        <div style="background: #F5F1E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Cliente:</strong> ${problema.nome_cliente}</p>
                            <p><strong>Email:</strong> ${problema.email_cliente}</p>
                            <p><strong>Tipo:</strong> ${problema.tipo}</p>
                            <p><strong>Prioridade:</strong> ${problema.prioridade}</p>
                        </div>

                        <div style="background: white; padding: 20px; border-left: 4px solid #D97706; margin: 20px 0;">
                            <h3 style="color: #6B4423; margin-top: 0;">Descrição do Problema:</h3>
                            <p style="color: #8B7355;">${problema.descricao}</p>
                        </div>

                        <p style="color: #8B7355;">Acesse o sistema para mais detalhes.</p>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px;">
                            <p>Café Seleção do Mário - Sistema de Gestão</p>
                        </div>
                    </div>
                `;
                break;

            case 'status_mudou':
                subject = `Status atualizado: ${problema.nome_cliente}`;
                body = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6B4423;">Status do problema atualizado</h2>
                        
                        <div style="background: #F5F1E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Cliente:</strong> ${problema.nome_cliente}</p>
                            <p><strong>Novo Status:</strong> ${problema.status}</p>
                            <p><strong>Tipo:</strong> ${problema.tipo}</p>
                        </div>

                        <div style="background: white; padding: 20px; border-left: 4px solid #C9A961; margin: 20px 0;">
                            <p style="color: #8B7355;"><strong>Problema:</strong> ${problema.descricao}</p>
                        </div>

                        <p style="color: #8B7355;">Atualizado por: ${user.full_name}</p>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px;">
                            <p>Café Seleção do Mário - Sistema de Gestão</p>
                        </div>
                    </div>
                `;
                break;

            case 'resolvido':
                subject = `Problema resolvido: ${problema.nome_cliente}`;
                body = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #2D5016, #3D6B1F); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h2 style="color: white; margin: 0;">✅ Problema Resolvido!</h2>
                        </div>
                        
                        <div style="background: white; padding: 20px;">
                            <div style="background: #F5F1E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Cliente:</strong> ${problema.nome_cliente}</p>
                                <p><strong>Email:</strong> ${problema.email_cliente}</p>
                                <p><strong>Tipo:</strong> ${problema.tipo}</p>
                            </div>

                            <div style="background: white; padding: 20px; border-left: 4px solid #2D5016; margin: 20px 0;">
                                <h3 style="color: #6B4423; margin-top: 0;">Problema Original:</h3>
                                <p style="color: #8B7355;">${problema.descricao}</p>
                            </div>

                            ${problema.solucao ? `
                                <div style="background: rgba(45, 80, 22, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="color: #2D5016; margin-top: 0;">Solução Aplicada:</h3>
                                    <p style="color: #8B7355;">${problema.solucao}</p>
                                </div>
                            ` : ''}

                            <p style="color: #8B7355; margin-top: 20px;">
                                Responsável: ${problema.responsavel || 'Não especificado'}
                            </p>
                        </div>

                        <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px; text-align: center;">
                            <p>Café Seleção do Mário - Sistema de Gestão</p>
                        </div>
                    </div>
                `;
                break;

            default:
                return Response.json({ error: 'Tipo de notificação inválido' }, { status: 400 });
        }

        console.log('Enviando email para:', emailDestinatario);
        console.log('Assunto:', subject);

        // Enviar email usando a integração Core
        const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: "Café Seleção do Mário",
            to: emailDestinatario,
            subject: subject,
            body: body
        });

        console.log('Email enviado com sucesso:', emailResult);

        return Response.json({ 
            success: true,
            message: 'Notificação enviada com sucesso',
            emailResult
        });

    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});