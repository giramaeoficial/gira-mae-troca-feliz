import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/utils/supabaseStorage';
import { CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import FriendlyError from '@/components/error/FriendlyError';

const EditarPerfil = () => {
  const { user, updateProfile } = useAuth();
  const { profile, loading, error, refetch } = useProfile();
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setCidade(profile.cidade || '');
      setEstado(profile.estado || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatar(file);
      // Criar uma URL para visualização imediata
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      let avatar_url = profile?.avatar_url;

      if (newAvatar) {
        const fileName = `avatars/${user?.id}/${newAvatar.name}`;
        const { error: uploadError } = await uploadImage({
          bucket: 'avatars',
          path: fileName,
          file: newAvatar
        });

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatar_url = publicUrl;
      }

      const updatedData = {
        nome,
        cidade,
        estado,
        avatar_url
      };

      const success = await updateProfile(updatedData);

      if (success) {
        setSaveSuccess(true);
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso.",
        });
        refetch(); // Atualiza o profile no cache
        setTimeout(() => {
          setSaveSuccess(false);
          navigate('/perfil');
        }, 1500);
      } else {
        throw new Error('Falha ao atualizar o perfil.');
      }
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      toast({
        title: "Erro ao salvar",
        description: err.message || "Ocorreu um erro ao salvar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner text="Carregando perfil..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <FriendlyError 
          title="Erro ao carregar perfil"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Editar Perfil
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              ) : (
                <AvatarFallback className="bg-gray-300 text-gray-600">
                  {getInitials(nome || 'Usuário')}
                </AvatarFallback>
              )}
            </Avatar>
            
            <Label htmlFor="avatar" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200">
              Alterar Avatar
              <Input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </Label>
          </div>

          {/* Nome */}
          <div>
            <Label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome Completo
            </Label>
            <Input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring focus:ring-primary/50"
              required
            />
          </div>

          {/* Cidade */}
          <div>
            <Label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
              Cidade
            </Label>
            <Input
              type="text"
              id="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring focus:ring-primary/50"
            />
          </div>

          {/* Estado */}
          <div>
            <Label htmlFor="estado" className="block text-sm font-medium text-gray-700">
              Estado
            </Label>
            <Input
              type="text"
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring focus:ring-primary/50"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary to-pink-500 text-white font-medium py-2 rounded-md hover:from-primary/90 hover:to-pink-500/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Salvando...
              </div>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
          
          {saveSuccess && (
            <div className="text-green-600 flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5" />
              Perfil atualizado! Redirecionando...
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;
