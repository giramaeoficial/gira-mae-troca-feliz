import React, { useState, useMemo, useEffect } from 'react';
import { useModeracaoItens } from '@/hooks/useModeracaoItens';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Check, 
  X, 
  AlertTriangle, 
  User, 
  Calendar,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  DollarSign,
  MapPin,
  Star,
  ExternalLink,
  Info,
  Package,
  Shirt,
  Palette,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ModeracaoItens = () => {
  const { itens, loading, aprovarItem, rejeitarItem, aceitarDenuncia, rejeitarDenuncia, refetch } = useModeracaoItens();
  const { profiles, fetchMultipleProfiles } = useUserProfiles();
  
  const [moderacaoLoading, setModeracaoLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: 'todos',
    categoria: 'todas',
    denunciados: 'todos'
  });
  const [ordenacao, setOrdenacao] = useState({
    campo: 'data_publicacao',
    direcao: 'desc' as 'asc' | 'desc'
  });
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [moderacaoDialogAberto, setModeracaoDialogAberto] = useState(false);
  const [userModalAberto, setUserModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [tipoAcao, setTipoAcao] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Buscar perfis dos usuários quando itens carregarem
  useEffect(() => {
    if (itens.length > 0) {
      const userIds = itens.map(item => item.usuario_id).filter(Boolean);
      fetchMultipleProfiles(userIds);
    }
  }, [itens, fetchMultipleProfiles]);

  // Estatísticas
  const stats = useMemo(() => {
    const pendentes = itens.filter(item => item.moderacao_status === 'pendente').length;
    const emAnalise = itens.filter(item => item.moderacao_status === 'em_analise').length;
    const denunciados = itens.filter(item => item.tem_denuncia).length;
    const totalDenuncias = itens.reduce((acc, item) => acc + (item.total_denuncias || 0), 0);
    
    return { pendentes, emAnalise, denunciados, totalDenuncias };
  }, [itens]);

  // Filtrar e ordenar itens
  const itensFiltrados = useMemo(() => {
    let resultado = [...itens];

    if (filtros.busca) {
      resultado = resultado.filter(item =>
        item.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        item.usuario_nome.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    if (filtros.status !== 'todos') {
      resultado = resultado.filter(item => item.moderacao_status === filtros.status);
    }

    if (filtros.categoria !== 'todas') {
      resultado = resultado.filter(item => item.categoria === filtros.categoria);
    }

    if (filtros.denunciados === 'sim') {
      resultado = resultado.filter(item => item.tem_denuncia);
    } else if (filtros.denunciados === 'nao') {
      resultado = resultado.filter(item => !item.tem_denuncia);
    }

    // Priorização: denunciados primeiro, depois por data
    resultado.sort((a, b) => {
      // Primeiro critério: itens denunciados têm prioridade
      if (a.tem_denuncia && !b.tem_denuncia) return -1;
      if (!a.tem_denuncia && b.tem_denuncia) return 1;
      
      // Segundo critério: ordenação selecionada
      let valorA: any = a[ordenacao.campo as keyof typeof a];
      let valorB: any = b[ordenacao.campo as keyof typeof b];

      if (ordenacao.campo === 'data_publicacao' || ordenacao.campo === 'data_denuncia') {
        valorA = new Date(valorA).getTime();
        valorB = new Date(valorB).getTime();
      }

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (ordenacao.direcao === 'asc') {
        return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      } else {
        return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
      }
    });

    return resultado;
  }, [itens, filtros, ordenacao]);

  const handleAprovar = async (moderacaoId: string) => {
    setModeracaoLoading(true);
    try {
      await aprovarItem(moderacaoId);
      await refetch();
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitar = async (moderacaoId: string, motivo: string, observacoes?: string) => {
    setModeracaoLoading(true);
    try {
      await rejeitarItem(moderacaoId, motivo, observacoes);
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

  const abrirModalUsuario = (userId: string) => {
    const profile = profiles[userId];
    if (profile) {
      setUsuarioSelecionado(profile);
      setUserModalAberto(true);
    }
  };

  const abrirModalModeracao = (item: any, acao: string) => {
    setItemSelecionado(item);
    setTipoAcao(acao);
    setMotivoRejeicao('');
    setObservacoes('');
    setModeracaoDialogAberto(true);
  };

  const confirmarAcao = async () => {
    if (!itemSelecionado) return;

    try {
      switch (tipoAcao) {
        case 'aprovar':
          await handleAprovar(itemSelecionado.moderacao_id);
          break;
        case 'rejeitar':
          await handleRejeitar(itemSelecionado.moderacao_id, motivoRejeicao, observacoes);
          break;
        case 'aceitar_denuncia':
          await handleAceitarDenuncia(itemSelecionado.denuncia_id);
          break;
        case 'rejeitar_denuncia':
          await handleRejeitarDenuncia(itemSelecionado.denuncia_id);
          break;
      }
      setModeracaoDialogAberto(false);
    } catch (error) {
      console.error('Erro na moderação:', error);
    }
  };

  const StatusBadge = ({ status, temDenuncia }: { status: string; temDenuncia: boolean }) => {
    if (temDenuncia) {
      return (
        <Badge variant="destructive" className="gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          Denunciado
        </Badge>
      );
    }
    
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pendente</Badge>;
      case 'em_analise':
        return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600"><Eye className="w-3 h-3" />Em Análise</Badge>;
      case 'aprovado':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'eletrônicos':
      case 'eletronicos':
        return <Package className="w-4 h-4" />;
      case 'moda':
      case 'roupas':
        return <Shirt className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Moderação de Itens</h2>
          <p className="text-muted-foreground">
            Análise e aprovação de itens publicados na plataforma
          </p>
        </div>
        <Button onClick={refetch} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Análise</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Denunciados</p>
                <p className="text-2xl font-bold text-red-600">{stats.denunciados}</p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Denúncias</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalDenuncias}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou usuário..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10"
              />
            </div>

            <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtros.categoria} onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
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

            <Select value={filtros.denunciados} onValueChange={(value) => setFiltros(prev => ({ ...prev, denunciados: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Denúncias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Apenas denunciados</SelectItem>
                <SelectItem value="nao">Sem denúncias</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setOrdenacao(prev => ({ ...prev, direcao: prev.direcao === 'asc' ? 'desc' : 'asc' }))}
              className="gap-2"
            >
              {ordenacao.direcao === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              Ordenação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="space-y-4">
        {itensFiltrados.map((item) => (
          <Card key={item.item_id} className={`hover:shadow-md transition-shadow ${item.tem_denuncia ? 'ring-2 ring-red-200' : ''}`}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Imagem do Item */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                    {item.primeira_foto ? (
                      <img 
                        src={item.primeira_foto} 
                        alt={item.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados Básicos do Item */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {item.titulo}
                        </h3>
                        <StatusBadge status={item.moderacao_status} temDenuncia={item.tem_denuncia} />
                      </div>

                      {/* Informações básicas sempre visíveis */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getCategoriaIcon(item.categoria)}
                            <span className="font-medium">{item.categoria}</span>
                            {item.subcategoria && <span className="text-muted-foreground">• {item.subcategoria}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-600">{item.valor_girinhas} Girinhas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.estado_conservacao}
                            </Badge>
                            {item.genero && (
                              <Badge variant="outline" className="text-xs">
                                {item.genero}
                              </Badge>
                            )}
                            {item.tamanho_valor && (
                              <Badge variant="outline" className="text-xs">
                                Tam. {item.tamanho_valor}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={profiles[item.usuario_id]?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {item.usuario_nome.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{item.usuario_nome}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirModalUsuario(item.usuario_id)}
                              className="h-6 w-6 p-0"
                            >
                              <Info className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{profiles[item.usuario_id]?.cidade || 'N/A'}, {profiles[item.usuario_id]?.estado || 'N/A'}</span>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-blue-600"
                            onClick={() => window.open(`/perfil/${item.usuario_id}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Ver perfil público
                          </Button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(item.data_publicacao), { addSuffix: true, locale: ptBR })}</span>
                          </div>
                          {item.fotos && (
                            <div className="text-muted-foreground">
                              📷 {item.fotos.length} foto{item.fotos.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Descrição */}
                      <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
                        {item.descricao}
                      </p>

                      {/* Informações de Denúncia */}
                      {item.tem_denuncia && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-800">Denúncia Recebida</span>
                            <Badge variant="destructive" className="text-xs">
                              {item.total_denuncias} denúncia{item.total_denuncias > 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-red-700">
                            {item.motivo_denuncia && (
                              <p><strong>Motivo:</strong> {item.motivo_denuncia}</p>
                            )}
                            {item.descricao_denuncia && (
                              <p><strong>Descrição:</strong> {item.descricao_denuncia}</p>
                            )}
                            {item.data_denuncia && (
                              <p><strong>Denunciado:</strong> {formatDistanceToNow(new Date(item.data_denuncia), { addSuffix: true, locale: ptBR })}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações de Moderação */}
                    <div className="flex flex-col gap-2 ml-4">
                      {item.tem_denuncia && item.denuncia_id ? (
                        <>
                          <Button
                            onClick={() => abrirModalModeracao(item, 'aceitar_denuncia')}
                            size="sm"
                            variant="destructive"
                            disabled={moderacaoLoading}
                            className="gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Aceitar Denúncia
                          </Button>
                          <Button
                            onClick={() => abrirModalModeracao(item, 'rejeitar_denuncia')}
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            disabled={moderacaoLoading}
                          >
                            <X className="w-4 h-4" />
                            Rejeitar Denúncia
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => abrirModalModeracao(item, 'aprovar')}
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            disabled={moderacaoLoading}
                          >
                            <Check className="w-4 h-4" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => abrirModalModeracao(item, 'rejeitar')}
                            size="sm"
                            variant="destructive"
                            disabled={moderacaoLoading}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => window.open(`/item/${item.item_id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {itensFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros ou termos de busca.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Informações do Usuário */}
      <Dialog open={userModalAberto} onOpenChange={setUserModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Informações do Usuário</DialogTitle>
          </DialogHeader>
          
          {usuarioSelecionado && (
            <div className="space-y-4">
              {/* Avatar e Nome */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={usuarioSelecionado.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {usuarioSelecionado.nome.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{usuarioSelecionado.nome}</h3>
                  <p className="text-muted-foreground">{usuarioSelecionado.email}</p>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Localização</p>
                  <p className="text-muted-foreground">{usuarioSelecionado.cidade}, {usuarioSelecionado.estado}</p>
                </div>
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-muted-foreground">{usuarioSelecionado.telefone || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Membro desde</p>
                  <p className="text-muted-foreground">
                    {formatDistanceToNow(new Date(usuarioSelecionado.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Reputação</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-muted-foreground">{usuarioSelecionado.reputacao || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{usuarioSelecionado.total_vendas || 0}</p>
                  <p className="text-sm text-muted-foreground">Vendas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{usuarioSelecionado.total_compras || 0}</p>
                  <p className="text-sm text-muted-foreground">Compras</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.open(`/perfil/${usuarioSelecionado.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Perfil Público
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setFiltros(prev => ({ ...prev, busca: usuarioSelecionado.nome }));
                    setUserModalAberto(false);
                  }}
                >
                  <Search className="w-4 h-4" />
                  Ver Outros Itens
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Moderação */}
      <Dialog open={moderacaoDialogAberto} onOpenChange={setModeracaoDialogAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tipoAcao === 'aprovar' && 'Aprovar Item'}
              {tipoAcao === 'rejeitar' && 'Rejeitar Item'}
              {tipoAcao === 'aceitar_denuncia' && 'Aceitar Denúncia'}
              {tipoAcao === 'rejeitar_denuncia' && 'Rejeitar Denúncia'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Informações do Item */}
            {itemSelecionado && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-background rounded overflow-hidden flex-shrink-0">
                    {itemSelecionado.primeira_foto ? (
                      <img 
                        src={itemSelecionado.primeira_foto} 
                        alt={itemSelecionado.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{itemSelecionado.titulo}</h4>
                    <p className="text-sm text-muted-foreground">Por: {itemSelecionado.usuario_nome}</p>
                    <p className="text-sm text-muted-foreground">{itemSelecionado.valor_girinhas} Girinhas</p>
                  </div>
                </div>
              </div>
            )}

            {/* Descrição da Ação */}
            <div className="text-sm text-muted-foreground">
              {tipoAcao === 'aprovar' && (
                <p>Tem certeza que deseja <strong className="text-green-600">aprovar</strong> este item? Ele ficará disponível no feed para todos os usuários.</p>
              )}
              {tipoAcao === 'rejeitar' && (
                <p>Tem certeza que deseja <strong className="text-red-600">rejeitar</strong> este item? Ele será removido da plataforma e o usuário será notificado.</p>
              )}
              {tipoAcao === 'aceitar_denuncia' && (
                <p>Tem certeza que deseja <strong className="text-red-600">aceitar esta denúncia</strong>? O item será removido e o denunciante será notificado.</p>
              )}
              {tipoAcao === 'rejeitar_denuncia' && (
                <p>Tem certeza que deseja <strong className="text-green-600">rejeitar esta denúncia</strong>? O item permanecerá na plataforma e será aprovado.</p>
              )}
            </div>

            {/* Campos de Motivo (para rejeições) */}
            {(tipoAcao === 'rejeitar' || tipoAcao === 'aceitar_denuncia') && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Motivo da Rejeição</label>
                  <Select value={motivoRejeicao} onValueChange={setMotivoRejeicao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conteudo_inadequado">Conteúdo Inadequado</SelectItem>
                      <SelectItem value="produto_falsificado">Produto Falsificado</SelectItem>
                      <SelectItem value="preco_abusivo">Preço Abusivo</SelectItem>
                      <SelectItem value="informacoes_falsas">Informações Falsas</SelectItem>
                      <SelectItem value="violacao_termos">Violação dos Termos</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="denuncia_procedente">Denúncia Procedente</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Observações (opcional)</label>
                  <Textarea 
                    placeholder="Adicione detalhes sobre a decisão..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Observações para outras ações */}
            {(tipoAcao === 'rejeitar_denuncia') && (
              <div>
                <label className="text-sm font-medium">Observações (opcional)</label>
                <Textarea 
                  placeholder="Motivo da rejeição da denúncia..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setModeracaoDialogAberto(false)}
                disabled={moderacaoLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmarAcao}
                disabled={moderacaoLoading || ((tipoAcao === 'rejeitar' || tipoAcao === 'aceitar_denuncia') && !motivoRejeicao)}
                variant={tipoAcao === 'aprovar' || tipoAcao === 'rejeitar_denuncia' ? 'default' : 'destructive'}
              >
                {moderacaoLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeracaoItens;