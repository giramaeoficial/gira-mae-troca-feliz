
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, School, Home, Heart } from 'lucide-react';
import { useProximityFilters } from '@/hooks/useProximityFilters';

const LocationFilter: React.FC = () => {
  const { filters, updateFilters } = useProximityFilters();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="w-4 h-4" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtro de proximidade */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="proximos-switch" className="text-sm">
              Apenas itens próximos a mim
            </Label>
            <Switch
              id="proximos-switch"
              checked={filters.apenasProximos}
              onCheckedChange={(checked) => updateFilters({ apenasProximos: checked })}
            />
          </div>
          
          {filters.apenasProximos && (
            <div className="ml-4 space-y-2">
              <Label className="text-xs text-muted-foreground">
                Raio: {filters.raioKm}km
              </Label>
              <Slider
                value={[filters.raioKm]}
                onValueChange={(value) => updateFilters({ raioKm: value[0] })}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Filtros por relacionamento */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mesma-escola"
              checked={filters.mesmaEscola}
              onCheckedChange={(checked) => updateFilters({ mesmaEscola: !!checked })}
            />
            <Label htmlFor="mesma-escola" className="text-sm flex items-center gap-1">
              <School className="w-3 h-3" />
              Mesma escola dos meus filhos
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mesmo-bairro"
              checked={filters.mesmoBairro}
              onCheckedChange={(checked) => updateFilters({ mesmoBairro: !!checked })}
            />
            <Label htmlFor="mesmo-bairro" className="text-sm flex items-center gap-1">
              <Home className="w-3 h-3" />
              Mães do meu bairro
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="para-filhos"
              checked={filters.paraMeusFilhos}
              onCheckedChange={(checked) => updateFilters({ paraMeusFilhos: !!checked })}
            />
            <Label htmlFor="para-filhos" className="text-sm flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Itens que servem para meus filhos
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationFilter;
