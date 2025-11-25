
import React, { useState } from "react";
import { Cliente } from "@/entities/Cliente";
import { ReservaCafe } from "@/entities/ReservaCafe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, MapPin, Mail, Phone, Bookmark, Package, Edit, Trash2, Edit2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

import ClienteFormModal from "./ClienteFormModal";
import PrecosClienteModal from "./PrecosClienteModal";

export default function ClientesTab({ clientes, reservas, cafes, onUpdate, onEditReserva }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrecos, setShowPrecos] = useState(false);
  const [clienteParaPrecos, setClienteParaPrecos] = useState(null);

  const getPesoEmbalagem = (embalagem) => {
    const pesos = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1
    };
    return pesos[embalagem] || 0.25; // Default to 250g if not specified
  };

  const filteredClientes = clientes.filter(c =>
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (data) => {
    if (selectedCliente) {
      await Cliente.update(selectedCliente.id, data);
    } else {
      await Cliente.create(data);
    }
    setShowForm(false);
    setSelectedCliente(null);
    onUpdate();
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setShowForm(true);
  };

  const handleDelete = async (clienteId) => {
    const reservasCliente = reservas.filter(r => r.cliente_id === clienteId && r.status === "Ativa");
    
    if (reservasCliente.length > 0) {
      alert(`Não é possível excluir este cliente. Existem ${reservasCliente.length} reserva(s) ativa(s).`);
      return;
    }

    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      await Cliente.delete(clienteId);
      onUpdate();
    }
  };

  const getReservasCliente = (clienteId) => {
    return reservas.filter(r => r.cliente_id === clienteId && r.status === "Ativa");
  };

  const getTotalReservadoKg = (clienteId) => {
    const reservasCliente = getReservasCliente(clienteId);
    return reservasCliente.reduce((sum, r) => {
      const peso = getPesoEmbalagem(r.embalagem || "250g");
      return sum + (r.quantidade_pacotes * peso);
    }, 0).toFixed(3);
  };

  const handleGerenciarPrecos = (cliente) => {
    setClienteParaPrecos(cliente);
    setShowPrecos(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#E5DCC8]"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedCliente(null);
            setShowForm(true);
          }}
          className="bg-[#6B4423] hover:bg-[#5A3A1E]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {filteredClientes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map((cliente, index) => {
            const reservasCliente = getReservasCliente(cliente.id);
            const totalReservadoKg = getTotalReservadoKg(cliente.id);

            return (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6 space-y-3"> {/* Added space-y-3 as per outline */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Cliente Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#B8935A] rounded-full flex items-center justify-center shadow-md">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[#6B4423]">{cliente.nome}</h3>
                          {cliente.localizacao && (
                            <div className="flex items-center gap-1 text-xs text-[#8B7355] mt-1">
                              <MapPin className="w-3 h-3" />
                              {cliente.localizacao}
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <Mail className="w-4 h-4 text-[#8B7355]" />
                              <a href={`mailto:${cliente.email}`} className="text-[#6B4423] hover:underline truncate">
                                {cliente.email}
                              </a>
                            </div>
                          )}
                          
                          {cliente.telefone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-[#8B7355]" />
                              <a href={`tel:${cliente.telefone}`} className="text-[#6B4423] hover:underline">
                                {cliente.telefone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGerenciarPrecos(cliente)}
                          className="border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016]/10"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Preços
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cliente)}
                          className="hover:bg-[#6B4423]/10 px-2"
                        >
                          <Edit className="w-4 h-4 text-[#6B4423] mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cliente.id)}
                          className="hover:bg-red-50 px-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {/* Reservas Section */}
                    {reservasCliente.length > 0 ? (
                      <div className="bg-gradient-to-r from-[#D97706]/10 to-[#F59E0B]/10 p-3 rounded-lg border border-[#D97706]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#6B4423]">Reservas Ativas</span>
                          <Badge className="bg-[#D97706]/20 text-[#D97706] border-[#D97706]">
                            {totalReservadoKg} kg
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {reservasCliente.slice(0, 2).map((reserva) => { // Changed slice limit to 2
                            const kgReserva = (reserva.quantidade_pacotes * getPesoEmbalagem(reserva.embalagem || "250g")).toFixed(3);
                            return (
                              <div key={reserva.id} className="flex items-center justify-between text-xs bg-white p-2 rounded group/reserva">
                                <div>
                                  <span className="text-[#6B4423] font-medium">
                                    {reserva.cafe_nome}
                                  </span>
                                  <span className="text-[#8B7355] ml-1">
                                    • {reserva.embalagem || "250g"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#6B4423] font-medium">
                                    {kgReserva} kg
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover/reserva:opacity-100 transition-opacity"
                                    onClick={() => onEditReserva(reserva)}
                                  >
                                    <Edit2 className="w-3 h-3 text-[#6B4423]" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          {reservasCliente.length > 2 && ( // Updated for new slice limit
                            <p className="text-xs text-[#8B7355] text-center pt-1">
                              +{reservasCliente.length - 2} {reservasCliente.length - 2 === 1 ? 'reserva' : 'reservas'}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 mt-4 border-t border-[#E5DCC8] text-center">
                        <p className="text-xs text-[#8B7355]">Nenhuma reserva ativa</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
          <User className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
          <p className="text-[#8B7355] text-lg">Nenhum cliente encontrado</p>
        </div>
      )}

      <ClienteFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCliente(null);
        }}
        onSave={handleSave}
        cliente={selectedCliente}
      />

      <PrecosClienteModal
        open={showPrecos}
        onClose={() => {
          setShowPrecos(false);
          setClienteParaPrecos(null);
        }}
        cliente={clienteParaPrecos}
        cafes={cafes}
        onUpdate={onUpdate}
      />
    </div>
  );
}
