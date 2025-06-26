import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, MapPin, Baby, Bell, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import ImageUpload from '@/components/ui/image-upload';
import AddressInput from '@/components/address/AddressInput';
import SchoolSelect from '@/components/address/SchoolSelect';
import EnderecoAdicional from '@/components/perfil/EnderecoAdicional';
import NotificationSettings from '@/components/location/NotificationSettings';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAddress, type Address } from '@/hooks/useAddress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CATEGORIAS_DISPONIVEIS = [
  'roupas', 'calcados', 'brinquedos', 'livros', 'acessorios', 'moveis', 'decoracao'
];

const INTERESSES_DISPONIVEIS = [
  'Moda Infantil', 'Educação', 'Atividades ao Ar Livre', 'Arte e Criatividade',
  'Esportes', 'Música', 'Leitura', 'Culinária', 'Jardinagem', 'Tecnologia'
];

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, filhos, loading, updateProfile, deleteFilho, refetch } = useProfile();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    bio: '',
    profissao: '',
    instagram: '',
    telefone: '',
    data_nascimento: '',
    interesses: [] as string[],
    categorias_favoritas: [] as string[],
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    ponto_retirada_preferido: ''
  });
  
  const [enderecoForm, setEnderecoForm] = useState<Address>({
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    ponto_referencia: ''
  });
  
  const [filhosForm, setFilhosForm] = useState<any[]>([]);
  const [novoFilho, setNovoFilho] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    tamanho_roupas: '',
    tamanho_calcados: '',
    escola_id: null,
    escola_selecionada: null as any
  });
  
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('pessoais');
  const [saving, setSaving] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        bio: profile.bio || '',
        profissao: profile.profissao || '',
        instagram: profile.instagram || '',
        telefone: profile.telefone || '',
        data_nascimento: profile.data_nascimento || '',
        interesses: profile.interesses || [],
        categorias_favoritas: profile.categorias_favoritas || [],
        aceita_entrega_domicilio: profile.aceita_entrega_domicilio || false,
        raio_entrega_km: profile.raio_entrega_km || 5,
        ponto_retirada_preferido: profile.ponto_retirada_preferido || ''
      });
      
      setEnderecoForm({
        cep: profile.cep || '',
        endereco: profile.endereco || '',
        numero: profile.numero || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        complemento: profile.complemento || '',
        ponto_referencia: profile.ponto_referencia || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (filhos) {
      setFilhosForm(filhos.map(filho => ({
        id: filho.id,
        nome: filho.nome,
        data_nascimento: filho.data_nascimento,
        sexo: filho.sexo || '',
        tamanho_roupas: filho.tamanho_roupas || '',
        tamanho_calcados: filho.tamanho_calcados || '',
        escola_id: filho.escola_id,
        escolas_inep: filho.escolas_inep
      })));
    }
  }, [filhos]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInteresseToggle = (interesse: string) => {
    setFormData(prev => ({
      ...prev,
      interesses: prev.interesses.includes(interesse)
        ? prev.interesses.filter(i => i !== interesse)
        : [...prev.interesses, interesse]
    }));
  };

  const handleCategoriaToggle = (categoria: string) => {
    setFormData(prev => ({
      ...prev,
      categorias_favoritas: prev.categorias_favoritas.includes(categoria)
        ? prev.categorias_favoritas.filter(c => c !== categoria)
        : [...prev.categorias_favoritas, categoria]
    }));
  };

  const handleFilhoChange = (index: number, field: string, value: any) => {
    setFilhosForm(prev => {
      const newFilhos = [...prev];
      newFilhos[index] = { ...newFilhos[index], [field]: value };
      return newFilhos;
    });
  };

  const handleAdicionarFilho = async () => {
    if (!novoFilho.nome || !novoFilho.data_nascimento) {
      toast.error('Nome e data de nascimento são obrigatórios');
      return;
    }

    try {
      console.log('Adicionando filho:', novoFilho);
      
      const { data, error } = await supabase
        .from('filhos')
        .insert({
          mae_id: user?.id,
          nome: novoFilho.nome,
          data_nascimento: novoFilho.data_nascimento,
          sexo: novoFilho.sexo || null,
          tamanho_roupas: novoFilho.tamanho_roupas || null,
          tamanho_calcados: novoFilho.tamanho_calcados || null,
          escola_id: novoFilho.escola_id
        })
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey (
            codigo_inep,
            escola,
            municipio,
            uf,
            endereco,
            categoria_administrativa
          )
        `)
        .single();

      if (error) throw error;

      console.log('Filho adicionado com sucesso:', data);

      const filhoComEscola = {
        ...data,
        escola: data.escolas_inep,
        escolas_inep: data.escolas_inep
      };

      setFilhosForm(prev => [...prev, filhoComEscola]);
      setNovoFilho({
        nome: '',
        data_nascimento: '',
        sexo: '',
        tamanho_roupas: '',
        tamanho_calcados: '',
        escola_id: null,
        escola_selecionada: null
      });
      
      toast.success('Filho adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar filho:', error);
      toast.error('Erro ao adicionar filho');
    }
  };

  const handleRemoverFilho = async (filhoId: string) => {
    if (confirm('Tem certeza que deseja remover este filho?')) {
      const success = await deleteFilho(filhoId);
      if (success) {
        setFilhosForm(prev => prev.filter(f => f.id !== filhoId));
        toast.success('Filho removido com sucesso!');
      }
    }
  };

  const handleSalvarFilho = async (filho: any, index: number) => {
    try {
      console.log('Salvando filho:', filho);
      
      const { error } = await supabase
        .from('filhos')
        .update({
          nome: filho.nome,
          data_nascimento: filho.data_nascimento,
          sexo: filho.sexo || null,
          tamanho_roupas: filho.tamanho_roupas || null,
          tamanho_calcados: filho.tamanho_calcados || null,
          escola_id: filho.escola_id
        })
        .eq('id', filho.id);

      if (error) throw error;
      
      console.log('Filho salvo com sucesso');
      toast.success('Dados do filho salvos!');
    } catch (error) {
      console.error('Erro ao salvar filho:', error);
      toast.error('Erro ao salvar dados do filho');
    }
  };

  const uploadAvatar = async () => {
    if (avatarFiles.length === 0) return null;

    const file = avatarFiles[0];
    const fileName = `${user?.id}-${Date.now()}.jpg`;

    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      let avatar_url = profile?.avatar_url;

      if (avatarFiles.length > 0) {
        avatar_url = await uploadAvatar();
      }

      const updateData = {
        ...formData,
        ...enderecoForm,
        avatar_url
      };

      const success = await updateProfile(updateData);
      
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
        navigate('/perfil');
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando dados...</p>
          </div>
        </div>
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      {/* Header fixo da página */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className="text-lg font-semibold">Editar Perfil</h1>
          
          <Button
            onClick={handleSalvar}
            disabled={saving}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pessoais" className="text-xs">
              <User className="w-4 h-4 mr-1" />
              Pessoais
            </TabsTrigger>
            <TabsTrigger value="endereco" className="text-xs">
              <MapPin className="w-4 h-4 mr-1" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="filhos" className="text-xs">
              <Baby className="w-4 h-4 mr-1" />
              Filhos
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="text-xs">
              <Bell className="w-4 h-4 mr-1" />
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pessoais" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.nome} />
                    <AvatarFallback className="text-lg">
                      {profile?.nome?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <ImageUpload
                      value={avatarFiles}
                      onChange={setAvatarFiles}
                      maxFiles={1}
                      accept="image/*"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
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
                      onChange={(e) => handleInputChange('profissao', e.target.value)}
                      placeholder="Sua profissão"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@seuinstagram"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interesses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias Favoritas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS_DISPONIVEIS.map(categoria => (
                    <Badge
                      key={categoria}
                      variant={formData.categorias_favoritas.includes(categoria) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => handleCategoriaToggle(categoria)}
                    >
                      {categoria}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endereço */}
          <TabsContent value="endereco" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Endereço Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <AddressInput
                  value={enderecoForm}
                  onChange={setEnderecoForm}
                  showAllFields={true}
                />
              </CardContent>
            </Card>

            <EnderecoAdicional />

            <Card>
              <CardHeader>
                <CardTitle>Preferências de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="aceita_entrega">Aceita entrega em domicílio</Label>
                  <input
                    id="aceita_entrega"
                    type="checkbox"
                    checked={formData.aceita_entrega_domicilio}
                    onChange={(e) => handleInputChange('aceita_entrega_domicilio', e.target.checked)}
                    className="rounded"
                  />
                </div>

                {formData.aceita_entrega_domicilio && (
                  <div>
                    <Label htmlFor="raio_entrega">Raio de entrega (km)</Label>
                    <Select
                      value={formData.raio_entrega_km.toString()}
                      onValueChange={(value) => handleInputChange('raio_entrega_km', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 10, 15, 20].map(km => (
                          <SelectItem key={km} value={km.toString()}>
                            {km} km
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="ponto_retirada">Ponto de retirada preferido</Label>
                  <Input
                    id="ponto_retirada"
                    value={formData.ponto_retirada_preferido}
                    onChange={(e) => handleInputChange('ponto_retirada_preferido', e.target.value)}
                    placeholder="Ex: Shopping, estação de metrô..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filhos" className="space-y-6">
            {filhosForm.map((filho, index) => (
              <Card key={filho.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{filho.nome}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoverFilho(filho.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={filho.nome}
                        onChange={(e) => handleFilhoChange(index, 'nome', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={filho.data_nascimento}
                        onChange={(e) => handleFilhoChange(index, 'data_nascimento', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Sexo</Label>
                      <Select
                        value={filho.sexo}
                        onValueChange={(value) => handleFilhoChange(index, 'sexo', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tamanho Roupas</Label>
                      <Input
                        value={filho.tamanho_roupas}
                        onChange={(e) => handleFilhoChange(index, 'tamanho_roupas', e.target.value)}
                        placeholder="Ex: 8, 10, M, G"
                      />
                    </div>
                    <div>
                      <Label>Tamanho Calçados</Label>
                      <Input
                        value={filho.tamanho_calcados}
                        onChange={(e) => handleFilhoChange(index, 'tamanho_calcados', e.target.value)}
                        placeholder="Ex: 35, 36, 37"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Escola</Label>
                    <SchoolSelect
                      value={filho.escolas_inep}
                      onChange={(escola) => {
                        console.log('Escola selecionada para filho:', escola);
                        handleFilhoChange(index, 'escola_id', escola?.codigo_inep || null);
                        handleFilhoChange(index, 'escolas_inep', escola);
                      }}
                      estadoFiltro={enderecoForm.estado}
                      cidadeFiltro={enderecoForm.cidade}
                    />
                  </div>

                  <Button
                    onClick={() => handleSalvarFilho(filho, index)}
                    variant="outline"
                    size="sm"
                  >
                    Salvar Alterações
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Filho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={novoFilho.nome}
                      onChange={(e) => setNovoFilho(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome do filho"
                    />
                  </div>
                  <div>
                    <Label>Data de Nascimento *</Label>
                    <Input
                      type="date"
                      value={novoFilho.data_nascimento}
                      onChange={(e) => setNovoFilho(prev => ({ ...prev, data_nascimento: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Sexo</Label>
                    <Select
                      value={novoFilho.sexo}
                      onValueChange={(value) => setNovoFilho(prev => ({ ...prev, sexo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tamanho Roupas</Label>
                    <Input
                      value={novoFilho.tamanho_roupas}
                      onChange={(e) => setNovoFilho(prev => ({ ...prev, tamanho_roupas: e.target.value }))}
                      placeholder="Ex: 8, 10, M, G"
                    />
                  </div>
                  <div>
                    <Label>Tamanho Calçados</Label>
                    <Input
                      value={novoFilho.tamanho_calcados}
                      onChange={(e) => setNovoFilho(prev => ({ ...prev, tamanho_calcados: e.target.value }))}
                      placeholder="Ex: 35, 36, 37"
                    />
                  </div>
                </div>

                <div>
                  <Label>Escola</Label>
                  <SchoolSelect
                    value={novoFilho.escola_selecionada}
                    onChange={(escola) => {
                      console.log('Escola selecionada para novo filho:', escola);
                      setNovoFilho(prev => ({ 
                        ...prev, 
                        escola_id: escola?.codigo_inep || null,
                        escola_selecionada: escola
                      }));
                    }}
                    estadoFiltro={enderecoForm.estado}
                    cidadeFiltro={enderecoForm.cidade}
                  />
                </div>

                <Button
                  onClick={handleAdicionarFilho}
                  className="w-full"
                  disabled={!novoFilho.nome || !novoFilho.data_nascimento}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Filho
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </main>

      <QuickNav />
    </div>
  );
};

export default EditarPerfil;
