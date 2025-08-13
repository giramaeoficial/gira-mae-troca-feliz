import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LazyImage from '@/components/ui/lazy-image';
import { 
  Check, 
  X, 
  AlertTriangle, 
  User, 
  MapPin,
  Calendar,
  Edit2,
  Save,
  XCircle,
  ExternalLink,
  Eye,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  onAprovar: (moderacaoId: string) => void;
  onRejeitar: (moderacaoId: string, motivo: string, observacoes?: string) => void;
  onAceitarDenuncia: (denunciaId: string) => void;
  onRejeitarDenuncia: (denunciaId: string) => void;
  loading?: boolean;
}

export const ItemModeracaoCard: React.FC<ItemModeracaoCardProps> = ({
  item,
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
      const { error } = await supabase.rpc('admin_update_item_basico', {
        p_item_id: item.item_id,
        p_titulo: editedData.titulo,
        p_descricao: editedData.descricao,
        p_categoria: editedData.categoria,
        p_subcategoria: editedData.subcategoria || null,
        p_valor_girinhas: editedData.valor_girinhas,
        p_estado_conservacao: editedData.estado_conservacao,
        p_genero: editedData.genero || null,
        p_tamanho_valor: editedData.tamanho_valor || null,
      } as any);
      
      if (error) throw error;

      toast({
        title: 'Item atualizado',
        description: 'As informações do item foram atualizadas com sucesso.',
      });

      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar o item.',
        variant: 'destructive',
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

  return (
    <Card className="hover:shadow-md transition-shadow bg-card">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Imagem do item */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {item.primeira_foto ? (
              <LazyImage
                src={item.primeira_foto}
                alt={item.titulo}
                className="w-full h-full object-cover"
                placeholder="📷"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs">Sem foto</span>
              </div>
            )}
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            {/* Cabeçalho com título e badges */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <Input
                    value={editedData.titulo}
                    onChange={(e) => setEditedData({...editedData, titulo: e.target.value})}
                    className="font-medium text-base mb-1"
                  />
                ) : (
                  <h3 className="font-medium text-base mb-1 line-clamp-2">{item.titulo}</h3>
                )}
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {item.categoria}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.estado_conservacao}
                  </Badge>
                  {item.tem_denuncia && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {item.total_denuncias} denúncia{item.total_denuncias !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-1 ml-4">
                {editMode ? (
                  <>
                    <Button onClick={handleSaveEdit} size="sm" className="h-8 px-3 bg-green-600 hover:bg-green-700">
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                    <Button onClick={() => setEditMode(false)} size="sm" variant="outline" className="h-8 px-3">
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setEditMode(true)} size="sm" variant="outline" className="h-8 px-3">
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    
                    {item.tem_denuncia && item.denuncia_id ? (
                      <>
                        <Button
                          onClick={() => onAceitarDenuncia(item.denuncia_id!)}
                          size="sm"
                          variant="destructive"
                          disabled={loading}
                          className="h-8 px-3"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          onClick={() => onRejeitarDenuncia(item.denuncia_id!)}
                          size="sm"
                          className="h-8 px-3 bg-green-600 hover:bg-green-700"
                          disabled={loading}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Rejeitar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => onAprovar(item.moderacao_id)}
                          size="sm"
                          className="h-8 px-3 bg-green-600 hover:bg-green-700"
                          disabled={loading}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aprovar
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setRejeitandoId(item.moderacao_id)}
                              size="sm"
                              variant="destructive"
                              disabled={loading}
                              className="h-8 px-3"
                            >
                              <X className="h-3 w-3 mr-1" />
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

            {/* Campos editáveis quando em modo de edição */}
            {editMode && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <Select value={editedData.categoria} onValueChange={(v) => setEditedData({...editedData, categoria: v})}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Estado</label>
                  <Select value={editedData.estado_conservacao} onValueChange={(v) => setEditedData({...editedData, estado_conservacao: v})}>
                    <SelectTrigger className="h-7 text-xs">
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
                  <label className="text-xs text-muted-foreground">Valor (Girinhas)</label>
                  <Input
                    type="number"
                    value={editedData.valor_girinhas}
                    onChange={(e) => setEditedData({...editedData, valor_girinhas: Number(e.target.value)})}
                    className="h-7 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Gênero</label>
                  <Select value={editedData.genero} onValueChange={(v) => setEditedData({...editedData, genero: v})}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {generos.map(genero => (
                        <SelectItem key={genero.value} value={genero.value}>{genero.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Descrição</label>
                  <Textarea
                    value={editedData.descricao}
                    onChange={(e) => setEditedData({...editedData, descricao: e.target.value})}
                    className="h-16 text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* Descrição do item (quando não editando) */}
            {!editMode && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {item.descricao}
              </p>
            )}

            {/* Preço */}
            <div className="flex items-center gap-1 mb-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">{item.valor_girinhas} Girinhas</span>
            </div>

            {/* Informações do usuário e data */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{item.usuario_nome}</span>
                  <Button
                    variant="link"
                    className="h-4 p-0 text-xs"
                    onClick={() => window.open(`/perfil/${item.usuario_id}`, '_blank')}
                    aria-label="Ver perfil público"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(item.data_publicacao), { addSuffix: true, locale: ptBR })}</span>
                </div>
              </div>
            </div>

            {/* Informações da denúncia (se houver) */}
            {item.tem_denuncia && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Denúncia</span>
                </div>
                
                {item.motivo_denuncia && (
                  <p className="text-xs text-red-700 mb-1">
                    <strong>Motivo:</strong> {item.motivo_denuncia}
                  </p>
                )}
                
                {item.descricao_denuncia && (
                  <p className="text-xs text-red-700 mb-1">
                    <strong>Descrição:</strong> {item.descricao_denuncia}
                  </p>
                )}
                
                {item.data_denuncia && (
                  <p className="text-xs text-red-600">
                    Denunciado há {formatDistanceToNow(new Date(item.data_denuncia), { addSuffix: true, locale: ptBR })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};