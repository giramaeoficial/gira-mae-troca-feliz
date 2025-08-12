import { useState } from 'react';
import { useModeracaoItens } from '@/hooks/useModeracaoItens';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, Calendar, User, Tag, DollarSign, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import StatusModeracaoWidget from './StatusModeracaoWidget';

const ModeracaoItens = () => {
  const { itens, loading, aprovarItem, rejeitarItem, refetch } = useModeracaoItens();
  const [rejeitandoId, setRejeitandoId] = useState<string | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [moderacaoLoading, setModeracaoLoading] = useState(false);

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

  const handleAprovar = async (itemId: string) => {
    setModeracaoLoading(true);
    try {
      await aprovarItem(itemId);
    } finally {
      setModeracaoLoading(false);
    }
  };

  const handleRejeitar = async () => {
    if (!rejeitandoId || !motivoRejeicao) return;
    
    setModeracaoLoading(true);
    try {
      await rejeitarItem(rejeitandoId, motivoRejeicao, observacoes);
      setRejeitandoId(null);
      setMotivoRejeicao('');
      setObservacoes('');
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
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>📊 {itens.length} itens para analisar</span>
                <span>•</span>
                <span>🔄 Atualizado: {new Date().toLocaleTimeString()}</span>
              </div>
          {itens.map((item) => (
            <Card key={item.moderacao_id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      {item.titulo}
                      {item.tem_denuncia && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Denúncia
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        {item.categoria}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {item.valor_girinhas} Girinhas
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAprovar(item.moderacao_id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={moderacaoLoading}
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
                          disabled={moderacaoLoading}
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
                            <Label htmlFor="motivo">Motivo da rejeição</Label>
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
                            <Label htmlFor="observacoes">Observações (opcional)</Label>
                            <Textarea
                              id="observacoes"
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
                              disabled={!motivoRejeicao || moderacaoLoading}
                            >
                              {moderacaoLoading ? 'Processando...' : 'Confirmar Rejeição'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex gap-4">
                  {item.primeira_foto && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.primeira_foto}
                        alt={item.titulo}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    {item.tem_denuncia && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                          <AlertTriangle className="h-4 w-4" />
                          Item denunciado
                        </div>
                        <p className="text-sm text-red-700">
                          Motivo: {item.motivo_denuncia}
                        </p>
                        <p className="text-xs text-red-600">
                          {item.total_denuncias} denúncia(s) registrada(s)
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Item ID:</strong> {item.item_id}</p>
                      <p><strong>Data de moderação:</strong> {new Date(item.data_moderacao).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeracaoItens;