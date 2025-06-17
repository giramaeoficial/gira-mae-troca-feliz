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
import { X, Plus, Save, User, GraduationCap } from "lucide-react";
import EscolaPicker from "@/components/escolas/EscolaPicker";
import { Tables } from "@/integrations/supabase/types";

type Escola = Tables<'escolas_inep'>;

interface FilhoData {
  id?: string;
  nome: string;
  data_nascimento: string;
  sexo: string;
  tamanho_roupas: string;
  tamanho_calcados: string;
  escola_id?: number | null;
  escola?: Tables<'escolas_inep'> | null;
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

      // Carregar filhos com escola
      const { data: filhosData, error: filhosError } = await supabase
        .from('filhos')
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey (*)
        `)
        .eq('mae_id', user.id);

      if (filhosError) throw filhosError;

      if (filhosData) {
        const filhosProcessados = filhosData.map(filho => ({
          id: filho.id,
          nome: filho.nome,
          data_nascimento: filho.data_nascimento,
          sexo: filho.sexo || "",
          tamanho_roupas: filho.tamanho_roupas || "",
          tamanho_calcados: filho.tamanho_calcados || "",
          escola_id: filho.escola_id,
          escola: filho.escolas_inep || null
        }));
        
        setFilhos(filhosProcessados);
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
        const escolaId = filho.escola?.codigo_inep || null;
        
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
              escola_id: escolaId,
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
              tamanho_calcados: filho.tamanho_calcados,
              escola_id: escolaId
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

  const atualizarFilho = (index: number, campo: keyof FilhoData, valor: string | any) => {
    const novosFilhos = [...filhos];
    if (campo === 'escola') {
      const escola = valor as Tables<'escolas_inep'> | null;
      novosFilhos[index] = { 
        ...novosFilhos[index], 
        escola: escola,
        escola_id: escola?.codigo_inep || null
      };
    } else {
      novosFilhos[index] = { ...novosFilhos[index], [campo]: valor };
    }
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
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl min-h-full sm:min-h-0 sm:rounded-lg sm:max-h-[95vh] overflow-y-auto">
        {/* Header fixo no mobile */}
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex justify-between items-center z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
            Editar Perfil
          </h2>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-sm font-medium">Nome *</Label>
                  <Input
                    id="nome"
                    value={perfil.nome}
                    onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                    placeholder="Seu nome completo"
                    className="mt-1 h-12"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_nascimento" className="text-sm font-medium">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={perfil.data_nascimento}
                      onChange={(e) => setPerfil({ ...perfil, data_nascimento: e.target.value })}
                      className="mt-1 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profissao" className="text-sm font-medium">Profissão</Label>
                    <Input
                      id="profissao"
                      value={perfil.profissao}
                      onChange={(e) => setPerfil({ ...perfil, profissao: e.target.value })}
                      placeholder="Sua profissão"
                      className="mt-1 h-12"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-sm font-medium">Instagram</Label>
                    <Input
                      id="instagram"
                      value={perfil.instagram}
                      onChange={(e) => setPerfil({ ...perfil, instagram: e.target.value })}
                      placeholder="@seuinstagram"
                      className="mt-1 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone" className="text-sm font-medium">Telefone</Label>
                    <Input
                      id="telefone"
                      value={perfil.telefone}
                      onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="mt-1 h-12"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">Sobre você</Label>
                  <Textarea
                    id="bio"
                    value={perfil.bio}
                    onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você, seus filhos e o que procura na comunidade..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="endereco" className="text-sm font-medium">Endereço</Label>
                  <Input
                    id="endereco"
                    value={perfil.endereco}
                    onChange={(e) => setPerfil({ ...perfil, endereco: e.target.value })}
                    placeholder="Rua, número, complemento"
                    className="mt-1 h-12"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bairro" className="text-sm font-medium">Bairro</Label>
                    <Input
                      id="bairro"
                      value={perfil.bairro}
                      onChange={(e) => setPerfil({ ...perfil, bairro: e.target.value })}
                      placeholder="Seu bairro"
                      className="mt-1 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade" className="text-sm font-medium">Cidade</Label>
                    <Input
                      id="cidade"
                      value={perfil.cidade}
                      onChange={(e) => setPerfil({ ...perfil, cidade: e.target.value })}
                      placeholder="Sua cidade"
                      className="mt-1 h-12"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ponto_retirada" className="text-sm font-medium">Ponto de Retirada Preferido</Label>
                  <Input
                    id="ponto_retirada"
                    value={perfil.ponto_retirada_preferido}
                    onChange={(e) => setPerfil({ ...perfil, ponto_retirada_preferido: e.target.value })}
                    placeholder="Ex: Escola do João, Shopping, etc."
                    className="mt-1 h-12"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 py-2">
                <Switch
                  id="aceita_entrega"
                  checked={perfil.aceita_entrega_domicilio}
                  onCheckedChange={(checked) => setPerfil({ ...perfil, aceita_entrega_domicilio: checked })}
                />
                <Label htmlFor="aceita_entrega" className="text-sm font-medium">Aceito entrega em domicílio</Label>
              </div>
              
              {perfil.aceita_entrega_domicilio && (
                <div>
                  <Label htmlFor="raio_entrega" className="text-sm font-medium">Raio de entrega (km)</Label>
                  <Input
                    id="raio_entrega"
                    type="number"
                    value={perfil.raio_entrega_km}
                    onChange={(e) => setPerfil({ ...perfil, raio_entrega_km: parseInt(e.target.value) || 5 })}
                    min={1}
                    max={50}
                    className="mt-1 h-12"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interesses */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Interesses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={novoInteresse}
                  onChange={(e) => setNovoInteresse(e.target.value)}
                  placeholder="Ex: Roupas orgânicas, brinquedos educativos..."
                  onKeyPress={(e) => e.key === 'Enter' && adicionarInteresse()}
                  className="flex-1 h-12"
                />
                <Button type="button" onClick={adicionarInteresse} className="px-4">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {perfil.interesses.map((interesse, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                    <span className="text-sm">{interesse}</span>
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
            <CardHeader className="pb-4">
              <CardTitle className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Meus Filhos
                </div>
                <Button type="button" onClick={adicionarFilho} size="sm" className="text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {filhos.map((filho, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-8 w-8"
                    onClick={() => removerFilho(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="space-y-4 pr-8">
                    <div>
                      <Label className="text-sm font-medium">Nome *</Label>
                      <Input
                        value={filho.nome}
                        onChange={(e) => atualizarFilho(index, 'nome', e.target.value)}
                        placeholder="Nome do filho(a)"
                        className="mt-1 h-12"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Data de Nascimento *</Label>
                        <Input
                          type="date"
                          value={filho.data_nascimento}
                          onChange={(e) => atualizarFilho(index, 'data_nascimento', e.target.value)}
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Sexo</Label>
                        <select
                          className="w-full p-3 border rounded-md mt-1 h-12 bg-white"
                          value={filho.sexo}
                          onChange={(e) => atualizarFilho(index, 'sexo', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Tamanho Roupas</Label>
                        <Input
                          value={filho.tamanho_roupas}
                          onChange={(e) => atualizarFilho(index, 'tamanho_roupas', e.target.value)}
                          placeholder="Ex: 2 anos, M, etc."
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tamanho Calçados</Label>
                        <Input
                          value={filho.tamanho_calcados}
                          onChange={(e) => atualizarFilho(index, 'tamanho_calcados', e.target.value)}
                          placeholder="Ex: 25, 26, etc."
                          className="mt-1 h-12"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Escola</Label>
                      <EscolaPicker
                        value={filho.escola}
                        onChange={(escola) => atualizarFilho(index, 'escola', escola)}
                        placeholder="Buscar escola do(a) filho(a)..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Selecionar a escola facilita a entrega de itens e encontrar outros pais da mesma comunidade escolar
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filhos.length === 0 && (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum filho cadastrado</p>
                  <Button onClick={adicionarFilho} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Filho
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação - Fixos no bottom no mobile */}
          <div className="sticky bottom-0 bg-white border-t -mx-4 sm:-mx-6 p-4 sm:p-6 sm:border-t-0 sm:static sm:bg-transparent">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="outline" onClick={onClose} className="h-12 sm:h-10">
                Cancelar
              </Button>
              <Button onClick={salvarPerfil} disabled={loading} className="h-12 sm:h-10">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
