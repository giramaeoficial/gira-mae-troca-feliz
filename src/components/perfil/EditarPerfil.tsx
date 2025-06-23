
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { MapPin, User, Heart, Truck, Home } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/use-toast';
import AddressInput from '@/components/address/AddressInput';
import EnderecoAdicional from './EnderecoAdicional';
import type { Address } from '@/hooks/useAddress';

const EditarPerfil: React.FC = () => {
  const { profile, updateProfile, loading } = useProfile();
  const [formData, setFormData] = useState({
    nome: '',
    bio: '',
    profissao: '',
    instagram: '',
    telefone: '',
    // Endereço principal
    endereco_principal: {} as Partial<Address>,
    // Preferências de entrega
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    ponto_retirada_preferido: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        bio: profile.bio || '',
        profissao: profile.profissao || '',
        instagram: profile.instagram || '',
        telefone: profile.telefone || '',
        endereco_principal: {
          cep: profile.cep || '',
          endereco: profile.endereco || '',
          bairro: profile.bairro || '',
          cidade: profile.cidade || '',
          estado: profile.estado || '',
          complemento: profile.complemento || '',
          ponto_referencia: profile.ponto_referencia || ''
        },
        aceita_entrega_domicilio: profile.aceita_entrega_domicilio || false,
        raio_entrega_km: profile.raio_entrega_km || 5,
        ponto_retirada_preferido: profile.ponto_retirada_preferido || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (address: Partial<Address>) => {
    setFormData(prev => ({
      ...prev,
      endereco_principal: address
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        nome: formData.nome,
        bio: formData.bio,
        profissao: formData.profissao,
        instagram: formData.instagram,
        telefone: formData.telefone,
        // Campos de endereço
        cep: formData.endereco_principal.cep || '',
        endereco: formData.endereco_principal.endereco || '',
        bairro: formData.endereco_principal.bairro || '',
        cidade: formData.endereco_principal.cidade || '',
        estado: formData.endereco_principal.estado || '',
        complemento: formData.endereco_principal.complemento || '',
        ponto_referencia: formData.endereco_principal.ponto_referencia || '',
        // Preferências de entrega
        aceita_entrega_domicilio: formData.aceita_entrega_domicilio,
        raio_entrega_km: formData.raio_entrega_km,
        ponto_retirada_preferido: formData.ponto_retirada_preferido
      });

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Editar Perfil</h1>
        <p className="text-muted-foreground">
          Mantenha suas informações atualizadas para facilitar as trocas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Conte um pouco sobre você..."
                className="h-20"
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
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
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
          </CardContent>
        </Card>

        {/* SEÇÃO 2: Meu Endereço Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Meu Endereço Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddressInput
              value={formData.endereco_principal}
              onChange={handleAddressChange}
              showAllFields={true}
            />
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <MapPin className="w-4 h-4 inline mr-1" />
              Este será seu endereço padrão para retiradas e entregas
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 3: Preferências de Entrega */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Preferências de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="aceita-entrega">Posso fazer entregas</Label>
                <p className="text-sm text-muted-foreground">
                  Permita que outros solicitem entrega dos seus itens
                </p>
              </div>
              <Switch
                id="aceita-entrega"
                checked={formData.aceita_entrega_domicilio}
                onCheckedChange={(checked) => handleInputChange('aceita_entrega_domicilio', checked)}
              />
            </div>

            {formData.aceita_entrega_domicilio && (
              <div className="space-y-4 ml-4 border-l-2 border-muted pl-4">
                <div className="space-y-2">
                  <Label>Raio máximo de entrega: {formData.raio_entrega_km}km</Label>
                  <Slider
                    value={[formData.raio_entrega_km]}
                    onValueChange={(value) => handleInputChange('raio_entrega_km', value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Distância máxima que você aceita fazer entregas
                  </p>
                </div>

                <div>
                  <Label htmlFor="ponto-encontro">Ponto de encontro preferido</Label>
                  <Input
                    id="ponto-encontro"
                    value={formData.ponto_retirada_preferido}
                    onChange={(e) => handleInputChange('ponto_retirada_preferido', e.target.value)}
                    placeholder="Ex: Shopping ABC, Praça Central, etc."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Botões de ação */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Salvar Alterações
          </Button>
        </div>
      </form>

      {/* SEÇÃO 4: Endereços Adicionais */}
      <EnderecoAdicional />
    </div>
  );
};

export default EditarPerfil;
