import React, { useState, useEffect } from "react";
import { ReservaCafe } from "@/entities/ReservaCafe";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Coffee, Calendar, User, AlertCircle } from "lucide-react";

export default function ReservaEditModal({ open, onClose, reservaGrupo, cafes, onSave }) {
  const [formData, setFormData] = useState({
    status: "Ativa",
    observacoes: ""
  });
  
  const [cafesReservados, setCafesReservados] = useState([]);
  const [totalPacotes, setTotalPacotes] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
  const [cafesParaDeletar, setCafesParaDeletar] = useState([]);
  const [reservasAtivas, setReservasAtivas] = useState([]);

  const getPesoEmbalagem = (embalagem) => {
    const pesos = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1
    };
    return pesos[embalagem] || 0.25;
  };

  useEffect(() => {
    if (reservaGrupo && open) {
      loadReservasAtivas();
      
      setFormData({
        status: reservaGrupo.status || "Ativa",
        observacoes: reservaGrupo.observacoes || ""
      });

      setCafesReservados(reservaGrupo.cafes.map(c => {
        const cafeObj = cafes?.find(cafe => cafe.id === c.cafe_id);
        return {
          id: c.id,
          cafe_id: c.cafe_id,
          cafe_nome: c.cafe_nome,
          cafe_forma: c.cafe_forma,
          quantidade_pacotes: c.quantidade_pacotes,
          embalagem: c.embalagem || "250g",
          isExisting: true,
          embalagens_disponiveis: cafeObj?.embalagens_disponiveis || ["250g"],
          estoque_por_embalagem: cafeObj?.estoque_por_embalagem || {}
        };
      }));

      setCafesParaDeletar([]);
    }
  }, [reservaGrupo, open, cafes]);

  const loadReservasAtivas = async () => {
    try {
      const reservas = await ReservaCafe.filter({ status: "Ativa" });
      setReservasAtivas(reservas);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
    }
  };

  const calcularDisponivel = (cafeId, embalagem, reservaIdAtual) => {
    const cafeObj = cafes?.find(c => c.id === cafeId);
    if (!cafeObj) return 0;

    const estoquePorEmbalagem = cafeObj.estoque_por_embalagem || {};
    const estoqueNaEmbalagem = estoquePorEmbalagem[embalagem] || 0;

    // Calcular reservado, EXCLUINDO a reserva atual que está sendo editada
    const reservadoNaEmbalagem = reservasAtivas
      .filter(r => 
        r.cafe_id === cafeId && 
        r.status === "Ativa" && 
        r.embalagem === embalagem &&
        r.id !== reservaIdAtual // Excluir a própria reserva
      )
      .reduce((sum, r) => sum + (r.quantidade_pacotes || 0), 0);

    return Math.max(0, estoqueNaEmbalagem - reservadoNaEmbalagem);
  };

  useEffect(() => {
    const totalPct = cafesReservados.reduce((sum, c) => sum + (c.quantidade_pacotes || 0), 0);
    setTotalPacotes(totalPct);
    
    const totalWeightKg = cafesReservados.reduce((sum, c) => {
      const peso = getPesoEmbalagem(c.embalagem || "250g");
      return sum + (c.quantidade_pacotes * peso);
    }, 0);
    setTotalKg(totalWeightKg.toFixed(3));
  }, [cafesReservados]);

  const handleAdicionarCafe = () => {
    setCafesReservados([...cafesReservados, {
      id: null,
      cafe_id: "",
      cafe_nome: "",
      cafe_forma: "",
      quantidade_pacotes: 0,
      embalagem: "250g",
      isExisting: false,
      embalagens_disponiveis: ["250g"],
      estoque_por_embalagem: {}
    }]);
  };

  const handleRemoverCafe = (index) => {
    const cafe = cafesReservados[index];
    if (cafe.isExisting && cafe.id) {
      setCafesParaDeletar([...cafesParaDeletar, cafe.id]);
    }
    setCafesReservados(cafesReservados.filter((_, i) => i !== index));
  };

  const handleCafeChange = (index, cafeId) => {
    const selectedCafe = cafes?.find(c => c.id === cafeId);
    if (selectedCafe) {
      const embalagensDisponiveis = selectedCafe.embalagens_disponiveis || ["250g"];
      const newCafes = [...cafesReservados];
      const embalagemAtual = embalagensDisponiveis.includes(newCafes[index].embalagem)
        ? newCafes[index].embalagem
        : embalagensDisponiveis[0];
      
      newCafes[index] = {
        ...newCafes[index],
        cafe_id: selectedCafe.id,
        cafe_nome: selectedCafe.nome,
        cafe_forma: selectedCafe.forma,
        embalagem: embalagemAtual,
        embalagens_disponiveis: embalagensDisponiveis,
        estoque_por_embalagem: selectedCafe.estoque_por_embalagem || {}
      };
      setCafesReservados(newCafes);
    }
  };

  const handleEmbalagemChange = (index, embalagem) => {
    const newCafes = [...cafesReservados];
    newCafes[index] = {
      ...newCafes[index],
      embalagem: embalagem,
      quantidade_pacotes: 0
    };
    setCafesReservados(newCafes);
  };

  const handleQuantidadeChange = (index, quantidade) => {
    const newCafes = [...cafesReservados];
    const cafeReserva = newCafes[index];
    
    const qtd = parseFloat(quantidade) || 0;
    const disponivel = calcularDisponivel(cafeReserva.cafe_id, cafeReserva.embalagem, cafeReserva.id);
    
    const quantidadeFinal = Math.min(qtd, disponivel);
    
    newCafes[index] = {
      ...newCafes[index],
      quantidade_pacotes: quantidadeFinal
    };
    setCafesReservados(newCafes);
    
    if (qtd > 0 && qtd > disponivel) {
      alert(`Estoque insuficiente! Disponível: ${disponivel} pacotes de ${cafeReserva.embalagem}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cafesValidos = cafesReservados.filter(c => c.cafe_id && c.quantidade_pacotes > 0);

    if (cafesValidos.length === 0) {
      alert("Por favor, mantenha pelo menos um café com quantidade válida");
      return;
    }

    const isStatusChangingToEntregue = reservaGrupo.status !== "Entregue" && formData.status === "Entregue";

    if (isStatusChangingToEntregue) {
      const confirmEntrega = confirm(
        "⚠️ Atenção!\n\n" +
        "Ao marcar esta reserva como 'Entregue', o estoque dos cafés será AUTOMATICAMENTE DIMINUÍDO.\n\n" +
        "Confirma que os cafés foram entregues fisicamente ao cliente?"
      );
      
      if (!confirmEntrega) {
        return;
      }
    }

    const dataToPassToOnSave = {
      groupId: reservaGrupo.id,
      newStatus: formData.status,
      newObservacoes: formData.observacoes,
      cafesToProcess: cafesValidos.map(cafe => ({
        id: cafe.id,
        cafe_id: cafe.cafe_id,
        cafe_nome: cafe.cafe_nome,
        cafe_forma: cafe.cafe_forma,
        quantidade_pacotes: cafe.quantidade_pacotes,
        embalagem: cafe.embalagem,
        isExisting: cafe.isExisting,
      })),
      cafesToDeleteIds: cafesParaDeletar,
      originalStatus: reservaGrupo.status,
      cliente_id: reservaGrupo.cliente_id,
      cliente_nome: reservaGrupo.cliente_nome,
      data_reserva: reservaGrupo.data_reserva,
    };

    try {
      await onSave(dataToPassToOnSave);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar alterações na reserva:", error);
      alert("Erro ao salvar alterações na reserva. Tente novamente.");
    }
  };

  if (!reservaGrupo) return null;

  const cafesDisponiveis = cafes || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            Editar Reserva
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[#F5F1E8] p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B7355]" />
              <span className="text-sm text-[#8B7355]">Cliente:</span>
              <span className="font-semibold text-[#6B4423]">{reservaGrupo.cliente_nome}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B7355]" />
              <span className="text-sm text-[#8B7355]">Data:</span>
              <span className="font-semibold text-[#6B4423]">
                {new Date(reservaGrupo.data_reserva).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Cafés Reservados *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdicionarCafe}
                className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Café
              </Button>
            </div>

            {cafesReservados.length === 0 ? (
              <div className="text-center py-8 bg-[#F5F1E8] rounded-lg border-2 border-dashed border-[#E5DCC8]">
                <Coffee className="w-12 h-12 text-[#8B7355] mx-auto mb-2 opacity-30" />
                <p className="text-[#8B7355] text-sm">Clique em "Adicionar Café" para começar</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {cafesReservados.map((cafe, index) => {
                  const disponivel = cafe.cafe_id && cafe.embalagem
                    ? calcularDisponivel(cafe.cafe_id, cafe.embalagem, cafe.id)
                    : 0;
                  const disponivelKg = disponivel > 0
                    ? (disponivel * getPesoEmbalagem(cafe.embalagem)).toFixed(3)
                    : "0.000";

                  const estoquePorEmbalagem = cafe.estoque_por_embalagem || {};

                  return (
                    <div key={index} className="bg-[#F5F1E8] p-4 rounded-lg space-y-3 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoverCafe(index)}
                        className="absolute top-2 right-2 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>

                      <div className="grid grid-cols-1 gap-3 pr-8">
                        <div className="space-y-2">
                          <Label className="text-xs">Café</Label>
                          <Select
                            value={cafe.cafe_id}
                            onValueChange={(value) => handleCafeChange(index, value)}
                            required
                            disabled={cafe.isExisting}
                          >
                            <SelectTrigger className="border-[#E5DCC8] bg-white">
                              <SelectValue placeholder="Selecione o café" />
                            </SelectTrigger>
                            <SelectContent>
                              {cafesDisponiveis.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.nome} ({c.forma})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {cafe.cafe_id && (
                          <>
                            {/* Mostrar embalagens disponíveis */}
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                              <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Embalagens Disponíveis para este café:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(cafe.embalagens_disponiveis || ["250g"]).map((emb) => {
                                  const estoqueEmb = estoquePorEmbalagem[emb] || 0;
                                  const reservadoEmb = reservasAtivas
                                    .filter(r => 
                                      r.cafe_id === cafe.cafe_id && 
                                      r.embalagem === emb && 
                                      r.status === "Ativa" &&
                                      r.id !== cafe.id // Excluir a própria reserva
                                    )
                                    .reduce((sum, r) => sum + r.quantidade_pacotes, 0);
                                  const dispEmb = Math.max(0, estoqueEmb - reservadoEmb);
                                  
                                  return (
                                    <Badge 
                                      key={emb} 
                                      variant="outline" 
                                      className={`${dispEmb > 0 ? 'bg-white border-blue-300' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                                    >
                                      {emb}: {dispEmb} pct
                                      {(emb === "10g" || emb === "18g") && " (Drip)"}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-xs">Embalagem *</Label>
                                <Select
                                  value={cafe.embalagem || "250g"}
                                  onValueChange={(value) => handleEmbalagemChange(index, value)}
                                  disabled={!cafe.cafe_id}
                                  required
                                >
                                  <SelectTrigger className="border-[#E5DCC8] bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(cafe.embalagens_disponiveis || ["250g"]).map((emb) => (
                                      <SelectItem key={emb} value={emb}>
                                        {emb} {(emb === "10g" || emb === "18g") && "(Drip)"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Quantidade (pacotes) *</Label>
                                <Input
                                  type="number"
                                  step="1"
                                  min="1"
                                  max={disponivel}
                                  value={cafe.quantidade_pacotes || ""}
                                  onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                                  required
                                  disabled={!cafe.cafe_id || !cafe.embalagem}
                                  className="border-[#E5DCC8] bg-white"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {cafe.cafe_id && cafe.embalagem && (
                        <div className="text-xs space-y-1 pt-2 border-t border-[#E5DCC8]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#8B7355]">Disponível nesta embalagem:</span>
                            <Badge
                              variant="outline"
                              className={disponivel > 0 ? "bg-[#2D5016]/10 text-[#2D5016]" : "bg-red-100 text-red-800"}
                            >
                              {disponivel} pacotes ({disponivelKg} kg)
                            </Badge>
                          </div>
                          {cafe.quantidade_pacotes > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#8B7355]">Esta reserva:</span>
                              <Badge variant="outline" className="bg-white">
                                {(cafe.quantidade_pacotes * getPesoEmbalagem(cafe.embalagem)).toFixed(3)} kg
                              </Badge>
                            </div>
                          )}
                          {disponivel === 0 && (
                            <p className="text-red-600 font-medium">⚠️ Sem estoque disponível nesta embalagem</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {totalPacotes > 0 && (
            <div className="bg-gradient-to-r from-[#6B4423]/10 to-[#C9A961]/10 p-4 rounded-lg border border-[#E5DCC8]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#6B4423]">Total da Reserva:</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#6B4423]">
                    {totalKg} kg
                  </p>
                  <p className="text-sm text-[#8B7355]">{totalPacotes} pacotes</p>
                </div>
              </div>
            </div>
          )}

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
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={3}
              placeholder="Informações adicionais sobre esta reserva..."
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
              disabled={cafesReservados.length === 0}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}