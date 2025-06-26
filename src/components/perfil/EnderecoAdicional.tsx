
// REMOVIDO: Este componente foi removido na simplificação do sistema de endereços.
// Agora o usuário possui apenas um endereço principal.
// Use o componente SimpleAddressForm em src/components/address/SimpleAddressForm.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const EnderecoAdicional: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereços Adicionais - Removido</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este componente foi removido. O sistema agora utiliza apenas um endereço principal por usuário.
            Use o SimpleAddressForm para gerenciar o endereço.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EnderecoAdicional;
