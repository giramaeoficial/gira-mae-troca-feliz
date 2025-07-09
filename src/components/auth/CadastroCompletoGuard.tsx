import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, X } from 'lucide-react';
import SimpleAddressForm from '@/components/address/SimpleAddressForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const INTERESSES_DISPONIVEIS = [
  'Moda Infantil', 'Educação', 'Atividades ao Ar Livre', 'Arte e Criatividade',
  'Esportes', 'Música', 'Leitura', 'Culinária', 'Jardinagem', 'Tecnologia'
];

interface CadastroCompletoGuardProps {
  children: React.ReactNode;
}

interface PersonalData {
  nome: string;
  bio: string;
  profissao: string;
  instagram: string;
  data_nascimento: string;
  interesses: string[];
}

export const CadastroCompletoGuard: React.FC<CadastroCompletoGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'basico' | 'endereco'>('basico');
  
  const [formData, setFormData] = useState<PersonalData>({
    nome: '',
    bio: '',
    profissao: '',
    instagram: '',
    data_nascimento: '',
    interesses: []
  });

  // Verificar se cadastro está completo
  useEffect(() => {
    const checkCadastroStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('cadastro_status, nome, bio, profissao, instagram, data_nascimento, interesses')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar status do cadastro:', error);
          setLoading(false);
          return;
        }

        // Se cadastro está incompleto, mostrar modal
        if (profile.cadastro_status === 'incompleto') {
          // Carregar dados existentes se houver
          setFormData({
            nome: profile.nome || '',
            bio: profile.bio || '',
            profissao: profile.profissao || '',
            instagram: profile.instagram || '',
            data_nascimento: profile.data_nascimento || '',
            interesses: profile.interesses || []
          });
          setShowModal(true);
        }
      } catch (error) {
        console.error('Erro ao verificar cadastro:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCadastroStatus();
  }, [user]);

  const handleInteresseToggle = (interesse: string) => {
    setFormData(prev => ({
      ...prev,
      interesses: prev.interesses.includes(interesse)
        ? prev.interesses.filter(i => i !== interesse)
        : [...prev.interesses, interesse]
    }));
  };

  const handleSaveDadosBasicos = async () => {
    if (!user || !formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha seu nome.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome.trim(),
          bio: formData.bio.trim(),
          profissao: formData.profissao.trim(),
          instagram: formData.instagram.trim(),
          data_nascimento: formData.data_nascimento || null,
          interesses: formData.interesses,
          cadastro_status: 'dados_completos'
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Dados salvos!",
        description: "Agora configure seu endereço para finalizar.",
      });

      setTab('endereco');
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizarCadastro = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          cadastro_status: 'completo'
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Cadastro finalizado!",
        description: "Bem-vinda à GiraMãe! 🎉",
      });

      setShowModal(false);
      
      // Recarregar página para aplicar mudanças
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao finalizar cadastro:', error);
      toast({
        title: "Erro",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
      
      <Dialog open={showModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-lg">
            <DialogTitle className="text-xl font-semibold text-center">
              Complete seu cadastro
            </DialogTitle>
            <p className="text-center text-pink-100 mt-2">
              Alguns dados são necessários para continuar
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <Button
              variant={tab === 'basico' ? 'default' : 'ghost'}
              onClick={() => setTab('basico')}
              className="flex-1 rounded-none"
            >
              Dados Básicos
            </Button>
            <Button
              variant={tab === 'endereco' ? 'default' : 'ghost'}
              onClick={() => setTab('endereco')}
              className="flex-1 rounded-none"
              disabled={!formData.nome}
            >
              Endereço
            </Button>
          </div>

          <div className="p-6">
            {tab === 'basico' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profissao">Profissão</Label>
                    <Input
                      id="profissao"
                      value={formData.profissao}
                      onChange={(e) => setFormData(prev => ({ ...prev, profissao: e.target.value }))}
                      placeholder="Sua profissão"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@seuinstagram"
                  />
                </div>

                <div>
                  <Label>Interesses</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTERESSES_DISPONIVEIS.map(interesse => (
                      <Badge
                        key={interesse}
                        variant={formData.interesses.includes(interesse) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleInteresseToggle(interesse)}
                      >
                        {interesse}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveDadosBasicos}
                  disabled={saving || !formData.nome.trim()}
                  className="w-full mt-6"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Continuar para Endereço
                    </>
                  )}
                </Button>
              </div>
            )}

            {tab === 'endereco' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">📍 Configure seu Endereço</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Seu endereço ajuda outras mães a encontrarem itens próximos.
                  </p>
                </div>

                <SimpleAddressForm />

                <Button 
                  onClick={handleFinalizarCadastro}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};