import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Calendar, 
  User, 
  Tag, 
  DollarSign, 
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  TrendingUp,
  ExternalLink,
  Edit2,
  Save,
  XCircle,
  Eye,
  AlertCircle,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePenalidades } from '@/hooks/usePenalidades';

interface UserProfile {
  id: string;
  nome: string;
  username: string;
  email?: string;
  telefone?: string;
  avatar_url?: string;
  cidade?: string;
  estado?: string;
  created_at: string;
  ultima_atividade?: string;
}

interface UserStats {
  total_itens_publicados: number;
  total_vendas_realizadas: number;
  total_compras_girinhas: number;
  saldo_atual: number;
  cadastro_completo: boolean;
}

interface ItemModeracaoCardProps {
  item: {
    moderacao_id: string;
    item_id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    subcategoria?: string;
    valor_girinhas: number;
    estado_conservacao: string;
    fotos?: string[];
    genero?: string;
    tamanho_valor?: string;
    tamanho_categoria?: string;
    data_publicacao: string;
    usuario_nome: string;
    tem_denuncia: boolean;
    motivo_denuncia?: string;
    descricao_denuncia?: string;
    data_denuncia?: string;
    total_denuncias?: number;
    denuncia_id?: string;
    primeira_foto?: string;
    usuario_id: string;
  };
  userProfile?: UserProfile;
  userStats?: UserStats;
  onAprovar: (moderacaoId: string) => void;
  onRejeitar: (moderacaoId: string, motivo: string, observacoes?: string) => void;
  onAceitarDenuncia: (denunciaId: string) => void;
  onRejeitarDenuncia: (denunciaId: string) => void;
  loading?: boolean;
}

export const ItemModeracaoCard: React.FC<ItemModeracaoCardProps> = ({
  item,
  userProfile,
  userStats,
  onAprovar,
  onRejeitar,
  onAceitarDenuncia,
  onRejeitarDenuncia,
  loading = false
}) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({
    titulo: item.titulo,
    descricao: item.descricao,
    categoria: item.categoria,
    subcategoria: item.subcategoria || '',
    valor_girinhas: item.valor_girinhas,
    estado_conservacao: item.estado_conservacao,
    genero: item.genero || '',
    tamanho_valor: item.tamanho_valor || ''
  });
  const [rejeitandoId, setRejeitandoId] = useState<string | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);

  const motivosRejeicao = [
    { value: 'conteudo_inadequado', label: 'Conteúdo inadequado' },
    { value: 'preco_incorreto', label: 'Preço incorreto' },
    { value: 'fotos_ruins', label: 'Fotos de baixa qualidade' },
    { value: 'descricao_insuficiente', label: 'Descrição insuficiente' },
    { value: 'item_danificado', label: 'Item muito danificado' },
    { value: 'categoria_errada', label: 'Categoria incorreta' },
    { value: 'duplicado', label: 'Item duplicado' },
    { value: 'outros', label: 'Outros motivos' }
  ];

  const categorias = [
    'roupas', 'calcados', 'brinquedos', 'livros', 'acessorios', 
    'moveis', 'decoracao', 'eletronicos', 'esportes', 'outros'
  ];

  const estadosConservacao = [
    'novo', 'seminovo', 'usado', 'muito_usado'
  ];

  const generos = [
    { value: 'menino', label: 'Menino' },
    { value: 'menina', label: 'Menina' },
    { value: 'unissex', label: 'Unissex' }
  ];

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('itens')
        .update({
          titulo: editedData.titulo,
          descricao: editedData.descricao,
          categoria: editedData.categoria,
          subcategoria: editedData.subcategoria || null,
          valor_girinhas: editedData.valor_girinhas,
          estado_conservacao: editedData.estado_conservacao,
          genero: editedData.genero || null,
          tamanho_valor: editedData.tamanho_valor || null
        })
        .eq('id', item.item_id);

      if (error) throw error;

      toast({
        title: "Item atualizado",
        description: "As alterações foram salvas com sucesso."
      });
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o item.",
        variant: "destructive"
      });
    }
  };

  const handleRejeitar = async () => {
    if (!rejeitandoId || !motivoRejeicao) return;
    
    await onRejeitar(rejeitandoId, motivoRejeicao, observacoes);
    setRejeitandoId(null);
    setMotivoRejeicao('');
    setObservacoes('');
  };

  const PenalidadesUsuario = ({ userId }: { userId: string }) => {
    const { penalidades, loading, getNivelTexto, getCorNivel } = usePenalidades();
    
    // Filtrar apenas penalidades do usuário específico
    const penalidadesUsuario = penalidades.filter(p => p.usuario_id === userId);
    
    if (loading) return <div className="text-sm text-muted-foreground">Carregando penalidades...</div>;
    
    if (penalidadesUsuario.length === 0) {
      return <div className="text-sm text-green-600">✅ Nenhuma penalização ativa</div>;
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Penalizações Ativas ({penalidadesUsuario.length})
        </h4>
        {penalidadesUsuario.map((penalidade) => (
          <div key={penalidade.id} className="border border-red-200 rounded p-2 bg-red-50">
            <div className="flex items-center justify-between mb-1">
              <Badge className={getCorNivel(penalidade.nivel)}>
                {getNivelTexto(penalidade.nivel)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(penalidade.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
            <p className="text-xs text-red-700">
              <strong>Tipo:</strong> {penalidade.tipo}
            </p>
            {penalidade.motivo && (
              <p className="text-xs text-red-700">
                <strong>Motivo:</strong> {penalidade.motivo}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Título e informações básicas */}
          <div className="flex-1 mr-4">
            {editMode ? (
              <Input
                value={editedData.titulo}
                onChange={(e) => setEditedData({...editedData, titulo: e.target.value})}
                className="font-semibold text-lg mb-2"
              />
            ) : (
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                {item.titulo}
                {item.tem_denuncia && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Denúncia
                  </Badge>
                )}
              </h3>
            )}

            {/* Meta informações */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {item.usuario_nome}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(item.data_publicacao).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {editMode ? (
                  <Select value={editedData.categoria} onValueChange={(v) => setEditedData({...editedData, categoria: v})}>
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  item.categoria
                )}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {editMode ? (
                  <Input
                    type="number"
                    value={editedData.valor_girinhas}
                    onChange={(e) => setEditedData({...editedData, valor_girinhas: Number(e.target.value)})}
                    className="h-6 w-20 text-xs"
                  />
                ) : (
                  `${item.valor_girinhas} Girinhas`
                )}
              </div>
            </div>

            {/* Edição de outros campos */}
            {editMode && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-muted-foreground">Subcategoria</label>
                  <Input
                    value={editedData.subcategoria}
                    onChange={(e) => setEditedData({...editedData, subcategoria: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Estado</label>
                  <Select value={editedData.estado_conservacao} onValueChange={(v) => setEditedData({...editedData, estado_conservacao: v})}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosConservacao.map(estado => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Gênero</label>
                  <Select value={editedData.genero} onValueChange={(v) => setEditedData({...editedData, genero: v})}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {generos.map(genero => (
                        <SelectItem key={genero.value} value={genero.value}>{genero.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tamanho</label>
                  <Input
                    value={editedData.tamanho_valor}
                    onChange={(e) => setEditedData({...editedData, tamanho_valor: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-2">
            {editMode ? (
              <>
                <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
                <Button onClick={() => setEditMode(false)} size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditMode(true)} size="sm" variant="outline">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                {item.tem_denuncia && item.denuncia_id ? (
                  <>
                    <Button
                      onClick={() => onAceitarDenuncia(item.denuncia_id!)}
                      size="sm"
                      variant="destructive"
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aceitar Denúncia
                    </Button>
                    <Button
                      onClick={() => onRejeitarDenuncia(item.denuncia_id!)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rejeitar Denúncia
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => onAprovar(item.moderacao_id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setRejeitandoId(item.moderacao_id)}
                          size="sm"
                          variant="destructive"
                          disabled={loading}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rejeitar Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Motivo da rejeição</label>
                            <Select onValueChange={setMotivoRejeicao}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o motivo" />
                              </SelectTrigger>
                              <SelectContent>
                                {motivosRejeicao.map((motivo) => (
                                  <SelectItem key={motivo.value} value={motivo.value}>
                                    {motivo.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Observações</label>
                            <Textarea
                              placeholder="Detalhes adicionais sobre a rejeição..."
                              value={observacoes}
                              onChange={(e) => setObservacoes(e.target.value)}
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setRejeitandoId(null)}>
                              Cancelar
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleRejeitar}
                              disabled={!motivoRejeicao || loading}
                            >
                              {loading ? 'Processando...' : 'Confirmar Rejeição'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Foto e informações do item */}
          <div className="space-y-3">
            {item.primeira_foto && (
              <div className="relative">
                <img
                  src={item.primeira_foto}
                  alt={item.titulo}
                  className="w-full h-40 object-cover rounded-lg border"
                />
                {item.fotos && item.fotos.length > 1 && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    +{item.fotos.length - 1} fotos
                  </div>
                )}
              </div>
            )}

            {/* Descrição editável */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              {editMode ? (
                <Textarea
                  value={editedData.descricao}
                  onChange={(e) => setEditedData({...editedData, descricao: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="text-sm bg-gray-50 p-2 rounded mt-1 line-clamp-3">
                  {item.descricao}
                </p>
              )}
            </div>

            {/* Badges de estado */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{item.estado_conservacao}</Badge>
              {item.genero && <Badge variant="outline">{item.genero}</Badge>}
              {item.tamanho_valor && <Badge variant="outline">Tam. {item.tamanho_valor}</Badge>}
            </div>
          </div>

          {/* Coluna 2: Informações do usuário */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Dados do Usuário</h4>
              <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Perfil Completo do Usuário</DialogTitle>
                  </DialogHeader>
                  
                  {userProfile && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {userProfile.avatar_url ? (
                          <img src={userProfile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{userProfile.nome}</h3>
                          <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/perfil/${userProfile.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver Público
                        </Button>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Contato</h4>
                          <div className="space-y-2 text-sm">
                            {userProfile.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${userProfile.email}`} className="text-blue-600 hover:underline">
                                  {userProfile.email}
                                </a>
                              </div>
                            )}
                            {userProfile.telefone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${userProfile.telefone}`} className="text-blue-600 hover:underline">
                                  {userProfile.telefone}
                                </a>
                              </div>
                            )}
                            {userProfile.cidade && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {userProfile.cidade}, {userProfile.estado}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Atividade</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Cadastro:</strong> {formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true, locale: ptBR })}
                            </div>
                            {userProfile.ultima_atividade && (
                              <div>
                                <strong>Última atividade:</strong> {formatDistanceToNow(new Date(userProfile.ultima_atividade), { addSuffix: true, locale: ptBR })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {userStats && (
                        <div>
                          <h4 className="font-medium mb-2">Estatísticas</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              <span>{userStats.total_itens_publicados} itens publicados</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              <span>{userStats.total_vendas_realizadas} vendas realizadas</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>{userStats.total_compras_girinhas} Girinhas compradas</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>{userStats.saldo_atual} Girinhas no saldo</span>
                            </div>
                          </div>
                          
                          {!userStats.cadastro_completo && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                              <AlertCircle className="h-4 w-4 inline mr-1" />
                              Cadastro incompleto
                            </div>
                          )}
                        </div>
                      )}

                      <Separator />

                      <PenalidadesUsuario userId={userProfile.id} />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {userProfile && (
              <div className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {userProfile.nome}</div>
                <div><strong>Username:</strong> @{userProfile.username}</div>
                {userProfile.cidade && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {userProfile.cidade}, {userProfile.estado}
                  </div>
                )}
                <div><strong>Cadastro:</strong> {formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true, locale: ptBR })}</div>
              </div>
            )}

            {userStats && (
              <>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Itens publicados:</span>
                    <strong>{userStats.total_itens_publicados}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendas realizadas:</span>
                    <strong>{userStats.total_vendas_realizadas}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo atual:</span>
                    <strong>{userStats.saldo_atual} Girinhas</strong>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Coluna 3: Denúncia e penalizações */}
          <div className="space-y-3">
            {item.tem_denuncia && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Item Denunciado
                </div>
                <div className="space-y-1 text-sm text-red-700">
                  <div><strong>Motivo:</strong> {item.motivo_denuncia}</div>
                  {item.descricao_denuncia && (
                    <div><strong>Descrição:</strong> {item.descricao_denuncia}</div>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs">{item.total_denuncias} denúncia(s)</span>
                    {item.data_denuncia && (
                      <span className="text-xs">
                        {formatDistanceToNow(new Date(item.data_denuncia), { addSuffix: true, locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <PenalidadesUsuario userId={item.usuario_id} />

            {/* Informações técnicas */}
            <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
              <div><strong>Item ID:</strong> {item.item_id}</div>
              <div><strong>Moderação ID:</strong> {item.moderacao_id}</div>
              <div><strong>Usuário ID:</strong> {item.usuario_id}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};