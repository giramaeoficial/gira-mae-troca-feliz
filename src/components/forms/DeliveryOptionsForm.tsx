
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryOptionsFormProps {
  aceitaEntrega: boolean;
  raioEntregaKm: number;
  instrucoesRetirada: string;
  onAceitaEntregaChange: (checked: boolean) => void;
  onRaioChange: (value: number[]) => void;
  onInstrucoesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  raioError?: string;
}

export const DeliveryOptionsForm: React.FC<DeliveryOptionsFormProps> = ({
  aceitaEntrega,
  raioEntregaKm,
  instrucoesRetirada,
  onAceitaEntregaChange,
  onRaioChange,
  onInstrucoesChange,
  raioError
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="aceita_entrega" className="text-base font-medium">
          Aceito entregar este item
        </Label>
        <Switch
          id="aceita_entrega"
          checked={aceitaEntrega}
          onCheckedChange={onAceitaEntregaChange}
        />
      </div>

      {aceitaEntrega && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20">
          <div>
            <Label className="text-sm font-medium">
              Raio de entrega: {raioEntregaKm} km
            </Label>
            <div className="mt-2">
              <Slider
                value={[raioEntregaKm]}
                onValueChange={onRaioChange}
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
          {raioError && <p className="text-red-500 text-sm">{raioError}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="instrucoes_retirada">Instruções de Retirada (opcional)</Label>
        <Textarea
          id="instrucoes_retirada"
          name="instrucoes_retirada"
          value={instrucoesRetirada}
          onChange={onInstrucoesChange}
          placeholder="Ex: Tocar o interfone do apto 101, disponível após 18h..."
          rows={3}
          className="mt-2"
        />
      </div>
    </div>
  );
};
