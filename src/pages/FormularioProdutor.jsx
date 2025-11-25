import React, { useState } from "react";
import { SubmissaoProdutor } from "@/entities/SubmissaoProdutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Coffee, CheckCircle, Send } from "lucide-react";

export default function FormularioProdutor() {
  const [formData, setFormData] = useState({
    nome_cafe: "",
    origem: "",
    tipo_grao: "",
    variedade: "",
    processamento: "",
    bebida: "",
    sabor_notas_sensoriais: "",
    docura: "",
    aroma: "",
    acidez_tipo: "",
    acidez_intensidade: "",
    corpo: "",
    torra: "",
    moagem: "",
    escala_intensidade: "",
    modo_conservacao: "",
    metodos_preparo: "",
    notas_degustacao: "",
    altitude: "",
    certificacoes: "",
    observacoes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome_cafe) {
      alert("Por favor, preencha o nome do café");
      return;
    }

    setIsSubmitting(true);
    try {
      await SubmissaoProdutor.create({
        ...formData,
        status: "Pendente"
      });
      
      setSubmitted(true);
      setFormData({
        nome_cafe: "",
        origem: "",
        tipo_grao: "",
        variedade: "",
        processamento: "",
        bebida: "",
        sabor_notas_sensoriais: "",
        docura: "",
        aroma: "",
        acidez_tipo: "",
        acidez_intensidade: "",
        corpo: "",
        torra: "",
        moagem: "",
        escala_intensidade: "",
        modo_conservacao: "",
        metodos_preparo: "",
        notas_degustacao: "",
        altitude: "",
        certificacoes: "",
        observacoes: ""
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Erro ao enviar submissão:", error);
      alert("Erro ao enviar formulário. Tente novamente.");
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center p-6">
        <Card className="max-w-md border-[#E5DCC8] shadow-xl">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-[#2D5016] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#6B4423] mb-2">
              Cadastrado com Sucesso!
            </h2>
            <p className="text-[#8B7355]">
              As informações do café foram registradas com sucesso!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 shadow-lg">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Café Seleção do Mário</h1>
              <p className="text-white/80">Cadastro de Café</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#6B4423] mb-2">
            Cadastrar Informações do Café
          </h2>
          <p className="text-[#8B7355]">
            Preencha o formulário abaixo com as informações detalhadas do café
          </p>
        </div>

        <Card className="border-[#E5DCC8] shadow-xl">
          <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
            <CardTitle className="text-xl text-[#6B4423]">
              Informações do Café
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_cafe">Nome do Café *</Label>
                  <Input
                    id="nome_cafe"
                    value={formData.nome_cafe}
                    onChange={(e) => setFormData({ ...formData, nome_cafe: e.target.value })}
                    required
                    className="border-[#E5DCC8]"
                    placeholder="Ex: Bourbon Amarelo Premium"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origem">Origem</Label>
                    <Input
                      id="origem"
                      value={formData.origem}
                      onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Sul de Minas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_grao">Tipo do Grão</Label>
                    <Input
                      id="tipo_grao"
                      value={formData.tipo_grao}
                      onChange={(e) => setFormData({ ...formData, tipo_grao: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: 100% Arábica"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variedade">Variedade</Label>
                    <Input
                      id="variedade"
                      value={formData.variedade}
                      onChange={(e) => setFormData({ ...formData, variedade: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Catuaí, Bourbon, Mundo Novo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processamento">Processamento</Label>
                    <Input
                      id="processamento"
                      value={formData.processamento}
                      onChange={(e) => setFormData({ ...formData, processamento: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Natural, Cereja Descascada"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bebida">Bebida</Label>
                    <Input
                      id="bebida"
                      value={formData.bebida}
                      onChange={(e) => setFormData({ ...formData, bebida: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Espresso, Coado, Cappuccino"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="torra">Torra</Label>
                    <Input
                      id="torra"
                      value={formData.torra}
                      onChange={(e) => setFormData({ ...formData, torra: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Clara, Média, Escura"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sabor_notas_sensoriais">Sabor / Notas Sensoriais</Label>
                  <Textarea
                    id="sabor_notas_sensoriais"
                    value={formData.sabor_notas_sensoriais}
                    onChange={(e) => setFormData({ ...formData, sabor_notas_sensoriais: e.target.value })}
                    className="border-[#E5DCC8]"
                    rows={2}
                    placeholder="Ex: Chocolate, Caramelo, Frutas Vermelhas"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="docura">Doçura</Label>
                    <Input
                      id="docura"
                      value={formData.docura}
                      onChange={(e) => setFormData({ ...formData, docura: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Alta, Média, Baixa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aroma">Aroma</Label>
                    <Input
                      id="aroma"
                      value={formData.aroma}
                      onChange={(e) => setFormData({ ...formData, aroma: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Floral, Frutado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corpo">Corpo</Label>
                    <Input
                      id="corpo"
                      value={formData.corpo}
                      onChange={(e) => setFormData({ ...formData, corpo: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Encorpado, Médio, Leve"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acidez_tipo">Acidez (Tipo)</Label>
                    <Input
                      id="acidez_tipo"
                      value={formData.acidez_tipo}
                      onChange={(e) => setFormData({ ...formData, acidez_tipo: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Cítrica, Málica"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acidez_intensidade">Acidez (Intensidade)</Label>
                    <Input
                      id="acidez_intensidade"
                      value={formData.acidez_intensidade}
                      onChange={(e) => setFormData({ ...formData, acidez_intensidade: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Alta, Média, Baixa"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moagem">Moagem</Label>
                    <Input
                      id="moagem"
                      value={formData.moagem}
                      onChange={(e) => setFormData({ ...formData, moagem: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Fina, Média, Grossa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escala_intensidade">Escala de Intensidade (1-10)</Label>
                    <Input
                      id="escala_intensidade"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.escala_intensidade}
                      onChange={(e) => setFormData({ ...formData, escala_intensidade: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="1 a 10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modo_conservacao">Modo de Conservação / Armazenamento</Label>
                  <Textarea
                    id="modo_conservacao"
                    value={formData.modo_conservacao}
                    onChange={(e) => setFormData({ ...formData, modo_conservacao: e.target.value })}
                    className="border-[#E5DCC8]"
                    rows={2}
                    placeholder="Ex: Local fresco e seco, longe da luz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodos_preparo">Métodos de Preparo (Detalhado)</Label>
                  <Textarea
                    id="metodos_preparo"
                    value={formData.metodos_preparo}
                    onChange={(e) => setFormData({ ...formData, metodos_preparo: e.target.value })}
                    className="border-[#E5DCC8]"
                    rows={3}
                    placeholder="Descreva os métodos de preparo recomendados..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas_degustacao">Notas de Degustação</Label>
                  <Textarea
                    id="notas_degustacao"
                    value={formData.notas_degustacao}
                    onChange={(e) => setFormData({ ...formData, notas_degustacao: e.target.value })}
                    className="border-[#E5DCC8]"
                    rows={2}
                    placeholder="Informações adicionais sobre degustação"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="altitude">Altitude de Cultivo</Label>
                    <Input
                      id="altitude"
                      value={formData.altitude}
                      onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: 1200m"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificacoes">Certificações</Label>
                    <Input
                      id="certificacoes"
                      value={formData.certificacoes}
                      onChange={(e) => setFormData({ ...formData, certificacoes: e.target.value })}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: Orgânico, Fair Trade"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="border-[#E5DCC8]"
                    rows={4}
                    placeholder="Informações adicionais sobre o café, produção, história..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Informações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
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