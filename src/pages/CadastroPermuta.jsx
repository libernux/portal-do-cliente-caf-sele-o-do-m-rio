import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coffee, Building2, User, MapPin, Phone, Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function CadastroPermuta() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome_empresa: "",
    cnpj: "",
    endereco_entrega: "",
    cep: "",
    cidade: "",
    estado: "",
    telefone_empresa: "",
    contato_nome: "",
    contato_telefone: "",
    contato_email: "",
    observacoes: ""
  });

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14);
    }
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === "cnpj") {
      formattedValue = formatCNPJ(value);
    } else if (field === "telefone_empresa" || field === "contato_telefone") {
      formattedValue = formatPhone(value);
    } else if (field === "cep") {
      formattedValue = formatCEP(value);
    }
    
    setFormData({ ...formData, [field]: formattedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await base44.entities.EmpresaPermuta.create({
        ...formData,
        status: "Pendente"
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erro ao enviar cadastro:", error);
      alert("Erro ao enviar cadastro. Tente novamente.");
    }

    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-white to-[#E5DCC8] flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-[#E5DCC8] shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#6B4423] mb-4">
              Cadastro Enviado com Sucesso!
            </h2>
            <p className="text-[#8B7355] mb-6">
              Sua empresa foi cadastrada no Clube de Permuta. 
              Entraremos em contato em breve para confirmar os dados.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  nome_empresa: "",
                  cnpj: "",
                  endereco_entrega: "",
                  cep: "",
                  cidade: "",
                  estado: "",
                  telefone_empresa: "",
                  contato_nome: "",
                  contato_telefone: "",
                  contato_email: "",
                  observacoes: ""
                });
              }}
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              Fazer Novo Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-white to-[#E5DCC8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Coffee className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Clube de Permuta</h1>
          <p className="text-white/90 text-lg">
            Cadastre sua empresa para participar do nosso Clube de Permuta
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit}>
          {/* Dados da Empresa */}
          <Card className="border-[#E5DCC8] shadow-lg mb-8">
            <CardHeader className="border-b border-[#E5DCC8] bg-[#F5F1E8]/50">
              <CardTitle className="text-[#6B4423] flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                  <Input
                    id="nome_empresa"
                    value={formData.nome_empresa}
                    onChange={(e) => handleChange("nome_empresa", e.target.value)}
                    placeholder="Ex: Clínica QualiVida"
                    required
                    className="border-[#E5DCC8] mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                    required
                    className="border-[#E5DCC8] mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone_empresa">Telefone da Empresa</Label>
                  <Input
                    id="telefone_empresa"
                    value={formData.telefone_empresa}
                    onChange={(e) => handleChange("telefone_empresa", e.target.value)}
                    placeholder="(00) 0000-0000"
                    className="border-[#E5DCC8] mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço de Entrega */}
          <Card className="border-[#E5DCC8] shadow-lg mb-8">
            <CardHeader className="border-b border-[#E5DCC8] bg-[#F5F1E8]/50">
              <CardTitle className="text-[#6B4423] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="endereco_entrega">Endereço Completo</Label>
                <Textarea
                  id="endereco_entrega"
                  value={formData.endereco_entrega}
                  onChange={(e) => handleChange("endereco_entrega", e.target.value)}
                  placeholder="Rua, número, complemento, bairro..."
                  rows={2}
                  className="border-[#E5DCC8] mt-1"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleChange("cep", e.target.value)}
                    placeholder="00000-000"
                    className="border-[#E5DCC8] mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    placeholder="Ex: Vitória"
                    className="border-[#E5DCC8] mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleChange("estado", e.target.value.toUpperCase())}
                    placeholder="ES"
                    maxLength={2}
                    className="border-[#E5DCC8] mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato do Clube */}
          <Card className="border-[#E5DCC8] shadow-lg mb-8">
            <CardHeader className="border-b border-[#E5DCC8] bg-[#F5F1E8]/50">
              <CardTitle className="text-[#6B4423] flex items-center gap-2">
                <User className="w-5 h-5" />
                Contato do Clube
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="contato_nome">Nome do Contato *</Label>
                <Input
                  id="contato_nome"
                  value={formData.contato_nome}
                  onChange={(e) => handleChange("contato_nome", e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="border-[#E5DCC8] mt-1"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contato_telefone">Telefone do Contato</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
                    <Input
                      id="contato_telefone"
                      value={formData.contato_telefone}
                      onChange={(e) => handleChange("contato_telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="border-[#E5DCC8] pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contato_email">E-mail do Contato *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
                    <Input
                      id="contato_email"
                      type="email"
                      value={formData.contato_email}
                      onChange={(e) => handleChange("contato_email", e.target.value)}
                      placeholder="email@empresa.com"
                      required
                      className="border-[#E5DCC8] pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="border-[#E5DCC8] shadow-lg mb-8">
            <CardContent className="p-6">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                placeholder="Informações adicionais, preferências de entrega, etc."
                rows={3}
                className="border-[#E5DCC8] mt-1"
              />
            </CardContent>
          </Card>

          {/* Botão de Enviar */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-lg bg-[#6B4423] hover:bg-[#5A3A1E] shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Cadastro"
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-6 mt-12">
        <div className="max-w-3xl mx-auto text-center px-6">
          <p className="text-lg">Café Seleção do Mário</p>
          <p className="text-white/80 text-sm mt-1">Clube de Permuta</p>
        </div>
      </div>
    </div>
  );
}