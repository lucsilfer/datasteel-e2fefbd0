import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react';

interface ImageUploadProps {
  onFileSelected: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelected, isLoading }) => {
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
  }, []);

  const isPdf = fileType === 'application/pdf';
  const hasFile = preview || (isPdf && fileName);

  return (
    <div className="relative group">
      {/* Glassmorphism glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <label
        htmlFor="certificate-upload"
        className={`relative flex flex-col items-center justify-center min-h-[280px] cursor-pointer transition-all duration-500 rounded-2xl border-2 border-dashed backdrop-blur-sm ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/10'
            : hasFile
              ? 'border-primary/30 bg-card/80'
              : 'border-border hover:border-primary/40 hover:bg-card/50 bg-card/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in fade-in duration-300">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border border-primary/20 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Analisando certificado...</p>
              <p className="text-xs text-muted-foreground mt-1">Extraindo dados com IA</p>
            </div>
          </div>
        ) : hasFile ? (
          <div className="relative w-full p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            {isPdf ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-destructive" />
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
                <img src={preview!} alt="Preview" className="max-h-[220px] object-contain rounded-xl shadow-md" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-safe" />
                  <span className="text-xs text-muted-foreground">{fileName}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-10 animate-in fade-in duration-300">
            <div className={`h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
              <Upload className="h-9 w-9 text-primary" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-base font-semibold text-foreground">Arraste o certificado aqui</p>
              <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                <FileText className="h-3 w-3" /> PDF
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
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
