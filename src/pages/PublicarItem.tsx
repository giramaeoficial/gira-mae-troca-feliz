import React from 'react';
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
import SimpleAddressForm from "@/components/address/SimpleAddressForm";
import SchoolSelect from "@/components/address/SchoolSelect";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, MapPin, Info, Home, School, Navigation } from "lucide-react";
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useFilhosPorEscola } from '@/hooks/useFilhosPorEscola';
import { usePublicarItemForm } from '@/hooks/usePublicarItemForm';
import FormProgress from '@/components/ui/form-progress';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';

const PublicarItem = () => {
  const { configuracoes } = useConfigCategorias();
  const { filhos } = useFilhosPorEscola();
  const {
    formData,
    updateFormData,
    errors,
    progress,
    loading,
    handleSubmit,
    calculateProgress,
    userAddress
  } = usePublicarItemForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    updateFormData({ [name]: value });
  };

  const handleImageUpload = (files: File[]) => {
    updateFormData({ imagens: files });
  };

  const handleEnderecoTipoChange = (tipo: 'meu' | 'escola' | 'outro') => {
    updateFormData({ 
      endereco_tipo: tipo,
      escola_selecionada: null,
      endereco_personalizado: {}
    });
  };

  const handleEscolaSelect = (escola: any) => {
    updateFormData({ escola_selecionada: escola });
  };

  const handleEnderecoPersonalizadoChange = (endereco: any) => {
    updateFormData({ endereco_personalizado: endereco });
  };

  const handleSwitchChange = (checked: boolean) => {
    updateFormData({ aceita_entrega: checked });
  };

  const handleRaioChange = (value: number[]) => {
    updateFormData({ raio_entrega_km: value[0] });
  };

  const handlePriceSuggestion = (price: number) => {
    updateFormData({ preco: String(price) });
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
                      <SimpleAddressForm />
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
