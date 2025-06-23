
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Plus, X, MapPin, School } from 'lucide-react';
import { useUserAddresses } from '@/hooks/useUserAddresses';
import { useEscolas } from '@/hooks/useEscolas';
import NotificationSettings from '@/components/location/NotificationSettings';

interface EditarPerfilProps {
  onClose: () => void;
}

const EditarPerfil: React.FC<EditarPerfilProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const { addresses, loading: addressesLoading, addAddress, deleteAddress } = useUserAddresses();
  const { escolas } = useEscolas();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basico');
  const [profileData, setProfileData] = useState({
    nome: '',
    bio: '',
    profissao: '',
    instagram: '',
    telefone: '',
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
    ponto_referencia: ''
  });

  const [newAddress, setNewAddress] = useState({
    apelido: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
    ponto_referencia: ''
  });

  const [filhos, setFilhos] = useState<any[]>([]);
  const [newFilho, setNewFilho] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    tamanho_roupas: '',
    tamanho_calcados: '',
    escola_id: null
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        nome: profile.nome || '',
        bio: profile.bio || '',
        profissao: profile.profissao || '',
        instagram: profile.instagram || '',
        telefone: profile.telefone || '',
        aceita_entrega_domicilio: profile.aceita_entrega_domicilio || false,
        raio_entrega_km: profile.raio_entrega_km || 5,
        endereco: profile.endereco || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        cep: profile.cep || '',
        complemento: profile.complemento || '',
        ponto_referencia: profile.ponto_referencia || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      carregarFilhos();
    }
  }, [user]);

  const carregarFilhos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('filhos')
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey(escola, codigo_inep)
        `)
        .eq('mae_id', user.id);

      if (error) throw error;
      setFilhos(data || []);
    } catch (error) {
      console.error('Erro ao carregar filhos:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.apelido || !newAddress.endereco) {
      toast.error('Preencha pelo menos o apelido e endereço');
      return;
    }

    try {
      await addAddress(newAddress);
      setNewAddress({
        apelido: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        complemento: '',
        ponto_referencia: ''
      });
      toast.success('Endereço adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar endereço');
    }
  };

  const handleAddFilho = async () => {
    if (!user || !newFilho.nome || !newFilho.data_nascimento) {
      toast.error('Preencha pelo menos nome e data de nascimento');
      return;
    }

    try {
      const { error } = await supabase
        .from('filhos')
        .insert({
          ...newFilho,
          mae_id: user.id,
          escola_id: newFilho.escola_id || null
        });

      if (error) throw error;

      setNewFilho({
        nome: '',
        data_nascimento: '',
        sexo: '',
        tamanho_roupas: '',
        tamanho_calcados: '',
        escola_id: null
      });
      
      carregarFilhos();
      toast.success('Filho(a) adicionado(a) com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar filho:', error);
      toast.error('Erro ao adicionar filho(a)');
    }
  };

  const handleDeleteFilho = async (filhoId: string) => {
    try {
      const { error } = await supabase
        .from('filhos')
        .delete()
        .eq('id', filhoId);

      if (error) throw error;
      
      carregarFilhos();
      toast.success('Filho(a) removido(a) com sucesso');
    } catch (error) {
      console.error('Erro ao remover filho:', error);
      toast.error('Erro ao remover filho(a)');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navegação por abas */}
          <div className="flex gap-2 border-b">
            {[
              { id: 'basico', label: 'Dados Básicos' },
              { id: 'enderecos', label: 'Endereços' },
              { id: 'filhos', label: 'Filhos' },
              { id: 'notificacoes', label: 'Notificações' }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className="text-sm"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === 'basico' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={profileData.nome}
                    onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={profileData.profissao}
                    onChange={(e) => setProfileData(prev => ({ ...prev, profissao: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={profileData.instagram}
                    onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@seu_usuario"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Aceita entrega em domicílio</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros usuários solicitem entrega
                  </p>
                </div>
                <Switch
                  checked={profileData.aceita_entrega_domicilio}
                  onCheckedChange={(checked) => 
                    setProfileData(prev => ({ ...prev, aceita_entrega_domicilio: checked }))
                  }
                />
              </div>

              {profileData.aceita_entrega_domicilio && (
                <div>
                  <Label htmlFor="raio">Raio de entrega (km)</Label>
                  <Input
                    id="raio"
                    type="number"
                    min="1"
                    max="50"
                    value={profileData.raio_entrega_km}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      raio_entrega_km: parseInt(e.target.value) || 5 
                    }))}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'enderecos' && (
            <div className="space-y-6">
              {/* Endereço principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Endereço Principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={profileData.endereco}
                        onChange={(e) => setProfileData(prev => ({ ...prev, endereco: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={profileData.bairro}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bairro: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={profileData.cidade}
                        onChange={(e) => setProfileData(prev => ({ ...prev, cidade: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={profileData.estado}
                        onChange={(e) => setProfileData(prev => ({ ...prev, estado: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={profileData.cep}
                        onChange={(e) => setProfileData(prev => ({ ...prev, cep: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={profileData.complemento}
                        onChange={(e) => setProfileData(prev => ({ ...prev, complemento: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ponto_referencia">Ponto de Referência</Label>
                    <Input
                      id="ponto_referencia"
                      value={profileData.ponto_referencia}
                      onChange={(e) => setProfileData(prev => ({ ...prev, ponto_referencia: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Endereços adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Endereços Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  {!addressesLoading && addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{address.apelido}</div>
                            <div className="text-sm text-muted-foreground">
                              {address.endereco}, {address.bairro} - {address.cidade}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAddress(address.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
                    <h4 className="font-medium">Adicionar Novo Endereço</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Apelido (ex: Casa, Trabalho)"
                        value={newAddress.apelido}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, apelido: e.target.value }))}
                      />
                      <Input
                        placeholder="Endereço"
                        value={newAddress.endereco}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, endereco: e.target.value }))}
                      />
                      <Input
                        placeholder="Bairro"
                        value={newAddress.bairro}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, bairro: e.target.value }))}
                      />
                      <Input
                        placeholder="Cidade"
                        value={newAddress.cidade}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, cidade: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleAddAddress} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Endereço
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'filhos' && (
            <div className="space-y-6">
              {filhos.length > 0 && (
                <div className="space-y-3">
                  {filhos.map((filho) => (
                    <div key={filho.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{filho.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(filho.data_nascimento).toLocaleDateString('pt-BR')}
                          </div>
                          {filho.escolas_inep && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <School className="w-3 h-3" />
                              {filho.escolas_inep.escola}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFilho(filho.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adicionar Filho(a)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Nome"
                      value={newFilho.nome}
                      onChange={(e) => setNewFilho(prev => ({ ...prev, nome: e.target.value }))}
                    />
                    <Input
                      type="date"
                      placeholder="Data de nascimento"
                      value={newFilho.data_nascimento}
                      onChange={(e) => setNewFilho(prev => ({ ...prev, data_nascimento: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddFilho} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Filho(a)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <NotificationSettings />
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveProfile} disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarPerfil;
