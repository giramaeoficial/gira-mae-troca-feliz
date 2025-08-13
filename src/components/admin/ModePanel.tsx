import React, { useState, useMemo, useEffect } from 'react';
import { useModeracaoItens } from '@/hooks/useModeracaoItens';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import ModerationSidebar from './moderation/ModerationSidebar';
import ModerationFilters from './moderation/ModerationFilters';
import ModerationTabs from './moderation/ModerationTabs';

const ModePanel = () => {
  const { itens, loading, aprovarItem, rejeitarItem, aceitarDenuncia, rejeitarDenuncia, refetch } = useModeracaoItens();
  const { profiles, fetchMultipleProfiles } = useUserProfiles();
  
  const [moderacaoLoading, setModeracaoLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [activeTab, setActiveTab] = useState('pendentes');

  // Buscar perfis dos usuários quando itens carregarem
  useEffect(() => {
    console.log('📊 Itens carregados no ModePanel:', itens);
    if (itens.length > 0) {
      const userIds = itens.map(item => item.usuario_id).filter(Boolean);
      console.log('👥 UserIds encontrados:', userIds);
      fetchMultipleProfiles(userIds);
    }
  }, [itens, fetchMultipleProfiles]);

  // Estatísticas
  const stats = useMemo(() => {
    console.log('📈 Calculando estatísticas para itens:', itens);
    
    const pendentes = itens.filter(item => {
      const isPendente = item.moderacao_status === 'pendente';
      console.log(`Item ${item.item_id} - Status: ${item.moderacao_status}, É pendente: ${isPendente}`);
      return isPendente;
    }).length;
    
    const reportados = itens.filter(item => {
      const isReportado = item.tem_denuncia;
      console.log(`Item ${item.item_id} - Tem denúncia: ${isReportado}`);
      return isReportado;
    }).length;
    
    const aprovados = itens.filter(item => {
      const isAprovado = item.moderacao_status === 'aprovado';
      console.log(`Item ${item.item_id} - Status: ${item.moderacao_status}, É aprovado: ${isAprovado}`);
      return isAprovado;
    }).length;
    
    const rejeitados = itens.filter(item => {
      const isRejeitado = item.moderacao_status === 'rejeitado';
      console.log(`Item ${item.item_id} - Status: ${item.moderacao_status}, É rejeitado: ${isRejeitado}`);
      return isRejeitado;
    }).length;
    
    const stats = { pendentes, reportados, aprovados, rejeitados };
    console.log('📊 Estatísticas calculadas:', stats);
    
    return stats;
  }, [itens]);

  // Filtrar itens por aba
  const itensFiltrados = useMemo(() => {
    console.log('🔍 Iniciando filtros - Aba ativa:', activeTab);
    console.log('🔍 Total de itens:', itens.length);
    
    let resultado = [...itens];

    // Filtrar por aba
    switch (activeTab) {
      case 'pendentes':
        resultado = resultado.filter(item => {
          const isPendente = item.moderacao_status === 'pendente';
          console.log(`  🔍 Filtro pendentes - Item ${item.item_id}: status=${item.moderacao_status}, passou=${isPendente}`);
          return isPendente;
        });
        break;
      case 'reportados':
        resultado = resultado.filter(item => {
          const isReportado = item.tem_denuncia;
          console.log(`  🔍 Filtro reportados - Item ${item.item_id}: tem_denuncia=${item.tem_denuncia}, passou=${isReportado}`);
          return isReportado;
        });
        break;
      case 'aprovados':
        resultado = resultado.filter(item => {
          const isAprovado = item.moderacao_status === 'aprovado';
          console.log(`  🔍 Filtro aprovados - Item ${item.item_id}: status=${item.moderacao_status}, passou=${isAprovado}`);
          return isAprovado;
        });
        break;
      case 'rejeitados':
        resultado = resultado.filter(item => {
          const isRejeitado = item.moderacao_status === 'rejeitado';
          console.log(`  🔍 Filtro rejeitados - Item ${item.item_id}: status=${item.moderacao_status}, passou=${isRejeitado}`);
          return isRejeitado;
        });
        break;
    }

    console.log(`🔍 Após filtro por aba "${activeTab}": ${resultado.length} itens`);

    // Filtrar por busca
    if (searchTerm) {
      const antesSearch = resultado.length;
      resultado = resultado.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`🔍 Após filtro de busca "${searchTerm}": ${resultado.length} itens (antes: ${antesSearch})`);
    }

    // Filtrar por categoria
    if (selectedCategory !== 'todas') {
      const antesCategoria = resultado.length;
      resultado = resultado.filter(item => item.categoria === selectedCategory);
      console.log(`🔍 Após filtro de categoria "${selectedCategory}": ${resultado.length} itens (antes: ${antesCategoria})`);
    }

    console.log('🔍 Resultado final:', resultado.length, 'itens');
    return resultado;
  }, [itens, activeTab, searchTerm, selectedCategory]);

  const handleAprovar = async (moderacaoId: string) => {
    setModeracaoLoading(true);
    try {
      console.log('🟢 ModePanel - Aprovando item:', moderacaoId);
      await aprovarItem(moderacaoId);
      console.log('🟢 ModePanel - Item aprovado, fazendo refetch...');
      await refetch();
      console.log('🟢 ModePanel - Refetch concluído');
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitar = async (moderacaoId: string) => {
    setModeracaoLoading(true);
    try {
      console.log('🔴 ModePanel - Rejeitando item:', moderacaoId);
      await rejeitarItem(moderacaoId, 'rejeitado_admin', 'Item rejeitado pela moderação');
      console.log('🔴 ModePanel - Item rejeitado, fazendo refetch...');
      await refetch();
      console.log('🔴 ModePanel - Refetch concluído');
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleAceitarDenuncia = async (denunciaId: string) => {
    setModeracaoLoading(true);
    try {
      await aceitarDenuncia(denunciaId, 'denuncia_procedente', 'Item removido por denúncia válida');
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitarDenuncia = async (denunciaId: string) => {
    setModeracaoLoading(true);
    try {
      await rejeitarDenuncia(denunciaId, 'Denúncia considerada improcedente');
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando sistema de moderação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ModerationSidebar stats={stats} />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Revisar Itens</h1>
            <p className="text-muted-foreground">Analise e modere os itens do marketplace</p>
          </div>
          <Button onClick={refetch} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <ModerationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <ModerationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          itensFiltrados={itensFiltrados}
          onAprovar={handleAprovar}
          onRejeitar={handleRejeitar}
          onAceitarDenuncia={handleAceitarDenuncia}
          onRejeitarDenuncia={handleRejeitarDenuncia}
          loading={moderacaoLoading}
        />
      </div>
    </div>
  );
};

export default ModePanel;