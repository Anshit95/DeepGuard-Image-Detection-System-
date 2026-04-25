import { motion } from "framer-motion";

interface AnalysisProgressProps {
  step: string;
  progress: number;
}

const steps = [
  "Extracting facial landmarks...",
  "Running frequency domain analysis...",
  "Analyzing noise patterns...",
  "Consulting ensemble models...",
  "Generating confidence scores...",
];

export default function AnalysisProgress({ step, progress }: AnalysisProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Analyzing...</span>
          <span className="text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((s, i) => {
          const currentIdx = steps.indexOf(step);
          const isDone = i < currentIdx;
          const isCurrent = s === step;

          return (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= currentIdx ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 text-sm ${
                isCurrent ? "text-primary font-medium" : isDone ? "text-success" : "text-muted-foreground"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isCurrent ? "bg-primary animate-pulse" : isDone ? "bg-success" : "bg-muted-foreground/30"
                }`}
              />
              {s}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
