
import React from 'react';
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ui/image-upload";

interface ImageUploadFormProps {
  imagens: File[];
  onImageUpload: (files: File[]) => void;
  error?: string;
}

export const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  imagens,
  onImageUpload,
  error
}) => {
  return (
    <div>
      <Label>Imagens</Label>
      <ImageUpload value={imagens} onChange={onImageUpload} />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
