
import React, { useState, useEffect } from "react";
import { ClienteSlug } from "@/entities/ClienteSlug";
import { Cliente } from "@/entities/Cliente";
import { ReservaCafe } from "@/entities/ReservaCafe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Copy, Check, Link as LinkIcon, Trash2, Eye, EyeOff, DollarSign, Heart } from "lucide-react"; // Added Heart icon
import { motion } from "framer-motion";

export default function LinksClientes() {
  const [links, setLinks] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const [formData, setFormData] = useState({
    cliente_id: "",
    slug: "",
    ativo: true,
    mostrar_precos: false // New field
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [linksData, clientesData, reservasData] = await Promise.all([
      ClienteSlug.list("-created_date"),
      Cliente.list(),
      ReservaCafe.list()
    ]);
    setLinks(linksData);
    setClientes(clientesData);
    setReservas(reservasData);
    setIsLoading(false);
  };

  const gerarSlug = (nome) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      const slugBase = gerarSlug(cliente.nome);
      
      // Verificar se slug já existe e adicionar número se necessário
      let slugFinal = slugBase;
      let contador = 1;
      while (links.some(l => l.slug === slugFinal && l.cliente_id !== clienteId)) {
        slugFinal = `${slugBase}-${contador}`;
        contador++;
      }
      
      setFormData({
        cliente_id: clienteId,
        slug: slugFinal,
        ativo: true,
        mostrar_precos: false // Initialize new field
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cliente = clientes.find(c => c.id === formData.cliente_id);
    if (!cliente) {
      alert("Cliente não encontrado");
      return;
    }

    // Verificar se slug já existe
    const slugExistente = links.find(l => l.slug === formData.slug && l.cliente_id !== formData.cliente_id);
    if (slugExistente) {
      alert("Este slug já está em uso. Por favor, escolha outro.");
      return;
    }

    try {
      await ClienteSlug.create({
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        slug: formData.slug,
        ativo: formData.ativo,
        mostrar_precos: formData.mostrar_precos // Include new field
      });

      setShowForm(false);
      setFormData({ cliente_id: "", slug: "", ativo: true, mostrar_precos: false }); // Reset new field
      loadData();
    } catch (error) {
      console.error("Erro ao criar link:", error);
      alert("Erro ao criar link. Tente novamente.");
    }
  };

  const handleToggleAtivo = async (link) => {
    try {
      await ClienteSlug.update(link.id, {
        ...link,
        ativo: !link.ativo
      });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleTogglePrecos = async (link) => {
    try {
      await ClienteSlug.update(link.id, {
        ...link,
        mostrar_precos: !link.mostrar_precos
      });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
    }
  };

  const handleDelete = async (linkId) => {
    if (confirm("Tem certeza que deseja excluir este link?")) {
      try {
        await ClienteSlug.delete(linkId);
        loadData();
      } catch (error) {
        console.error("Erro ao excluir link:", error);
      }
    }
  };

  const getUrlCompleta = (slug) => {
    return `${window.location.origin}/ReservaPublica?cliente=${slug}`;
  };

  const handleCopyUrl = (slug, linkId) => {
    const url = getUrlCompleta(slug);
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getReservasPorCliente = (clienteId) => {
    return reservas.filter(r => r.cliente_id === clienteId && r.status === "Ativa").length;
  };

  const linkPatrocinio = `${window.location.origin}/SolicitarPatrocinio`;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
              <LinkIcon className="w-8 h-8" />
              Links Personalizados
            </h1>
            <p className="text-[#8B7355]">
              Crie links de reserva exclusivos para seus clientes
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#6B4423] hover:bg-[#5A3A1E] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Link
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#6B4423]/5 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355] mb-1">Links Ativos</p>
                  <p className="text-3xl font-bold text-[#6B4423]">
                    {links.filter(l => l.ativo).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#2D5016]/10 rounded-full flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-[#2D5016]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/5 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355] mb-1">Total de Links</p>
                  <p className="text-3xl font-bold text-[#6B4423]">{links.length}</p>
                </div>
                <div className="w-12 h-12 bg-[#6B4423]/10 rounded-full flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-[#6B4423]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#C9A961]/5 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355] mb-1">Link Patrocínios</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(linkPatrocinio);
                      alert("Link copiado!");
                    }}
                    className="mt-2 border-[#C9A961] text-[#8B7355] hover:bg-[#C9A961]/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
                <div className="w-12 h-12 bg-[#C9A961]/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#C9A961]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Links */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : links.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {links.map((link, index) => {
              const reservasCliente = getReservasPorCliente(link.cliente_id);
              
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-[#6B4423]">
                              {link.cliente_nome}
                            </h3>
                            <Badge variant="outline" className={
                              link.ativo 
                                ? "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }>
                              {link.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={
                                link.mostrar_precos
                                  ? "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]"
                                  : "bg-gray-100 text-gray-600 border-gray-300"
                              }
                            >
                              {link.mostrar_precos ? "💰 Com Preços" : "Sem Preços"}
                            </Badge>
                            {reservasCliente > 0 && (
                              <Badge className="bg-[#D97706]/10 text-[#D97706] border-[#D97706]">
                                {reservasCliente} {reservasCliente === 1 ? 'reserva' : 'reservas'}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="bg-[#F5F1E8] px-4 py-2 rounded-lg font-mono text-sm text-[#6B4423] break-all">
                            {getUrlCompleta(link.slug)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyUrl(link.slug, link.id)}
                            className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar URL
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePrecos(link)}
                            title={link.mostrar_precos ? "Ocultar preços" : "Mostrar preços"}
                            className="hover:bg-[#C9A961]/10"
                          >
                            <DollarSign className={`w-4 h-4 ${link.mostrar_precos ? 'text-[#2D5016]' : 'text-gray-400'}`} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleAtivo(link)}
                            title={link.ativo ? "Desativar" : "Ativar"}
                          >
                            {link.ativo ? (
                              <Eye className="w-4 h-4 text-[#2D5016]" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(link.id)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <LinkIcon className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
              <p className="text-[#8B7355] text-lg">Nenhum link criado ainda</p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                Criar Primeiro Link
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal de Criação */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#6B4423]">
                Criar Novo Link
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={handleClienteChange}
                  required
                >
                  <SelectTrigger className="border-[#E5DCC8]">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug da URL *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="border-[#E5DCC8]"
                  placeholder="joao-silva"
                />
                <p className="text-xs text-[#8B7355]">
                  URL completa: {window.location.origin}/ReservaPublica?cliente={formData.slug || "..."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 text-[#6B4423] rounded"
                  />
                  <Label htmlFor="ativo" className="cursor-pointer">
                    Link ativo
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mostrar_precos"
                    checked={formData.mostrar_precos}
                    onChange={(e) => setFormData({ ...formData, mostrar_precos: e.target.checked })}
                    className="w-4 h-4 text-[#6B4423] rounded"
                  />
                  <Label htmlFor="mostrar_precos" className="cursor-pointer flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Mostrar preços na página pública
                  </Label>
                </div>

                {formData.mostrar_precos && (
                  <div className="bg-[#C9A961]/10 p-3 rounded-lg border border-[#C9A961]/20">
                    <p className="text-xs text-[#6B4423]">
                      <strong>💡 Atenção:</strong> Certifique-se de configurar os preços para este cliente na aba "Estoque → Clientes → Botão Preços"
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                  disabled={!formData.cliente_id || !formData.slug}
                >
                  Criar Link
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
