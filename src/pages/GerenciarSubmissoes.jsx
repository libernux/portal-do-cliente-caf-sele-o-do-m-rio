import React, { useState, useEffect } from "react";
import { SubmissaoProdutor } from "@/entities/SubmissaoProdutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Trash2, Coffee, Edit, ExternalLink, Copy, ClipboardList, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditarSubmissaoModal from "../components/submissoes/EditarSubmissaoModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function GerenciarSubmissoes() {
  const [submissoes, setSubmissoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmissao, setSelectedSubmissao] = useState(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [notasAdmin, setNotasAdmin] = useState("");

  useEffect(() => {
    loadSubmissoes();
  }, []);

  const loadSubmissoes = async () => {
    setIsLoading(true);
    const data = await SubmissaoProdutor.list("-created_date");
    setSubmissoes(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta submissão?")) {
      await SubmissaoProdutor.delete(id);
      await loadSubmissoes();
    }
  };

  const handleUpdateStatus = async (submissao, newStatus) => {
    await SubmissaoProdutor.update(submissao.id, {
      ...submissao,
      status: newStatus,
      notas_admin: notasAdmin
    });
    await loadSubmissoes();
    setShowDetalhes(false);
  };

  const handleVerDetalhes = (submissao) => {
    setSelectedSubmissao(submissao);
    setNotasAdmin(submissao.notas_admin || "");
    setShowDetalhes(true);
  };

  const handleEditar = (submissao) => {
    setSelectedSubmissao(submissao);
    setShowEditar(true);
  };

  const handleSaveEdit = async (formData) => {
    await SubmissaoProdutor.update(selectedSubmissao.id, formData);
    await loadSubmissoes();
    setShowEditar(false);
  };

  const handleSavePontuacao = async (id, pontuacao) => {
    const submissao = submissoes.find(s => s.id === id);
    if (submissao) {
      await SubmissaoProdutor.update(id, { ...submissao, pontuacao: parseFloat(pontuacao) });
      await loadSubmissoes();
    }
  };

  const filteredSubmissoes = submissoes.filter(sub => {
    const matchSearch = sub.nome_cafe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sub.origem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sub.variedade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || sub.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusConfig = {
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Aprovado": "bg-green-100 text-green-800 border-green-300",
    "Recusado": "bg-red-100 text-red-800 border-red-300"
  };

  const statsPendente = submissoes.filter(s => s.status === "Pendente").length;
  const statsAnalise = submissoes.filter(s => s.status === "Em Análise").length;
  const statsAprovado = submissoes.filter(s => s.status === "Aprovado").length;

  // Função para formatar dados de um café para texto
  const formatarCafeTexto = (cafe) => {
    let texto = `📦 ${cafe.nome_cafe}\n`;
    if (cafe.pontuacao) texto += `⭐ Pontuação: ${cafe.pontuacao}/100\n`;
    if (cafe.origem) texto += `📍 Origem: ${cafe.origem}\n`;
    texto += '\n';
    
    if (cafe.tipo_grao) texto += `Tipo do Grão: ${cafe.tipo_grao}\n`;
    if (cafe.variedade) texto += `Variedade: ${cafe.variedade}\n`;
    if (cafe.processamento) texto += `Processamento: ${cafe.processamento}\n`;
    if (cafe.bebida) texto += `Bebida: ${cafe.bebida}\n`;
    if (cafe.altitude) texto += `Altitude: ${cafe.altitude}\n`;
    if (cafe.torra) texto += `Torra: ${cafe.torra}\n`;
    if (cafe.moagem) texto += `Moagem: ${cafe.moagem}\n`;
    if (cafe.docura) texto += `Doçura: ${cafe.docura}\n`;
    if (cafe.aroma) texto += `Aroma: ${cafe.aroma}\n`;
    if (cafe.corpo) texto += `Corpo: ${cafe.corpo}\n`;
    if (cafe.acidez_tipo) texto += `Acidez (Tipo): ${cafe.acidez_tipo}\n`;
    if (cafe.acidez_intensidade) texto += `Acidez (Intensidade): ${cafe.acidez_intensidade}\n`;
    if (cafe.escala_intensidade) texto += `Intensidade: ${cafe.escala_intensidade}/10\n`;
    
    if (cafe.sabor_notas_sensoriais) texto += `\nSabor / Notas Sensoriais:\n${cafe.sabor_notas_sensoriais}\n`;
    if (cafe.notas_degustacao) texto += `\nNotas de Degustação:\n${cafe.notas_degustacao}\n`;
    if (cafe.metodos_preparo) texto += `\nMétodos de Preparo:\n${cafe.metodos_preparo}\n`;
    if (cafe.modo_conservacao) texto += `\nConservação:\n${cafe.modo_conservacao}\n`;
    if (cafe.observacoes) texto += `\nObservações:\n${cafe.observacoes}\n`;
    if (cafe.certificacoes) texto += `\nCertificações: ${cafe.certificacoes}\n`;
    
    return texto;
  };

  // Copiar dados de um café individual
  const copiarCafeIndividual = (cafe) => {
    const texto = formatarCafeTexto(cafe);
    navigator.clipboard.writeText(texto);
    toast.success(`Dados de "${cafe.nome_cafe}" copiados!`);
  };

  // Copiar todos os cafés aprovados
  const copiarTodosCafes = () => {
    const cafesAprovados = submissoes.filter(s => s.status === "Aprovado");
    if (cafesAprovados.length === 0) {
      toast.error("Nenhum café aprovado para copiar");
      return;
    }
    
    const textoCompleto = cafesAprovados.map((cafe, index) => {
      return `${'═'.repeat(50)}\n${index + 1}. ${formatarCafeTexto(cafe)}`;
    }).join('\n\n');
    
    const header = `☕ CATÁLOGO DE CAFÉS ESPECIAIS\n📅 ${new Date().toLocaleDateString('pt-BR')}\n📦 Total: ${cafesAprovados.length} cafés\n\n`;
    
    navigator.clipboard.writeText(header + textoCompleto);
    toast.success(`${cafesAprovados.length} cafés copiados!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#6B4423]">Gerenciar Cadastros de Cafés</h1>
            <p className="text-[#8B7355]">Visualize e gerencie as informações cadastradas dos cafés</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={copiarTodosCafes}
              variant="outline"
              className="border-[#6B4423] text-[#6B4423] hover:bg-[#6B4423]/10"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Copiar Todos ({statsAprovado})
            </Button>
            <Link 
              to={createPageUrl("CafesPublico")}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-[#6B4423] hover:bg-[#5A3A1E] text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Página Pública
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <p className="text-sm text-[#8B7355]">Total</p>
              <p className="text-3xl font-bold text-[#6B4423]">{submissoes.length}</p>
            </CardContent>
          </Card>
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <p className="text-sm text-[#8B7355]">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">{statsPendente}</p>
            </CardContent>
          </Card>
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <p className="text-sm text-[#8B7355]">Em Análise</p>
              <p className="text-3xl font-bold text-blue-600">{statsAnalise}</p>
            </CardContent>
          </Card>
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <p className="text-sm text-[#8B7355]">Aprovados</p>
              <p className="text-3xl font-bold text-green-600">{statsAprovado}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-[#E5DCC8]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                <Input
                  placeholder="Buscar por nome do café, origem ou variedade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#E5DCC8]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48 border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Análise">Em Análise</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
            <p className="text-[#8B7355] mt-4">Carregando...</p>
          </div>
        ) : filteredSubmissoes.length === 0 ? (
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-12 text-center">
              <Coffee className="w-16 h-16 text-[#8B7355] mx-auto mb-4" />
              <p className="text-[#8B7355] text-lg">Nenhuma submissão encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSubmissoes.map((sub) => (
              <Card key={sub.id} className="border-[#E5DCC8] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-[#6B4423]">{sub.nome_cafe}</h3>
                        <Badge variant="outline" className={statusConfig[sub.status]}>
                          {sub.status}
                        </Badge>
                        {sub.pontuacao && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                            ⭐ {sub.pontuacao}/100
                          </Badge>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-[#8B7355] mb-4">
                        <p><strong>Cadastrado em:</strong> {format(new Date(sub.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        {sub.origem && <p><strong>Origem:</strong> {sub.origem}</p>}
                        {sub.variedade && <p><strong>Variedade:</strong> {sub.variedade}</p>}
                        {sub.tipo_grao && <p><strong>Tipo:</strong> {sub.tipo_grao}</p>}
                      </div>
                      
                      {/* Campo de Pontuação Rápida */}
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <label className="text-sm font-medium text-amber-800 whitespace-nowrap">
                          Pontuação:
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          defaultValue={sub.pontuacao || ""}
                          placeholder="0-100"
                          className="w-24 h-8 text-center border-amber-300"
                          onBlur={(e) => {
                            if (e.target.value && e.target.value !== String(sub.pontuacao)) {
                              handleSavePontuacao(sub.id, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSavePontuacao(sub.id, e.target.value);
                              e.target.blur();
                            }
                          }}
                        />
                        <span className="text-sm text-amber-700">/100</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copiarCafeIndividual(sub)}
                        title="Copiar dados"
                        className="hover:bg-green-50"
                      >
                        <Copy className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditar(sub)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleVerDetalhes(sub)}
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(sub.id)}
                        className="hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#6B4423]">
              Detalhes da Submissão
            </DialogTitle>
          </DialogHeader>

          {selectedSubmissao && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <Badge variant="outline" className={statusConfig[selectedSubmissao.status]}>
                  {selectedSubmissao.status}
                </Badge>
              </div>

              {/* Informações do Café */}
              <div>
                <h3 className="font-bold text-[#6B4423] mb-3">Informações do Café</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                    <p className="text-xs text-[#8B7355]">Nome do Café</p>
                    <p className="font-semibold text-[#6B4423]">{selectedSubmissao.nome_cafe}</p>
                  </div>
                  {selectedSubmissao.origem && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Origem</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.origem}</p>
                    </div>
                  )}
                  {selectedSubmissao.tipo_grao && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Tipo do Grão</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.tipo_grao}</p>
                    </div>
                  )}
                  {selectedSubmissao.variedade && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Variedade</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.variedade}</p>
                    </div>
                  )}
                  {selectedSubmissao.processamento && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Processamento</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.processamento}</p>
                    </div>
                  )}
                  {selectedSubmissao.altitude && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Altitude</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.altitude}</p>
                    </div>
                  )}
                  {selectedSubmissao.certificacoes && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Certificações</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.certificacoes}</p>
                    </div>
                  )}
                </div>

                {selectedSubmissao.bebida && (
                  <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg mt-3">
                    <p className="text-xs text-[#8B7355]">Bebida</p>
                    <p className="font-semibold text-[#6B4423]">{selectedSubmissao.bebida}</p>
                  </div>
                )}

                {selectedSubmissao.sabor_notas_sensoriais && (
                  <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg mt-3">
                    <p className="text-xs text-[#8B7355] mb-1">Sabor / Notas Sensoriais</p>
                    <p className="text-[#5A4A3A]">{selectedSubmissao.sabor_notas_sensoriais}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  {selectedSubmissao.docura && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Doçura</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.docura}</p>
                    </div>
                  )}
                  {selectedSubmissao.aroma && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Aroma</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.aroma}</p>
                    </div>
                  )}
                  {selectedSubmissao.corpo && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Corpo</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.corpo}</p>
                    </div>
                  )}
                </div>

                {(selectedSubmissao.acidez_tipo || selectedSubmissao.acidez_intensidade) && (
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    {selectedSubmissao.acidez_tipo && (
                      <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                        <p className="text-xs text-[#8B7355]">Acidez (Tipo)</p>
                        <p className="font-semibold text-[#6B4423]">{selectedSubmissao.acidez_tipo}</p>
                      </div>
                    )}
                    {selectedSubmissao.acidez_intensidade && (
                      <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                        <p className="text-xs text-[#8B7355]">Acidez (Intensidade)</p>
                        <p className="font-semibold text-[#6B4423]">{selectedSubmissao.acidez_intensidade}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  {selectedSubmissao.torra && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Torra</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.torra}</p>
                    </div>
                  )}
                  {selectedSubmissao.moagem && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Moagem</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.moagem}</p>
                    </div>
                  )}
                  {selectedSubmissao.escala_intensidade && (
                    <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg">
                      <p className="text-xs text-[#8B7355]">Intensidade</p>
                      <p className="font-semibold text-[#6B4423]">{selectedSubmissao.escala_intensidade}/10</p>
                    </div>
                  )}
                </div>

                {selectedSubmissao.pontuacao && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-lg mt-3">
                    <p className="text-xs text-amber-700 mb-1">Pontuação do Café</p>
                    <p className="text-3xl font-bold text-amber-600">{selectedSubmissao.pontuacao}/100</p>
                  </div>
                )}

                {selectedSubmissao.modo_conservacao && (
                  <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg mt-3">
                    <p className="text-xs text-[#8B7355] mb-1">Modo de Conservação</p>
                    <p className="text-[#5A4A3A]">{selectedSubmissao.modo_conservacao}</p>
                  </div>
                )}

                {selectedSubmissao.metodos_preparo && (
                  <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg mt-3">
                    <p className="text-xs text-[#8B7355] mb-1">Métodos de Preparo</p>
                    <p className="text-[#5A4A3A]">{selectedSubmissao.metodos_preparo}</p>
                  </div>
                )}

                {selectedSubmissao.notas_degustacao && (
                  <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg mt-3">
                    <p className="text-xs text-[#8B7355] mb-1">Notas de Degustação</p>
                    <p className="text-[#5A4A3A]">{selectedSubmissao.notas_degustacao}</p>
                  </div>
                )}

                {selectedSubmissao.observacoes && (
                  <div className="bg-white border border-[#E5DCC8] p-3 rounded-lg mt-3">
                    <p className="text-xs text-[#8B7355] mb-1">Observações</p>
                    <p className="text-[#5A4A3A]">{selectedSubmissao.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Gestão */}
              <div className="border-t border-[#E5DCC8] pt-4 space-y-4">
                <h3 className="font-bold text-[#6B4423]">Gestão da Submissão</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#6B4423]">Notas Administrativas</label>
                  <Textarea
                    value={notasAdmin}
                    onChange={(e) => setNotasAdmin(e.target.value)}
                    rows={3}
                    className="border-[#E5DCC8]"
                    placeholder="Adicione notas internas sobre esta submissão..."
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => handleUpdateStatus(selectedSubmissao, "Em Análise")}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Marcar Em Análise
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedSubmissao, "Aprovado")}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedSubmissao, "Recusado")}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Recusar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <EditarSubmissaoModal
        open={showEditar}
        onClose={() => setShowEditar(false)}
        submissao={selectedSubmissao}
        onSave={handleSaveEdit}
      />
    </div>
  );
}