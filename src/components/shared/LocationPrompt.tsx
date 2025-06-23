
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Settings } from 'lucide-react';

interface LocationPromptProps {
  onConfigureClick: () => void;
  onDismiss?: () => void;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({ 
  onConfigureClick, 
  onDismiss 
}) => {
  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 p-6 m-4 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-pink-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            🏠 Onde você mora?
          </h3>
          <p className="text-gray-600 text-sm max-w-sm">
            Configure sua cidade no perfil para ver roupinhas e brinquedos 
            pertinho de você! Assim fica mais fácil combinar as trocas.
          </p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <Button 
            onClick={onConfigureClick}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar agora
          </Button>
          
          {onDismiss && (
            <Button variant="ghost" onClick={onDismiss} className="text-gray-500">
              Ver todos os itens
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
