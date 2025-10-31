import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Schemas de validação
const etapa1Schema = z.object({
  org_nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  org_tipo: z.string().min(1, 'Tipo é obrigatório').max(50),
  org_cnpj: z.string().optional(),
  org_responsavel: z.string().min(3, 'Nome do responsável é obrigatório').max(100),
  org_email: z.string().email('Email inválido').max(255),
  org_telefone: z.string().min(10, 'Telefone inválido').max(20),
  org_endereco: z.string().min(5, 'Endereço é obrigatório').max(200),
  org_cidade: z.string().min(2, 'Cidade é obrigatória').max(100),
  org_estado: z.string().length(2, 'Estado deve ter 2 caracteres')
});

const etapa2Schema = z.object({
  prog_nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  prog_descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500),
  prog_objetivo: z.string().min(10, 'Objetivo deve ter pelo menos 10 caracteres').max(500),
  prog_publico_alvo: z.string().min(5, 'Público-alvo é obrigatório').max(200)
});

const etapa3Schema = z.object({
  valor_credito: z.number().min(1, 'Valor deve ser maior que 0').max(10000),
  dia_creditacao: z.number().min(1, 'Dia deve estar entre 1 e 28').max(28),
  criterios_elegibilidade: z.string().min(10, 'Critérios são obrigatórios').max(500),
  documentos_necessarios: z.string().min(5, 'Documentos são obrigatórios').max(300),
  instrucoes_usuario: z.string().optional()
});

type Etapa1Form = z.infer<typeof etapa1Schema>;
type Etapa2Form = z.infer<typeof etapa2Schema>;
type Etapa3Form = z.infer<typeof etapa3Schema>;

export default function NovaParceria() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [etapa, setEtapa] = useState(1);
  const [dadosEtapa1, setDadosEtapa1] = useState<Etapa1Form | null>(null);
  const [dadosEtapa2, setDadosEtapa2] = useState<Etapa2Form | null>(null);

  const form1 = useForm<Etapa1Form>({
    resolver: zodResolver(etapa1Schema),
    defaultValues: {
      org_nome: '',
      org_tipo: 'ONG',
      org_cnpj: '',
      org_responsavel: '',
      org_email: '',
      org_telefone: '',
      org_endereco: '',
      org_cidade: '',
      org_estado: ''
    }
  });

  const form2 = useForm<Etapa2Form>({
    resolver: zodResolver(etapa2Schema),
    defaultValues: {
      prog_nome: '',
      prog_descricao: '',
      prog_objetivo: '',
      prog_publico_alvo: ''
    }
  });

  const form3 = useForm<Etapa3Form>({
    resolver: zodResolver(etapa3Schema),
    defaultValues: {
      valor_credito: 100,
      dia_creditacao: 1,
      criterios_elegibilidade: '',
      documentos_necessarios: '',
      instrucoes_usuario: ''
    }
  });

  const criarParceriaMutation = useMutation({
    mutationFn: async (dados: { etapa1: Etapa1Form; etapa2: Etapa2Form; etapa3: Etapa3Form }) => {
      // Gerar códigos únicos
      const orgCodigo = `ORG_${Date.now()}`;
      const progCodigo = `PROG_${Date.now()}`;

      // 1. Criar Organização
      const { data: org, error: orgError } = await supabase
        .from('parcerias_organizacoes')
        .insert({
          codigo: orgCodigo,
          nome: dados.etapa1.org_nome,
          tipo: dados.etapa1.org_tipo,
          cnpj: dados.etapa1.org_cnpj || null,
          contato_responsavel: dados.etapa1.org_responsavel,
          contato_email: dados.etapa1.org_email,
          contato_telefone: dados.etapa1.org_telefone,
          endereco: dados.etapa1.org_endereco,
          cidade: dados.etapa1.org_cidade,
          estado: dados.etapa1.org_estado,
          ativo: true
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Criar Programa
      const documentosArray = dados.etapa3.documentos_necessarios.split(',').map(d => d.trim()).filter(d => d);
      
      const { data: programa, error: progError } = await supabase
        .from('parcerias_programas')
        .insert({
          organizacao_id: org.id,
          codigo: progCodigo,
          nome: dados.etapa2.prog_nome,
          descricao: dados.etapa2.prog_descricao,
          valor_credito: dados.etapa3.valor_credito,
          criterios_elegibilidade: JSON.stringify({
            objetivo: dados.etapa2.prog_objetivo,
            publico_alvo: dados.etapa2.prog_publico_alvo,
            criterios: dados.etapa3.criterios_elegibilidade
          }),
          campos_obrigatorios: ['nome', 'email', 'telefone'],
          documentos_aceitos: documentosArray,
          instrucoes_usuario: dados.etapa3.instrucoes_usuario || '',
          dia_creditacao: dados.etapa3.dia_creditacao,
          ativo: true
        })
        .select()
        .single();

      if (progError) throw progError;

      return programa;
    },
    onSuccess: (programa) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-parcerias'] });
      toast({
        title: 'Parceria criada!',
        description: 'A organização e o programa foram criados com sucesso.'
      });
      navigate(`/admin/parcerias/${programa.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar parceria',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const etapas = [
    'Dados da Organização',
    'Dados do Programa',
    'Configurações'
  ];

  const progresso = (etapa / etapas.length) * 100;

  const handleEtapa1 = (data: Etapa1Form) => {
    setDadosEtapa1(data);
    setEtapa(2);
  };

  const handleEtapa2 = (data: Etapa2Form) => {
    setDadosEtapa2(data);
    setEtapa(3);
  };

  const handleEtapa3 = (data: Etapa3Form) => {
    if (!dadosEtapa1 || !dadosEtapa2) return;
    
    criarParceriaMutation.mutate({
      etapa1: dadosEtapa1,
      etapa2: dadosEtapa2,
      etapa3: data
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/parcerias')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Nova Parceria</h1>
            <p className="text-muted-foreground">
              Configure uma nova organização e programa social
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                {etapas.map((nome, idx) => (
                  <span
                    key={idx}
                    className={idx + 1 <= etapa ? 'text-primary font-medium' : 'text-muted-foreground'}
                  >
                    {idx + 1}. {nome}
                  </span>
                ))}
              </div>
              <Progress value={progresso} />
            </div>
          </CardContent>
        </Card>

        {/* Etapa 1: Organização */}
        {etapa === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados da Organização</CardTitle>
              <CardDescription>Informações sobre a organização parceira</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form1}>
                <form onSubmit={form1.handleSubmit(handleEtapa1)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form1.control}
                      name="org_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Organização*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Instituto XYZ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="org_tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: ONG, Associação" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form1.control}
                    name="org_cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form1.control}
                    name="org_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form1.control}
                      name="org_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@organizacao.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="org_telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone*</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form1.control}
                    name="org_endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço*</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form1.control}
                      name="org_cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade*</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="org_estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado*</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Programa */}
        {etapa === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Programa</CardTitle>
              <CardDescription>Informações sobre o programa social</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form2}>
                <form onSubmit={form2.handleSubmit(handleEtapa2)} className="space-y-4">
                  <FormField
                    control={form2.control}
                    name="prog_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Programa*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Apoio Materno" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form2.control}
                    name="prog_descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o programa social..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Mínimo 10 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form2.control}
                    name="prog_objetivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Qual o objetivo do programa?"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form2.control}
                    name="prog_publico_alvo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Público-Alvo*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Mães em situação de vulnerabilidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setEtapa(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button type="submit">
                      Próximo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Configurações */}
        {etapa === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Defina os parâmetros do programa</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form3}>
                <form onSubmit={form3.handleSubmit(handleEtapa3)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form3.control}
                      name="valor_credito"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do Crédito Mensal*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Em Girinhas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form3.control}
                      name="dia_creditacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia da Creditação*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              max={28}
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>De 1 a 28</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form3.control}
                    name="criterios_elegibilidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Critérios de Elegibilidade*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Quais os critérios para participar do programa?"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form3.control}
                    name="documentos_necessarios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documentos Necessários*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="RG, CPF, Comprovante de residência (separados por vírgula)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Separe os documentos por vírgula</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form3.control}
                    name="instrucoes_usuario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instruções para o Usuário (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instruções adicionais para os beneficiários..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setEtapa(2)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button type="submit" disabled={criarParceriaMutation.isPending}>
                      {criarParceriaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Criar Parceria
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
