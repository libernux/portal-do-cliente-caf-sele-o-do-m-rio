
import React, { useState, useEffect } from "react";
import { ClienteSlug } from "@/entities/ClienteSlug";
import { Cliente } from "@/entities/Cliente";
import { Cafe } from "@/entities/Cafe";
import { SolicitacaoEvento } from "@/entities/SolicitacaoEvento";
import { PrecoCafe } from "@/entities/PrecoCafe";
import { ReservaCafe } from "@/entities/ReservaCafe"; // New import for active reservations
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
import { Coffee, Plus, Trash2, CheckCircle, Package, Mail, Phone, User, MapPin, Calendar, Users, Clock, TrendingUp, Percent, Calculator, Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReservaPublica() {
  const [clienteSlug, setClienteSlug] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [precosCafe, setPrecosCafe] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [step, setStep] = useState(1);
  const [tipoSolicitacao, setTipoSolicitacao] = useState("Evento");

  const [formData, setFormData] = useState({
    data_evento: "",
    local_evento: "",
    observacoes: ""
  });

  // Dados da calculadora para EVENTOS
  const [calcDataEvento, setCalcDataEvento] = useState({
    pessoas_por_dia: 100,
    dias_evento: 1,
    taxa_adesao: 60,
    horas_por_dia: 8,
    ml_por_copo: 70,
    fator_perdas: 10
  });

  // Dados da calculadora para USO INTERNO
  const [calcDataInterno, setCalcDataInterno] = useState({
    quantidade_funcionarios: 10,
    dias_uso: 30,
    xicaras_por_dia: 3, // NOVO: quantidade média de xícaras por pessoa
    tamanho_xicara: 100,
    fator_perdas: 10
  });

  const [resultados, setResultados] = useState({
    publico_total: 0,
    consumidores_esperados: 0,
    kg_total: 0,
    pacotes_250g: 0,
    kg_por_dia: 0,
    kg_por_hora: 0
  });

  const [cafesReservados, setCafesReservados] = useState([]);
  const [totalPacotesSelecionados, setTotalPacotesSelecionados] = useState(0); // This will represent total equivalent 250g packages
  const [totalValor, setTotalValor] = useState(0); // New state
  const [reservasAtivas, setReservasAtivas] = useState([]); // New state for active reservations

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tipoSolicitacao === "Evento") {
      calcularEvento();
    } else {
      calcularInterno();
    }
  }, [calcDataEvento, calcDataInterno, tipoSolicitacao]);

  // Updated useEffect for totalPacotesSelecionados (now representing total KG in 250g equivalents)
  useEffect(() => {
    const totalKgSelected = cafesReservados.reduce((sum, c) => {
      const pesoEmbalagem = getPesoEmbalagem(c.embalagem || "250g"); // Default to 250g if not set
      return sum + ((c.quantidade_pacotes || 0) * pesoEmbalagem);
    }, 0);
    // Convert total KG back to equivalent 250g packages for comparison with results.pacotes_250g
    setTotalPacotesSelecionados(Math.round(totalKgSelected / 0.25));
  }, [cafesReservados]);

  // Updated useEffect for total value
  useEffect(() => {
    if (clienteSlug?.mostrar_precos) {
      const total = cafesReservados.reduce((sum, c) => {
        const precoPor250g = precosCafe[c.cafe_id] || 0; // Price assumed for a 250g package
        const pesoEmbalagem = getPesoEmbalagem(c.embalagem || "250g");
        // Calculate equivalent 250g packages for the current item
        const equivalent250gPackages = (c.quantidade_pacotes || 0) * (pesoEmbalagem / 0.25);
        return sum + (precoPor250g * equivalent250gPackages);
      }, 0);
      setTotalValor(total);
    }
  }, [cafesReservados, precosCafe, clienteSlug]);

  const loadData = async () => {
    setIsLoading(true);

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('cliente');

    try {
      const [cafesData, reservasData] = await Promise.all([
        Cafe.list(),
        ReservaCafe.filter({ status: "Ativa" }) // Fetch active reservations
      ]);

      setCafes(cafesData);
      setReservasAtivas(reservasData); // Store active reservations

      if (slug) {
        const slugsData = await ClienteSlug.filter({ slug: slug, ativo: true });
        if (slugsData && slugsData.length > 0) {
          const clienteSlugData = slugsData[0];
          setClienteSlug(clienteSlugData);

          // Carregar preços se configurado
          if (clienteSlugData.mostrar_precos) {
            const precosData = await PrecoCafe.filter({
              cliente_id: clienteSlugData.cliente_id,
              ativo: true
            });

            // Criar mapa de preços por cafe_id (assuming price is per 250g package)
            const precosMap = {};
            precosData.forEach(p => {
              precosMap[p.cafe_id] = p.preco_por_pacote;
            });
            setPrecosCafe(precosMap);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }

    setIsLoading(false);
  };

  const calcularEvento = () => {
    const { pessoas_por_dia, dias_evento, taxa_adesao, horas_por_dia, ml_por_copo, fator_perdas } = calcDataEvento;

    const publico_total = pessoas_por_dia * dias_evento;
    const consumidores_esperados = Math.round(publico_total * (taxa_adesao / 100));
    const gramas_por_copo = ml_por_copo / 10;
    const gramas_totais = consumidores_esperados * gramas_por_copo * (1 + fator_perdas / 100);
    const kg_total = gramas_totais / 1000;
    const kg_por_dia = kg_total / dias_evento;
    const kg_por_hora = kg_por_dia / horas_por_dia;
    const pacotes_250g = Math.ceil(kg_total / 0.25);

    setResultados({
      publico_total,
      consumidores_esperados,
      kg_total: parseFloat(kg_total.toFixed(2)),
      pacotes_250g,
      kg_por_dia: parseFloat(kg_por_dia.toFixed(2)),
      kg_por_hora: parseFloat(kg_por_hora.toFixed(3))
    });
  };

  const calcularInterno = () => {
    const { quantidade_funcionarios, dias_uso, xicaras_por_dia, tamanho_xicara, fator_perdas } = calcDataInterno;

    // Calcular ML diários por funcionário
    const ml_diarios_por_funcionario = xicaras_por_dia * tamanho_xicara;

    // Total de ML necessário
    const ml_totais = quantidade_funcionarios * dias_uso * ml_diarios_por_funcionario;

    // Converter ML para gramas (10ml = 1g)
    const gramas_totais = (ml_totais / 10) * (1 + fator_perdas / 100);

    // Converter para kg
    const kg_total = gramas_totais / 1000;
    const kg_por_dia = kg_total / dias_uso;
    const pacotes_250g = Math.ceil(kg_total / 0.25);

    setResultados({
      publico_total: quantidade_funcionarios * dias_uso, // Total de consumos
      consumidores_esperados: quantidade_funcionarios,
      kg_total: parseFloat(kg_total.toFixed(2)),
      pacotes_250g,
      kg_por_dia: parseFloat(kg_por_dia.toFixed(2)),
      kg_por_hora: 0
    });
  };

  const handleCalcChangeEvento = (field, value) => {
    setCalcDataEvento(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleCalcChangeInterno = (field, value) => {
    setCalcDataInterno(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const getPesoEmbalagem = (embalagem) => {
    const pesos = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1
    };
    return pesos[embalagem] || 0.25; // Default to 0.25kg (250g)
  };

  const calcularDisponivel = (cafeId, embalagem) => {
    const cafe = cafes.find(c => c.id === cafeId);
    if (!cafe) return 0;

    const pesoEmbalagem = getPesoEmbalagem(embalagem); // e.g., 0.25 for 250g
    
    // Cafe stock is typically stored as 250g packages. Convert to kg.
    // Assuming cafe.quantidade_pacotes refers to total 250g packages in stock.
    const estoqueTotalKg = (cafe.quantidade_pacotes || 0) * 0.25;

    // Calculate total reserved in kg for this specific cafe by active reservations
    const reservadoKg = reservasAtivas
      .filter(r => r.cafe_id === cafeId)
      .reduce((sum, r) => {
        const pesoReservaEmbalagem = getPesoEmbalagem(r.embalagem || "250g");
        return sum + ((r.quantidade_pacotes || 0) * pesoReservaEmbalagem);
      }, 0);

    const disponivelKg = estoqueTotalKg - reservadoKg;
    
    // Convert available kg back to the requested embalagem type packages
    // Use Math.floor to ensure we only count full packages
    const disponivelPacotes = Math.floor(disponivelKg / pesoEmbalagem);

    return Math.max(0, disponivelPacotes); // Ensure it's not negative
  };

  const handleProximoPasso = () => {
    if (!clienteSlug) {
      alert("Link inválido ou inativo. Entre em contato com o fornecedor.");
      return;
    }

    if (!formData.data_evento || !formData.local_evento) {
      alert("Por favor, preencha a data e o local");
      return;
    }

    if (tipoSolicitacao === "Evento" && calcDataEvento.pessoas_por_dia < 1) {
      alert("Por favor, configure a expectativa de pessoas por dia");
      return;
    }

    if (tipoSolicitacao === "Interno" && calcDataInterno.quantidade_funcionarios < 1) {
      alert("Por favor, configure a quantidade de funcionários");
      return;
    }

    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleAdicionarCafe = () => {
    setCafesReservados([...cafesReservados, {
      cafe_id: "",
      cafe_nome: "",
      cafe_forma: "",
      embalagem: "250g", // Default embalagem
      quantidade_pacotes: 0,
      embalagens_disponiveis: ["250g"] // Default available, will be updated on selection
    }]);
  };

  const handleRemoverCafe = (index) => {
    setCafesReservados(cafesReservados.filter((_, i) => i !== index));
  };

  const handleCafeChange = (index, cafeId) => {
    const selectedCafe = cafes.find(c => c.id === cafeId);
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
        quantidade_pacotes: 0 // Reset quantity when cafe changes
      };
      setCafesReservados(newCafes);
    }
  };

  const handleEmbalagemChange = (index, embalagem) => {
    const newCafes = [...cafesReservados];
    newCafes[index] = {
      ...newCafes[index],
      embalagem: embalagem,
      quantidade_pacotes: 0 // Reset quantity when packaging changes
    };
    setCafesReservados(newCafes);
  };

  const handleQuantidadeChange = (index, quantidade) => {
    const newCafes = [...cafesReservados];
    const cafeReserva = newCafes[index];
    
    const qtd = parseFloat(quantidade) || 0;
    
    // Only calculate available if a cafe and packaging are selected
    const disponivel = cafeReserva.cafe_id && cafeReserva.embalagem 
      ? calcularDisponivel(cafeReserva.cafe_id, cafeReserva.embalagem)
      : 0; 

    // Limit to available stock
    const quantidadeFinal = Math.min(qtd, disponivel);

    newCafes[index] = {
      ...newCafes[index],
      quantidade_pacotes: quantidadeFinal
    };
    setCafesReservados(newCafes);

    // Show warning if tried to exceed and valid cafe/embalagem selected
    if (cafeReserva.cafe_id && cafeReserva.embalagem && qtd > disponivel) {
      alert(`Estoque insuficiente para ${cafeReserva.cafe_nome} (${cafeReserva.embalagem})! Disponível: ${disponivel} pacotes.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteSlug) {
      alert("Link inválido");
      return;
    }

    const cafesValidos = cafesReservados.filter(c => c.cafe_id && c.quantidade_pacotes > 0 && c.embalagem).map(c => ({
      cafe_id: c.cafe_id,
      cafe_nome: c.cafe_nome,
      cafe_forma: c.cafe_forma,
      quantidade_pacotes: c.quantidade_pacotes,
      embalagem: c.embalagem // Include embalagem
    }));

    if (cafesValidos.length === 0) {
      alert("Por favor, adicione pelo menos um café com quantidade válida");
      return;
    }

    // Validate stock availability BEFORE submission
    for (const cafeReserva of cafesValidos) {
      const disponivel = calcularDisponivel(cafeReserva.cafe_id, cafeReserva.embalagem);
      if (cafeReserva.quantidade_pacotes > disponivel) {
        alert(`Estoque insuficiente para ${cafeReserva.cafe_nome} (${cafeReserva.embalagem})! Disponível: ${disponivel} pacotes.`);
        return; // Prevent submission
      }
    }

    try {
      const clienteData = await Cliente.filter({ id: clienteSlug.cliente_id });
      const cliente = clienteData[0];

      if (!cliente) {
        alert("Cliente não encontrado");
        return;
      }

      const dadosBase = {
        tipo_solicitacao: tipoSolicitacao,
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        email_cliente: cliente.email || "",
        telefone_cliente: cliente.telefone || "",
        data_evento: formData.data_evento,
        local_evento: formData.local_evento,
        kg_total_calculado: resultados.kg_total,
        pacotes_totais_calculados: resultados.pacotes_250g, // This is still the calculated 250g equivalent
        cafes_selecionados: cafesValidos,
        observacoes: formData.observacoes,
        status: "Pendente",
        valor_total: clienteSlug.mostrar_precos ? totalValor : null,
      };

      if (tipoSolicitacao === "Evento") {
        await SolicitacaoEvento.create({
          ...dadosBase,
          publico_total: resultados.publico_total,
          taxa_adesao: calcDataEvento.taxa_adesao,
          dias_evento: calcDataEvento.dias_evento,
          horas_por_dia: calcDataEvento.horas_por_dia,
          ml_por_copo: calcDataEvento.ml_por_copo,
          fator_perdas: calcDataEvento.fator_perdas,
          consumidores_esperados: resultados.consumidores_esperados
        });
      } else {
        // Salvar dados de uso interno
        const ml_diarios = calcDataInterno.xicaras_por_dia * calcDataInterno.tamanho_xicara;

        await SolicitacaoEvento.create({
          ...dadosBase,
          quantidade_funcionarios: calcDataInterno.quantidade_funcionarios,
          dias_evento: calcDataInterno.dias_uso,
          consumo_diario_ml: ml_diarios, // Calculado a partir de xícaras
          xicaras_por_dia: calcDataInterno.xicaras_por_dia, // Adicionado ao dados
          tamanho_xicara: calcDataInterno.tamanho_xicara,
          fator_perdas: calcDataInterno.fator_perdas,
          consumidores_esperados: calcDataInterno.quantidade_funcionarios
        });
      }

      setEnviado(true);

      setTimeout(() => {
        setFormData({
          data_evento: "",
          local_evento: "",
          observacoes: ""
        });
        setCalcDataEvento({
          pessoas_por_dia: 100,
          dias_evento: 1,
          taxa_adesao: 60,
          horas_por_dia: 8,
          ml_por_copo: 70,
          fator_perdas: 10
        });
        setCalcDataInterno({
          quantidade_funcionarios: 10,
          dias_uso: 30,
          xicaras_por_dia: 3,
          tamanho_xicara: 100,
          fator_perdas: 10
        });
        setCafesReservados([]);
        setStep(1);
        setEnviado(false);
        setTipoSolicitacao("Evento");
        setTotalValor(0); // Reset total value
      }, 5000);

    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      alert("Erro ao enviar solicitação. Tente novamente.");
    }
  };

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

  if (!clienteSlug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#E5DCC8] shadow-2xl">
          <CardContent className="p-8 text-center">
            <Coffee className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-[#6B4423] mb-3">
              Link Inválido
            </h2>
            <p className="text-[#8B7355]">
              Este link não é válido ou foi desativado. Entre em contato com o fornecedor para obter um link válido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#E5DCC8] shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-[#2D5016] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#6B4423] mb-3">
              Solicitação Enviada!
            </h2>
            <p className="text-[#8B7355] mb-6">
              Recebemos sua solicitação de <strong>{tipoSolicitacao}</strong> para <strong>{resultados.pacotes_250g} pacotes ({resultados.kg_total} kg)</strong> de café.
              <br /><br />
              <strong>Data:</strong> {new Date(formData.data_evento).toLocaleDateString('pt-BR')}<br />
              <strong>Local:</strong> {formData.local_evento}
            </p>
            {clienteSlug?.mostrar_precos && totalValor > 0 && (
              <p className="text-[#8B7355] mb-6">
                <strong>Valor total estimado:</strong> <span className="text-xl font-bold text-[#2D5016]">R$ {totalValor.toFixed(2)}</span>
              </p>
            )}
            <div className="bg-[#F5F1E8] p-4 rounded-lg">
              <p className="text-sm text-[#6B4423]">
                Entraremos em contato em breve para confirmar sua solicitação!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 shadow-lg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Café Seleção do Mário</h1>
              <p className="text-white/90 text-sm md:text-base">Solicitação de Café</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-4">
            <p className="text-sm">
              👋 Olá, <strong>{clienteSlug.cliente_nome}</strong>! Use este link para fazer suas solicitações.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#6B4423]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#6B4423] text-white' : 'bg-gray-200'}`}>
              <Calculator className="w-4 h-4" />
            </div>
            <span className="font-semibold hidden md:inline">Dados e Cálculo</span>
          </div>
          <div className="w-16 h-1 bg-gray-300">
            <div className={`h-full ${step >= 2 ? 'bg-[#6B4423]' : 'bg-gray-300'} transition-all duration-300`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#6B4423]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#6B4423] text-white' : 'bg-gray-200'}`}>
              <Coffee className="w-4 h-4" />
            </div>
            <span className="font-semibold hidden md:inline">Seleção de Cafés</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {step === 1 ? (
          <div className="space-y-6">
            {/* Seleção de Tipo */}
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-xl text-[#6B4423]">
                  Tipo de Solicitação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={tipoSolicitacao} onValueChange={setTipoSolicitacao} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#F5F1E8]">
                    <TabsTrigger value="Evento" className="gap-2">
                      <Briefcase className="w-4 h-4" />
                      Evento
                    </TabsTrigger>
                    <TabsTrigger value="Interno" className="gap-2">
                      <Building2 className="w-4 h-4" />
                      Uso Interno/Empresa
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className="text-sm text-[#8B7355] mt-3">
                  {tipoSolicitacao === "Evento"
                    ? "Para feiras, congressos, degustações e eventos em geral"
                    : "Para consumo diário na empresa, escritório ou estabelecimento"}
                </p>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Coluna Esquerda: Dados */}
              <Card className="border-[#E5DCC8] shadow-xl">
                <CardHeader className="border-b border-[#E5DCC8]">
                  <CardTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    {tipoSolicitacao === "Evento" ? "Dados do Evento" : "Dados do Uso"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="data_evento" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {tipoSolicitacao === "Evento" ? "Data do Evento *" : "Data de Início *"}
                    </Label>
                    <Input
                      id="data_evento"
                      type="date"
                      value={formData.data_evento}
                      onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                      required
                      className="border-[#E5DCC8]"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local_evento" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {tipoSolicitacao === "Evento" ? "Local do Evento *" : "Local/Empresa *"}
                    </Label>
                    <Input
                      id="local_evento"
                      value={formData.local_evento}
                      onChange={(e) => setFormData({ ...formData, local_evento: e.target.value })}
                      required
                      className="border-[#E5DCC8]"
                      placeholder={tipoSolicitacao === "Evento" ? "Ex: Centro de Convenções" : "Ex: Escritório Central"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações (Opcional)</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="border-[#E5DCC8]"
                      rows={3}
                      placeholder="Alguma preferência ou informação adicional?"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Coluna Direita: Calculadora */}
              <Card className="border-[#E5DCC8] shadow-xl">
                <CardHeader className="border-b border-[#E5DCC8]">
                  <CardTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    Calculadora de Café
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {tipoSolicitacao === "Evento" ? (
                    <>
                      {/* Calculadora de Evento */}
                      <div className="space-y-2">
                        <Label htmlFor="pessoas_dia" className="flex items-center gap-2 text-[#6B4423]">
                          <Users className="w-4 h-4" />
                          Expectativa de Pessoas por Dia *
                        </Label>
                        <Input
                          id="pessoas_dia"
                          type="number"
                          min="1"
                          value={calcDataEvento.pessoas_por_dia}
                          onChange={(e) => handleCalcChangeEvento('pessoas_por_dia', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <p className="text-xs text-[#8B7355]">Quantas pessoas devem passar pelo estande por dia</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dias" className="flex items-center gap-2 text-[#6B4423]">
                          <Calendar className="w-4 h-4" />
                          Quantidade de Dias *
                        </Label>
                        <Input
                          id="dias"
                          type="number"
                          min="1"
                          value={calcDataEvento.dias_evento}
                          onChange={(e) => handleCalcChangeEvento('dias_evento', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxa" className="flex items-center gap-2 text-[#6B4423]">
                          <Percent className="w-4 h-4" />
                          Taxa de Adesão (%)
                        </Label>
                        <Input
                          id="taxa"
                          type="number"
                          min="1"
                          max="100"
                          value={calcDataEvento.taxa_adesao}
                          onChange={(e) => handleCalcChangeEvento('taxa_adesao', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <div className="bg-[#C9A961]/10 p-2 rounded text-xs text-[#6B4423]">
                          <strong>Dica:</strong> 60-70% eventos gerais, 75-85% matutinos
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="horas" className="flex items-center gap-2 text-[#6B4423]">
                          <Clock className="w-4 h-4" />
                          Horas de Atendimento/Dia
                        </Label>
                        <Input
                          id="horas"
                          type="number"
                          min="1"
                          max="24"
                          value={calcDataEvento.horas_por_dia}
                          onChange={(e) => handleCalcChangeEvento('horas_por_dia', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                      </div>

                      {/* Resultado */}
                      <div className="bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] text-white p-6 rounded-xl mt-6">
                        <p className="text-sm opacity-80 mb-2">Café Necessário:</p>
                        <p className="text-4xl font-bold mb-1">{resultados.kg_total} kg</p>
                        <p className="text-sm opacity-90">{resultados.pacotes_250g} pacotes de 250g</p>
                        <div className="mt-4 pt-4 border-t border-white/20 text-sm space-y-1">
                          <p><strong>{resultados.publico_total}</strong> pessoas no total ({calcDataEvento.pessoas_por_dia}/dia × {calcDataEvento.dias_evento} dias)</p>
                          <p><strong>{resultados.consumidores_esperados}</strong> consumidores esperados ({calcDataEvento.taxa_adesao}%)</p>
                          <p><strong>{resultados.kg_por_dia} kg/dia</strong> · <strong>{resultados.kg_por_hora} kg/hora</strong></p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Calculadora de Uso Interno - ATUALIZADA */}
                      <div className="space-y-2">
                        <Label htmlFor="funcionarios" className="flex items-center gap-2 text-[#6B4423]">
                          <Users className="w-4 h-4" />
                          Quantidade de Funcionários *
                        </Label>
                        <Input
                          id="funcionarios"
                          type="number"
                          min="1"
                          value={calcDataInterno.quantidade_funcionarios}
                          onChange={(e) => handleCalcChangeInterno('quantidade_funcionarios', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <p className="text-xs text-[#8B7355]">Número de pessoas que consomem café regularmente</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dias_uso" className="flex items-center gap-2 text-[#6B4423]">
                          <Calendar className="w-4 h-4" />
                          Período (dias) *
                        </Label>
                        <Input
                          id="dias_uso"
                          type="number"
                          min="1"
                          value={calcDataInterno.dias_uso}
                          onChange={(e) => handleCalcChangeInterno('dias_uso', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <p className="text-xs text-[#8B7355]">Por quantos dias você precisa de café?</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="xicaras_por_dia" className="flex items-center gap-2 text-[#6B4423]">
                          <Coffee className="w-4 h-4" />
                          Xícaras por Dia (por pessoa) *
                        </Label>
                        <Input
                          id="xicaras_por_dia"
                          type="number"
                          min="1"
                          step="0.5"
                          value={calcDataInterno.xicaras_por_dia}
                          onChange={(e) => handleCalcChangeInterno('xicaras_por_dia', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <div className="bg-[#C9A961]/10 p-2 rounded text-xs text-[#6B4423]">
                          <strong>Sugestões:</strong> 2-3 xícaras (moderado), 4-5 xícaras (alto consumo)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tamanho_xicara" className="flex items-center gap-2 text-[#6B4423]">
                          <Coffee className="w-4 h-4" />
                          Tamanho da Xícara
                        </Label>
                        <Select
                          value={calcDataInterno.tamanho_xicara.toString()}
                          onValueChange={(value) => handleCalcChangeInterno('tamanho_xicara', value)}
                        >
                          <SelectTrigger className="border-[#E5DCC8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">100ml (Xícara pequena/café)</SelectItem>
                            <SelectItem value="200">200ml (Caneca média)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-[#8B7355]">
                          {calcDataInterno.xicaras_por_dia} xícara(s) × {calcDataInterno.tamanho_xicara}ml = {calcDataInterno.xicaras_por_dia * calcDataInterno.tamanho_xicara}ml/dia por pessoa
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="perdas_interno" className="flex items-center gap-2 text-[#6B4423]">
                          <TrendingUp className="w-4 h-4" />
                          Fator de Perdas (%)
                        </Label>
                        <Input
                          id="perdas_interno"
                          type="number"
                          min="0"
                          max="50"
                          value={calcDataInterno.fator_perdas}
                          onChange={(e) => handleCalcChangeInterno('fator_perdas', e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <p className="text-xs text-[#8B7355]">Sobra, moagem e desperdício (padrão: 10%)</p>
                      </div>

                      {/* Resultado */}
                      <div className="bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] text-white p-6 rounded-xl mt-6">
                        <p className="text-sm opacity-80 mb-2">Café Necessário:</p>
                        <p className="text-4xl font-bold mb-1">{resultados.kg_total} kg</p>
                        <p className="text-sm opacity-90">{resultados.pacotes_250g} pacotes de 250g</p>
                        <div className="mt-4 pt-4 border-t border-white/20 text-sm space-y-1">
                          <p><strong>{calcDataInterno.quantidade_funcionarios}</strong> funcionários</p>
                          <p><strong>{calcDataInterno.dias_uso}</strong> dias de uso</p>
                          <p><strong>{calcDataInterno.xicaras_por_dia}</strong> xícara(s) de <strong>{calcDataInterno.tamanho_xicara}ml</strong>/dia por pessoa</p>
                          <p><strong>{calcDataInterno.xicaras_por_dia * calcDataInterno.tamanho_xicara}ml/dia</strong> por pessoa</p>
                          <p><strong>{resultados.kg_por_dia} kg/dia</strong> no total</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleProximoPasso}
                    className="w-full bg-[#2D5016] hover:bg-[#1F3810] text-white text-lg py-6"
                  >
                    Próximo: Selecionar Cafés
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-[#6B4423]">
                    Selecione os Cafés e Embalagens
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    ← Voltar
                  </Button>
                </div>
                <div className="bg-[#F5F1E8] p-4 rounded-lg mt-4">
                  <p className="text-sm text-[#6B4423]">
                    <strong>Café necessário:</strong> {resultados.kg_total} kg ({resultados.pacotes_250g} pacotes de 250g)
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Label>Cafés Selecionados</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAdicionarCafe}
                    className="border-[#6B4423] text-[#6B4423]"
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
                  <div className="space-y-3">
                    {cafesReservados.map((cafe, index) => {
                      const disponivel = cafe.cafe_id && cafe.embalagem
                        ? calcularDisponivel(cafe.cafe_id, cafe.embalagem)
                        : 0;

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

                        <div className="grid md:grid-cols-3 gap-3 pr-8">
                          <div className="space-y-2">
                            <Label className="text-xs">Café</Label>
                            <Select
                              value={cafe.cafe_id}
                              onValueChange={(value) => handleCafeChange(index, value)}
                              required
                            >
                              <SelectTrigger className="border-[#E5DCC8] bg-white">
                                <SelectValue placeholder="Selecione o café" />
                              </SelectTrigger>
                              <SelectContent>
                                {cafes.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.nome} ({c.forma})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Embalagem</Label>
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
                            {cafe.cafe_id && cafe.embalagens_disponiveis && cafe.embalagens_disponiveis.length === 1 && (
                              <p className="text-xs text-[#8B7355]">
                                Apenas {cafe.embalagens_disponiveis[0]} disponível
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Quantidade</Label>
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              max={disponivel}
                              value={cafe.quantidade_pacotes || ""}
                              onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                              required
                              disabled={!cafe.cafe_id || !cafe.embalagem || disponivel === 0}
                              className="border-[#E5DCC8] bg-white"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {cafe.cafe_id && cafe.embalagem && (
                          <div className="flex items-center justify-between pt-2 border-t border-[#E5DCC8]">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[#8B7355]">Disponível:</span>
                                <Badge 
                                  variant="outline" 
                                  className={disponivel > 0 ? "bg-[#2D5016]/10 text-[#2D5016]" : "bg-red-100 text-red-800"}
                                >
                                  {disponivel} pacotes de {cafe.embalagem}
                                </Badge>
                              </div>
                              {cafe.quantidade_pacotes > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[#8B7355]">Equivalente:</span>
                                  <Badge variant="outline" className="bg-white">
                                    {(cafe.quantidade_pacotes * getPesoEmbalagem(cafe.embalagem)).toFixed(3)} kg
                                  </Badge>
                                </div>
                              )}
                              {disponivel === 0 && (
                                <p className="text-red-600 font-medium">⚠️ Sem estoque disponível</p>
                              )}
                            </div>

                            {clienteSlug?.mostrar_precos && precosCafe[cafe.cafe_id] && cafe.quantidade_pacotes > 0 && (
                              <div className="text-right">
                                <p className="text-xs text-[#8B7355]">Subtotal:</p>
                                <p className="text-lg font-bold text-[#2D5016]">
                                  R$ {(precosCafe[cafe.cafe_id] * cafe.quantidade_pacotes * (getPesoEmbalagem(cafe.embalagem) / 0.25)).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}

                {/* Resumo */}
                {totalPacotesSelecionados > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${
                    totalPacotesSelecionados === resultados.pacotes_250g
                      ? 'bg-[#2D5016]/10 border-[#2D5016]'
                      : totalPacotesSelecionados > resultados.pacotes_250g
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-[#C9A961]/10 border-[#C9A961]'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#6B4423]">Total Selecionado (equivalente):</span>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#6B4423]">
                            {totalPacotesSelecionados} pacotes de 250g
                          </p>
                          <p className="text-sm text-[#8B7355]>">{(totalPacotesSelecionados * 0.25).toFixed(2)} kg</p>
                        </div>
                      </div>

                      {clienteSlug?.mostrar_precos && totalValor > 0 && (
                        <div className="pt-3 border-t border-[#E5DCC8] flex items-center justify-between">
                          <span className="font-semibold text-[#6B4423] text-lg">Valor Total:</span>
                          <p className="text-3xl font-bold text-[#2D5016]">
                            R$ {totalValor.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {totalPacotesSelecionados !== resultados.pacotes_250g && (
                        <p className="text-xs text-[#8B7355] mt-2">
                          {totalPacotesSelecionados > resultados.pacotes_250g
                            ? `⚠️ Você selecionou ${totalPacotesSelecionados - resultados.pacotes_250g} pacotes de 250g equivalentes a mais que o calculado`
                            : `⚠️ Faltam ${resultados.pacotes_250g - totalPacotesSelecionados} pacotes de 250g equivalentes para atingir o valor calculado`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Botão Enviar */}
                <Button
                  type="submit"
                  className="w-full bg-[#6B4423] hover:bg-[#5A3A1E] text-white text-lg py-6"
                  disabled={cafesReservados.length === 0 || totalPacotesSelecionados === 0}
                >
                  <Coffee className="w-5 h-5 mr-2" />
                  Enviar Solicitação
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <Card className="border-[#E5DCC8] bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#6B4423] mb-3 text-center">Fale Conosco</h3>
            <div className="space-y-2 text-sm text-[#8B7355] text-center">
              <p className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                contato@cafeselecao.com
              </p>
              <p className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                (27) 99999-9999
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer com Links Obrigatórios */}
      <footer className="bg-white border-t border-[#E5DCC8] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-[#8B7355]">
            <a href="/Privacy" className="hover:text-[#6B4423] hover:underline font-medium">
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="/Support" className="hover:text-[#6B4423] hover:underline font-medium">
              Suporte
            </a>
            <span>•</span>
            <span>© {new Date().getFullYear()} Café Seleção do Mário</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
