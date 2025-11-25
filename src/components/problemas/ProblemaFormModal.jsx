
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EtiquetaProblema } from "@/entities/EtiquetaProblema";
import { Responsavel } from "@/entities/Responsavel";
import { Badge } from "@/components/ui/badge";
import { Tag, X } from "lucide-react";
import { notificarProblema } from "@/functions/notificarProblema";

export default function ProblemaFormModal({ open, onClose, onSave, problema, etiquetasDisponiveis }) {
  const [formData, setFormData] = useState({
    nome_cliente: "",
    email_cliente: "",
    telefone_cliente: "",
    descricao: "",
    tipo: "Outro",
    etiquetas: [],
    prioridade: "Média",
    status: "Aberto",
    responsavel: "",
    data_abertura: "",
    data_resolucao: "",
    solucao: "",
  });
  const [etiquetas, setEtiquetas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);

  useEffect(() => {
    if (open) {
      loadData();
    }
    
    if (problema) {
      setFormData(problema);
    } else {
      setFormData({
        nome_cliente: "",
        email_cliente: "",
        telefone_cliente: "",
        descricao: "",
        tipo: "Outro",
        etiquetas: [],
        prioridade: "Média",
        status: "Aberto",
        responsavel: "",
        data_abertura: new Date().toISOString().split('T')[0],
        data_resolucao: "",
        solucao: "",
      });
    }
  }, [problema, open]);

  const loadData = async () => {
    const [etiquetasData, responsaveisData] = await Promise.all([
      EtiquetaProblema.list(),
      Responsavel.filter({ ativo: true })
    ]);
    setEtiquetas(etiquetasData);
    setResponsaveis(responsaveisData);
  };

  const toggleEtiqueta = (etiquetaId) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas?.includes(etiquetaId)
        ? prev.etiquetas.filter(id => id !== etiquetaId)
        : [...(prev.etiquetas || []), etiquetaId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const statusAnterior = problema?.status;
    const responsavelAnterior = problema?.responsavel;
    
    // Salvar o problema primeiro
    const problemaSalvo = await onSave(formData);
    
    // Só enviar notificações se o salvamento foi bem-sucedido e temos um ID
    if (problemaSalvo && problemaSalvo.id) {
      try {
        // Se foi atribuído um responsável pela primeira vez ou mudou
        if (formData.responsavel && formData.responsavel !== responsavelAnterior) {
          // Buscar email do responsável selecionado
          const responsavelObj = responsaveis.find(r => r.nome === formData.responsavel);
          if (responsavelObj && responsavelObj.email) {
            await notificarProblema({
              problemaId: problemaSalvo.id,
              tipo: 'atribuicao',
              emailDestinatario: responsavelObj.email,
              nomeDestinatario: responsavelObj.nome
            });
          }
        }
        
        // Status mudou - POR ENQUANTO NÃO NOTIFICAR CLIENTE
        // Futuramente, verificar configuração antes de enviar
        
      } catch (error) {
        console.error('Erro ao enviar notificações:', error);
        // Não bloquear o salvamento por erro de notificação
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            {problema ? "Editar Chamado" : "Novo Chamado"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do Cliente */}
          <div className="bg-[#F5F1E8] p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-[#6B4423]">Informações do Cliente</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                required
                className="border-[#E5DCC8]"
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email_cliente">Email do Cliente *</Label>
                <Input
                  id="email_cliente"
                  type="email"
                  value={formData.email_cliente}
                  onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
                  required
                  className="border-[#E5DCC8]"
                  placeholder="cliente@email.com"
                />
                <p className="text-xs text-[#8B7355]">
                  O cliente poderá buscar este chamado usando este email
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone_cliente">Telefone</Label>
                <Input
                  id="telefone_cliente"
                  type="tel"
                  value={formData.telefone_cliente}
                  onChange={(e) => setFormData({ ...formData, telefone_cliente: e.target.value })}
                  className="border-[#E5DCC8]"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Descrição do Chamado */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do Chamado *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
              className="border-[#E5DCC8] min-h-[120px]"
              placeholder="Descreva detalhadamente o chamado reportado pelo cliente. Não há limite de caracteres..."
            />
          </div>

          {/* Etiquetas Personalizadas */}
          <div className="space-y-2">
            <Label>Etiquetas Personalizadas</Label>
            {etiquetas.length === 0 ? (
              <p className="text-sm text-[#8B7355]">
                Nenhuma etiqueta disponível. Crie etiquetas no gerenciador.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {etiquetas.map(etiqueta => {
                  const isSelected = formData.etiquetas?.includes(etiqueta.id);
                  
                  return (
                    <Badge
                      key={etiqueta.id}
                      onClick={() => toggleEtiqueta(etiqueta.id)}
                      style={{
                        backgroundColor: isSelected ? etiqueta.cor : `${etiqueta.cor}15`,
                        color: isSelected ? 'white' : etiqueta.cor,
                        borderColor: etiqueta.cor,
                        cursor: 'pointer'
                      }}
                      variant="outline"
                      className="border hover:scale-105 transition-transform"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {etiqueta.nome}
                      {isSelected && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Classificação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Logística">Logística</SelectItem>
                  <SelectItem value="Estoque">Estoque</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Equipamento">Equipamento</SelectItem>
                  <SelectItem value="Qualidade">Qualidade</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status e Responsável */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Aguardando">Aguardando</SelectItem>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select
                value={formData.responsavel}
                onValueChange={(value) => setFormData({ ...formData, responsavel: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map(resp => (
                    <SelectItem key={resp.id} value={resp.nome}>
                      {resp.nome} ({resp.area})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_abertura">Data de Abertura</Label>
              <Input
                id="data_abertura"
                type="date"
                value={formData.data_abertura}
                onChange={(e) => setFormData({ ...formData, data_abertura: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_resolucao">Data de Resolução</Label>
              <Input
                id="data_resolucao"
                type="date"
                value={formData.data_resolucao}
                onChange={(e) => setFormData({ ...formData, data_resolucao: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          {/* Solução */}
          {(formData.status === "Resolvido" || formData.solucao) && (
            <div className="space-y-2">
              <Label htmlFor="solucao">Solução</Label>
              <Textarea
                id="solucao"
                value={formData.solucao}
                onChange={(e) => setFormData({ ...formData, solucao: e.target.value })}
                className="border-[#E5DCC8]"
                rows={3}
                placeholder="Descreva a solução aplicada..."
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              {problema ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
