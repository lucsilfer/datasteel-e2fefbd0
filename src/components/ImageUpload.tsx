import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react';

interface ImageUploadProps {
  onFileSelected: (base64: string, mimeType: string) => void;
  onFileCleared?: () => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelected, onFileCleared, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) return;

    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(isImage ? base64 : null);
      onFileSelected(base64, file.type);
    };
    reader.readAsDataURL(file);
  }, [onFileSelected]);

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

  const clearFile = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setFileName(null);
    setFileType(null);
    onFileCleared?.();
  }, [onFileCleared]);

  const isPdf = fileType === 'application/pdf';
  const hasFile = preview || (isPdf && fileName);

  return (
    <div className="corporate-card">
      <label
        htmlFor="certificate-upload"
        className={`relative flex flex-col items-center justify-center min-h-[240px] cursor-pointer transition-all duration-300 rounded-lg border-2 border-dashed m-1 ${
          isDragging
            ? 'border-primary bg-primary/5'
            : hasFile
              ? 'border-border bg-card'
              : 'border-border hover:border-primary/50 bg-card'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Analisando certificado...</p>
              <p className="text-xs text-muted-foreground mt-1">Extraindo dados com IA</p>
            </div>
          </div>
        ) : hasFile ? (
          <div className="relative w-full p-6">
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            {isPdf ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{fileName}</p>
                  <div className="flex items-center gap-1.5 justify-center mt-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-safe" />
                    <span className="text-xs text-muted-foreground">PDF carregado</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <img src={preview!} alt="Preview" className="max-h-[200px] object-contain rounded-lg border border-border" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-safe" />
                  <span className="text-xs text-muted-foreground">{fileName}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className={`h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Arraste o certificado aqui</p>
              <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted text-muted-foreground border border-border">
                <FileText className="h-3 w-3" /> PDF
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted text-muted-foreground border border-border">
                JPG / PNG
              </span>
            </div>
          </div>
        )}
        <input
          id="certificate-upload"
          type="file"
          accept="image/*,.pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};

export default ImageUpload;
