import { motion } from "framer-motion";

interface Scores {
  real: number;
  aiGenerated: number;
  manipulated: number;
}

const items = [
  { key: "real" as const, label: "Real", color: "bg-emerald-500", textColor: "text-emerald-400" },
  { key: "aiGenerated" as const, label: "AI Generated", color: "bg-violet-500", textColor: "text-violet-400" },
  { key: "manipulated" as const, label: "Manipulated", color: "bg-amber-500", textColor: "text-amber-400" },
];

export default function ScoreBreakdown({ scores }: { scores: Scores }) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-foreground">Score Breakdown</h3>
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-1.5"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className={`font-mono-score font-medium ${item.textColor}`}>{scores[item.key]}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${item.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${scores[item.key]}%` }}
              transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
