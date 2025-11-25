import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Coffee, Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Support() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: ""
  });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Aqui você pode adicionar integração com email/sistema de tickets
    console.log("Formulário enviado:", formData);
    
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 shadow-lg">
        <div className="max-w-6xl mx-auto px-6">
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#6B4423] mb-4">Central de Suporte</h1>
          <p className="text-lg text-[#8B7355]">
            Estamos aqui para ajudar! Entre em contato conosco.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Formulário de Contato */}
          <Card className="border-[#E5DCC8] shadow-xl">
            <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
              <CardTitle className="text-2xl text-[#6B4423] flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                Envie uma Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {enviado ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-[#2D5016] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#2D5016] mb-2">Mensagem Enviada!</h3>
                  <p className="text-[#8B7355]">Entraremos em contato em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                      className="border-[#E5DCC8]"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="border-[#E5DCC8]"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assunto">Assunto *</Label>
                    <Input
                      id="assunto"
                      value={formData.assunto}
                      onChange={(e) => setFormData({...formData, assunto: e.target.value})}
                      required
                      className="border-[#E5DCC8]"
                      placeholder="Como podemos ajudar?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mensagem">Mensagem *</Label>
                    <Textarea
                      id="mensagem"
                      value={formData.mensagem}
                      onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                      required
                      className="border-[#E5DCC8] h-32"
                      placeholder="Descreva sua dúvida ou problema..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#6B4423] hover:bg-[#5A3A1E] text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <div className="space-y-6">
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
                <CardTitle className="text-2xl text-[#6B4423]">
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B4423]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#6B4423]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#6B4423] mb-1">E-mail</h3>
                    <p className="text-[#8B7355]">contato@cafeselecaodomario.com.br</p>
                    <p className="text-sm text-[#A69483]">Resposta em até 24h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B4423]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#6B4423]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#6B4423] mb-1">Telefone</h3>
                    <p className="text-[#8B7355]">(27) 3333-4444</p>
                    <p className="text-sm text-[#A69483]">Segunda a Sexta, 8h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B4423]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#6B4423]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#6B4423] mb-1">Endereço</h3>
                    <p className="text-[#8B7355]">
                      Vila Velha, ES<br />
                      Brasil
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B4423]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#6B4423]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#6B4423] mb-1">Horário de Atendimento</h3>
                    <p className="text-[#8B7355]">
                      Segunda a Sexta: 8h às 18h<br />
                      Sábado: 8h às 12h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Rápido */}
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#2D5016]/5 to-white">
                <CardTitle className="text-xl text-[#2D5016]">
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="font-bold text-[#6B4423] mb-1">Como faço uma reserva?</h4>
                  <p className="text-sm text-[#8B7355]">
                    Acesse seu link personalizado e use a calculadora para reservar cafés.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-[#6B4423] mb-1">Qual o prazo de entrega?</h4>
                  <p className="text-sm text-[#8B7355]">
                    Entregamos em até 48h para Vila Velha e região.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-[#6B4423] mb-1">Posso alterar minha reserva?</h4>
                  <p className="text-sm text-[#8B7355]">
                    Sim! Entre em contato conosco para fazer alterações.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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