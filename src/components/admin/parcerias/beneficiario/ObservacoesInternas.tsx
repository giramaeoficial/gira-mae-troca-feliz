import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import type { ObservacaoInterna } from '@/types/parcerias';
import EmptyState from '../shared/EmptyState';

interface ObservacoesInternasProps {
  observacoes: ObservacaoInterna[];
  onAdd: (texto: string) => Promise<void>;
}

export default function ObservacoesInternas({ observacoes, onAdd }: ObservacoesInternasProps) {
  const [novaObservacao, setNovaObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!novaObservacao.trim()) return;

    setLoading(true);
    try {
      await onAdd(novaObservacao);
      setNovaObservacao('');
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Observações Internas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar Nova Observação */}
        <div className="space-y-2">
          <Textarea
            placeholder="Adicione uma observação interna sobre este beneficiário..."
            value={novaObservacao}
            onChange={(e) => setNovaObservacao(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleAdd} 
            disabled={loading || !novaObservacao.trim()}
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Adicionando...' : 'Adicionar Observação'}
          </Button>
        </div>

        {/* Histórico de Observações */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Histórico</h4>
          {observacoes.length === 0 ? (
            <EmptyState 
              icon={MessageSquare}
              titulo="Nenhuma observação"
              mensagem="Ainda não há observações sobre este beneficiário"
            />
          ) : (
            <div className="space-y-3">
              {observacoes.map((obs) => (
                <div key={obs.id} className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{obs.admin_nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(obs.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{obs.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
