import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange: (files: File[]) => void;
}

export function ImageUploader({ maxImages = 3, onImagesChange }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combinedFiles = [...files, ...newFiles].slice(0, maxImages);
      
      setFiles(combinedFiles);
      onImagesChange(combinedFiles);

      // Generate previews
      const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
    // Reset input so same file can be selected again if removed
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Free memory
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {previews.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {previews.map((src, i) => (
            <div key={i} className="relative flex-shrink-0 snap-center">
              <div className="w-24 h-40 rounded-xl overflow-hidden border-2 border-border relative group">
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => removeImage(i)}
                    className="p-2 bg-destructive text-white rounded-full hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length < maxImages && (
        <div 
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:bg-secondary/50 hover:border-primary/50 hover:text-primary transition-all cursor-pointer group"
        >
          <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-medium">Ajouter une capture</p>
            <p className="text-xs opacity-70 mt-1">Image seulement ({files.length}/{maxImages} max)</p>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        accept="image/*" 
        multiple={maxImages > 1}
        className="hidden" 
        ref={inputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
