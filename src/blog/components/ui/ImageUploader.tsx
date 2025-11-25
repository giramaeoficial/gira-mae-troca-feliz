import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadImage, compressImage, validateImage } from '@/utils/imageUpload';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageInsert: (url: string, alt: string) => void;
  onClose: () => void;
}

export default function ImageUploader({ onImageInsert, onClose }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validar arquivo
    const validation = validateImage(file);
    if (!validation.valid) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: validation.error,
      });
      return;
    }

    try {
      setUploading(true);

      // Comprimir imagem
      const compressedFile = await compressImage(file);

      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(compressedFile);

      // Upload para Supabase
      const url = await uploadImage(compressedFile);

      if (url) {
        toast({
          title: 'Sucesso!',
          description: 'Imagem enviada com sucesso.',
        });
        // Auto-preencher com nome do arquivo se alt estiver vazio
        if (!altText) {
          setAltText(file.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        throw new Error('Erro ao fazer upload');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível fazer upload da imagem.',
      });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInsertFromUpload = () => {
    if (!preview) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhuma imagem selecionada',
      });
      return;
    }
    
    if (!altText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Alt text obrigatório',
        description: 'Descrição da imagem é obrigatória para SEO e acessibilidade',
      });
      return;
    }
    
    // Validar alt text descritivo (não genérico)
    const genericTerms = ['imagem', 'foto', 'image', 'picture', 'img', 'figura'];
    const isGeneric = genericTerms.some(term => 
      altText.toLowerCase().trim() === term
    );
    
    if (isGeneric) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito genérica',
        description: 'Use uma descrição específica (ex: "Mãe organizando roupas infantis")',
      });
      return;
    }
    
    // Validar comprimento mínimo
    if (altText.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito curta',
        description: 'Use pelo menos 10 caracteres para descrever a imagem',
      });
      return;
    }
    
    onImageInsert(preview, altText);
    onClose();
  };

  const handleInsertFromUrl = () => {
    if (!urlInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'URL da imagem não pode estar vazia',
      });
      return;
    }
    
    if (!altText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Alt text obrigatório',
        description: 'Descrição da imagem é obrigatória para SEO e acessibilidade',
      });
      return;
    }
    
    // Validar alt text descritivo (não genérico)
    const genericTerms = ['imagem', 'foto', 'image', 'picture', 'img', 'figura'];
    const isGeneric = genericTerms.some(term => 
      altText.toLowerCase().trim() === term
    );
    
    if (isGeneric) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito genérica',
        description: 'Use uma descrição específica (ex: "Mãe organizando roupas infantis")',
      });
      return;
    }
    
    // Validar comprimento mínimo
    if (altText.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito curta',
        description: 'Use pelo menos 10 caracteres para descrever a imagem',
      });
      return;
    }
    
    onImageInsert(urlInput, altText);
    onClose();
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Enviando...</p>
              </div>
            ) : preview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF ou WebP (máx. 5MB)
                </p>
              </div>
            )}
          </div>

          {preview && (
            <>
              <div>
                <Label htmlFor="alt-upload">
                  Texto alternativo (alt) *
                </Label>
                <Input
                  id="alt-upload"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descrição detalhada da imagem (min. 10 caracteres)"
                  minLength={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Descreva o conteúdo da imagem para acessibilidade e SEO.
                  Evite termos genéricos como "imagem" ou "foto".
                </p>
              </div>
              <Button
                onClick={handleInsertFromUpload}
                disabled={!altText || altText.length < 10}
                className="w-full"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Inserir Imagem
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div>
            <Label htmlFor="image-url">URL da Imagem</Label>
            <Input
              id="image-url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          {urlInput && (
            <div className="border rounded-lg p-4">
              <img
                src={urlInput}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div>
            <Label htmlFor="alt-url">Texto alternativo (alt) *</Label>
            <Input
              id="alt-url"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descrição detalhada da imagem (min. 10 caracteres)"
              minLength={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Descreva o conteúdo da imagem para acessibilidade e SEO.
              Evite termos genéricos como "imagem" ou "foto".
            </p>
          </div>

          <Button
            onClick={handleInsertFromUrl}
            disabled={!urlInput || !altText || altText.length < 10}
            className="w-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Inserir Imagem
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
