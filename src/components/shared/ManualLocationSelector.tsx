
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Navigation } from 'lucide-react';
import LocationFilter from './LocationFilter';

interface ManualLocationSelectorProps {
  currentLocation?: { estado: string; cidade: string } | null;
  onLocationChange: (location: { estado: string; cidade: string } | null) => void;
  disabled?: boolean;
}

const ManualLocationSelector: React.FC<ManualLocationSelectorProps> = ({
  currentLocation,
  onLocationChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ estado: string; cidade: string } | null>(currentLocation || null);

  const handleConfirm = () => {
    onLocationChange(tempLocation);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempLocation(currentLocation || null);
    setIsOpen(false);
  };

  const handleClearLocation = () => {
    setTempLocation(null);
    onLocationChange(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {currentLocation?.cidade ? 
            `${currentLocation.cidade}, ${currentLocation.estado}` : 
            'Selecionar Local'
          }
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Selecionar Localização
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Escolha uma cidade para ver os itens disponíveis nesta localização:
          </p>
          
          <LocationFilter
            value={tempLocation}
            onChange={setTempLocation}
          />
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={!tempLocation?.estado || !tempLocation?.cidade}
              className="flex-1"
            >
              Confirmar
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            
            {currentLocation && (
              <Button
                variant="ghost"
                onClick={handleClearLocation}
                size="sm"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualLocationSelector;
