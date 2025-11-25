
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
import { Badge } from "@/components/ui/badge";
import { Package, X, Scale, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CafeFormModal({ open, onClose, onSave, cafe }) {
  const [formData, setFormData] = useState({
    nome: "",
    forma: "Grão",
    estoque_por_embalagem: { // New field, initializes to empty stock
      "10g": 0,
      "18g": 0,
      "100g": 0,
      "250g": 0,
      "500g": 0,
      "1kg": 0
    },
    embalagens_disponiveis: ["250g"],
    localizacao: "Vila Velha",
    data_entrada: new Date().toISOString().split('T')[0], // Default to today's date
    observacoes: "",
    is_private_label: false, // New field
    precos_private_label: { // Changed to object for per-embalagem prices
      "10g": 0,
      "18g": 0,
      "100g": 0,
      "250g": 0,
      "500g": 0,
      "1kg": 0
    },
    descricao_private_label: "", // New field
    notas_degustacao: "", // New field
    origem: "", // New field
    torra: "" // New field
  });

  const [modoEstoque, setModoEstoque] = useState("pacotes");
  const [quantidadeKg, setQuantidadeKg] = useState(0);
  const [quantidadePacotes, setQuantidadePacotes] = useState(0);
  const [embalagemEstoque, setEmbalagemEstoque] = useState("250g");

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
    if (cafe) {
      setFormData({
        ...cafe,
        embalagens_disponiveis: cafe.embalagens_disponiveis || ["250g"],
        // Ensure new fields have default values if not present in cafe object
        estoque_por_embalagem: cafe.estoque_por_embalagem || { "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0 },
        is_private_label: cafe.is_private_label ?? false,
        precos_private_label: cafe.precos_private_label || { "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0 },
        descricao_private_label: cafe.descricao_private_label || "",
        notas_degustacao: cafe.notas_degustacao || "",
        origem: cafe.origem || "",
        torra: cafe.torra || ""
      });
      // Reset initial stock helper states when editing, as they are not relevant to existing stock
      setQuantidadePacotes(0);
      setQuantidadeKg(0);
      setEmbalagemEstoque("250g");
      setModoEstoque("pacotes"); // Resetting to default view
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        nome: "",
        forma: "Grão",
        estoque_por_embalagem: { "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0 },
        embalagens_disponiveis: ["250g"],
        localizacao: "Vila Velha",
        data_entrada: today,
        observacoes: "",
        is_private_label: false,
        precos_private_label: { "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0 },
        descricao_private_label: "",
        notas_degustacao: "",
        origem: "",
        torra: ""
      });
      // Also reset initial stock helper states for new cafe creation
      setQuantidadePacotes(0);
      setQuantidadeKg(0);
      setEmbalagemEstoque("250g");
      setModoEstoque("pacotes");
    }
  }, [cafe, open]);

  const calcularPacotesPorKg = () => {
    if (quantidadeKg <= 0) return 0;
    const pesoEmbalagem = getPesoEmbalagem(embalagemEstoque);
    return Math.floor(quantidadeKg / pesoEmbalagem);
  };

  const handleToggleEmbalagem = (embalagem) => {
    const current = formData.embalagens_disponiveis || [];
    
    if (current.includes(embalagem)) {
      if (current.length === 1) {
        alert("Deve haver pelo menos uma embalagem disponível");
        return;
      }
      setFormData({
        ...formData,
        embalagens_disponiveis: current.filter(e => e !== embalagem)
      });
    } else {
      setFormData({
        ...formData,
        embalagens_disponiveis: [...current, embalagem]
      });
    }
  };

  const isEmbalagemSelecionada = (embalagem) => {
    return (formData.embalagens_disponiveis || []).includes(embalagem);
  };

  const handlePrecoEmbalagemChange = (embalagem, preco) => {
    setFormData({
      ...formData,
      precos_private_label: {
        ...formData.precos_private_label,
        [embalagem]: parseFloat(preco) || 0
      }
    });
  };

  const handleSubmit = async (e) => { // Added async as per outline
    e.preventDefault();
    
    if (!formData.embalagens_disponiveis || formData.embalagens_disponiveis.length === 0) {
      alert("Selecione pelo menos uma embalagem disponível");
      return;
    }

    let dadosParaSalvar = { ...formData };
    let initialStockDescription = ""; // To be added to observacoes if new cafe

    // For new cafes, populate estoque_por_embalagem from the initial stock helper states
    // and generate a description for observacoes
    if (!cafe) {
      let tempEstoquePorEmbalagem = {
        "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0
      };
      let pacotesCountForInitialStock = 0;

      if (modoEstoque === "pacotes" && quantidadePacotes > 0) {
        pacotesCountForInitialStock = quantidadePacotes;
        tempEstoquePorEmbalagem[embalagemEstoque] = pacotesCountForInitialStock;
        const kgTotal = pacotesCountForInitialStock * getPesoEmbalagem(embalagemEstoque);
        initialStockDescription = `Estoque inicial: ${pacotesCountForInitialStock}x ${embalagemEstoque} (${kgTotal.toFixed(3)} kg)`;
      } else if (modoEstoque === "kg" && quantidadeKg > 0) {
        pacotesCountForInitialStock = calcularPacotesPorKg(); // Uses quantidadeKg and embalagemEstoque
        tempEstoquePorEmbalagem[embalagemEstoque] = pacotesCountForInitialStock;
        const kgReal = pacotesCountForInitialStock * getPesoEmbalagem(embalagemEstoque);
        initialStockDescription = `Estoque inicial: ${pacotesCountForInitialStock}x ${embalagemEstoque} (${kgReal.toFixed(3)} kg de ${quantidadeKg} kg informados)`;
      }
      dadosParaSalvar.estoque_por_embalagem = tempEstoquePorEmbalagem;
      if (initialStockDescription) {
          dadosParaSalvar.observacoes = initialStockDescription + (formData.observacoes ? `\n${formData.observacoes}` : '');
      }
    }
    
    // Calculate total_kg from the determined estoque_por_embalagem (either from existing cafe or newly formed initial stock)
    const totalKgFromStock = Object.entries(dadosParaSalvar.estoque_por_embalagem).reduce((sum, [emb, qtd]) => {
      const peso = getPesoEmbalagem(emb);
      return sum + (qtd * peso);
    }, 0);
    
    // Calculate quantidade_pacotes as total 250g equivalents (rounded up as per original logic)
    const quantidade_pacotes_total = Math.ceil(totalKgFromStock / 0.25);
    dadosParaSalvar.quantidade_pacotes = quantidade_pacotes_total;
    
    await onSave(dadosParaSalvar); // Added await as per outline
  };

  const pacotesCalculados = modoEstoque === "kg" ? calcularPacotesPorKg() : quantidadePacotes;
  const kgCalculado = pacotesCalculados * getPesoEmbalagem(embalagemEstoque);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            {cafe ? "Editar Café" : "Novo Café"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4"> {/* Wrapped inputs in a grid */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Café *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="border-[#E5DCC8]"
                placeholder="Ex: Amendoado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma">Forma *</Label>
              <Select
                value={formData.forma}
                onValueChange={(value) => setFormData({ ...formData, forma: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grão">Em Grão</SelectItem>
                  <SelectItem value="Moído">Moído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estoque Inicial - Apenas para novos cafés */}
          {!cafe && (
            <div className="space-y-4 p-4 bg-[#F5F1E8] rounded-lg">
              <Label className="text-base font-semibold text-[#6B4423]">
                Estoque Inicial (Opcional)
              </Label>
              <p className="text-xs text-[#8B7355]">
                Adicione o estoque inicial do café ou deixe em branco para adicionar depois
              </p>

              <Tabs value={modoEstoque} onValueChange={setModoEstoque} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white">
                  <TabsTrigger value="pacotes" className="gap-2">
                    <Package className="w-4 h-4" />
                    Por Pacotes
                  </TabsTrigger>
                  <TabsTrigger value="kg" className="gap-2">
                    <Scale className="w-4 h-4" />
                    Por Peso (KG)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pacotes" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="embalagem_estoque">Embalagem</Label>
                      <Select
                        value={embalagemEstoque}
                        onValueChange={setEmbalagemEstoque}
                      >
                        <SelectTrigger className="border-[#E5DCC8] bg-white">
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
                      <Label htmlFor="qtd_pacotes_estoque">Quantidade</Label>
                      <Input
                        id="qtd_pacotes_estoque"
                        type="number"
                        step="1"
                        min="0"
                        value={quantidadePacotes || ""}
                        onChange={(e) => setQuantidadePacotes(parseInt(e.target.value) || 0)}
                        className="border-[#E5DCC8] bg-white"
                        placeholder="Ex: 100"
                      />
                    </div>
                  </div>

                  {quantidadePacotes > 0 && (
                    <div className="bg-white p-3 rounded-lg border border-[#E5DCC8]">
                      <p className="text-xs text-[#8B7355] mb-1">Será adicionado:</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#2D5016] text-white">
                          {quantidadePacotes}x {embalagemEstoque}
                        </Badge>
                        <span className="text-xs text-[#8B7355]">
                          = {kgCalculado.toFixed(3)} kg
                        </span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="kg" className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="embalagem_estoque_kg">Embalagem</Label>
                    <Select
                      value={embalagemEstoque}
                      onValueChange={setEmbalagemEstoque}
                    >
                      <SelectTrigger className="border-[#E5DCC8] bg-white">
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
                      Cada pacote de {embalagemEstoque} = {(getPesoEmbalagem(embalagemEstoque) * 1000).toFixed(0)}g
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qtd_kg_estoque">Peso Total (KG)</Label>
                    <Input
                      id="qtd_kg_estoque"
                      type="number"
                      step="0.001"
                      min="0"
                      value={quantidadeKg || ""}
                      onChange={(e) => setQuantidadeKg(parseFloat(e.target.value) || 0)}
                      className="border-[#E5DCC8] bg-white"
                      placeholder="Ex: 5.5"
                    />
                  </div>

                  {quantidadeKg > 0 && (
                    <div className="bg-white p-3 rounded-lg border border-[#E5DCC8]">
                      <p className="text-xs text-[#8B7355] mb-2">Conversão:</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-[#F5F1E8]">
                          {quantidadeKg.toFixed(3)} kg
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-[#8B7355]" />
                        <Badge className="bg-[#2D5016] text-white">
                          {pacotesCalculados}x {embalagemEstoque}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#8B7355] mt-2">
                        = {kgCalculado.toFixed(3)} kg aproveitados
                        {quantidadeKg - kgCalculado > 0.001 && (
                          <span className="text-orange-600"> (sobra: {(quantidadeKg - kgCalculado).toFixed(3)} kg)</span>
                        )}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Seleção de Embalagens Disponíveis */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Embalagens Disponíveis para este Café *
            </Label>
            <p className="text-xs text-[#8B7355]">
              Selecione quais embalagens estarão disponíveis quando os clientes fizerem reservas
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {opcoesEmbalagem.map((opcao) => (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => handleToggleEmbalagem(opcao.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isEmbalagemSelecionada(opcao.value)
                      ? 'border-[#6B4423] bg-[#6B4423]/10 text-[#6B4423] font-semibold'
                      : 'border-[#E5DCC8] hover:border-[#C9A961] text-[#8B7355]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{opcao.label}</span>
                    {isEmbalagemSelecionada(opcao.value) && (
                      <Badge className="bg-[#2D5016] text-white text-xs">✓</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[#F5F1E8] p-3 rounded-lg">
              <p className="text-xs font-semibold text-[#6B4423] mb-2">
                Embalagens selecionadas ({formData.embalagens_disponiveis?.length || 0}):
              </p>
              <div className="flex flex-wrap gap-1">
                {(formData.embalagens_disponiveis || []).map((emb) => (
                  <Badge key={emb} variant="outline" className="bg-white">
                    {emb}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4"> {/* Wrapped inputs in a grid */}
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização *</Label>
              <Select
                value={formData.localizacao}
                onValueChange={(value) => setFormData({ ...formData, localizacao: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vila Velha">Vila Velha</SelectItem>
                  <SelectItem value="Venda Nova">Venda Nova</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_entrada">Data de Entrada</Label>
              <Input
                id="data_entrada"
                type="date"
                value={formData.data_entrada}
                onChange={(e) => setFormData({ ...formData, data_entrada: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          {/* Nova Seção: Private Label */}
          <div className="border-t border-[#E5DCC8] pt-5">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="is_private_label"
                checked={formData.is_private_label}
                onChange={(e) => setFormData({ ...formData, is_private_label: e.target.checked })}
                className="w-4 h-4 text-[#6B4423] rounded accent-[#6B4423]" // Added accent for styling checkbox
              />
              <Label htmlFor="is_private_label" className="cursor-pointer font-semibold text-[#6B4423]">
                ✨ Este café faz parte da linha Private Label
              </Label>
            </div>

            {formData.is_private_label && (
              <div className="space-y-4 bg-[#F5F1E8] p-4 rounded-lg">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Dica:</strong> Os preços serão definidos apenas para as embalagens que você selecionou como disponíveis acima.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-[#6B4423]">
                    💰 Preços por Embalagem *
                  </Label>
                  <p className="text-xs text-[#8B7355]">
                    Defina o preço para cada embalagem disponível
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(formData.embalagens_disponiveis || []).map((embalagem) => {
                      const opcao = opcoesEmbalagem.find(o => o.value === embalagem);
                      return (
                        <div key={embalagem} className="bg-white p-3 rounded-lg border border-[#E5DCC8]">
                          <Label htmlFor={`preco_${embalagem}`} className="text-sm font-medium text-[#6B4423] mb-2 block">
                            {opcao?.label || embalagem}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-[#8B7355]">R$</span>
                            <Input
                              id={`preco_${embalagem}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.precos_private_label?.[embalagem] || ""}
                              onChange={(e) => handlePrecoEmbalagemChange(embalagem, e.target.value)}
                              required={formData.is_private_label}
                              className="border-[#E5DCC8]"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {formData.embalagens_disponiveis && formData.embalagens_disponiveis.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Selecione pelo menos uma embalagem disponível acima para definir preços
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="torra">Nível de Torra</Label>
                    <Select
                      value={formData.torra}
                      onValueChange={(value) => setFormData({ ...formData, torra: value })}
                    >
                      <SelectTrigger className="border-[#E5DCC8] bg-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clara">Clara</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Escura">Escura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origem">Origem</Label>
                    <Input
                      id="origem"
                      value={formData.origem}
                      onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                      className="border-[#E5DCC8] bg-white"
                      placeholder="Ex: Minas Gerais, ES"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas_degustacao">Notas de Degustação</Label>
                  <Input
                    id="notas_degustacao"
                    value={formData.notas_degustacao}
                    onChange={(e) => setFormData({ ...formData, notas_degustacao: e.target.value })}
                    className="border-[#E5DCC8] bg-white"
                    placeholder="Ex: Chocolate, Caramelo, Frutas Vermelhas"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao_private_label">Descrição (para tabela pública)</Label>
                  <Textarea
                    id="descricao_private_label"
                    value={formData.descricao_private_label}
                    onChange={(e) => setFormData({ ...formData, descricao_private_label: e.target.value })}
                    className="border-[#E5DCC8] bg-white"
                    rows={3}
                    placeholder="Descrição que aparecerá na tabela pública de preços..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              {cafe ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
