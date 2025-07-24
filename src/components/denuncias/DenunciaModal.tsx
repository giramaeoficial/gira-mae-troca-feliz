import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield } from 'lucide-react';

interface DenunciaModalProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemTitulo: string;
}

const motivosDenuncia = [
  { value: 'produto_inadequado', label: 'Produto inadequado ou perigoso' },
  { value: 'preco_abusivo', label: 'Preço abusivo' },
  { value: 'descricao_enganosa', label: 'Descrição enganosa' },
  { value: 'fotos_inadequadas', label: 'Fotos inadequadas' },
  { value: 'spam', label: 'Spam ou repetição excessiva' },
  { value: 'conteudo_ofensivo', label: 'Conteúdo ofensivo' },
  { value: 'outro', label: 'Outro motivo' }
];

export const DenunciaModal: React.FC<DenunciaModalProps> = ({
  open,
  onClose,
  itemId,
  itemTitulo
}) => {
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motivo) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um motivo para a denúncia.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('denuncias')
        .insert({
          item_id: itemId,
          denunciante_id: (await supabase.auth.getUser()).data.user?.id,
          motivo,
          descricao: descricao.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Denúncia enviada",
        description: "Sua denúncia foi enviada com sucesso. Nossa equipe irá analisá-la em breve.",
      });

      onClose();
      setMotivo('');
      setDescricao('');
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a denúncia. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const motivoSelecionado = motivosDenuncia.find(m => m.value === motivo);

  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Shield className="w-5 h-5" />
            Denunciar Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item sendo denunciado */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Item:</p>
            <p className="font-medium text-sm line-clamp-2">{itemTitulo}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Motivo da denúncia */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Motivo da denúncia</Label>
              <RadioGroup value={motivo} onValueChange={setMotivo}>
                {motivosDenuncia.map((motivoItem) => (
                  <div key={motivoItem.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={motivoItem.value} 
                      id={motivoItem.value}
                      className="text-red-600" 
                    />
                    <Label 
                      htmlFor={motivoItem.value} 
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {motivoItem.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Descrição adicional */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-base font-medium">
                Descrição adicional {motivoSelecionado?.value === 'outro' && '(obrigatória)'}
              </Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder={
                  motivoSelecionado?.value === 'outro' 
                    ? 'Descreva detalhadamente o motivo da denúncia...'
                    : 'Adicione mais detalhes se necessário (opcional)...'
                }
                rows={3}
                className="text-sm"
                required={motivoSelecionado?.value === 'outro'}
              />
              <p className="text-xs text-gray-500">
                {motivoSelecionado?.value === 'outro' 
                  ? 'Explique o motivo da denúncia.'
                  : 'Forneça mais contexto para ajudar nossa análise.'
                }
              </p>
            </div>

            {/* Aviso */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>
                    Denúncias falsas podem resultar em penalizações. 
                    Certifique-se de que sua denúncia é legítima e necessária.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !motivo || (motivo === 'outro' && !descricao.trim())}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Enviando...' : 'Enviar Denúncia'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};