import React, { useState, useMemo, useEffect } from 'react';
import { useModeracaoItens } from '@/hooks/useModeracaoItens';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  BarChart3,
  Flag,
  Users,
  History,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import ItemModeracaoCardCompleto from './ItemModeracaoCardCompleto';

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
      await aprovarItem(moderacaoId);
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitar = async (moderacaoId: string) => {
    setModeracaoLoading(true);
    try {
      await rejeitarItem(moderacaoId, 'rejeitado_admin', 'Item rejeitado pela moderação');
      await refetch();
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

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', value: 'dashboard' },
    { icon: Shield, label: 'Revisar Itens', value: 'revisar', count: stats.pendentes },
    { icon: Flag, label: 'Denúncias', value: 'denuncias', count: stats.reportados },
    { icon: Users, label: 'Usuários', value: 'usuarios' },
    { icon: History, label: 'Histórico', value: 'historico' },
    { icon: Settings, label: 'Configurações', value: 'configuracoes' },
  ];

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
      {/* Sidebar */}
      <div className="w-64 bg-card border-r p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">ModePanel</h1>
            <p className="text-sm text-muted-foreground">Sistema de Moderação</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            NAVEGAÇÃO
          </h2>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.value}
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-3"
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== undefined && (
                  <Badge 
                    variant={item.count > 0 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Status do Sistema */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Itens Pendentes</span>
              <Badge variant="secondary">{stats.pendentes}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Denúncias Ativas</span>
              <Badge variant="destructive">{stats.reportados}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Usuários Suspensos</span>
              <Badge variant="outline">3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

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
            Voltar
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por título ou vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                <SelectItem value="roupas">Roupas</SelectItem>
                <SelectItem value="calcados">Calçados</SelectItem>
                <SelectItem value="brinquedos">Brinquedos</SelectItem>
                <SelectItem value="livros">Livros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pendentes" className="gap-2">
              <Clock className="w-4 h-4" />
              Pendentes ({stats.pendentes})
            </TabsTrigger>
            <TabsTrigger value="reportados" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reportados ({stats.reportados})
            </TabsTrigger>
            <TabsTrigger value="aprovados" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Aprovados ({stats.aprovados})
            </TabsTrigger>
            <TabsTrigger value="rejeitados" className="gap-2">
              <XCircle className="w-4 h-4" />
              Rejeitados ({stats.rejeitados})
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <TabsContent value={activeTab} className="space-y-6">
            {itensFiltrados.length > 0 ? (
              <div className="grid gap-4">
                {itensFiltrados.map((item) => (
                  <ItemModeracaoCardCompleto
                    key={item.item_id}
                    item={item}
                    onAprovar={handleAprovar}
                    onRejeitar={handleRejeitar}
                    onAceitarDenuncia={handleAceitarDenuncia}
                    onRejeitarDenuncia={handleRejeitarDenuncia}
                    loading={moderacaoLoading}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
                  <p className="text-muted-foreground">
                    Não há itens {activeTab} no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModePanel;