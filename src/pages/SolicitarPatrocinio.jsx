
import React, { useState } from "react";
import { SolicitacaoPatrocinio } from "@/entities/SolicitacaoPatrocinio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Calendar, Users, MapPin, TrendingUp, CheckCircle, Coffee } from "lucide-react";
import { motion } from "framer-motion";

export default function SolicitarPatrocinio() {
  const [formData, setFormData] = useState({
    nome_organizador: "",
    email_contato: "",
    telefone_contato: "",
    nome_evento: "",
    tipo_evento: "Corporativo",
    data_evento: "",
    local_evento: "",
    publico_esperado: "",
    duracao_dias: 1,
    tipo_solicitacao: "Patrocínio",
    descricao_evento: "",
    proposta_patrocinio: "",
    contrapartidas_oferecidas: "",
    alcance_estimado: "",
    outras_marcas_patrocinadoras: "",
    exclusividade_categoria: "sim",
    material_divulgacao: "",
    historico_eventos: "",
    beneficios_visibilidade: "",
    midia_redes_sociais: "",
    orcamento_evento: "",
    cafe_necessario_kg: ""
  });

  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await SolicitacaoPatrocinio.create({
        ...formData,
        publico_esperado: parseInt(formData.publico_esperado) || 0,
        duracao_dias: parseInt(formData.duracao_dias) || 1,
        cafe_necessario_kg: parseFloat(formData.cafe_necessario_kg) || 0,
        status: "Nova"
      });

      setEnviado(true);
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("Erro ao enviar solicitação. Por favor, tente novamente.");
    }

    setIsSubmitting(false);
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-[#E5DCC8] shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2D5016] to-[#3D6B1F] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#6B4423] mb-4">
                Solicitação Enviada com Sucesso!
              </h2>
              <p className="text-[#8B7355] text-lg mb-6">
                Obrigado pelo seu interesse em parceria com o <strong>Café Seleção do Mário</strong>!
              </p>
              <div className="bg-[#F5F1E8] p-6 rounded-lg mb-6">
                <p className="text-[#6B4423] text-sm">
                  ✅ Recebemos sua solicitação e nossa equipe irá analisá-la cuidadosamente.<br/>
                  📧 Você receberá uma resposta por e-mail em até <strong>5 dias úteis</strong>.<br/>
                  ☕ Analisaremos o alinhamento do evento com nossa marca e os benefícios mútuos.
                </p>
              </div>
              <p className="text-[#8B7355] text-sm">
                Caso precise de informações adicionais, entraremos em contato pelo e-mail fornecido.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="w-12 h-12 text-[#6B4423]" />
            <Heart className="w-8 h-8 text-[#C9A961]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#6B4423] mb-4">
            Solicite Patrocínio
          </h1>
          <p className="text-xl text-[#8B7355] max-w-2xl mx-auto">
            Café Seleção do Mário - Apoiando eventos que compartilham nossa paixão por café de qualidade
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-[#E5DCC8] shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white rounded-t-lg">
              <CardTitle className="text-2xl">Formulário de Solicitação</CardTitle>
              <p className="text-sm opacity-90 mt-2">
                Preencha todas as informações para que possamos avaliar sua proposta
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dados do Solicitante */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-[#6B4423]" />
                    <h3 className="text-xl font-bold text-[#6B4423]">Dados do Organizador</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_organizador">Nome/Organização *</Label>
                      <Input
                        id="nome_organizador"
                        value={formData.nome_organizador}
                        onChange={(e) => setFormData({ ...formData, nome_organizador: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        placeholder="Seu nome ou da organização"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email_contato">Email *</Label>
                      <Input
                        id="email_contato"
                        type="email"
                        value={formData.email_contato}
                        onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone_contato">Telefone *</Label>
                      <Input
                        id="telefone_contato"
                        value={formData.telefone_contato}
                        onChange={(e) => setFormData({ ...formData, telefone_contato: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        placeholder="(27) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="midia_redes_sociais">Redes Sociais / Website</Label>
                      <Input
                        id="midia_redes_sociais"
                        value={formData.midia_redes_sociais}
                        onChange={(e) => setFormData({ ...formData, midia_redes_sociais: e.target.value })}
                        className="border-[#E5DCC8]"
                        placeholder="@instagram, site, etc"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Evento */}
                <div className="space-y-4 pt-6 border-t border-[#E5DCC8]">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-[#6B4423]" />
                    <h3 className="text-xl font-bold text-[#6B4423]">Dados do Evento</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_evento">Nome do Evento *</Label>
                      <Input
                        id="nome_evento"
                        value={formData.nome_evento}
                        onChange={(e) => setFormData({ ...formData, nome_evento: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        placeholder="Nome do seu evento"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo_evento">Tipo de Evento *</Label>
                      <Select
                        value={formData.tipo_evento}
                        onValueChange={(value) => setFormData({ ...formData, tipo_evento: value })}
                      >
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporativo">Corporativo</SelectItem>
                          <SelectItem value="Esportivo">Esportivo</SelectItem>
                          <SelectItem value="Cultural">Cultural</SelectItem>
                          <SelectItem value="Educacional">Educacional</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Feira/Exposição">Feira/Exposição</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_evento">Data do Evento *</Label>
                      <Input
                        id="data_evento"
                        type="date"
                        value={formData.data_evento}
                        onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duracao_dias">Duração (dias) *</Label>
                      <Input
                        id="duracao_dias"
                        type="number"
                        min="1"
                        value={formData.duracao_dias}
                        onChange={(e) => setFormData({ ...formData, duracao_dias: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="local_evento">Local *</Label>
                      <Input
                        id="local_evento"
                        value={formData.local_evento}
                        onChange={(e) => setFormData({ ...formData, local_evento: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        placeholder="Cidade, estado ou endereço"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publico_esperado">Público Esperado *</Label>
                      <Input
                        id="publico_esperado"
                        type="number"
                        min="1"
                        value={formData.publico_esperado}
                        onChange={(e) => setFormData({ ...formData, publico_esperado: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        placeholder="Número de participantes"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="descricao_evento">Descrição do Evento *</Label>
                      <Textarea
                        id="descricao_evento"
                        value={formData.descricao_evento}
                        onChange={(e) => setFormData({ ...formData, descricao_evento: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        rows={4}
                        placeholder="Descreva o objetivo, programação e diferencial do evento"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="historico_eventos">Histórico de Eventos Anteriores</Label>
                      <Textarea
                        id="historico_eventos"
                        value={formData.historico_eventos}
                        onChange={(e) => setFormData({ ...formData, historico_eventos: e.target.value })}
                        className="border-[#E5DCC8]"
                        rows={3}
                        placeholder="Já realizou este evento antes? Quantas pessoas participaram? Quais os resultados?"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Apoio */}
                <div className="space-y-4 pt-6 border-t border-[#E5DCC8]">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-[#6B4423]" />
                    <h3 className="text-xl font-bold text-[#6B4423]">Tipo de Apoio Solicitado</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo_solicitacao">O que você busca? *</Label>
                      <Select
                        value={formData.tipo_solicitacao}
                        onValueChange={(value) => setFormData({ ...formData, tipo_solicitacao: value })}
                      >
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Patrocínio">Patrocínio (troca de benefícios)</SelectItem>
                          <SelectItem value="Doação">Doação (apoio solidário)</SelectItem>
                          <SelectItem value="Participação/Stand">Participação com Stand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cafe_necessario_kg">Quantidade de Café Estimada (kg)</Label>
                      <Input
                        id="cafe_necessario_kg"
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.cafe_necessario_kg}
                        onChange={(e) => setFormData({ ...formData, cafe_necessario_kg: e.target.value })}
                        className="border-[#E5DCC8]"
                        placeholder="Ex: 50"
                      />
                      <p className="text-xs text-[#8B7355]">
                        💡 Use nossa <a href="/CalculadoraEventos" target="_blank" className="text-[#6B4423] underline">calculadora de eventos</a> para estimar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proposta_patrocinio">Proposta de Patrocínio *</Label>
                      <Textarea
                        id="proposta_patrocinio"
                        value={formData.proposta_patrocinio}
                        onChange={(e) => setFormData({ ...formData, proposta_patrocinio: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        rows={4}
                        placeholder="O que você está solicitando? (Ex: X kg de café, equipamentos, equipe, stand, etc)"
                      />
                    </div>
                  </div>
                </div>

                {/* Contrapartidas e Benefícios */}
                <div className="space-y-4 pt-6 border-t border-[#E5DCC8]">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#6B4423]" />
                    <h3 className="text-xl font-bold text-[#6B4423]">Contrapartidas e Visibilidade</h3>
                  </div>

                  <div className="bg-[#F5F1E8] p-4 rounded-lg mb-4">
                    <p className="text-sm text-[#6B4423]">
                      <strong>💡 Dica:</strong> Seja específico sobre o que você oferece em troca. Quanto mais clara e atraente a proposta, maiores as chances de aprovação!
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contrapartidas_oferecidas">Contrapartidas Oferecidas *</Label>
                      <Textarea
                        id="contrapartidas_oferecidas"
                        value={formData.contrapartidas_oferecidas}
                        onChange={(e) => setFormData({ ...formData, contrapartidas_oferecidas: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        rows={4}
                        placeholder="O que você oferece em troca? (Ex: Logo no material, menções em redes sociais, espaço para degustação, etc)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beneficios_visibilidade">Benefícios de Visibilidade da Marca *</Label>
                      <Textarea
                        id="beneficios_visibilidade"
                        value={formData.beneficios_visibilidade}
                        onChange={(e) => setFormData({ ...formData, beneficios_visibilidade: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        rows={4}
                        placeholder="Onde e como nossa marca aparecerá? (Ex: banner 2x2m na entrada, 3 posts no Instagram com 10k seguidores, citação no release para imprensa, etc)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alcance_estimado">Alcance Estimado *</Label>
                      <Textarea
                        id="alcance_estimado"
                        value={formData.alcance_estimado}
                        onChange={(e) => setFormData({ ...formData, alcance_estimado: e.target.value })}
                        required
                        className="border-[#E5DCC8]"
                        rows={3}
                        placeholder="Quantas pessoas serão impactadas? (Ex: 500 presencial + 10.000 nas redes sociais + mídia local)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="material_divulgacao">Material de Divulgação Disponível</Label>
                      <Textarea
                        id="material_divulgacao"
                        value={formData.material_divulgacao}
                        onChange={(e) => setFormData({ ...formData, material_divulgacao: e.target.value })}
                        className="border-[#E5DCC8]"
                        rows={3}
                        placeholder="Que tipo de material vocês produzem? (Ex: flyers, banners, posts, releases, vídeos, etc)"
                      />
                    </div>
                  </div>
                </div>

                {/* Outras Informações */}
                <div className="space-y-4 pt-6 border-t border-[#E5DCC8]">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#6B4423]" />
                    <h3 className="text-xl font-bold text-[#6B4423]">Informações Complementares</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="outras_marcas_patrocinadoras">Outras Marcas Patrocinadoras</Label>
                      <Textarea
                        id="outras_marcas_patrocinadoras"
                        value={formData.outras_marcas_patrocinadoras}
                        onChange={(e) => setFormData({ ...formData, outras_marcas_patrocinadoras: e.target.value })}
                        className="border-[#E5DCC8]"
                        rows={2}
                        placeholder="Quais outras marcas já confirmaram ou estão em negociação?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exclusividade_categoria">Exclusividade de Categoria *</Label>
                      <Select
                        value={formData.exclusividade_categoria}
                        onValueChange={(value) => setFormData({ ...formData, exclusividade_categoria: value })}
                      >
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim - Seremos a única marca de café</SelectItem>
                          <SelectItem value="nao">Não - Há outros fornecedores de café</SelectItem>
                          <SelectItem value="negociavel">Negociável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orcamento_evento">Orçamento Total do Evento</Label>
                      <Input
                        id="orcamento_evento"
                        value={formData.orcamento_evento}
                        onChange={(e) => setFormData({ ...formData, orcamento_evento: e.target.value })}
                        className="border-[#E5DCC8]"
                        placeholder="Ex: R$ 50.000 (opcional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6 border-t border-[#E5DCC8]">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] hover:from-[#5A3A1E] hover:to-[#6B4423] text-white text-lg py-6 shadow-xl"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Solicitação de Patrocínio"}
                  </Button>
                  <p className="text-center text-xs text-[#8B7355] mt-4">
                    Ao enviar, você concorda que analisaremos sua proposta e responderemos em até 5 dias úteis
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer com Links Obrigatórios */}
      <footer className="bg-white border-t border-[#E5DCC8] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-[#8B7355]">
            <a href="/Privacy" className="hover:text-[#6B4423] hover:underline font-medium">
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="/Support" className="hover:text-[#6B4423] hover:underline font-medium">
              Suporte
            </a>
            <span>•</span>
            <span>© {new Date().getFullYear()} Café Seleção do Mário</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
