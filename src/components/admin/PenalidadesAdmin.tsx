import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PenalidadeUsuario } from '@/hooks/usePenalidades';

interface PenalidadeComUsuario extends PenalidadeUsuario {
  profiles: {
    nome: string;
    username: string;
  };
}

export const PenalidadesAdmin: React.FC = () => {
  const [penalidades, setPenalidades] = useState<PenalidadeComUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPenalidades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('penalidades_usuario')
        .select(`
          *,
          profiles:usuario_id (
            nome,
            username
          )
        `)
        .eq('ativo', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setPenalidades(data || []);
    } catch (err) {
      console.error('Erro ao buscar penalidades:', err);
    } finally {
      setLoading(false);
    }
  };

  const limparPenalidadesExpiradas = async () => {
    try {
      const { data, error } = await supabase.rpc('limpar_penalidades_expiradas');
      if (error) throw error;
      
      console.log(`${data} penalidades limpas`);
      fetchPenalidades(); // Recarregar lista
    } catch (err) {
      console.error('Erro ao limpar penalidades:', err);
    }
  };

  useEffect(() => {
    fetchPenalidades();
  }, []);

  const getNivelTexto = (nivel: number) => {
    switch (nivel) {
      case 1: return 'Leve';
      case 2: return 'Médio';
      case 3: return 'Grave';
      default: return 'Desconhecido';
    }
  };

  const getCorNivel = (nivel: number) => {
    switch (nivel) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-300';
      case 3: return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const penalidadesFiltradas = penalidades.filter(p => {
    if (!searchTerm) return true;
    const termo = searchTerm.toLowerCase();
    return (
      p.profiles?.nome?.toLowerCase().includes(termo) ||
      p.profiles?.username?.toLowerCase().includes(termo) ||
      p.tipo.toLowerCase().includes(termo) ||
      p.motivo?.toLowerCase().includes(termo)
    );
  });

  const estatisticas = {
    total: penalidades.length,
    leves: penalidades.filter(p => p.nivel === 1).length,
    medias: penalidades.filter(p => p.nivel === 2).length,
    graves: penalidades.filter(p => p.nivel === 3).length,
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{estatisticas.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Ativas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">{estatisticas.leves}</span>
            </div>
            <p className="text-sm text-muted-foreground">Leves</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">{estatisticas.medias}</span>
            </div>
            <p className="text-sm text-muted-foreground">Médias</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold">{estatisticas.graves}</span>
            </div>
            <p className="text-sm text-muted-foreground">Graves</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Penalidades Ativas
            </span>
            <Button onClick={limparPenalidadesExpiradas} variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Limpar Expiradas
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Buscar por usuário, tipo ou motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Lista de Penalidades */}
          <div className="space-y-4">
            {penalidadesFiltradas.map((penalidade) => (
              <div
                key={penalidade.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {penalidade.profiles?.nome || 'Nome não disponível'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        @{penalidade.profiles?.username || 'username'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCorNivel(penalidade.nivel)}>
                        {getNivelTexto(penalidade.nivel)}
                      </Badge>
                      <span className="text-sm">
                        {penalidade.tipo === 'item_rejeitado' && 'Item Rejeitado'}
                        {penalidade.tipo === 'denuncia_falsa' && 'Denúncia Falsa'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {penalidade.expira_em 
                        ? `Expira ${formatDistanceToNow(new Date(penalidade.expira_em), { addSuffix: true, locale: ptBR })}`
                        : 'Sem expiração'
                      }
                    </div>
                    <div>
                      Aplicada {formatDistanceToNow(new Date(penalidade.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                </div>
                
                {penalidade.motivo && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Motivo:</strong> {penalidade.motivo}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {penalidadesFiltradas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhuma penalidade encontrada com os filtros aplicados.' : 'Nenhuma penalidade ativa no momento.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};