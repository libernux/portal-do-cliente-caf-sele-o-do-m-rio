import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { format } from 'npm:date-fns@3.0.0';
import { ptBR } from 'npm:date-fns@3.0.0/locale';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { problemaId, atualizacaoId, emailCliente, nomeCliente } = await req.json();

        // Buscar configuração
        const configs = await base44.asServiceRole.entities.ConfiguracaoNotificacao.filter({
            chave: 'notificar_clientes_problema'
        });

        if (configs.length === 0 || !configs[0].valor) {
            return Response.json({ 
                success: false,
                message: 'Notificações para clientes estão desativadas'
            });
        }

        // Buscar dados do problema
        const problema = await base44.entities.Problema.get(problemaId);
        if (!problema) {
            return Response.json({ error: 'Problema não encontrado' }, { status: 404 });
        }

        // Buscar atualização
        const atualizacao = await base44.entities.AtualizacaoProblema.get(atualizacaoId);
        if (!atualizacao) {
            return Response.json({ error: 'Atualização não encontrada' }, { status: 404 });
        }

        const subject = `Nova atualização sobre seu chamado - ${problema.tipo}`;
        const body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6B4423, #8B5A2B); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h2 style="color: white; margin: 0;">📬 Nova Atualização do Seu Chamado</h2>
                </div>
                
                <div style="background: white; padding: 20px;">
                    <p style="color: #6B4423; font-size: 16px;">Olá <strong>${nomeCliente}</strong>,</p>
                    
                    <p style="color: #8B7355;">
                        Há uma nova atualização sobre o seu chamado:
                    </p>

                    <div style="background: #F5F1E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Tipo:</strong> ${problema.tipo}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #2D5016;">${problema.status}</span></p>
                        <p style="margin: 5px 0;"><strong>Prioridade:</strong> ${problema.prioridade}</p>
                    </div>

                    <div style="background: white; padding: 20px; border-left: 4px solid #6B4423; margin: 20px 0;">
                        <p style="color: #8B7355; margin: 0 0 10px 0;"><strong>Atualização de ${atualizacao.autor}:</strong></p>
                        <p style="color: #6B4423; font-size: 15px; margin: 0; white-space: pre-wrap;">${atualizacao.mensagem}</p>
                        <p style="color: #A69483; font-size: 12px; margin: 10px 0 0 0;">
                            ${format(new Date(atualizacao.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>

                    <div style="background: white; padding: 15px; border-left: 4px solid #E5DCC8; margin: 20px 0;">
                        <p style="color: #8B7355; margin: 0;"><strong>Problema original:</strong></p>
                        <p style="color: #8B7355; margin: 5px 0 0 0;">${problema.descricao}</p>
                    </div>

                    ${problema.responsavel ? `
                        <p style="color: #8B7355; margin-top: 20px;">
                            Responsável pelo atendimento: <strong>${problema.responsavel}</strong>
                        </p>
                    ` : ''}

                    <div style="background: rgba(107, 68, 35, 0.05); padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="color: #6B4423; margin: 0;">
                            <strong>💬 Alguma dúvida?</strong><br>
                            Responda este email ou entre em contato conosco.
                        </p>
                    </div>
                </div>

                <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px; text-align: center;">
                    <p>Café Seleção do Mário - Sistema de Gestão</p>
                    <p>Esta é uma notificação automática sobre o acompanhamento do seu chamado.</p>
                </div>
            </div>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: "Café Seleção do Mário - Atendimento",
            to: emailCliente,
            subject: subject,
            body: body
        });

        return Response.json({ 
            success: true,
            message: 'Notificação enviada ao cliente'
        });

    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});