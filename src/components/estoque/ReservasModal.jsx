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
import { Plus, Trash2, Package, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReservasModal({ open, onClose, cafe, clientes, cafes, onUpdate }) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    observacoes: ""
  });

  const [cafesReservados, setCafesReservados] = useState([]);
  const [totalPacotes, setTotalPacotes] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
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
    if (open) {
      loadReservasAtivas();

      const today = new Date().toISOString().split('T')[0];
      setFormData({
        cliente_id: "",
        observacoes: "",
        data_reserva: today
      });

      if (cafe) {
        const embalagensDisponiveis = cafe.embalagens_disponiveis || ["250g"];
        setCafesReservados([{
          cafe_id: cafe.id,
          cafe_nome: cafe.nome,
          cafe_forma: cafe.forma,
          quantidade_pacotes: 0,
          embalagem: embalagensDisponiveis[0],
          embalagens_disponiveis: embalagensDisponiveis,
          estoque_por_embalagem: cafe.estoque_por_embalagem || {}
        }]);
      } else {
        setCafesReservados([]);
      }
    }
  }, [open, cafe]);

  const loadReservasAtivas = async () => {
    try {
      const reservas = await ReservaCafe.filter({ status: "Ativa" });
      setReservasAtivas(reservas);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
    }
  };

  const calcularDisponivel = (cafeId, embalagem) => {
    const cafeObj = cafes?.find(c => c.id === cafeId);
    if (!cafeObj) return 0;

    // Pegar estoque por embalagem específica
    const estoquePorEmbalagem = cafeObj.estoque_por_embalagem || {};
    const estoqueNaEmbalagem = estoquePorEmbalagem[embalagem] || 0;

    // Calcular total reservado nesta embalagem específica
    const reservadoNaEmbalagem = reservasAtivas
      .filter(r => r.cafe_id === cafeId && r.status === "Ativa" && r.embalagem === embalagem)
      .reduce((sum, r) => sum + (r.quantidade_pacotes || 0), 0);

    return Math.max(0, estoqueNaEmbalagem - reservadoNaEmbalagem);
  };

  useEffect(() => {
    const totalPct = cafesReservados.reduce((sum, c) => sum + (c.quantidade_pacotes || 0), 0);
    setTotalPacotes(totalPct);

    const totalWeightKg = cafesReservados.reduce((sum, c) => {
      const pesoUnitario = getPesoEmbalagem(c.embalagem || "250g");
      return sum + ((c.quantidade_pacotes || 0) * pesoUnitario);
    }, 0);
    setTotalKg(totalWeightKg.toFixed(3));
  }, [cafesReservados]);

  const handleAdicionarCafe = () => {
    setCafesReservados([...cafesReservados, {
      cafe_id: "",
      cafe_nome: "",
      cafe_forma: "",
      quantidade_pacotes: 0,
      embalagem: "250g",
      embalagens_disponiveis: ["250g"],
      estoque_por_embalagem: {}
    }]);
  };

  const handleRemoverCafe = (index) => {
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
        embalagens_disponiveis: embalagensDisponiveis,
        embalagem: embalagemAtual,
        quantidade_pacotes: 0,
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
    const disponivel = calcularDisponivel(cafeReserva.cafe_id, cafeReserva.embalagem);

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

    if (!formData.cliente_id) {
      alert("Por favor, selecione um cliente");
      return;
    }

    const cafesValidos = cafesReservados.filter(c => c.cafe_id && c.quantidade_pacotes > 0 && c.embalagem);

    if (cafesValidos.length === 0) {
      alert("Por favor, adicione pelo menos um café com quantidade e embalagem válidas");
      return;
    }

    for (const cafeReserva of cafesValidos) {
      const disponivel = calcularDisponivel(cafeReserva.cafe_id, cafeReserva.embalagem);
      if (cafeReserva.quantidade_pacotes > disponivel) {
        alert(`Estoque insuficiente para ${cafeReserva.cafe_nome} (${cafeReserva.embalagem})! Disponível: ${disponivel} pacotes.`);
        return;
      }
    }

    const cliente = clientes.find(c => c.id === formData.cliente_id);

    if (!cliente) {
      alert("Cliente não encontrado");
      return;
    }

    try {
      for (const cafeReserva of cafesValidos) {
        await ReservaCafe.create({
          cliente_id: cliente.id,
          cliente_nome: cliente.nome,
          cafe_id: cafeReserva.cafe_id,
          cafe_nome: cafeReserva.cafe_nome,
          cafe_forma: cafeReserva.cafe_forma,
          embalagem: cafeReserva.embalagem,
          quantidade_pacotes: cafeReserva.quantidade_pacotes,
          data_reserva: formData.data_reserva || new Date().toISOString().split('T')[0],
          status: "Ativa",
          observacoes: formData.observacoes
        });
      }

      alert(`${cafesValidos.length} reserva(s) criada(s) com sucesso!`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao criar reservas:", error);
      alert("Erro ao criar reservas. Tente novamente.");
    }
  };

  const cafesDisponiveis = cafes || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
            <Package className="w-6 h-6" />
            Nova Reserva {cafe ? `- ${cafe.nome}` : ''}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
              required
            >
              <SelectTrigger className="border-[#E5DCC8]">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} {cliente.localizacao ? `(${cliente.localizacao})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Cafés a Reservar *</Label>
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
                <Package className="w-12 h-12 text-[#8B7355] mx-auto mb-2 opacity-30" />
                <p className="text-[#8B7355] text-sm">Clique em "Adicionar Café" para começar</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {cafesReservados.map((cafeReserva, index) => {
                  const disponivel = cafeReserva.cafe_id && cafeReserva.embalagem
                    ? calcularDisponivel(cafeReserva.cafe_id, cafeReserva.embalagem)
                    : 0;
                  const disponivelKg = disponivel > 0
                    ? (disponivel * getPesoEmbalagem(cafeReserva.embalagem)).toFixed(3)
                    : "0.000";

                  const estoquePorEmbalagem = cafeReserva.estoque_por_embalagem || {};

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
                            value={cafeReserva.cafe_id}
                            onValueChange={(value) => handleCafeChange(index, value)}
                            required
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

                        {cafeReserva.cafe_id && (
                          <>
                            {/* Mostrar embalagens disponíveis */}
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                              <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Embalagens Disponíveis para este café:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(cafeReserva.embalagens_disponiveis || ["250g"]).map((emb) => {
                                  const estoqueEmb = estoquePorEmbalagem[emb] || 0;
                                  const reservadoEmb = reservasAtivas
                                    .filter(r => r.cafe_id === cafeReserva.cafe_id && r.embalagem === emb && r.status === "Ativa")
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
                                  value={cafeReserva.embalagem || "250g"}
                                  onValueChange={(value) => handleEmbalagemChange(index, value)}
                                  disabled={!cafeReserva.cafe_id}
                                  required
                                >
                                  <SelectTrigger className="border-[#E5DCC8] bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(cafeReserva.embalagens_disponiveis || ["250g"]).map((emb) => (
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
                                  min="0"
                                  max={disponivel}
                                  value={cafeReserva.quantidade_pacotes || ""}
                                  onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                                  required
                                  disabled={!cafeReserva.cafe_id || !cafeReserva.embalagem}
                                  className="border-[#E5DCC8] bg-white"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {cafeReserva.cafe_id && cafeReserva.embalagem && (
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
                          {cafeReserva.quantidade_pacotes > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#8B7355]">Esta reserva:</span>
                              <Badge variant="outline" className="bg-white">
                                {(cafeReserva.quantidade_pacotes * getPesoEmbalagem(cafeReserva.embalagem)).toFixed(3)} kg
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
              disabled={cafesReservados.length === 0 || !formData.cliente_id || totalPacotes === 0}
            >
              Criar Reserva{cafesReservados.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}