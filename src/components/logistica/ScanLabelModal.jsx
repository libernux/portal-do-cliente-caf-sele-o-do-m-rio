import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Upload, Camera, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ScanLabelModal({ open, onClose, onDataExtracted }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const labelSchema = {
    type: "object",
    properties: {
      codigo_rastreamento: {
        type: "string",
        description: "Código de rastreamento da encomenda"
      },
      remetente: {
        type: "string",
        description: "Nome do remetente"
      },
      destinatario: {
        type: "string",
        description: "Nome do destinatário"
      },
      endereco_destino: {
        type: "string",
        description: "Endereço completo de destino"
      },
      cidade_destino: {
        type: "string",
        description: "Cidade de destino"
      },
      peso: {
        type: "string",
        description: "Peso da encomenda"
      },
      transportadora: {
        type: "string",
        description: "Nome da transportadora (Correios, Melhor Envio, LATAM, etc)"
      }
    }
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Upload da imagem
      const { file_url } = await UploadFile({ file });

      // Extrair dados da etiqueta
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: labelSchema
      });

      if (result.status === "success" && result.output) {
        // Mapear os dados extraídos para o formato da caixa
        const caixaData = {
          codigo_rastreamento: result.output.codigo_rastreamento || "",
          responsavel: result.output.remetente || "",
          conteudo: `Destinatário: ${result.output.destinatario || "Não informado"}`,
          meio_transporte: determineMeioTransporte(result.output.transportadora),
          observacoes: `Destino: ${result.output.endereco_destino || ""}\nCidade: ${result.output.cidade_destino || ""}\nPeso: ${result.output.peso || ""}`,
          tem_etiqueta: true,
          codigo_etiqueta: result.output.codigo_rastreamento || "",
        };

        onDataExtracted(caixaData);
        onClose();
      } else {
        setError("Não foi possível extrair as informações da etiqueta. Tente novamente ou preencha manualmente.");
      }
    } catch (err) {
      setError("Erro ao processar a imagem. Verifique se a foto está nítida e tente novamente.");
      console.error("Erro:", err);
    }

    setIsProcessing(false);
  };

  const determineMeioTransporte = (transportadora) => {
    if (!transportadora) return "Outro";
    
    const lower = transportadora.toLowerCase();
    if (lower.includes("correio")) return "Correios";
    if (lower.includes("latam") || lower.includes("cargo")) return "Transportadora";
    if (lower.includes("jadlog") || lower.includes("melhor")) return "Transportadora";
    
    return "Transportadora";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processImage(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processImage(files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Escanear Etiqueta
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p className="text-[#8B7355] text-sm">
            Tire uma foto ou faça upload da etiqueta de envio para extrair automaticamente as informações.
          </p>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 transition-all ${
              dragActive 
                ? "border-[#6B4423] bg-[#F5F1E8]" 
                : "border-[#E5DCC8] hover:border-[#C9A961]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />

            <div className="text-center space-y-4">
              {isProcessing ? (
                <>
                  <Loader2 className="w-12 h-12 text-[#6B4423] mx-auto animate-spin" />
                  <p className="text-[#6B4423] font-medium">
                    Processando etiqueta...
                  </p>
                  <p className="text-sm text-[#8B7355]">
                    Extraindo informações da imagem
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto bg-[#F5F1E8] rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#6B4423]" />
                  </div>
                  <div>
                    <p className="text-[#6B4423] font-medium mb-2">
                      Arraste a imagem aqui ou clique para selecionar
                    </p>
                    <p className="text-sm text-[#8B7355]">
                      Formatos: JPG, PNG
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Usar Câmera
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-[#F5F1E8] rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-[#2D5016] mt-0.5" />
              <div>
                <p className="font-medium text-[#6B4423] text-sm">Dicas para melhor resultado:</p>
                <ul className="text-xs text-[#8B7355] space-y-1 mt-1">
                  <li>• Tire a foto com boa iluminação</li>
                  <li>• Mantenha a etiqueta plana e visível</li>
                  <li>• Certifique-se que os códigos de barras estejam legíveis</li>
                  <li>• Evite reflexos e sombras</li>
                  <li>• **iPhone: Converta HEIC para JPG antes de enviar**</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}