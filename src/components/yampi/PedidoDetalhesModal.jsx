import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AtualizarStatusModal from "./AtualizarStatusModal";

export default function PedidoDetalhesModal({ open, onClose, pedidoId, onUpdate }) {
  const [pedido, setPedido] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (open && pedidoId) {
      loadPedido();
    }
  }, [open, pedidoId]);

  const loadPedido = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('getYampiOrderById', {
        orderId: pedidoId
      });

      if (response.data.success) {
        setPedido(response.data.pedido);
      } else {
        setError(response.data.error || 'Erro ao carregar pedido');
      }
    } catch (err) {
      setError('Erro ao carregar pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdated = () => {
    loadPedido();
    if (onUpdate) onUpdate();
  };

  const handleClose = () => {
    setPedido(null);
    setError(null);
    onClose();
  };

  const getPaymentStatusColor = (paid) => {
    return paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#6B4423] mb-4" />
              <p className="text-[#8B7355]">Carregando detalhes...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          ) : pedido ? (
            <div className="space-y-6">
              {/* Header do Pedido */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#6B4423]">
                    Pedido #{pedido.number}
                  </h2>
                  <p className="text-sm text-[#8B7355]">
                    ID Yampi: {pedido.id}
                  </p>
                  <p className="text-sm text-[#8B7355]">
                    {format(new Date(pedido.created_at?.date || new Date()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={getPaymentStatusColor(pedido.paid)}>
                    {pedido.paid ? 'Pago' : 'Pendente'}
                  </Badge>
                  <p className="text-3xl font-bold text-[#2D5016] mt-2">
                    R$ {pedido.value?.toFixed(2).replace('.', ',')}
                  </p>
                  <Button
                    onClick={() => setShowStatusModal(true)}
                    className="mt-2 bg-[#6B4423]"
                    size="sm"
                  >
                    Atualizar Status
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Status Atual */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#6B4423]" />
                    <div>
                      <p className="text-sm text-[#8B7355]">Status do Pedido</p>
                      <p className="font-semibold text-[#6B4423]">
                        {pedido.status?.data?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cliente */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <User className="w-5 h-5 text-[#6B4423] mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-[#8B7355] mb-1">Cliente</p>
                      <p className="font-semibold text-[#6B4423]">
                        {pedido.customer?.data?.first_name} {pedido.customer?.data?.last_name}
                      </p>
                      <p className="text-sm text-[#8B7355]">{pedido.customer?.data?.email}</p>
                      <p className="text-sm text-[#8B7355]">{pedido.customer?.data?.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço de Entrega */}
              {pedido.shipping?.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#6B4423] mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-[#8B7355] mb-1">Endereço de Entrega</p>
                        <p className="font-semibold">
                          {pedido.shipping.data.street}, {pedido.shipping.data.number}
                        </p>
                        {pedido.shipping.data.complement && (
                          <p className="text-sm">{pedido.shipping.data.complement}</p>
                        )}
                        <p className="text-sm">
                          {pedido.shipping.data.neighborhood} - {pedido.shipping.data.city}/{pedido.shipping.data.state}
                        </p>
                        <p className="text-sm">CEP: {pedido.shipping.data.zipcode}</p>
                        {pedido.shipping.data.tracking_code && (
                          <div className="mt-2 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#2D5016]" />
                            <span className="text-sm font-medium text-[#2D5016]">
                              Código de Rastreamento: {pedido.shipping.data.tracking_code}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Forma de Pagamento */}
              {pedido.payment?.data && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#6B4423]" />
                      <div>
                        <p className="text-sm text-[#8B7355]">Forma de Pagamento</p>
                        <p className="font-semibold">{pedido.payment.data.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Itens do Pedido */}
              <div>
                <h3 className="font-semibold text-[#6B4423] mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens do Pedido
                </h3>
                <div className="space-y-2">
                  {pedido.items?.data?.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-[#6B4423]">{item.name}</p>
                              <p className="text-sm text-[#8B7355]">SKU: {item.sku_code}</p>
                              <p className="text-sm text-[#8B7355]">Quantidade: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#2D5016]">
                              R$ {item.price?.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-sm text-[#8B7355]">unitário</p>
                            <p className="text-lg font-bold text-[#2D5016] mt-1">
                              R$ {(item.price * item.quantity)?.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Resumo de Valores */}
              <Card className="bg-[#F5F1E8]">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B7355]">Subtotal</span>
                    <span className="font-semibold">
                      R$ {(pedido.value - (pedido.shipping_value || 0) + (pedido.discount || 0))?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {pedido.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8B7355]">Desconto</span>
                      <span className="font-semibold text-red-600">
                        - R$ {pedido.discount?.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B7355]">Frete</span>
                    <span className="font-semibold">
                      R$ {pedido.shipping_value?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#6B4423]">Total</span>
                    <span className="text-[#2D5016]">
                      R$ {pedido.value?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Status */}
              {pedido.history?.data && pedido.history.data.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#6B4423] mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Histórico de Status
                  </h3>
                  <div className="space-y-2">
                    {pedido.history.data.map((hist, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {hist.status_id === pedido.status?.data?.id ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-[#8B7355]" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{hist.status_name}</p>
                                {hist.observation && (
                                  <p className="text-xs text-[#8B7355]">{hist.observation}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-[#8B7355]">
                              {format(new Date(hist.created_at?.date || new Date()), "dd/MM/yy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AtualizarStatusModal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        pedido={pedido}
        onSuccess={handleStatusUpdated}
      />
    </>
  );
}