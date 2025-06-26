
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, School, Navigation, Info } from "lucide-react";
import SimpleAddressForm from "@/components/address/SimpleAddressForm";
import SchoolSelect from "@/components/address/SchoolSelect";

interface LocationFormProps {
  enderecoTipo: 'meu' | 'escola' | 'outro';
  escolaSelecionada: any;
  userAddress: any;
  filhos: any[];
  onEnderecoTipoChange: (tipo: 'meu' | 'escola' | 'outro') => void;
  onEscolaSelect: (escola: any) => void;
  onEnderecoPersonalizadoChange: (endereco: any) => void;
  error?: string;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  enderecoTipo,
  escolaSelecionada,
  userAddress,
  filhos,
  onEnderecoTipoChange,
  onEscolaSelect,
  onEnderecoPersonalizadoChange,
  error
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Home className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Local de Retirada</h3>
      </div>

      <RadioGroup
        value={enderecoTipo}
        onValueChange={onEnderecoTipoChange}
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
      {enderecoTipo === 'meu' && (
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

      {enderecoTipo === 'escola' && (
        <div className="mt-4">
          {filhos && filhos.length > 0 ? (
            <SchoolSelect
              value={escolaSelecionada}
              onChange={onEscolaSelect}
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

      {enderecoTipo === 'outro' && (
        <div className="mt-4">
          <SimpleAddressForm />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
