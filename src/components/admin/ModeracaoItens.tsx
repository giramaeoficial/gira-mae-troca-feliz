import React, { useState } from 'react';
import { useModeracaoItens } from '@/hooks/useModeracaoItens';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { ItemModeracaoCard } from './ItemModeracaoCard';
import StatusModeracaoWidget from './StatusModeracaoWidget';

const ModeracaoItens = () => {
  const { itens, loading, aprovarItem, rejeitarItem, aceitarDenuncia, rejeitarDenuncia, refetch } = useModeracaoItens();
  const [moderacaoLoading, setModeracaoLoading] = useState(false);
  
  // Nenhum dado extra carregado aqui; cada card busca detalhes sob demanda


  const handleAprovar = async (itemId: string) => {
    setModeracaoLoading(true);
    try {
      await aprovarItem(itemId);
      await refetch(); // Atualizar lista após aprovação
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitar = async (itemId: string, motivo: string, observacoes?: string) => {
    setModeracaoLoading(true);
    try {
      await rejeitarItem(itemId, motivo, observacoes);
      await refetch(); // Atualizar lista após rejeição
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleAceitarDenuncia = async (denunciaId: string) => {
    setModeracaoLoading(true);
    try {
      await aceitarDenuncia(denunciaId, 'denuncia_procedente', 'Item removido por denúncia válida');
      await refetch(); // Atualizar lista após aceitar denúncia
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitarDenuncia = async (denunciaId: string) => {
    setModeracaoLoading(true);
    try {
      await rejeitarDenuncia(denunciaId, 'Denúncia considerada improcedente');
      await refetch(); // Atualizar lista após rejeitar denúncia
    } finally {
      setModeracaoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando itens para moderação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Moderação de Itens</h2>
          <p className="text-muted-foreground">
            Análise e aprovação de itens publicados na plataforma
          </p>
        </div>
        <Button onClick={refetch} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Carregando...' : 'Atualizar Lista'}
        </Button>
      </div>

      {/* Widget de Status */}
      <StatusModeracaoWidget
        totalPendentes={itens.length}
        totalAprovados={0} // TODO: implementar contadores no hook
        totalRejeitados={0} // TODO: implementar contadores no hook
      />

      {/* Lista de Itens para Moderação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Itens Pendentes de Moderação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : itens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>✅ Nenhum item pendente de moderação!</p>
              <p className="text-sm mt-2">Todos os itens foram analisados.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>📊 {itens.length} itens para analisar</span>
                <span>•</span>
                <span>🔄 Atualizado: {new Date().toLocaleTimeString()}</span>
              </div>
              
              {itens.map((item) => (
                <ItemModeracaoCard
                  key={item.moderacao_id}
                  item={item}
                  onAprovar={handleAprovar}
                  onRejeitar={handleRejeitar}
                  onAceitarDenuncia={handleAceitarDenuncia}
                  onRejeitarDenuncia={handleRejeitarDenuncia}
                  loading={moderacaoLoading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeracaoItens;