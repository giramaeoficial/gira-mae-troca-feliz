import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ui/image-upload";
import PriceSuggestions from "@/components/ui/price-suggestions";
import AddressInput from "@/components/address/AddressInput";
import SchoolSelect from "@/components/address/SchoolSelect";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, MapPin, Tag, Calendar, Info, Home, School, Navigation } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useItens } from '@/hooks/useItens';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useUserAddress } from '@/hooks/useUserAddress';
import { useFilhosPorEscola } from '@/hooks/useFilhosPorEscola';
import { type Address } from '@/hooks/useAddress';
import FormProgress from '@/components/ui/form-progress';
import { toast } from "sonner";
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';

interface FormData {
  nome: string;
  categoria_id: string;
  estado_conservacao: string;
  tamanho: string;
  preco: string;
  descricao: string;
  imagens: File[];
  // Campos de endereço
  endereco_tipo: 'meu' | 'escola' | 'outro';
  escola_selecionada: any;
  endereco_personalizado: Partial<Address>;
  aceita_entrega: boolean;
  raio_entrega_km: number;
  instrucoes_retirada: string;
}

const validateForm = (formData: FormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!formData.nome) {
    errors.nome = "O nome do item é obrigatório.";
  }

  if (!formData.categoria_id) {
    errors.categoria_id = "A categoria é obrigatória.";
  }

  if (!formData.estado_conservacao) {
    errors.estado_conservacao = "O estado de conservação é obrigatório.";
  }

  if (!formData.preco) {
    errors.preco = "O preço é obrigatório.";
  } else if (isNaN(Number(formData.preco))) {
    errors.preco = "O preço deve ser um número.";
  }

  if (!formData.descricao) {
    errors.descricao = "A descrição é obrigatória.";
  }

  if (!formData.imagens || formData.imagens.length === 0) {
    errors.imagens = "Pelo menos uma imagem é obrigatória.";
  }

  return errors;
};

const validateAddress = (formData: FormData, userAddress: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  // Validação específica para cada tipo de endereço
  if (formData.endereco_tipo === 'meu') {
    if (!userAddress) {
      errors.endereco = "Você precisa cadastrar seu endereço principal no perfil para usar esta opção.";
    } else if (!userAddress.cep || !userAddress.endereco || !userAddress.cidade || !userAddress.estado) {
      errors.endereco = "Seu endereço principal está incompleto. Complete seu perfil primeiro.";
    }
  } else if (formData.endereco_tipo === 'escola') {
    if (!formData.escola_selecionada) {
      errors.endereco = "Selecione uma escola.";
    } else if (!formData.escola_selecionada.municipio || !formData.escola_selecionada.uf) {
      errors.endereco = "A escola selecionada não possui dados de localização completos.";
    }
  } else if (formData.endereco_tipo === 'outro') {
    const endereco = formData.endereco_personalizado;
    if (!endereco.cep || !endereco.endereco || !endereco.cidade || !endereco.estado) {
      errors.endereco = "Preencha todos os campos obrigatórios do endereço.";
    }
  }

  if (formData.aceita_entrega && !formData.raio_entrega_km) {
    errors.raio_entrega = "Defina o raio de entrega.";
  }

  return errors;
};

const extrairBairroEscola = (escola: any): string => {
  // Se já tiver um campo bairro explícito, use-o
  if (escola.bairro) {
    return escola.bairro.trim();
  }

  // Se não tiver endereço, retorna vazio
  if (!escola.endereco) {
    return '';
  }

  const endereco = escola.endereco.trim();
  
  // Tenta diferentes padrões comuns de endereços de escolas
  const padroes = [
    // Padrão: "Rua/Av Nome, Número, Bairro, Cidade"
    /^[^,]+,\s*[^,]*,\s*([^,]+),/,
    // Padrão: "Rua/Av Nome, Bairro"
    /^[^,]+,\s*([^,]+)$/,
    // Padrão: "Nome da Rua - Bairro"
    /^[^-]+-\s*([^-]+)$/,
    // Padrão: busca por palavras indicativas de bairro
    /(?:bairro|distrito|vila|jardim|centro)\s+([^,\-]+)/i,
  ];

  for (const padrao of padroes) {
    const match = endereco.match(padrao);
    if (match && match[1]) {
      let bairro = match[1].trim();
      
      // Remove números que possam ter sido capturados
      bairro = bairro.replace(/^\d+\s*/, '');
      
      // Remove palavras muito comuns que não são bairros
      const palavrasExcluir = ['rua', 'avenida', 'av', 'r', 'número', 'nº', 'n'];
      const palavrasBairro = bairro.split(/\s+/).filter(palavra => 
        !palavrasExcluir.includes(palavra.toLowerCase()) && palavra.length > 1
      );
      
      if (palavrasBairro.length > 0) {
        return palavrasBairro.join(' ');
      }
    }
  }

  // Se nenhum padrão funcionou, tenta o método anterior como fallback
  const enderecoPartes = endereco.split(',').map(parte => parte.trim());
  if (enderecoPartes.length > 1) {
    let bairro = enderecoPartes[1];
    
    // Remove números no início
    bairro = bairro.replace(/^\d+\s*/, '');
    
    if (bairro && bairro.length > 2) {
      return bairro;
    }
  }

  // Se tudo falhar, retorna vazio em vez de dados incorretos
  return '';
};

const PublicarItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { configuracoes } = useConfigCategorias();
  const { publicarItem, loading } = useItens();
  const { userAddress } = useUserAddress();
  const { filhos } = useFilhosPorEscola();

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    categoria_id: '',
    estado_conservacao: '',
    tamanho: '',
    preco: '',
    descricao: '',
    imagens: [],
    endereco_tipo: 'meu',
    escola_selecionada: null,
    endereco_personalizado: {},
    aceita_entrega: false,
    raio_entrega_km: 5,
    instrucoes_retirada: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [progress, setProgress] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (files: File[]) => {
    setFormData(prev => ({ ...prev, imagens: files }));
  };

  const handleEnderecoTipoChange = (tipo: 'meu' | 'escola' | 'outro') => {
    setFormData(prev => ({ 
      ...prev, 
      endereco_tipo: tipo,
      escola_selecionada: null,
      endereco_personalizado: {}
    }));
  };

  const handleEscolaSelect = (escola: any) => {
    setFormData(prev => ({ ...prev, escola_selecionada: escola }));
  };

  const handleEnderecoPersonalizadoChange = (endereco: Address) => {
    setFormData(prev => ({ ...prev, endereco_personalizado: endereco }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, aceita_entrega: checked }));
  };

  const handleRaioChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, raio_entrega_km: value[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const basicErrors = validateForm(formData);
    
    // Validação de endereço
    const addressErrors = validateAddress(formData, userAddress);
    
    // Combinar todos os erros
    const allErrors = { ...basicErrors, ...addressErrors };
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      try {
        const categoriaSelecionada = configuracoes?.find(c => c.id === formData.categoria_id);
        
        if (!categoriaSelecionada) {
          toast.error("Categoria não encontrada.");
          return;
        }

        // Preparar dados de endereço baseado no tipo selecionado
        let enderecoData: any = {};

        if (formData.endereco_tipo === 'meu' && userAddress) {
          enderecoData = {
            endereco_cep: userAddress.cep,
            endereco_rua: userAddress.endereco,
            endereco_bairro: userAddress.bairro,
            endereco_cidade: userAddress.cidade,
            endereco_estado: userAddress.estado,
            endereco_complemento: userAddress.complemento,
            ponto_referencia: userAddress.ponto_referencia
          };
        } else if (formData.endereco_tipo === 'escola' && formData.escola_selecionada) {
          const escola = formData.escola_selecionada;
          
          // Usar a nova função robusta para extrair o bairro
          const bairro = extrairBairroEscola(escola);
          
          enderecoData = {
            escola_id: escola.codigo_inep,
            endereco_rua: escola.endereco || '',
            endereco_bairro: bairro,
            endereco_cidade: escola.municipio,
            endereco_estado: escola.uf,
            ponto_referencia: `Escola: ${escola.escola}`
          };
        } else if (formData.endereco_tipo === 'outro') {
          const endereco = formData.endereco_personalizado;
          enderecoData = {
            endereco_cep: endereco.cep,
            endereco_rua: endereco.endereco,
            endereco_bairro: endereco.bairro,
            endereco_cidade: endereco.cidade,
            endereco_estado: endereco.estado,
            endereco_complemento: endereco.complemento,
            ponto_referencia: endereco.ponto_referencia
          };
        }

        const itemData = {
          titulo: formData.nome,
          descricao: formData.descricao,
          categoria: categoriaSelecionada.categoria,
          estado_conservacao: formData.estado_conservacao,
          tamanho: formData.tamanho || null,
          valor_girinhas: parseFloat(formData.preco),
          publicado_por: user?.id,
          status: 'disponivel',
          aceita_entrega: formData.aceita_entrega,
          raio_entrega_km: formData.aceita_entrega ? formData.raio_entrega_km : null,
          instrucoes_retirada: formData.instrucoes_retirada || null,
          ...enderecoData
        };

        setProgress(30);

        const success = await publicarItem(itemData, formData.imagens);
        
        if (success) {
          setProgress(100);
          toast.success("Item publicado com sucesso!");
          navigate('/feed');
        } else {
          toast.error("Erro ao publicar o item. Tente novamente.");
          setProgress(0);
        }
      } catch (error: any) {
        console.error("Erro ao criar item:", error);
        toast.error("Erro ao publicar o item. Tente novamente.");
        setProgress(0);
      }
    } else {
      toast.error("Por favor, corrija os erros no formulário.");
    }
  };

  const handlePriceSuggestion = (price: number) => {
    setFormData(prev => ({ ...prev, preco: String(price) }));
  };

  // Calcular progresso do formulário
  const calculateProgress = () => {
    const steps = [
      { label: "Nome", completed: !!formData.nome, required: true },
      { label: "Categoria", completed: !!formData.categoria_id, required: true },
      { label: "Estado", completed: !!formData.estado_conservacao, required: true },
      { label: "Preço", completed: !!formData.preco, required: true },
      { label: "Descrição", completed: !!formData.descricao, required: true },
      { label: "Localização", completed: formData.endereco_tipo === 'meu' ? !!userAddress : 
        formData.endereco_tipo === 'escola' ? !!formData.escola_selecionada :
        !!(formData.endereco_personalizado.cep && formData.endereco_personalizado.cidade), required: true },
      { label: "Imagens", completed: formData.imagens.length > 0, required: true },
      { label: "Tamanho", completed: !!formData.tamanho, required: false }
    ];
    return steps;
  };

  const categoriaSelecionada = configuracoes?.find(c => c.id === formData.categoria_id);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Publicar Novo Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {progress > 0 && (
                  <FormProgress steps={calculateProgress()} />
                )}

                {/* Informações Básicas */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Item</Label>
                    <Input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Ex: Vestido de festa, Livro usado..."
                    />
                    {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
                  </div>

                  <div>
                    <Label htmlFor="categoria_id">Categoria</Label>
                    <Select onValueChange={handleSelectChange('categoria_id')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {configuracoes?.map(categoria => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoria_id && <p className="text-red-500 text-sm">{errors.categoria_id}</p>}
                  </div>

                  <div>
                    <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
                    <Select onValueChange={handleSelectChange('estado_conservacao')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="seminovo">Seminovo</SelectItem>
                        <SelectItem value="usado">Usado</SelectItem>
                        <SelectItem value="muito usado">Muito Usado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado_conservacao && <p className="text-red-500 text-sm">{errors.estado_conservacao}</p>}
                  </div>

                  <div>
                    <Label htmlFor="tamanho">Tamanho (opcional)</Label>
                    <Input
                      type="text"
                      id="tamanho"
                      name="tamanho"
                      value={formData.tamanho}
                      onChange={handleChange}
                      placeholder="Ex: M, 38, 2-3 anos..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="preco">Preço (Girinhas)</Label>
                    <Input
                      type="number"
                      id="preco"
                      name="preco"
                      value={formData.preco}
                      onChange={handleChange}
                      placeholder="Ex: 25"
                    />
                    {errors.preco && <p className="text-red-500 text-sm">{errors.preco}</p>}
                    {categoriaSelecionada && (
                      <PriceSuggestions 
                        categoria={categoriaSelecionada.categoria}
                        estadoConservacao={formData.estado_conservacao || "bom"}
                        valorMinimo={categoriaSelecionada.valor_minimo}
                        valorMaximo={categoriaSelecionada.valor_maximo}
                        valorAtual={formData.preco ? Number(formData.preco) : undefined}
                        onSuggestionClick={handlePriceSuggestion}
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      placeholder="Descreva o item detalhadamente..."
                    />
                    {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao}</p>}
                  </div>
                </div>

                <Separator />

                {/* Local de Retirada */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Local de Retirada</h3>
                  </div>

                  <RadioGroup
                    value={formData.endereco_tipo}
                    onValueChange={handleEnderecoTipoChange}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="meu" id="endereco-meu" />
                      <Label htmlFor="endereco-meu" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Usar meu endereço principal
                        {!userAddress && (
                          <Badge variant="destructive" className="text-xs">
                            Não cadastrado
                          </Badge>
                        )}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="escola" id="endereco-escola" />
                      <Label htmlFor="endereco-escola" className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        Endereço da escola
                        {(!filhos || filhos.length === 0) && (
                          <Badge variant="secondary" className="text-xs">
                            Sem escolas
                          </Badge>
                        )}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outro" id="endereco-outro" />
                      <Label htmlFor="endereco-outro" className="flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Outro endereço
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Conteúdo baseado na opção selecionada */}
                  {formData.endereco_tipo === 'meu' && (
                    <div className="mt-4">
                      {userAddress ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Endereço:</strong> {userAddress.endereco}, {userAddress.bairro}
                          </p>
                          <p className="text-sm text-green-800">
                            <strong>Cidade:</strong> {userAddress.cidade}/{userAddress.estado}
                          </p>
                          <p className="text-sm text-green-800">
                            <strong>CEP:</strong> {userAddress.cep}
                          </p>
                        </div>
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Você precisa cadastrar seu endereço principal no perfil primeiro.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {formData.endereco_tipo === 'escola' && (
                    <div className="mt-4">
                      {filhos && filhos.length > 0 ? (
                        <SchoolSelect
                          value={formData.escola_selecionada}
                          onChange={handleEscolaSelect}
                          placeholder="Selecione a escola..."
                        />
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Você precisa cadastrar filhos com escolas no seu perfil primeiro.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {formData.endereco_tipo === 'outro' && (
                    <div className="mt-4">
                      <AddressInput
                        value={formData.endereco_personalizado}
                        onChange={handleEnderecoPersonalizadoChange}
                      />
                    </div>
                  )}

                  {errors.endereco && <p className="text-red-500 text-sm">{errors.endereco}</p>}
                </div>

                <Separator />

                {/* Opções de Entrega */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="aceita_entrega" className="text-base font-medium">
                      Aceito entregar este item
                    </Label>
                    <Switch
                      id="aceita_entrega"
                      checked={formData.aceita_entrega}
                      onCheckedChange={handleSwitchChange}
                    />
                  </div>

                  {formData.aceita_entrega && (
                    <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                      <div>
                        <Label className="text-sm font-medium">
                          Raio de entrega: {formData.raio_entrega_km} km
                        </Label>
                        <div className="mt-2">
                          <Slider
                            value={[formData.raio_entrega_km]}
                            onValueChange={handleRaioChange}
                            max={50}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1 km</span>
                          <span>50 km</span>
                        </div>
                      </div>
                      {errors.raio_entrega && <p className="text-red-500 text-sm">{errors.raio_entrega}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="instrucoes_retirada">Instruções de Retirada (opcional)</Label>
                  <Textarea
                    id="instrucoes_retirada"
                    name="instrucoes_retirada"
                    value={formData.instrucoes_retirada}
                    onChange={handleChange}
                    placeholder="Ex: Tocar o interfone do apto 101, disponível após 18h..."
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Upload de Imagens */}
                <div>
                  <Label>Imagens</Label>
                  <ImageUpload value={formData.imagens} onChange={handleImageUpload} />
                  {errors.imagens && <p className="text-red-500 text-sm">{errors.imagens}</p>}
                </div>

                <Button disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Publicar Item
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <QuickNav />
      </div>
    </AuthGuard>
  );
};

export default PublicarItem;
