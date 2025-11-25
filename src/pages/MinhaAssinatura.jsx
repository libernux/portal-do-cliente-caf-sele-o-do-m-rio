import React, { useState, useEffect } from "react";
import { AssinanteClube } from "@/entities/AssinanteClube";
import { EntregaClube } from "@/entities/EntregaClube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhaAssinatura() {
  const [assinante, setAssinante] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");

    if (!slug) {
      setError("Link inválido. Solicite um novo link ao administrador.");
      setIsLoading(false);
      return;
    }

    try {
      const assinantes = await AssinanteClube.filter({ slug_acesso: slug });
      
      if (assinantes.length === 0) {
        setError("Assinatura não encontrada. Verifique o link ou entre em contato.");
        setIsLoading(false);
        return;
      }

      const assinanteData = assinantes[0];
      setAssinante(assinanteData);

      const entregasData = await EntregaClube.filter({ assinante_id: assinanteData.id }, "-data_programada");
      setEntregas(entregasData);
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente.");
    }
    
    setIsLoading(false);
  };

  const statusConfig = {
    "Programada": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", icon: Clock },
    "Em Preparação": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", icon: Package },
    "Enviada": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300", icon: Truck },
    "Entregue": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", icon: CheckCircle2 },
    "Cancelada": { bg: "bg-red-100", text: "text-red-800", border: "border-red-300", icon: AlertCircle }
  };

  const entregasEntregues = entregas.filter(e => e.status === "Entregue");
  const entregasPendentes = entregas.filter(e => e.status !== "Entregue" && e.status !== "Cancelada");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto mb-4"></div>
          <p className="text-[#8B7355]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center p-6">
        <Card className="max-w-md border-[#E5DCC8] shadow-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#6B4423] mb-2">Ops!</h2>
            <p className="text-[#8B7355]">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 shadow-lg">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Clube de Assinatura</h1>
              <p className="text-white/80">Café Seleção do Mário</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Dados do Assinante */}
        <Card className="border-[#E5DCC8] shadow-lg">
          <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
            <CardTitle className="text-xl text-[#6B4423] flex items-center gap-2">
              <User className="w-5 h-5" />
              Minha Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#6B4423]">{assinante.nome}</h3>
                <div className="space-y-1 text-sm text-[#8B7355]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {assinante.email}
                  </div>
                  {assinante.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {assinante.telefone}
                    </div>
                  )}
                  {assinante.endereco && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {assinante.endereco}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Badge 
                  variant="outline" 
                  className={`${assinante.status === "Ativo" ? "bg-green-100 text-green-800 border-green-300" : "bg-yellow-100 text-yellow-800 border-yellow-300"} text-sm px-3 py-1`}
                >
                  {assinante.status}
                </Badge>
                <Badge variant="outline" className="bg-[#F5F1E8] text-[#6B4423] border-[#E5DCC8]">
                  Plano {assinante.plano}
                </Badge>
                <Badge variant="outline" className="bg-[#F5F1E8] text-[#6B4423] border-[#E5DCC8]">
                  {assinante.quantidade_pacotes} pacote(s)/entrega
                </Badge>
              </div>
            </div>

            {assinante.moagem_preferida && (
              <p className="text-sm text-[#8B7355] mt-4 pt-4 border-t border-[#E5DCC8]">
                <strong>Preferência:</strong> {assinante.moagem_preferida}
                {assinante.tipo_cafe_preferido && ` - ${assinante.tipo_cafe_preferido}`}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-[#6B4423] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#6B4423]">{entregas.length}</p>
              <p className="text-xs text-[#8B7355]">Total Entregas</p>
            </CardContent>
          </Card>
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{entregasEntregues.length}</p>
              <p className="text-xs text-[#8B7355]">Recebidas</p>
            </CardContent>
          </Card>
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{entregasPendentes.length}</p>
              <p className="text-xs text-[#8B7355]">Pendentes</p>
            </CardContent>
          </Card>
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-purple-600">
                {assinante.data_proxima_entrega 
                  ? format(new Date(assinante.data_proxima_entrega), "dd/MM")
                  : "-"}
              </p>
              <p className="text-xs text-[#8B7355]">Próxima</p>
            </CardContent>
          </Card>
        </div>

        {/* Entregas Pendentes */}
        {entregasPendentes.length > 0 && (
          <Card className="border-[#E5DCC8] shadow-lg">
            <CardHeader className="border-b border-[#E5DCC8]">
              <CardTitle className="text-lg text-[#6B4423] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Próximas Entregas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {entregasPendentes.map((entrega) => {
                  const config = statusConfig[entrega.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <div key={entrega.id} className="bg-[#F5F1E8] p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#8B7355]" />
                          <span className="font-medium text-[#6B4423]">
                            {format(new Date(entrega.data_programada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {entrega.status}
                        </Badge>
                      </div>

                      {entrega.cafes_entregues && entrega.cafes_entregues.length > 0 && (
                        <div className="space-y-1">
                          {entrega.cafes_entregues.map((cafe, idx) => (
                            <p key={idx} className="text-sm text-[#8B7355]">
                              ☕ {cafe.cafe_nome} - {cafe.quantidade}x ({cafe.moagem || "N/A"})
                            </p>
                          ))}
                        </div>
                      )}

                      {entrega.codigo_rastreamento && (
                        <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          Rastreio: {entrega.codigo_rastreamento}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Entregas */}
        <Card className="border-[#E5DCC8] shadow-lg">
          <CardHeader className="border-b border-[#E5DCC8]">
            <CardTitle className="text-lg text-[#6B4423] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Histórico de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {entregasEntregues.length > 0 ? (
              <div className="space-y-4">
                {entregasEntregues.map((entrega) => (
                  <div key={entrega.id} className="border-b border-[#E5DCC8] pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-[#6B4423]">
                          {format(new Date(entrega.data_entrega || entrega.data_programada), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Entregue
                      </Badge>
                    </div>

                    {entrega.cafes_entregues && entrega.cafes_entregues.length > 0 && (
                      <div className="space-y-1">
                        {entrega.cafes_entregues.map((cafe, idx) => (
                          <p key={idx} className="text-sm text-[#8B7355]">
                            ☕ {cafe.cafe_nome} - {cafe.quantidade}x ({cafe.moagem || "N/A"})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#8B7355]">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma entrega realizada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-[#8B7355] pt-4">
          <p>Dúvidas? Entre em contato conosco!</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/Support" className="hover:text-[#6B4423] hover:underline">Suporte</a>
            <span>•</span>
            <a href="/Privacy" className="hover:text-[#6B4423] hover:underline">Privacidade</a>
          </div>
        </div>
      </div>
    </div>
  );
}