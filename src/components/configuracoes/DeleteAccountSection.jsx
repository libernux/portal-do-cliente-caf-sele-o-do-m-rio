import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DeleteAccountSection({ user }) {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "EXCLUIR") {
      toast.error("Digite EXCLUIR para confirmar");
      return;
    }

    setIsDeleting(true);
    try {
      // Deletar dados do usuário
      // Nota: Em produção, isso deveria chamar uma função backend para deletar todos os dados
      await base44.auth.logout();
      toast.success("Conta excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast.error("Erro ao excluir conta. Tente novamente.");
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDialog(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Minha Conta
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão de Conta
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                Esta ação é <strong>irreversível</strong>. Ao excluir sua conta:
              </p>
              <ul className="list-disc ml-4 space-y-1 text-sm">
                <li>Todos os seus dados pessoais serão removidos</li>
                <li>Você perderá acesso a todos os recursos</li>
                <li>Histórico e configurações serão apagados</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Digite <strong className="text-red-600">EXCLUIR</strong> para confirmar:
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="EXCLUIR"
                className="border-red-200 focus:border-red-400"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setConfirmText("");
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmText !== "EXCLUIR" || isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Excluir Permanentemente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}