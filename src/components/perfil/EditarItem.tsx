
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import { useEditarItemForm } from '@/hooks/useEditarItemForm';
import { Item } from '@/hooks/useItensOptimized';

interface EditarItemProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditarItem: React.FC<EditarItemProps> = ({ item, isOpen, onClose, onSuccess }) => {
  const {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit,
    resetForm
  } = useEditarItemForm(item);

  useEffect(() => {
    if (isOpen && item) {
      resetForm(item);
    }
  }, [isOpen, item, resetForm]);

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Editar Item
          </DialogTitle>
        </div>
        
        <div className="p-6">
          <form onSubmit={onSubmitForm} className="space-y-6">
            <SimpleItemForm
              formData={formData}
              onFieldChange={handleFieldChange}
              errors={errors}
            />

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-12 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg rounded-lg transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarItem;
