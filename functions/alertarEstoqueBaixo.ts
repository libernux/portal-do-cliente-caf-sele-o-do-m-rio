import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { limiteEstoque = 50 } = await req.json();

        // Buscar configuração
        const configs = await base44.asServiceRole.entities.ConfiguracaoNotificacao.filter({
            chave: 'alertas_estoque_baixo'
        });

        if (configs.length === 0 || !configs[0].valor) {
            return Response.json({ 
                success: false,
                message: 'Alertas de estoque baixo estão desativados nas configurações'
            });
        }

        // Buscar todos os cafés
        const cafes = await base44.asServiceRole.entities.Cafe.list();

        // Filtrar cafés com estoque baixo
        const cafesBaixo = cafes.filter(cafe => cafe.quantidade_kg < limiteEstoque);

        if (cafesBaixo.length === 0) {
            return Response.json({ 
                success: true,
                message: 'Nenhum café com estoque baixo'
            });
        }

        // Buscar responsáveis que devem receber alertas de estoque
        const responsaveis = await base44.asServiceRole.entities.Responsavel.filter({
            ativo: true,
            receber_estoque: true
        });

        if (responsaveis.length === 0) {
            return Response.json({ 
                success: false,
                message: 'Nenhum responsável configurado para receber alertas de estoque'
            });
        }

        const subject = `⚠️ Alerta: ${cafesBaixo.length} ${cafesBaixo.length === 1 ? 'café com estoque' : 'cafés com estoques'} baixo`;
        
        const body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #D97706, #EA580C); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h2 style="color: white; margin: 0;">⚠️ Alerta de Estoque Baixo</h2>
                </div>
                
                <div style="background: white; padding: 20px;">
                    <p style="color: #6B4423; font-size: 16px;">
                        Os seguintes cafés estão com estoque abaixo de <strong>${limiteEstoque}kg</strong>:
                    </p>
                    
                    <div style="margin: 20px 0;">
                        ${cafesBaixo.map(cafe => `
                            <div style="background: #F5F1E8; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid ${cafe.quantidade_kg < 20 ? '#DC2626' : '#D97706'};">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <p style="margin: 5px 0; color: #6B4423; font-weight: bold;">${cafe.nome}</p>
                                        <p style="margin: 5px 0; color: #8B7355; font-size: 14px;">${cafe.origem || 'Origem não especificada'} - ${cafe.forma}</p>
                                        ${cafe.reservado_para ? `<p style="margin: 5px 0; color: #D97706; font-size: 12px;">🔖 Reservado: ${cafe.reservado_para}</p>` : ''}
                                    </div>
                                    <div style="text-align: right;">
                                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${cafe.quantidade_kg < 20 ? '#DC2626' : '#D97706'};">${cafe.quantidade_kg}kg</p>
                                        <p style="margin: 0; font-size: 12px; color: #8B7355;">em estoque</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="background: rgba(217, 119, 6, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #6B4423; margin: 0;">
                            <strong>📊 Resumo:</strong><br>
                            Total de cafés com estoque baixo: <strong>${cafesBaixo.length}</strong><br>
                            Estoque total abaixo do limite: <strong>${cafesBaixo.reduce((sum, cafe) => sum + cafe.quantidade_kg, 0).toFixed(2)}kg</strong>
                        </p>
                    </div>

                    <p style="color: #8B7355; margin-top: 20px; text-align: center;">
                        ⚡ Considere fazer um novo pedido aos fornecedores!
                    </p>
                </div>

                <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #E5DCC8; color: #A69483; font-size: 12px; text-align: center;">
                    <p>Café Seleção do Mário - Sistema de Gestão</p>
                    <p>Este alerta foi gerado automaticamente</p>
                </div>
            </div>
        `;

        // Enviar email para todos os responsáveis
        let emailsEnviados = 0;
        for (const responsavel of responsaveis) {
            if (responsavel.email) {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: "Café Seleção do Mário",
                    to: responsavel.email,
                    subject: subject,
                    body: body
                });
                emailsEnviados++;
            }
        }

        return Response.json({ 
            success: true,
            message: 'Alertas de estoque baixo enviados',
            cafesComEstoqueBaixo: cafesBaixo.length,
            emailsEnviados: emailsEnviados
        });

    } catch (error) {
        console.error('Erro ao enviar alertas:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});