
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ui/image-upload';

const INTERESSES_DISPONIVEIS = [
  'Moda Infantil', 'Educação', 'Atividades ao Ar Livre', 'Arte e Criatividade',
  'Esportes', 'Música', 'Leitura', 'Culinária', 'Jardinagem', 'Tecnologia'
];

const CATEGORIAS_DISPONIVEIS = [
  'roupas', 'calcados', 'brinquedos', 'livros', 'acessorios', 'moveis', 'decoracao'
];

interface DadosPessoaisSectionProps {
  formData: {
    nome: string;
    bio: string;
    profissao: string;
    instagram: string;
    telefone: string;
    data_nascimento: string;
    interesses: string[];
    categorias_favoritas: string[];
  };
  profile: any;
  avatarFiles: File[];
  onInputChange: (field: string, value: any) => void;
  onInteresseToggle: (interesse: string) => void;
  onCategoriaToggle: (categoria: string) => void;
  onAvatarChange: (files: File[]) => void;
}

const DadosPessoaisSection: React.FC<DadosPessoaisSectionProps> = ({
  formData,
  profile,
  avatarFiles,
  onInputChange,
  onInteresseToggle,
  onCategoriaToggle,
  onAvatarChange
}) => {
  return (
    <div className="space-y-6">
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
                onChange={onAvatarChange}
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
              onChange={(e) => onInputChange('nome', e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onInputChange('bio', e.target.value)}
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
                onChange={(e) => onInputChange('profissao', e.target.value)}
                placeholder="Sua profissão"
              />
            </div>

            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => onInputChange('data_nascimento', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => onInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => onInputChange('instagram', e.target.value)}
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
                onClick={() => onInteresseToggle(interesse)}
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
                onClick={() => onCategoriaToggle(categoria)}
              >
                {categoria}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DadosPessoaisSection;
