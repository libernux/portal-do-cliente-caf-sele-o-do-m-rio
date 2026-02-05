import React, { useState, useEffect, useCallback } from "react";
import { Cafe } from "@/entities/Cafe";
import { Cliente } from "@/entities/Cliente";
import { ReservaCafe } from "@/entities/ReservaCafe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Package } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import CafeCard from "../components/estoque/CafeCard";
import CafeFormModal from "../components/estoque/CafeFormModal";
import EstoqueStats from "../components/estoque/EstoqueStats";
import ClientesTab from "../components/estoque/ClientesTab";
import ReservasModal from "../components/estoque/ReservasModal";
import ReservaEditModal from "../components/estoque/ReservaEditModal";
import ReservasTab from "../components/estoque/ReservasTab";
import AdicionarEstoqueModal from "../components/estoque/AdicionarEstoqueModal";
import PullToRefresh from "../components/layout/PullToRefresh";

export default function Estoque() {
  const [cafes, setCafes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReservas, setShowReservas] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [cafeParaReserva, setCafeParaReserva] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formaFilter, setFormaFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("estoque");

  const [showEditReserva, setShowEditReserva] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null); // This will now hold a reservaGrupo object or a single ReservaCafe wrapped as a group

  const [showAdicionarEstoque, setShowAdicionarEstoque] = useState(false);
  const [cafeParaAdicionar, setCafeParaAdicionar] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [cafesData, clientesData, reservasData] = await Promise.all([
      Cafe.list("-created_date"),
      Cliente.list("-created_date"),
      ReservaCafe.list("-created_date")
    ]);
    setCafes(cafesData);
    setClientes(clientesData);
    setReservas(reservasData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    
    // Listener para tab-refresh
    const handleTabRefresh = (e) => {
      if (e.detail === "Estoque") {
        loadData();
      }
    };
    window.addEventListener('tab-refresh', handleTabRefresh);
    return () => window.removeEventListener('tab-refresh', handleTabRefresh);
  }, [loadData]);

  useEffect(() => {
    let filtered = cafes;

    if (formaFilter !== "all") {
      filtered = filtered.filter(c => c.forma === formaFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCafes(filtered);
  }, [cafes, searchTerm, formaFilter]);

  const handleSave = async (data) => {
    // Optimistic UI update
    if (selectedCafe) {
      setCafes(prev => prev.map(c => c.id === selectedCafe.id ? { ...c, ...data } : c));
    } else {
      const tempId = `temp-${Date.now()}`;
      setCafes(prev => [{ id: tempId, ...data }, ...prev]);
    }
    setShowForm(false);
    setSelectedCafe(null);
    
    // Persistir no backend
    if (selectedCafe) {
      await Cafe.update(selectedCafe.id, data);
    } else {
      await Cafe.create(data);
    }
    loadData();
  };

  const handleAdicionarEstoque = (cafe) => {
    setCafeParaAdicionar(cafe);
    setShowAdicionarEstoque(true);
  };

  const handleSalvarEstoque = async (data) => {
    await Cafe.update(data.id, data);
    setShowAdicionarEstoque(false);
    setCafeParaAdicionar(null);
    loadData();
  };

  const handleEdit = (cafe) => {
    setSelectedCafe(cafe);
    setShowForm(true);
  };

  const handleDelete = async (cafeId) => {
    // Verificar se há reservas ativas para este café
    const reservasAtivas = reservas.filter(r => r.cafe_id === cafeId && r.status === "Ativa");
    
    if (reservasAtivas.length > 0) {
      alert(`Não é possível excluir este café. Existem ${reservasAtivas.length} reserva(s) ativa(s) para ele.`);
      return;
    }

    if (confirm("Tem certeza que deseja excluir este café?")) {
      await Cafe.delete(cafeId);
      loadData();
    }
  };

  const handleReservar = (cafe) => {
    setCafeParaReserva(cafe);
    setShowReservas(true);
  };

  const handleReservarGeral = () => {
    setCafeParaReserva(null); // No specific cafe selected initially
    setShowReservas(true);
  };

  // Modified handleEditReserva to accept a reservaGrupo as per outline,
  // but also handles single ReservaCafe objects by wrapping them in a group structure.
  const handleEditReserva = (item) => {
    let groupToEdit = item;

    // Check if the item appears to be a single ReservaCafe (e.g., from CafeCard or ClientesTab)
    // A 'reservaGrupo' typically has a 'cafes' array, while a single 'ReservaCafe' directly contains properties like 'cafe_id'.
    if (item && item.id && item.cafe_id && item.cliente_id && typeof item.quantidade_pacotes === 'number') {
      const client = clientes.find(c => c.id === item.cliente_id);
      groupToEdit = {
        // When editing a single reservation, we create a temporary group structure.
        // The ID here is crucial: it should be the ID of the specific ReservaCafe being edited,
        // as `handleSaveReserva` uses `selectedReserva.id` for `ReservaCafe.update`.
        id: item.id, // This `id` will be used if `cafesToProcess` has only one item and it's existing.
        cliente_id: item.cliente_id,
        cliente_nome: client ? client.nome : "Cliente Desconhecido",
        data_reserva: item.data_reserva, // Assuming this is also present on single reservation
        status: item.status,
        observacoes: item.observacoes || '',
        cafes: [item], // Wrap the single reservation in an array
      };
    }
    setSelectedReserva(groupToEdit);
    setShowEditReserva(true);
  };

  // New handleDeleteReserva as per outline
  const handleDeleteReserva = async (reservaGrupo) => {
    if (confirm(`Tem certeza que deseja cancelar esta reserva de ${reservaGrupo.cliente_nome}?`)) {
      try {
        // Atualizar status de todos os cafés da reserva para "Cancelada"
        for (const cafeReserva of reservaGrupo.cafes) { 
          await ReservaCafe.update(cafeReserva.id, {
            status: "Cancelada"
          });
        }
        loadData();
      } catch (error) {
        console.error("Erro ao cancelar reserva:", error);
        alert("Erro ao cancelar reserva");
      }
    }
  };

  const calcularDisponivel = (cafe) => {
    const reservasAtivas = reservas.filter(
      r => r.cafe_id === cafe.id && r.status === "Ativa"
    );
    const totalReservado = reservasAtivas.reduce((sum, r) => sum + r.quantidade_pacotes, 0);
    return (cafe.quantidade_pacotes || 0) - totalReservado;
  };

  // Helper function moved outside handleSaveReserva for reusability
  const getPesoEmbalagem = (embalagem) => {
    const pesos = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1
    };
    return pesos[embalagem] || 0.25; // Default to 250g if embalagem is unknown
  };

  const handleMarcarComoEntregue = async (reservaGrupo) => {
    const hoje = new Date().toISOString().split('T')[0];
    
    const confirmEntrega = confirm(
      `⚠️ Confirmar Entrega\n\n` +
      `Cliente: ${reservaGrupo.cliente_nome}\n` +
      `Data: ${hoje}\n\n` +
      `Ao confirmar, o estoque será automaticamente diminuído.\n` +
      `Deseja continuar?`
    );
    
    if (!confirmEntrega) {
      return;
    }

    try {
      // Processar cada café da reserva
      for (const cafeReserva of reservaGrupo.cafes) {
        // Atualizar status da reserva
        await ReservaCafe.update(cafeReserva.id, {
          status: "Entregue",
          data_entrega: hoje
        });

        // Diminuir estoque
        const cafe = cafes.find(c => c.id === cafeReserva.cafe_id);
        
        if (cafe) {
          const quantidadeEntregue = cafeReserva.quantidade_pacotes;
          const embalagemEntregue = cafeReserva.embalagem || "250g";
          
          // Atualizar estoque por embalagem
          const estoqueAtual = cafe.estoque_por_embalagem || {
            "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0
          };

          const estoqueAnterior = estoqueAtual[embalagemEntregue] || 0;

          const novoEstoquePorEmbalagem = {
            ...estoqueAtual,
            [embalagemEntregue]: Math.max(0, estoqueAnterior - quantidadeEntregue)
          };

          // Recalcular quantidade_pacotes total
          const totalPacotes250g = Object.entries(novoEstoquePorEmbalagem).reduce((sum, [emb, qtd]) => {
            const pesoEmKg = qtd * getPesoEmbalagem(emb);
            return sum + Math.ceil(pesoEmKg / 0.25);
          }, 0);

          await Cafe.update(cafe.id, {
            ...cafe,
            estoque_por_embalagem: novoEstoquePorEmbalagem,
            quantidade_pacotes: totalPacotes250g
          });

          console.log(`✅ Estoque atualizado: ${cafe.nome} - ${embalagemEntregue}: ${estoqueAnterior} → ${novoEstoquePorEmbalagem[embalagemEntregue]}`);
        }
      }

      alert(`✅ Entrega confirmada com sucesso!\n\nReserva de ${reservaGrupo.cliente_nome} marcada como entregue e estoque atualizado.`);
      loadData();
      
    } catch (error) {
      console.error("Erro ao marcar como entregue:", error);
      alert("Erro ao confirmar entrega. Tente novamente.");
    }
  };

  const handleSaveReserva = async (data) => {
    try {
      console.log("💾 Salvando reserva com dados:", data);

      // 1. Deletar cafés removidos
      if (data.cafesToDeleteIds && data.cafesToDeleteIds.length > 0) {
        console.log("🗑️ Deletando cafés:", data.cafesToDeleteIds);
        for (const reservaId of data.cafesToDeleteIds) {
          await ReservaCafe.delete(reservaId);
        }
      }

      // 2. Verificar se houve mudança de status de Ativa → Entregue
      const mudouParaEntregue = data.originalStatus === "Ativa" && data.newStatus === "Entregue";
      const voltouParaAtiva = data.originalStatus === "Entregue" && data.newStatus === "Ativa";

      console.log(`📊 Status: ${data.originalStatus} → ${data.newStatus}`);
      console.log(`🔄 Mudou para Entregue: ${mudouParaEntregue}`);
      console.log(`🔙 Voltou para Ativa: ${voltouParaAtiva}`);

      // 3. Processar cada café (atualizar existentes ou criar novos)
      for (const cafeData of data.cafesToProcess) {
        console.log(`📦 Processando café: ${cafeData.cafe_nome} (${cafeData.embalagem})`);

        if (cafeData.isExisting && cafeData.id) {
          // Atualizar reserva existente
          await ReservaCafe.update(cafeData.id, {
            cliente_id: data.cliente_id, // Ensure cliente_id is updated if changed
            cliente_nome: data.cliente_nome, // Ensure cliente_nome is updated if changed
            cafe_id: cafeData.cafe_id,
            cafe_nome: cafeData.cafe_nome,
            cafe_forma: cafeData.cafe_forma,
            embalagem: cafeData.embalagem,
            quantidade_pacotes: cafeData.quantidade_pacotes,
            status: data.newStatus,
            observacoes: data.newObservacoes,
            data_entrega: data.newStatus === "Entregue" ? new Date().toISOString().split('T')[0] : null
          });

          console.log(`✅ Reserva atualizada: ${cafeData.id}`);

          // Se mudou de "Ativa" para "Entregue", diminuir estoque
          if (mudouParaEntregue) {
            const cafe = cafes.find(c => c.id === cafeData.cafe_id);
            if (cafe) {
              console.log(`📉 Diminuindo estoque de ${cafe.nome}`);
              
              const estoqueAtual = cafe.estoque_por_embalagem || {
                "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0
              };

              const estoqueAnterior = estoqueAtual[cafeData.embalagem] || 0;
              console.log(`  Estoque anterior (${cafeData.embalagem}): ${estoqueAnterior}`);
              console.log(`  Quantidade a debitar: ${cafeData.quantidade_pacotes}`);

              const novoEstoquePorEmbalagem = {
                ...estoqueAtual,
                [cafeData.embalagem]: Math.max(0, estoqueAnterior - cafeData.quantidade_pacotes)
              };

              console.log(`  Novo estoque (${cafeData.embalagem}): ${novoEstoquePorEmbalagem[cafeData.embalagem]}`);

              const totalPacotes250g = Object.entries(novoEstoquePorEmbalagem).reduce((sum, [emb, qtd]) => {
                const pesoEmKg = qtd * getPesoEmbalagem(emb);
                return sum + Math.ceil(pesoEmKg / 0.25);
              }, 0);

              console.log(`  Total pacotes 250g: ${totalPacotes250g}`);

              await Cafe.update(cafe.id, {
                ...cafe,
                estoque_por_embalagem: novoEstoquePorEmbalagem,
                quantidade_pacotes: totalPacotes250g
              });

              console.log(`✅ Estoque atualizado no banco`);
            }
          }

          // Se mudou de "Entregue" de volta para "Ativa", devolver ao estoque
          if (voltouParaAtiva) {
            const cafe = cafes.find(c => c.id === cafeData.cafe_id);
            if (cafe) {
              console.log(`📈 Devolvendo ao estoque de ${cafe.nome}`);
              
              const estoqueAtual = cafe.estoque_por_embalagem || {
                "10g": 0, "18g": 0, "100g": 0, "250g": 0, "500g": 0, "1kg": 0
              };

              const novoEstoquePorEmbalagem = {
                ...estoqueAtual,
                [cafeData.embalagem]: (estoqueAtual[cafeData.embalagem] || 0) + cafeData.quantidade_pacotes
              };

              const totalPacotes250g = Object.entries(novoEstoquePorEmbalagem).reduce((sum, [emb, qtd]) => {
                const pesoEmKg = qtd * getPesoEmbalagem(emb);
                return sum + Math.ceil(pesoEmKg / 0.25);
              }, 0);

              await Cafe.update(cafe.id, {
                ...cafe,
                estoque_por_embalagem: novoEstoquePorEmbalagem,
                quantidade_pacotes: totalPacotes250g
              });

              console.log(`✅ Estoque devolvido`);
            }
          }
        } else {
          // Criar nova reserva
          console.log(`➕ Criando nova reserva`);
          await ReservaCafe.create({
            cliente_id: data.cliente_id,
            cliente_nome: data.cliente_nome,
            cafe_id: cafeData.cafe_id,
            cafe_nome: cafeData.cafe_nome,
            cafe_forma: cafeData.cafe_forma,
            embalagem: cafeData.embalagem,
            quantidade_pacotes: cafeData.quantidade_pacotes,
            data_reserva: data.data_reserva,
            status: data.newStatus,
            observacoes: data.newObservacoes
          });
          console.log(`✅ Nova reserva criada`);
        }
      }

      alert("✅ Reserva atualizada com sucesso!");
      setShowEditReserva(false);
      setSelectedReserva(null);
      await loadData();
      
    } catch (error) {
      console.error("❌ Erro ao salvar alterações na reserva:", error);
      alert("Erro ao salvar alterações na reserva. Tente novamente.");
    }
  };

  return (
    <PullToRefresh onRefresh={loadData} className="min-h-screen">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
              Gestão de Estoque
            </h1>
            <p className="text-[#8B7355]">
              Controle de cafés e reservas para clientes em Vila Velha
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#F5F1E8]">
            <TabsTrigger value="estoque" className="gap-2">
              <Package className="w-4 h-4" />
              Estoque de Cafés
            </TabsTrigger>
            {/* New Reservations Tab */}
            <TabsTrigger value="reservas" className="gap-2">
              <Package className="w-4 h-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="clientes" className="gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estoque" className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                onClick={handleReservarGeral}
                variant="outline"
                className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Reserva
              </Button>
              <Button
                onClick={() => {
                  setSelectedCafe(null);
                  setShowForm(true);
                }}
                className="bg-[#6B4423] hover:bg-[#5A3A1E] text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Café
              </Button>
            </div>

            <EstoqueStats cafes={cafes} reservas={reservas} />

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-[#E5DCC8] shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                    <Input
                      placeholder="Buscar por nome ou localização..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#E5DCC8] focus:border-[#6B4423]"
                    />
                  </div>
                </div>
                <div>
                  <Tabs value={formaFilter} onValueChange={setFormaFilter}>
                    <TabsList className="bg-[#F5F1E8]">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="Grão">Em Grão</TabsTrigger>
                      <TabsTrigger value="Moído">Moído</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
              </div>
            ) : filteredCafes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCafes.map((cafe) => (
                  <CafeCard
                    key={cafe.id}
                    cafe={cafe}
                    disponivel={calcularDisponivel(cafe)}
                    reservas={reservas.filter(r => r.cafe_id === cafe.id && r.status === "Ativa")}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReservar={handleReservar}
                    // onEditReserva is kept, now it can pass a single reservation which handleEditReserva will convert to a group of one.
                    onEditReserva={handleEditReserva} 
                    onAdicionarEstoque={handleAdicionarEstoque}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
                <p className="text-[#8B7355] text-lg">Nenhum café encontrado</p>
              </div>
            )}
          </TabsContent>

          {/* New Reservations Tab Content */}
          <TabsContent value="reservas" className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={handleReservarGeral}
                className="bg-[#6B4423] hover:bg-[#5A3A1E] text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Reserva
              </Button>
            </div>

            <ReservasTab
              reservas={reservas}
              clientes={clientes}
              cafes={cafes}
              onEditReserva={handleEditReserva} // This now expects a reservaGrupo (or a single converted to group)
              onDeleteReserva={handleDeleteReserva}
              onMarcarComoEntregue={handleMarcarComoEntregue}
            />
          </TabsContent>

          <TabsContent value="clientes">
            <ClientesTab
              clientes={clientes}
              reservas={reservas}
              cafes={cafes}
              onUpdate={loadData}
              // onEditReserva is kept, now it can pass a single reservation which handleEditReserva will convert to a group of one.
              onEditReserva={handleEditReserva}
            />
          </TabsContent>
        </Tabs>

        <CafeFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedCafe(null);
          }}
          onSave={handleSave}
          cafe={selectedCafe}
        />

        <ReservasModal
          open={showReservas}
          onClose={() => {
            setShowReservas(false);
            setCafeParaReserva(null);
          }}
          cafe={cafeParaReserva} // This can be null for general reservations
          cafes={cafes} // Pass all cafes for selection
          clientes={clientes}
          onUpdate={loadData} // ReservasModal continues to use onUpdate={loadData} for new reservations
        />

        <ReservaEditModal
          open={showEditReserva}
          onClose={() => {
            setShowEditReserva(false);
            setSelectedReserva(null);
          }}
          reservaGrupo={selectedReserva} // Prop name changed to reservaGrupo as per outline
          cafes={cafes} // Still needed for selection within the modal
          // Removed clients prop from ReservaEditModal as per outline
          onSave={handleSaveReserva} // MODIFIED: Changed from onUpdate={loadData} to onSave={handleSaveReserva}
        />

        <AdicionarEstoqueModal
          open={showAdicionarEstoque}
          onClose={() => {
            setShowAdicionarEstoque(false);
            setCafeParaAdicionar(null);
          }}
          cafe={cafeParaAdicionar}
          onSave={handleSalvarEstoque}
        />
        </div>
      </div>
    </PullToRefresh>
  );
}