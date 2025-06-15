
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { X, Plus, Save, User } from "lucide-react";

interface FilhoData {
  id?: string;
  nome: string;
  data_nascimento: string;
  sexo: string;
  tamanho_roupas: string;
  tamanho_calcados: string;
}

interface PerfilData {
  nome: string;
  bio: string;
  data_nascimento: string;
  profissao: string;
  instagram: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  ponto_retirada_preferido: string;
  aceita_entrega_domicilio: boolean;
  raio_entrega_km: number;
  interesses: string[];
}

const EditarPerfil = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<PerfilData>({
    nome: "",
    bio: "",
    data_nascimento: "",
    profissao: "",
    instagram: "",
    telefone: "",
    endereco: "",
    bairro: "",
    cidade: "",
    ponto_retirada_preferido: "",
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    interesses: []
  });
  const [filhos, setFilhos] = useState<FilhoData[]>([]);
  const [novoInteresse, setNovoInteresse] = useState("");

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;

    try {
      // Carregar perfil
      const { data: perfilData, error: perfilError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (perfilError) throw perfilError;

      if (perfilData) {
        setPerfil({
          nome: perfilData.nome || "",
          bio: perfilData.bio || "",
          data_nascimento: perfilData.data_nascimento || "",
          profissao: perfilData.profissao || "",
          instagram: perfilData.instagram || "",
          telefone: perfilData.telefone || "",
          endereco: perfilData.endereco || "",
          bairro: perfilData.bairro || "",
          cidade: perfilData.cidade || "",
          ponto_retirada_preferido: perfilData.ponto_retirada_preferido || "",
          aceita_entrega_domicilio: perfilData.aceita_entrega_domicilio || false,
          raio_entrega_km: perfilData.raio_entrega_km || 5,
          interesses: perfilData.interesses || []
        });
      }

      // Carregar filhos
      const { data: filhosData, error: filhosError } = await supabase
        .from('filhos')
        .select('*')
        .eq('mae_id', user.id);

      if (filhosError) throw filhosError;

      if (filhosData) {
        setFilhos(filhosData.map(filho => ({
          id: filho.id,
          nome: filho.nome,
          data_nascimento: filho.data_nascimento,
          sexo: filho.sexo || "",
          tamanho_roupas: filho.tamanho_roupas || "",
          tamanho_calcados: filho.tamanho_calcados || ""
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar seus dados",
        variant: "destructive"
      });
    }
  };

  const salvarPerfil = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Atualizar perfil
      const { error: perfilError } = await supabase
        .from('profiles')
        .update({
          nome: perfil.nome,
          bio: perfil.bio,
          data_nascimento: perfil.data_nascimento || null,
          profissao: perfil.profissao,
          instagram: perfil.instagram,
          telefone: perfil.telefone,
          endereco: perfil.endereco,
          bairro: perfil.bairro,
          cidade: perfil.cidade,
          ponto_retirada_preferido: perfil.ponto_retirada_preferido,
          aceita_entrega_domicilio: perfil.aceita_entrega_domicilio,
          raio_entrega_km: perfil.raio_entrega_km,
          interesses: perfil.interesses,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (perfilError) throw perfilError;

      // Salvar filhos
      for (const filho of filhos) {
        if (filho.id) {
          // Atualizar filho existente
          const { error } = await supabase
            .from('filhos')
            .update({
              nome: filho.nome,
              data_nascimento: filho.data_nascimento,
              sexo: filho.sexo,
              tamanho_roupas: filho.tamanho_roupas,
              tamanho_calcados: filho.tamanho_calcados,
              updated_at: new Date().toISOString()
            })
            .eq('id', filho.id);

          if (error) throw error;
        } else {
          // Criar novo filho
          const { error } = await supabase
            .from('filhos')
            .insert({
              mae_id: user.id,
              nome: filho.nome,
              data_nascimento: filho.data_nascimento,
              sexo: filho.sexo,
              tamanho_roupas: filho.tamanho_roupas,
              tamanho_calcados: filho.tamanho_calcados
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso"
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarFilho = () => {
    setFilhos([...filhos, {
      nome: "",
      data_nascimento: "",
      sexo: "",
      tamanho_roupas: "",
      tamanho_calcados: ""
    }]);
  };

  const removerFilho = (index: number) => {
    setFilhos(filhos.filter((_, i) => i !== index));
  };

  const atualizarFilho = (index: number, campo: keyof FilhoData, valor: string) => {
    const novosFilhos = [...filhos];
    novosFilhos[index] = { ...novosFilhos[index], [campo]: valor };
    setFilhos(novosFilhos);
  };

  const adicionarInteresse = () => {
    if (novoInteresse.trim() && !perfil.interesses.includes(novoInteresse.trim())) {
      setPerfil({
        ...perfil,
        interesses: [...perfil.interesses, novoInteresse.trim()]
      });
      setNovoInteresse("");
    }
  };

  const removerInteresse = (interesse: string) => {
    setPerfil({
      ...perfil,
      interesses: perfil.interesses.filter(i => i !== interesse)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <User className="w-6 h-6" />
            Editar Perfil
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={perfil.nome}
                    onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={perfil.data_nascimento}
                    onChange={(e) => setPerfil({ ...perfil, data_nascimento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={perfil.profissao}
                    onChange={(e) => setPerfil({ ...perfil, profissao: e.target.value })}
                    placeholder="Sua profissão"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={perfil.instagram}
                    onChange={(e) => setPerfil({ ...perfil, instagram: e.target.value })}
                    placeholder="@seuinstagram"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={perfil.telefone}
                    onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Sobre você</Label>
                <Textarea
                  id="bio"
                  value={perfil.bio}
                  onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
                  placeholder="Conte um pouco sobre você, seus filhos e o que procura na comunidade..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={perfil.endereco}
                    onChange={(e) => setPerfil({ ...perfil, endereco: e.target.value })}
                    placeholder="Rua, número, complemento"
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={perfil.bairro}
                    onChange={(e) => setPerfil({ ...perfil, bairro: e.target.value })}
                    placeholder="Seu bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={perfil.cidade}
                    onChange={(e) => setPerfil({ ...perfil, cidade: e.target.value })}
                    placeholder="Sua cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="ponto_retirada">Ponto de Retirada Preferido</Label>
                  <Input
                    id="ponto_retirada"
                    value={perfil.ponto_retirada_preferido}
                    onChange={(e) => setPerfil({ ...perfil, ponto_retirada_preferido: e.target.value })}
                    placeholder="Ex: Escola do João, Shopping, etc."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="aceita_entrega"
                  checked={perfil.aceita_entrega_domicilio}
                  onCheckedChange={(checked) => setPerfil({ ...perfil, aceita_entrega_domicilio: checked })}
                />
                <Label htmlFor="aceita_entrega">Aceito entrega em domicílio</Label>
              </div>
              {perfil.aceita_entrega_domicilio && (
                <div>
                  <Label htmlFor="raio_entrega">Raio de entrega (km)</Label>
                  <Input
                    id="raio_entrega"
                    type="number"
                    value={perfil.raio_entrega_km}
                    onChange={(e) => setPerfil({ ...perfil, raio_entrega_km: parseInt(e.target.value) || 5 })}
                    min={1}
                    max={50}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interesses */}
          <Card>
            <CardHeader>
              <CardTitle>Interesses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={novoInteresse}
                  onChange={(e) => setNovoInteresse(e.target.value)}
                  placeholder="Ex: Roupas orgânicas, brinquedos educativos..."
                  onKeyPress={(e) => e.key === 'Enter' && adicionarInteresse()}
                />
                <Button type="button" onClick={adicionarInteresse}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {perfil.interesses.map((interesse, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {interesse}
                    <button onClick={() => removerInteresse(interesse)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filhos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Meus Filhos
                <Button type="button" onClick={adicionarFilho} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Filho
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filhos.map((filho, index) => (
                <div key={index} className="border p-4 rounded-lg relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removerFilho(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Nome *</Label>
                      <Input
                        value={filho.nome}
                        onChange={(e) => atualizarFilho(index, 'nome', e.target.value)}
                        placeholder="Nome do filho(a)"
                      />
                    </div>
                    <div>
                      <Label>Data de Nascimento *</Label>
                      <Input
                        type="date"
                        value={filho.data_nascimento}
                        onChange={(e) => atualizarFilho(index, 'data_nascimento', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Sexo</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={filho.sexo}
                        onChange={(e) => atualizarFilho(index, 'sexo', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <Label>Tamanho Roupas</Label>
                      <Input
                        value={filho.tamanho_roupas}
                        onChange={(e) => atualizarFilho(index, 'tamanho_roupas', e.target.value)}
                        placeholder="Ex: 2 anos, M, etc."
                      />
                    </div>
                    <div>
                      <Label>Tamanho Calçados</Label>
                      <Input
                        value={filho.tamanho_calcados}
                        onChange={(e) => atualizarFilho(index, 'tamanho_calcados', e.target.value)}
                        placeholder="Ex: 25, 26, etc."
                      />
                    </div>
                  </div>
                </div>
              ))}
              {filhos.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhum filho cadastrado. Clique em "Adicionar Filho" para começar.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={salvarPerfil} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
