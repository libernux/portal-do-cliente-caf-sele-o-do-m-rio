import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Send } from "lucide-react";

export default function EnviarAssinaturaModal({ open, onClose, contrato, onEnviar }) {
  const [signatarios, setSignatarios] = useState([
    { 
      nome: contrato?.contratante_nome || "", 
      email: contrato?.contratante_email || "", 
      cpf: contrato?.contratante_cpf || "",
      tipo: "Contratante" 
    }
  ]);
  const [isEnviando, setIsEnviando] = useState(false);

  const addSignatario = () => {
    setSignatarios([...signatarios, { nome: "", email: "", cpf: "", tipo: "Contratada" }]);
  };

  const removeSignatario = (index) => {
    if (signatarios.length > 1) {
      setSignatarios(signatarios.filter((_, i) => i !== index));
    }
  };

  const updateSignatario = (index, field, value) => {
    const updated = [...signatarios];
    updated[index][field] = value;
    setSignatarios(updated);
  };

  const handleEnviar = async () => {
    // Validar
    const invalidos = signatarios.filter(s => !s.nome || !s.email);
    if (invalidos.length > 0) {
      alert("Preencha todos os campos dos signatários");
      return;
    }

    setIsEnviando(true);
    try {
      await onEnviar(signatarios);
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
    setIsEnviando(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            Enviar para Assinatura
          </DialogTitle>
          <p className="text-sm text-[#8B7355]">
            Contrato: {contrato?.numero_contrato}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-[#F5F1E8] p-4 rounded-lg">
            <p className="text-sm text-[#5A4A3A]">
              Configure os signatários que receberão o contrato para assinatura digital.
              Todos receberão um email com o link para assinar.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#6B4423]">Signatários</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addSignatario}
                className="border-[#E5DCC8]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {signatarios.map((sig, index) => (
              <div key={index} className="border border-[#E5DCC8] p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#6B4423]">
                    Signatário #{index + 1}
                  </span>
                  {signatarios.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSignatario(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={sig.nome}
                      onChange={(e) => updateSignatario(index, 'nome', e.target.value)}
                      className="border-[#E5DCC8]"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={sig.email}
                      onChange={(e) => updateSignatario(index, 'email', e.target.value)}
                      className="border-[#E5DCC8]"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input
                      value={sig.cpf}
                      onChange={(e) => updateSignatario(index, 'cpf', e.target.value)}
                      className="border-[#E5DCC8]"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label>Tipo *</Label>
                    <Select
                      value={sig.tipo}
                      onValueChange={(value) => updateSignatario(index, 'tipo', value)}
                    >
                      <SelectTrigger className="border-[#E5DCC8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contratante">Contratante</SelectItem>
                        <SelectItem value="Contratada">Contratada</SelectItem>
                        <SelectItem value="Testemunha">Testemunha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DCC8]">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#E5DCC8]"
              disabled={isEnviando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviar}
              disabled={isEnviando}
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              {isEnviando ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Assinatura
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}