import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [usuariosData, me] = await Promise.all([
      User.list(),
      User.me()
    ]);
    setUsuarios(usuariosData);
    setCurrentUser(me);
    setIsLoading(false);
  };

  const cargoColors = {
    "Super Admin": "bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white",
    "Administrativo": "bg-[#2D5016]/10 text-[#2D5016] border border-[#2D5016]",
    "Parceiro Logístico": "bg-[#C9A961]/10 text-[#8B7355] border border-[#C9A961]",
    "Representante": "bg-blue-100 text-blue-800 border border-blue-300"
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-[#8B7355]">
            Equipe e permissões do sistema
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((usuario, index) => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${
                  currentUser?.email === usuario.email ? 'ring-2 ring-[#6B4423]' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                          {usuario.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-[#6B4423] mb-1">
                          {usuario.full_name}
                          {currentUser?.email === usuario.email && (
                            <span className="text-sm text-[#8B7355] ml-2">(Você)</span>
                          )}
                        </CardTitle>
                        {usuario.cargo && (
                          <Badge className={cargoColors[usuario.cargo] || "bg-gray-100 text-gray-800"}>
                            {usuario.cargo}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-[#8B7355]" />
                      <span className="text-[#8B7355] truncate">{usuario.email}</span>
                    </div>

                    {usuario.telefone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-[#8B7355]" />
                        <span className="text-[#8B7355]">{usuario.telefone}</span>
                      </div>
                    )}

                    {usuario.localizacao_padrao && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#8B7355]" />
                        <span className="text-[#8B7355]">{usuario.localizacao_padrao}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E5DCC8]">
                      <Badge variant="outline" className={`
                        ${usuario.role === 'admin' 
                          ? 'bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]' 
                          : 'bg-gray-100 text-gray-800 border-gray-300'}
                      `}>
                        {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {usuarios.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
            <UsersIcon className="w-16 h-16 text-[#8B7355] mx-auto mb-4" />
            <p className="text-[#8B7355] text-lg">Nenhum usuário encontrado</p>
          </div>
        )}

        <div className="mt-8 bg-[#F5F1E8] rounded-xl p-6 border border-[#E5DCC8]">
          <h2 className="text-lg font-bold text-[#6B4423] mb-3">
            Sobre Permissões e Usuários
          </h2>
          <p className="text-[#8B7355] mb-4">
            Para adicionar novos usuários ao sistema, use a funcionalidade de convite na área administrativa do Base44.
          </p>
          <ul className="space-y-2 text-sm text-[#8B7355]">
            <li>• <strong>Super Admin:</strong> Acesso completo ao sistema e gerenciamento de permissões</li>
            <li>• <strong>Administrativo:</strong> Visualiza e atualiza dados operacionais</li>
            <li>• <strong>Parceiro Logístico:</strong> Gerencia caixas atribuídas e atualiza status</li>
            <li>• <strong>Representante:</strong> Visualiza tarefas e registra demandas de clientes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}