import { motion } from "framer-motion";
import { DetectionSignals } from "@/store/useAnalysisStore";
import { Check, X, AlertTriangle, Scan, Waves, Fingerprint, FileCheck, Layers, User, Eye as EyeIcon, Mountain } from "lucide-react";
import { useEffect, useState } from "react";

function AnimatedScore({ value, max = 10 }: { value: number; max?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 1000, 1);
      setDisplay(Number((p * value).toFixed(1)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span className="font-mono-score">{display}/{max}</span>;
}

export default function DetectionSignalsGrid({ signals }: { signals: DetectionSignals }) {
  const items = [
    {
      label: "Facial Landmarks",
      icon: Scan,
      value: signals.facialLandmarkConsistency,
      type: "bool" as const,
      good: true,
    },
    {
      label: "Frequency Artifacts",
      icon: Waves,
      value: signals.frequencyArtifactScore,
      type: "score" as const,
      good: signals.frequencyArtifactScore <= 4,
      invertScore: true,
    },
    {
      label: "Noise Patterns",
      icon: Fingerprint,
      value: signals.noisePatternResult,
      type: "text" as const,
      good: signals.noisePatternResult === "Consistent",
    },
    {
      label: "Metadata Integrity",
      icon: FileCheck,
      value: signals.metadataIntegrity,
      type: "bool" as const,
      good: signals.metadataIntegrity,
    },
    {
      label: "Compression",
      icon: Layers,
      value: signals.compressionArtifacts,
      type: "score" as const,
      good: signals.compressionArtifacts <= 4,
      invertScore: true,
    },
    {
      label: "Skin Texture",
      icon: User,
      value: signals.skinTextureNaturalness,
      type: "score" as const,
      good: signals.skinTextureNaturalness >= 6,
    },
    {
      label: "Eye Reflections",
      icon: EyeIcon,
      value: signals.eyeReflectionConsistency,
      type: "bool" as const,
      good: signals.eyeReflectionConsistency,
    },
    {
      label: "Background",
      icon: Mountain,
      value: signals.backgroundCoherence,
      type: "score" as const,
      good: signals.backgroundCoherence >= 6,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-foreground">Detection Signals</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          const borderColor = item.good
            ? "border-emerald-500/20 hover:border-emerald-500/40"
            : "border-red-500/20 hover:border-red-500/40";

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 text-center space-y-2 border transition-all duration-300 ${borderColor} ${
                !item.good ? "animate-pulse-glow" : ""
              }`}
              style={!item.good ? { "--tw-shadow-color": "rgba(239,68,68,0.1)" } as React.CSSProperties : {}}
            >
              <div className="flex justify-center">
                <Icon className={`h-4 w-4 ${item.good ? "text-emerald-400" : "text-red-400"}`} />
              </div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              {item.type === "bool" ? (
                <div className="flex justify-center">
                  {item.value ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                      <Check className="h-4 w-4" /> OK
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400 text-sm font-medium">
                      <X className="h-4 w-4" /> Fail
                    </div>
                  )}
                </div>
              ) : item.type === "score" ? (
                <p className={`text-lg font-semibold ${item.good ? "text-emerald-400" : "text-red-400"}`}>
                  <AnimatedScore value={item.value as number} />
                </p>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  {item.good ? (
                    <span className="text-sm font-medium text-emerald-400">{String(item.value)}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> {String(item.value)}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
