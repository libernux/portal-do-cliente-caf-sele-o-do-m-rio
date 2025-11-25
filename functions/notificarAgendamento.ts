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

        const { agendamentoId, tipo, emails } = await req.json();

        // Buscar configuração
        const configs = await base44.asServiceRole.entities.ConfiguracaoNotificacao.filter({
            chave: 'notificar_agendamentos'
        });

        if (configs.length === 0 || !configs[0].valor) {
            return Response.json({ 
                success: false,
                message: 'Notificações de agendamentos estão desativadas'
            });
        }

        // Buscar dados do agendamento
        const agendamento = await base44.entities.Agendamento.get(agendamentoId);

        if (!agendamento) {
            return Response.json({ error: 'Agendamento não encontrado' }, { status: 404 });
        }

        const dataInicio = new Date(agendamento.data_inicio);
        const dataFim = new Date(agendamento.data_fim);

        let subject = '';
        let body = '';

        switch (tipo) {
            case 'criado':
                subject = `📅 Novo agendamento: ${agendamento.titulo}`;
                body = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #C9A961, #B8935A); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h2 style="color: white; margin: 0;">📅 Novo Agendamento</h2>
                        </div>
                        
                        <div style="background: white; padding: 20px;">
                            <h3 style="color: #6B4423; margin-top: 0;">${agendamento.titulo}</h3>
                            
                            <div style="background: #F5F1E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 10px 0;"><strong>📅 Data:</strong> ${format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                <p style="margin: 10px 0;"><strong>🕐 Horário:</strong> ${format(dataInicio, 'HH:mm')} - ${format(dataFim, 'HH:mm')}</p>
                                <p style="margin: 10px 0;"><strong>📍 Tipo:</strong> ${agendamento.tipo}</p>
                                ${agendamento.local ? `<p style="margin: 10px 0;"><strong>📌 Local:</strong> ${agendamento.local}</p>` : ''}
                            </div>

                            ${agendamento.descricao ? `
                                <div style="background: white; padding: 15px; border-left: 4px solid #C9A961; margin: 20px 0;">
                                    <p style="color: #8B7355; margin: 0;">${agendamento.descricao}</p>
                                </div>
                            ` : ''}

                            ${agendamento.participantes && agendamento.participantes.length > 0 ? `
                                <div style="margin: 20px 0;">
                                    <p style="color: #6B4423;"><strong>👥 Participantes:</strong></p>
                                    <ul style="color: #8B7355;">
                                        ${agendamento.participantes.map(p => `<li>${p}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            <p style="color: #8B7355; margin-top: 20px;">
                                Criado por: ${user.full_name}
                            </p>
                        </div>

                        <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px; text-align: center;">
                            <p>Café Seleção do Mário - Sistema de Gestão</p>
                        </div>
                    </div>
                `;
                break;

            case 'lembrete':
                subject = `⏰ Lembrete: ${agendamento.titulo} amanhã`;
                body = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #D97706, #EA580C); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h2 style="color: white; margin: 0;">⏰ Lembrete de Agendamento</h2>
                        </div>
                        
                        <div style="background: white; padding: 20px;">
                            <p style="color: #D97706; font-size: 18px; font-weight: bold;">Você tem um compromisso amanhã!</p>
                            
                            <h3 style="color: #6B4423; margin-top: 20px;">${agendamento.titulo}</h3>
                            
                            <div style="background: #F5F1E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 10px 0;"><strong>📅 Data:</strong> ${format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                <p style="margin: 10px 0; font-size: 20px;"><strong>🕐 Horário:</strong> <span style="color: #D97706;">${format(dataInicio, 'HH:mm')} - ${format(dataFim, 'HH:mm')}</span></p>
                                ${agendamento.local ? `<p style="margin: 10px 0;"><strong>📌 Local:</strong> ${agendamento.local}</p>` : ''}
                            </div>

                            ${agendamento.descricao ? `
                                <div style="background: white; padding: 15px; border-left: 4px solid #D97706; margin: 20px 0;">
                                    <p style="color: #8B7355; margin: 0;">${agendamento.descricao}</p>
                                </div>
                            ` : ''}

                            <p style="color: #8B7355; margin-top: 20px; text-align: center;">
                                Não esqueça de se preparar! 🎯
                            </p>
                        </div>

                        <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px; text-align: center;">
                            <p>Café Seleção do Mário - Sistema de Gestão</p>
                        </div>
                    </div>
                `;
                break;

            case 'cancelado':
                subject = `❌ Agendamento cancelado: ${agendamento.titulo}`;
                body = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #DC2626; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h2 style="color: white; margin: 0;">❌ Agendamento Cancelado</h2>
                        </div>
                        
                        <div style="background: white; padding: 20px;">
                            <p style="color: #DC2626; font-size: 16px;">O seguinte agendamento foi cancelado:</p>
                            
                            <h3 style="color: #6B4423; margin-top: 20px;">${agendamento.titulo}</h3>
                            
                            <div style="background: #F5F1E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 10px 0;"><strong>📅 Data:</strong> ${format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                <p style="margin: 10px 0;"><strong>🕐 Horário:</strong> ${format(dataInicio, 'HH:mm')} - ${format(dataFim, 'HH:mm')}</p>
                            </div>

                            <p style="color: #8B7355; margin-top: 20px;">
                                Cancelado por: ${user.full_name}
                            </p>
                        </div>

                        <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px; text-align: center;">
                            <p>Café Seleção do Mário - Sistema de Gestão</p>
                        </div>
                    </div>
                `;
                break;
        }

        // Enviar email para cada destinatário
        const emailsArray = Array.isArray(emails) ? emails : [emails];
        
        for (const email of emailsArray) {
            await base44.asServiceRole.integrations.Core.SendEmail({
                from_name: "Café Seleção do Mário",
                to: email,
                subject: subject,
                body: body
            });
        }

        return Response.json({ 
            success: true,
            message: 'Notificações enviadas com sucesso',
            emailsEnviados: emailsArray.length
        });

    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});