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
import { Package, Plus, TrendingUp, Scale, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdicionarEstoqueModal({ open, onClose, cafe, onSave }) {
  const [modoEntrada, setModoEntrada] = useState("pacotes");
  const [quantidadeKg, setQuantidadeKg] = useState(0);
  const [quantidadePacotes, setQuantidadePacotes] = useState(0);
  const [embalagemSelecionada, setEmbalagemSelecionada] = useState("250g");
  const [dataEntrada, setDataEntrada] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const opcoesEmbalagem = [
    { value: "10g", label: "10g (Drip Individual)", peso: 0.01 },
    { value: "18g", label: "18g (Drip Premium)", peso: 0.018 },
    { value: "100g", label: "100g", peso: 0.1 },
    { value: "250g", label: "250g (Padrão)", peso: 0.25 },
    { value: "500g", label: "500g", peso: 0.5 },
    { value: "1kg", label: "1kg", peso: 1 }
  ];

  const getPesoEmbalagem = (embalagem) => {
    const opcao = opcoesEmbalagem.find(e => e.value === embalagem);
    return opcao ? opcao.peso : 0.25;
  };

  useEffect(() => {
    if (open && cafe) {
      const today = new Date().toISOString().split('T')[0];
      setDataEntrada(today);
      setQuantidadeKg(0);
      setQuantidadePacotes(0);
      setEmbalagemSelecionada("250g");
      setObservacoes("");
      setModoEntrada("pacotes");
    }
  }, [open, cafe]);

  // Calcular quantos pacotes da embalagem selecionada cabem no peso informado
  const calcularPacotesPorKg = () => {
    if (quantidadeKg <= 0) return 0;
    const pesoEmbalagem = getPesoEmbalagem(embalagemSelecionada);
    return Math.floor(quantidadeKg / pesoEmbalagem);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let pacotesParaAdicionar = 0;
    let detalheEntrada = "";

    if (modoEntrada === "kg") {
      pacotesParaAdicionar = calcularPacotesPorKg();
      if (pacotesParaAdicionar <= 0) {
        alert("A quantidade deve ser maior que zero");
        return;
      }
      const kgReal = pacotesParaAdicionar * getPesoEmbalagem(embalagemSelecionada);
      detalheEntrada = `Entrada: ${pacotesParaAdicionar}x ${embalagemSelecionada} (${kgReal.toFixed(3)} kg de ${quantidadeKg} kg informados)`;
    } else {
      pacotesParaAdicionar = quantidadePacotes;
      if (pacotesParaAdicionar <= 0) {
        alert("A quantidade deve ser maior que zero");
        return;
      }
      const kgTotal = pacotesParaAdicionar * getPesoEmbalagem(embalagemSelecionada);
      detalheEntrada = `Entrada: ${pacotesParaAdicionar}x ${embalagemSelecionada} (${kgTotal.toFixed(3)} kg)`;
    }

    // Atualizar estoque por embalagem
    const estoqueAtual = cafe.estoque_por_embalagem || {
      "10g": 0,
      "18g": 0,
      "100g": 0,
      "250g": 0,
      "500g": 0,
      "1kg": 0
    };

    const novoEstoquePorEmbalagem = {
      ...estoqueAtual,
      [embalagemSelecionada]: (estoqueAtual[embalagemSelecionada] || 0) + pacotesParaAdicionar
    };

    // Calcular total em pacotes de 250g para quantidade_pacotes
    const totalPacotes250g = Object.entries(novoEstoquePorEmbalagem).reduce((sum, [emb, qtd]) => {
      const pesoEmKg = qtd * getPesoEmbalagem(emb);
      return sum + Math.ceil(pesoEmKg / 0.25);
    }, 0);

    onSave({
      ...cafe,
      estoque_por_embalagem: novoEstoquePorEmbalagem,
      quantidade_pacotes: totalPacotes250g,
      data_entrada: dataEntrada,
      observacoes: observacoes 
        ? `${cafe.observacoes || ''}\n[${new Date().toLocaleDateString('pt-BR')}] ${detalheEntrada}: ${observacoes}`.trim()
        : `${cafe.observacoes || ''}\n[${new Date().toLocaleDateString('pt-BR')}] ${detalheEntrada}`.trim()
    });
  };

  if (!cafe) return null;

  const estoqueAtual = cafe.estoque_por_embalagem || {
    "10g": 0,
    "18g": 0,
    "100g": 0,
    "250g": 0,
    "500g": 0,
    "1kg": 0
  };

  const pacotesCalculados = modoEntrada === "kg" ? calcularPacotesPorKg() : quantidadePacotes;
  const kgCalculado = pacotesCalculados * getPesoEmbalagem(embalagemSelecionada);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Adicionar Estoque
          </DialogTitle>
        </DialogHeader>

        <div className="bg-[#F5F1E8] p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-[#6B4423]" />
            <div>
              <p className="font-bold text-[#6B4423]">{cafe.nome}</p>
              <Badge variant="outline" className="bg-white mt-1">
                {cafe.forma}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#6B4423]">Estoque Atual por Embalagem:</p>
            <div className="grid grid-cols-3 gap-2">
              {opcoesEmbalagem.map((opcao) => {
                const qtd = estoqueAtual[opcao.value] || 0;
                const kgEmbalagem = (qtd * opcao.peso).toFixed(3);
                return (
                  <div key={opcao.value} className="bg-white p-2 rounded text-center">
                    <p className="text-xs text-[#8B7355]">{opcao.value}</p>
                    <p className="font-bold text-[#6B4423]">{qtd}</p>
                    <p className="text-[10px] text-[#8B7355]">{kgEmbalagem} kg</p>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-gradient-to-br from-[#2D5016]/10 to-[#3D6B1F]/10 p-3 rounded mt-2">
              <p className="text-xs text-[#8B7355] mb-1">Total Geral</p>
              <p className="font-bold text-[#2D5016] text-lg">
                {cafe.quantidade_pacotes || 0} pacotes (250g)
              </p>
              <p className="text-xs text-[#8B7355]">
                {((cafe.quantidade_pacotes || 0) * 0.25).toFixed(2)} kg
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={modoEntrada} onValueChange={setModoEntrada} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#F5F1E8]">
              <TabsTrigger value="pacotes" className="gap-2">
                <Package className="w-4 h-4" />
                Por Pacotes
              </TabsTrigger>
              <TabsTrigger value="kg" className="gap-2">
                <Scale className="w-4 h-4" />
                Por Peso (KG)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pacotes" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="embalagem">Tipo de Embalagem *</Label>
                  <Select
                    value={embalagemSelecionada}
                    onValueChange={setEmbalagemSelecionada}
                  >
                    <SelectTrigger className="border-[#E5DCC8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoesEmbalagem.map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade_pacotes">Quantidade de Pacotes *</Label>
                  <Input
                    id="quantidade_pacotes"
                    type="number"
                    step="1"
                    min="1"
                    value={quantidadePacotes || ""}
                    onChange={(e) => setQuantidadePacotes(parseInt(e.target.value) || 0)}
                    required
                    className="border-[#E5DCC8]"
                    placeholder="Ex: 100"
                  />
                </div>
              </div>

              {quantidadePacotes > 0 && (
                <div className="bg-gradient-to-r from-[#2D5016]/10 to-[#3D6B1F]/10 p-4 rounded-lg border border-[#2D5016]/20">
                  <p className="text-sm font-semibold text-[#6B4423] mb-2">Será adicionado:</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#2D5016] text-white text-base px-4 py-2">
                      {quantidadePacotes}x {embalagemSelecionada}
                    </Badge>
                    <span className="text-sm text-[#8B7355]">
                      = {kgCalculado.toFixed(3)} kg
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="kg" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="embalagem_kg">Tipo de Embalagem *</Label>
                <Select
                  value={embalagemSelecionada}
                  onValueChange={setEmbalagemSelecionada}
                >
                  <SelectTrigger className="border-[#E5DCC8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opcoesEmbalagem.map((opcao) => (
                      <SelectItem key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#8B7355]">
                  Cada pacote de {embalagemSelecionada} = {(getPesoEmbalagem(embalagemSelecionada) * 1000).toFixed(0)}g
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_kg">Peso Total Recebido (KG) *</Label>
                <Input
                  id="quantidade_kg"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={quantidadeKg || ""}
                  onChange={(e) => setQuantidadeKg(parseFloat(e.target.value) || 0)}
                  required
                  className="border-[#E5DCC8]"
                  placeholder="Ex: 5.5"
                />
              </div>

              {quantidadeKg > 0 && (
                <div className="bg-gradient-to-r from-[#2D5016]/10 to-[#3D6B1F]/10 p-4 rounded-lg border border-[#2D5016]/20">
                  <p className="text-sm font-semibold text-[#6B4423] mb-3">Conversão Automática:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white text-[#6B4423] border border-[#E5DCC8]">
                        {quantidadeKg.toFixed(3)} kg
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-[#8B7355]" />
                      <Badge className="bg-[#2D5016] text-white text-base px-4 py-2">
                        {pacotesCalculados}x {embalagemSelecionada}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#8B7355] pl-2">
                      = {kgCalculado.toFixed(3)} kg aproveitados
                      {quantidadeKg - kgCalculado > 0.001 && (
                        <span className="text-orange-600"> (sobra: {(quantidadeKg - kgCalculado).toFixed(3)} kg)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="data">Data de Entrada *</Label>
            <Input
              id="data"
              type="date"
              value={dataEntrada}
              onChange={(e) => setDataEntrada(e.target.value)}
              required
              className="border-[#E5DCC8]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="border-[#E5DCC8]"
              rows={3}
              placeholder="Lote, fornecedor, notas sobre esta entrada..."
            />
            <p className="text-xs text-[#8B7355]">
              💡 Esta informação será adicionada ao histórico de observações do café
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#2D5016] hover:bg-[#1F3A0F] text-white"
              disabled={pacotesCalculados <= 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar ao Estoque
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}