import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Waves, Grid3X3, ZoomIn, ZoomOut } from "lucide-react";

type ViewMode = "original" | "heatmap" | "noise" | "frequency";

export default function HeatmapOverlay({ imageUrl }: { imageUrl: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("original");
  const [zoom, setZoom] = useState(1);

  const modes: { id: ViewMode; label: string; icon: typeof Eye }[] = [
    { id: "original", label: "Original", icon: Eye },
    { id: "heatmap", label: "Heatmap", icon: Eye },
    { id: "noise", label: "Noise Map", icon: Waves },
    { id: "frequency", label: "Frequency", icon: Grid3X3 },
  ];

  const getFilterStyle = (): React.CSSProperties => {
    switch (viewMode) {
      case "noise":
        return { filter: "grayscale(1) contrast(2) brightness(0.8)" };
      case "frequency":
        return { filter: "hue-rotate(180deg) saturate(2) contrast(1.5)" };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-heading font-semibold text-foreground">Image Forensics</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setViewMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === m.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <m.icon className="h-3 w-3" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative rounded-xl overflow-hidden glass-card">
        <div className="overflow-hidden" style={{ maxHeight: "400px" }}>
          <img
            src={imageUrl}
            alt="Analyzed"
            className="w-full object-contain transition-transform duration-300"
            style={{ ...getFilterStyle(), transform: `scale(${zoom})`, transformOrigin: "center" }}
          />
        </div>
        {viewMode === "heatmap" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 45% 40%, rgba(239,68,68,0.6) 0%, rgba(249,115,22,0.3) 25%, transparent 50%), radial-gradient(circle at 55% 45%, rgba(239,68,68,0.4) 0%, transparent 35%), radial-gradient(circle at 30% 70%, rgba(249,115,22,0.3) 0%, transparent 30%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
