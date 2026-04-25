import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, Image, Link as LinkIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError("");
      if (rejected.length > 0) {
        setError("Invalid file. Please upload JPG, PNG, WEBP or TIFF under 10MB.");
        return;
      }
      if (accepted.length > 0) {
        toast.success("Image uploaded successfully!");
        onFileSelected(accepted[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/tiff": [".tiff", ".tif"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    setError("");
    try {
      const res = await fetch(urlInput);
      const blob = await res.blob();
      const file = new File([blob], "pasted-image.jpg", { type: blob.type });
      toast.success("Image loaded from URL!");
      onFileSelected(file);
    } catch {
      setError("Failed to load image from URL. Please check the link.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        {...(getRootProps() as any)}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragActive
            ? "border-primary bg-primary/10 glow-md"
            : "border-border/50 hover:border-primary/50 hover:bg-primary/5 animate-pulse-glow"
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 rounded-2xl bg-primary/10">
            {isDragActive ? (
              <Image className="h-10 w-10 text-primary" />
            ) : (
              <Upload className="h-10 w-10 text-primary" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {isDragActive ? "Drop your image here" : "Drag & drop an image"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse • JPG, PNG, WEBP, TIFF up to 10MB
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">or paste URL</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder="https://example.com/image.jpg"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUrlSubmit}
          className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Analyze
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-danger text-sm"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
