import { motion } from "framer-motion";
import { ANALYSIS_STEPS } from "@/lib/analyzeImage";
import { Check, Loader2 } from "lucide-react";

interface ScanningOverlayProps {
  imageUrl: string;
  currentStep: string;
  progress: number;
}

export default function ScanningOverlay({ imageUrl, currentStep, progress }: ScanningOverlayProps) {
  const currentIdx = ANALYSIS_STEPS.indexOf(currentStep);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto"
    >
      {/* Image with scanning effects */}
      <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden glass-card">
        <img src={imageUrl} alt="Scanning" className="w-full h-full object-contain" />

        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          style={{ boxShadow: "0 0 20px 4px rgba(6, 182, 212, 0.5)" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Corner brackets */}
        {[
          "top-2 left-2 border-t-2 border-l-2",
          "top-2 right-2 border-t-2 border-r-2",
          "bottom-2 left-2 border-b-2 border-l-2",
          "bottom-2 right-2 border-b-2 border-r-2",
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`absolute w-8 h-8 ${pos} border-cyan-400/70`}
          />
        ))}

        {/* Radar ping */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 rounded-full border border-primary/30"
              animate={{
                scale: [1, 4],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Steps */}
      <div className="w-full max-w-lg glass-card p-6 rounded-2xl space-y-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Analysis Progress</span>
          <span className="font-mono-score text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="space-y-2 mt-4">
          {ANALYSIS_STEPS.map((s, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isPending = i > currentIdx;

            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 text-sm ${
                  isCurrent ? "text-cyan-400 font-medium" : isDone ? "text-emerald-400" : "text-muted-foreground"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {isDone ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                {s}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
