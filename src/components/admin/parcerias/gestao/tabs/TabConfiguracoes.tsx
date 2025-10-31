import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Archive, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Programa } from '@/types/parcerias';

interface TabConfiguracoesProps {
  programa: Programa;
  onUpdate: (config: Partial<Programa>) => void;
}

const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  valor_credito: z.number().min(1, 'Valor deve ser maior que 0'),
  instrucoes_usuario: z.string().optional(),
  dia_creditacao: z.number().min(1).max(28)
});

export default function TabConfiguracoes({ programa, onUpdate }: TabConfiguracoesProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: programa.nome,
      descricao: programa.descricao || '',
      valor_credito: programa.valor_credito || 0,
      instrucoes_usuario: programa.instrucoes_usuario || '',
      dia_creditacao: programa.dia_creditacao || 1
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onUpdate(values);
  };

  const handleDesativar = () => {
    onUpdate({ ativo: false });
    toast({
      title: 'Programa desativado',
      description: 'O programa foi desativado temporariamente.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Configure as informações básicas do programa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Programa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Auxílio Creche" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o programa e seus objetivos..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor_credito"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mensal (Girinhas)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor creditado mensalmente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dia_creditacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Creditação</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          max="28"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Dia do mês (1-28)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="instrucoes_usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções para Usuário</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instruções de como se inscrever no programa..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Ações Perigosas */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam o programa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <Ban className="h-4 w-4 mr-2" />
                  Desativar Programa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desativar Programa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O programa será temporariamente desativado. Nenhum novo beneficiário poderá se inscrever
                    e as distribuições mensais serão pausadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDesativar}>
                    Confirmar Desativação
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 border-destructive text-destructive">
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar Programa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Arquivar Programa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é permanente. O programa será arquivado e não poderá ser reativado.
                    Todos os dados históricos serão mantidos apenas para consulta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive">
                    Confirmar Arquivamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
