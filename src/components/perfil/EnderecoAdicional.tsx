
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const EnderecoAdicional: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sistema Simplificado</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            O GiraMãe agora utiliza apenas um endereço principal por usuário.
            Isso torna a experiência mais simples e focada.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EnderecoAdicional;
