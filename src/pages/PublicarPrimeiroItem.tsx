
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import { MissionItemForm } from '@/components/forms/MissionItemForm';

const PublicarPrimeiroItem = () => {
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState(1);
  
  const {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit
  } = usePublicarItemFormV2({
    status: 'inativo',
    onSuccess: () => {
      if (currentItem === 1) {
        setCurrentItem(2);
        // Reset form for second item
        updateFormData({
          titulo: '',
          descricao: '',
          categoria_id: '',
          subcategoria: '',
          genero: 'unissex',
          tamanho_categoria: '',
          tamanho_valor: '',
          estado_conservacao: 'usado',
          preco: '',
          imagens: []
        });
      } else {
        // Redirect to missions page after completing both items
        navigate('/missoes');
      }
    }
  });

  const handleNext = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    await handleSubmit(e || new Event('submit') as any);
  };

  const handlePostpone = () => {
    navigate('/feed');
  };

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  return (
    <MissionItemForm
      currentItem={currentItem}
      formData={formData}
      onFieldChange={handleFieldChange}
      errors={errors}
      onNext={handleNext}
      onPostpone={handlePostpone}
      loading={loading}
    />
  );
};

export default PublicarPrimeiroItem;
