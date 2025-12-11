import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Status comuns da Yampi
const STATUS_OPTIONS = [
  { id: 1, name: "Aguardando Pagamento" },
  { id: 2, name: "Pagamento Aprovado" },
  { id: 3, name: "Em Separação" },
  { id: 4, name: "Enviado" },
  { id: 5, name: "Entregue" },
  { id: 6, name: "Cancelado" },
  { id: 7, name: "Devolvido" },
  { id: 8, name: "Em Disputa" }
];

export default function AtualizarStatusModal({ open, onClose, pedido, onSuccess }) {
  const [statusId, setStatusId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statusId || !pedido) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('updateYampiOrderStatus', {
        orderId: pedido.id,
        statusId: parseInt(statusId),
        observacao
      });

      if (response.data.success) {
        setStatusId("");
        setObservacao("");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response.data.error || 'Erro ao atualizar status');
      }
    } catch (err) {
      setError('Erro ao atualizar status do pedido');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setStatusId("");
    setObservacao("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Status do Pedido</DialogTitle>
        </DialogHeader>
        
        {pedido && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-[#8B7355] mb-2">
                Pedido #{pedido.number} - ID: {pedido.id}
              </p>
              <p className="text-sm font-medium">
                Status Atual: {pedido.status?.data?.name || 'N/A'}
              </p>
            </div>

            <div>
              <Label>Novo Status *</Label>
              <Select
                value={statusId}
                onValueChange={setStatusId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.id} value={String(status.id)}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Observação (opcional)</Label>
              <Textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Adicione uma observação sobre a atualização..."
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isUpdating}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#6B4423]" disabled={isUpdating || !statusId}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Status'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}