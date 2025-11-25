import React from "react";
import { Shield, Mail, Phone, MapPin, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 shadow-lg">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Café Seleção do Mário</h1>
              <p className="text-white/80">Cafés Especiais</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="border-[#E5DCC8] shadow-xl mb-6">
          <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
            <CardTitle className="text-3xl text-[#6B4423] flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Política de Privacidade
            </CardTitle>
            <p className="text-sm text-[#8B7355] mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Introdução */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">1. Introdução</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                A <strong>Café Seleção do Mário</strong> valoriza a privacidade de seus clientes e parceiros. 
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas 
                informações pessoais quando você utiliza nosso sistema de gestão e portal de clientes.
              </p>
            </section>

            {/* Informações Coletadas */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">2. Informações que Coletamos</h2>
              <div className="space-y-3 text-[#5A4A3A]">
                <p><strong>2.1. Informações de Cadastro:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nome completo</li>
                  <li>Endereço de e-mail</li>
                  <li>Telefone</li>
                  <li>Endereço de entrega</li>
                  <li>Informações da empresa (quando aplicável)</li>
                </ul>

                <p className="mt-4"><strong>2.2. Informações de Uso:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Histórico de pedidos e reservas</li>
                  <li>Preferências de cafés</li>
                  <li>Comunicações com nossa equipe</li>
                  <li>Dados de navegação no portal</li>
                </ul>

                <p className="mt-4"><strong>2.3. Informações de Autenticação:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Credenciais de login (criptografadas)</li>
                  <li>Informações do Google OAuth (quando aplicável)</li>
                </ul>
              </div>
            </section>

            {/* Como Usamos */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">3. Como Usamos suas Informações</h2>
              <div className="space-y-2 text-[#5A4A3A]">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Processar e gerenciar suas reservas de café</li>
                  <li>Enviar atualizações sobre pedidos e entregas</li>
                  <li>Responder às suas solicitações e chamados</li>
                  <li>Melhorar nossos produtos e serviços</li>
                  <li>Enviar comunicações relevantes sobre nossos cafés (com seu consentimento)</li>
                  <li>Cumprir obrigações legais e contratuais</li>
                  <li>Prevenir fraudes e garantir a segurança</li>
                </ul>
              </div>
            </section>

            {/* Compartilhamento */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">4. Compartilhamento de Informações</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                <strong>Nós NÃO vendemos suas informações pessoais.</strong> Podemos compartilhar suas informações apenas com:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-[#5A4A3A] mt-2">
                <li><strong>Parceiros de entrega:</strong> Para processar e entregar seus pedidos</li>
                <li><strong>Prestadores de serviços:</strong> Que nos auxiliam na operação do sistema (Base44, Google)</li>
                <li><strong>Autoridades legais:</strong> Quando exigido por lei</li>
              </ul>
            </section>

            {/* Segurança */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">5. Segurança dos Dados</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-[#5A4A3A] mt-2">
                <li>Criptografia de dados sensíveis (SSL/TLS)</li>
                <li>Autenticação segura com Google OAuth</li>
                <li>Controle de acesso restrito aos dados</li>
                <li>Backups regulares e seguros</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </section>

            {/* Seus Direitos */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">6. Seus Direitos (LGPD)</h2>
              <p className="text-[#5A4A3A] leading-relaxed mb-2">
                Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-[#5A4A3A]">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou incorretos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar consentimento a qualquer momento</li>
                <li>Solicitar portabilidade dos dados</li>
                <li>Obter informações sobre o tratamento de seus dados</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">7. Cookies e Tecnologias Similares</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento do portal, como cookies de autenticação 
                e preferências. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
              </p>
            </section>

            {/* Retenção */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">8. Retenção de Dados</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                Mantemos suas informações pelo tempo necessário para cumprir as finalidades descritas nesta 
                política, a menos que um período maior seja exigido por lei. Dados de pedidos são mantidos 
                por 5 anos para fins fiscais e contábeis.
              </p>
            </section>

            {/* Menores */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">9. Privacidade de Menores</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                Nossos serviços são destinados a pessoas maiores de 18 anos. Não coletamos intencionalmente 
                informações de menores de idade sem o consentimento dos pais ou responsáveis.
              </p>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="text-2xl font-bold text-[#6B4423] mb-3">10. Alterações nesta Política</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
                mudanças significativas por e-mail ou através de avisos no portal. A data da última atualização 
                será sempre indicada no topo desta página.
              </p>
            </section>

            {/* Contato */}
            <section className="bg-[#F5F1E8] p-6 rounded-xl border border-[#E5DCC8]">
              <h2 className="text-2xl font-bold text-[#6B4423] mb-4">11. Contato</h2>
              <p className="text-[#5A4A3A] mb-4">
                Para exercer seus direitos, tirar dúvidas ou fazer solicitações relacionadas à privacidade, 
                entre em contato conosco:
              </p>
              <div className="space-y-3 text-[#5A4A3A]">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#6B4423]" />
                  <span><strong>E-mail:</strong> privacidade@cafeselecaodomario.com.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#6B4423]" />
                  <span><strong>Telefone:</strong> (27) 3333-4444</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#6B4423] mt-1" />
                  <div>
                    <strong>Endereço:</strong><br />
                    Café Seleção do Mário<br />
                    Vila Velha, ES - Brasil
                  </div>
                </div>
              </div>
            </section>

            {/* Consentimento */}
            <section className="bg-[#2D5016]/5 p-6 rounded-xl border border-[#2D5016]/20">
              <h2 className="text-xl font-bold text-[#2D5016] mb-3">Consentimento</h2>
              <p className="text-[#5A4A3A] leading-relaxed">
                Ao utilizar nosso portal e sistema, você concorda com esta Política de Privacidade e 
                com o tratamento de seus dados pessoais conforme descrito neste documento.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-3">
          <a 
            href="/" 
            className="text-[#6B4423] hover:underline font-medium"
          >
            ← Voltar para a página inicial
          </a>
          <div className="text-sm text-[#8B7355]">
            <a href="/Support" className="hover:underline">Suporte</a>
            {" • "}
            <a href="/Privacy" className="hover:underline">Privacidade</a>
          </div>
        </div>
      </div>
    </div>
  );
}