import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function NovaParceria() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);

  const etapas = [
    'Dados da Organização',
    'Dados do Programa',
    'Configurações'
  ];

  const progresso = (etapa / etapas.length) * 100;

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

        {/* Conteúdo da Etapa */}
        <Card>
          <CardHeader>
            <CardTitle>{etapas[etapa - 1]}</CardTitle>
            <CardDescription>
              Etapa {etapa} de {etapas.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                O wizard de criação de parcerias está em construção. 
                Em breve você poderá criar novas organizações e programas de forma guiada.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setEtapa(Math.max(1, etapa - 1))}
            disabled={etapa === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={() => {
              if (etapa < etapas.length) {
                setEtapa(etapa + 1);
              } else {
                navigate('/admin/parcerias');
              }
            }}
          >
            {etapa === etapas.length ? 'Finalizar' : 'Próximo'}
            {etapa < etapas.length && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
