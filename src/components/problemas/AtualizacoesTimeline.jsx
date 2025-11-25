import React, { useState, useEffect } from "react";
import { AtualizacaoProblema } from "@/entities/AtualizacaoProblema";
import { Problema } from "@/entities/Problema";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User as UserIcon, Eye, EyeOff, Bell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { notificarAtualizacao } from "@/functions/notificarAtualizacao";

export default function AtualizacoesTimeline({ problemaId, problema, onUpdate }) {
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("Comentário");
  const [visivelCliente, setVisivelCliente] = useState(true);
  const [notificarCliente, setNotificarCliente] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await User.me();
      setUser(currentUser);
    };

    const loadAtualizacoes = async () => {
      setIsLoading(true);
      const data = await AtualizacaoProblema.filter({ problema_id: problemaId }, "-created_date");
      setAtualizacoes(data);
      setIsLoading(false);
    };

    const marcarComoLido = async () => {
      try {
        if (problema && problema.tem_novas_atualizacoes) {
          await Problema.update(problemaId, {
            ...problema,
            tem_novas_atualizacoes: false
          });
          if (onUpdate) onUpdate();
        }
      } catch (error) {
        console.error("Erro ao marcar como lido:", error);
      }
    };

    loadUser();
    loadAtualizacoes();
    marcarComoLido();
  }, [problemaId, problema, onUpdate]);

  const loadAtualizacoes = async () => {
    setIsLoading(true);
    const data = await AtualizacaoProblema.filter({ problema_id: problemaId }, "-created_date");
    setAtualizacoes(data);
    setIsLoading(false);
  };

  const handleEnviar = async () => {
    if (!novaMensagem.trim()) return;
    
    setIsSending(true);
    try {
      const novaAtualizacao = await AtualizacaoProblema.create({
        problema_id: problemaId,
        tipo: tipoMensagem,
        mensagem: novaMensagem,
        autor: user?.full_name || "Sistema",
        visivel_cliente: visivelCliente,
        notificar_cliente: notificarCliente
      });

      // Atualizar problema com timestamp da última interação da equipe
      await Problema.update(problemaId, {
        ...problema,
        ultima_interacao_equipe: new Date().toISOString(),
        tem_novas_atualizacoes: false
      });

      // Se deve notificar o cliente, enviar email
      if (notificarCliente && problema?.email_cliente) {
        await notificarAtualizacao({
          problemaId: problemaId,
          atualizacaoId: novaAtualizacao.id,
          emailCliente: problema.email_cliente,
          nomeCliente: problema.nome_cliente
        });
      }

      setNovaMensagem("");
      setVisivelCliente(true);
      setNotificarCliente(false);
      loadAtualizacoes();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erro ao enviar atualização:", error);
      alert("Erro ao enviar atualização");
    }
    setIsSending(false);
  };

  const tipoColors = {
    "Comentário": "bg-blue-100 text-blue-800",
    "Mudança Status": "bg-[#C9A961]/20 text-[#8B7355]",
    "Atribuição": "bg-purple-100 text-purple-800",
    "Resolução": "bg-[#2D5016]/20 text-[#2D5016]",
    "Interno": "bg-gray-100 text-gray-800"
  };

  return (
    <div className="space-y-4">
      {/* Nova Atualização */}
      <div className="bg-[#F5F1E8] p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-[#6B4423] flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Adicionar Atualização
        </h3>
        
        <Textarea
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Descreva o que foi feito, próximos passos, ou adicione um comentário..."
          className="border-[#E5DCC8]"
          rows={3}
        />

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={tipoMensagem}
            onChange={(e) => setTipoMensagem(e.target.value)}
            className="px-3 py-2 border border-[#E5DCC8] rounded-md text-sm"
          >
            <option value="Comentário">💬 Comentário</option>
            <option value="Mudança Status">🔄 Mudança Status</option>
            <option value="Atribuição">👤 Atribuição</option>
            <option value="Resolução">✅ Resolução</option>
            <option value="Interno">🔒 Nota Interna</option>
          </select>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={visivelCliente}
              onChange={(e) => setVisivelCliente(e.target.checked)}
              className="w-4 h-4 text-[#6B4423] rounded"
            />
            <Eye className="w-4 h-4" />
            <span className="text-[#6B4423]">Visível ao cliente</span>
          </label>

          {visivelCliente && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notificarCliente}
                onChange={(e) => setNotificarCliente(e.target.checked)}
                className="w-4 h-4 text-[#6B4423] rounded"
              />
              <Bell className="w-4 h-4" />
              <span className="text-[#6B4423]">Notificar por email</span>
            </label>
          )}

          <Button
            onClick={handleEnviar}
            disabled={isSending || !novaMensagem.trim()}
            className="bg-[#6B4423] hover:bg-[#5A3A1E] ml-auto"
          >
            {isSending ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>

      {/* Timeline de Atualizações */}
      <div className="space-y-3">
        <h3 className="font-semibold text-[#6B4423] flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Histórico de Atualizações ({atualizacoes.length})
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : atualizacoes.length > 0 ? (
          <div className="space-y-3">
            {atualizacoes.map((atualizacao, index) => (
              <motion.div
                key={atualizacao.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white p-4 rounded-lg border-l-4 ${
                  atualizacao.visivel_cliente ? 'border-[#6B4423]' : 'border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#6B4423] text-sm">{atualizacao.autor}</p>
                      <p className="text-xs text-[#8B7355]">
                        {format(new Date(atualizacao.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={tipoColors[atualizacao.tipo]}>
                      {atualizacao.tipo}
                    </Badge>
                    {!atualizacao.visivel_cliente && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Interno
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-[#6B4423] whitespace-pre-wrap">{atualizacao.mensagem}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#8B7355] py-8">
            Nenhuma atualização ainda. Seja o primeiro a adicionar!
          </p>
        )}
      </div>
    </div>
  );
}