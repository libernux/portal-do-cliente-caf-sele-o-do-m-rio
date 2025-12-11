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
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BuscarProdutoModal({ open, onClose }) {
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [produto, setProduto] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);
    setProduto(null);

    try {
      const response = await base44.functions.invoke('getYampiProductById', {
        productId
      });

      if (response.data.success) {
        setProduto(response.data.produto);
      } else {
        setError(response.data.error || 'Produto não encontrado');
      }
    } catch (err) {
      setError('Erro ao buscar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setProductId("");
    setProduto(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Produto por ID</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>ID do Produto na Yampi</Label>
              <Input
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Ex: 12345"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !productId}
              className="mt-6 bg-[#6B4423]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {produto && (
            <div className="border border-[#E5DCC8] rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {produto.images?.data?.[0]?.url && (
                    <img
                      src={produto.images.data[0].url}
                      alt={produto.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-[#6B4423] text-lg">{produto.name}</h3>
                    <p className="text-sm text-[#8B7355]">SKU: {produto.sku}</p>
                    <p className="text-sm text-[#8B7355]">ID Yampi: {produto.id}</p>
                  </div>
                </div>
                <Badge variant={produto.active ? "default" : "secondary"}>
                  {produto.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-t border-[#E5DCC8] pt-4">
                <div>
                  <p className="text-[#8B7355]">Preço</p>
                  <p className="font-semibold text-[#2D5016]">
                    R$ {produto.prices?.data?.[0]?.price?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[#8B7355]">Estoque</p>
                  <p className="font-semibold">
                    {produto.skus?.data?.[0]?.quantity || 0} un
                  </p>
                </div>
                <div>
                  <p className="text-[#8B7355]">Categoria</p>
                  <p className="font-semibold">
                    {produto.categories?.data?.[0]?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[#8B7355]">Peso</p>
                  <p className="font-semibold">
                    {produto.skus?.data?.[0]?.weight || 0} kg
                  </p>
                </div>
              </div>

              {produto.description && (
                <div className="border-t border-[#E5DCC8] pt-4">
                  <p className="text-[#8B7355] text-sm mb-2">Descrição:</p>
                  <p className="text-sm">{produto.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}