import React, { useState, useEffect } from "react";
import { InfoCafe } from "@/entities/InfoCafe";
import { Cafe } from "@/entities/Cafe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  Coffee
} from "lucide-react";
import InfoCafeFormModal from "../components/infoscafe/InfoCafeFormModal";

export default function GerenciarInfosCafe() {
  const [infosCafe, setInfosCafe] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [infosData, cafesData] = await Promise.all([
      InfoCafe.list("-created_date"),
      Cafe.list("nome")
    ]);
    setInfosCafe(infosData);
    setCafes(cafesData);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir estas informações?")) {
      await InfoCafe.delete(id);
      await loadData();
    }
  };

  const handleToggleAtivo = async (info) => {
    await InfoCafe.update(info.id, { ...info, ativo: !info.ativo });
    await loadData();
  };

  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/InfoCafePublico?slug=${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência!");
  };

  const handleOpenLink = (slug) => {
    const url = `${window.location.origin}/InfoCafePublico?slug=${slug}`;
    window.open(url, "_blank");
  };

  const filteredInfos = infosCafe.filter(info =>
    info.cafe_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    info.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsAtivos = infosCafe.filter(i => i.ativo).length;
  const statsInativos = infosCafe.filter(i => !i.ativo).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#6B4423]">Gerenciar Informações dos Cafés</h1>
            <p className="text-[#8B7355]">Cadastre informações detalhadas para visualização pública</p>
          </div>
          <Button
            onClick={() => {
              setEditingInfo(null);
              setShowFormModal(true);
            }}
            className="bg-[#6B4423] hover:bg-[#5A3A1E]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Informações
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355]">Total Cadastrado</p>
                  <p className="text-3xl font-bold text-[#6B4423]">{infosCafe.length}</p>
                </div>
                <Coffee className="w-12 h-12 text-[#6B4423]/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355]">Ativos</p>
                  <p className="text-3xl font-bold text-[#2D5016]">{statsAtivos}</p>
                </div>
                <Eye className="w-12 h-12 text-[#2D5016]/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355]">Inativos</p>
                  <p className="text-3xl font-bold text-[#8B7355]">{statsInativos}</p>
                </div>
                <Eye className="w-12 h-12 text-[#8B7355]/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-[#E5DCC8]">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
              <Input
                placeholder="Buscar por nome do café ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#E5DCC8]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
            <p className="text-[#8B7355] mt-4">Carregando...</p>
          </div>
        ) : filteredInfos.length === 0 ? (
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-12 text-center">
              <Coffee className="w-16 h-16 text-[#8B7355] mx-auto mb-4" />
              <p className="text-[#8B7355] text-lg">
                {searchTerm ? "Nenhuma informação encontrada" : "Nenhuma informação cadastrada ainda"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInfos.map((info) => (
              <Card key={info.id} className="border-[#E5DCC8] hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-[#6B4423]">{info.cafe_nome}</CardTitle>
                        <Badge className={info.ativo ? "bg-[#2D5016] text-white" : "bg-gray-400 text-white"}>
                          {info.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-[#8B7355]">
                        <p><strong>Slug:</strong> {info.slug}</p>
                        <p><strong>Link público:</strong> /InfoCafePublico?slug={info.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenLink(info.slug)}
                        title="Abrir link público"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyLink(info.slug)}
                        title="Copiar link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleAtivo(info)}
                        title={info.ativo ? "Desativar" : "Ativar"}
                      >
                        <Eye className={`w-4 h-4 ${info.ativo ? "text-[#2D5016]" : "text-gray-400"}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingInfo(info);
                          setShowFormModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(info.id)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <InfoCafeFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingInfo(null);
        }}
        infoCafe={editingInfo}
        cafes={cafes}
        onSave={loadData}
      />
    </div>
  );
}