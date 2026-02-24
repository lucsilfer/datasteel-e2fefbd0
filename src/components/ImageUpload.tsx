import React, { useCallback, useState } from 'react';
import { Upload, FileImage, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploadProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <label
          htmlFor="certificate-upload"
          className={`relative flex flex-col items-center justify-center min-h-[240px] cursor-pointer transition-all duration-300 border-2 border-dashed rounded-lg m-4 ${
            isDragging
              ? 'border-primary bg-primary/5'
              : preview
                ? 'border-transparent'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Analisando certificado...</p>
            </div>
          ) : preview ? (
            <div className="relative w-full">
              <img src={preview} alt="Preview" className="w-full max-h-[300px] object-contain rounded-md" />
              <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/5 transition-colors rounded-md flex items-center justify-center">
                <span className="opacity-0 hover:opacity-100 text-sm font-medium bg-card/90 px-3 py-1.5 rounded-full shadow-sm transition-opacity">
                  Trocar imagem
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground py-8">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Arraste o certificado aqui</p>
                <p className="text-xs mt-1">ou clique para selecionar</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-2">
                <FileImage className="h-3.5 w-3.5" />
                <span>JPG, PNG ou PDF</span>
              </div>
            </div>
          )}
          <input
            id="certificate-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </label>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
