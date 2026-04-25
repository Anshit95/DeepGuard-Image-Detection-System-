import { motion } from "framer-motion";
import { Verdict } from "@/store/useAnalysisStore";
import { ShieldCheck, Bot, Scissors, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

const config: Record<Verdict, { label: string; icon: typeof ShieldCheck; gradient: string; bg: string; glow: string }> = {
  real: {
    label: "AUTHENTIC IMAGE",
    icon: ShieldCheck,
    gradient: "from-emerald-400 to-green-600",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  ai_generated: {
    label: "AI GENERATED",
    icon: Bot,
    gradient: "from-violet-400 to-purple-600",
    bg: "bg-violet-500/10 border-violet-500/30",
    glow: "shadow-violet-500/20",
  },
  manipulated: {
    label: "MANIPULATED IMAGE",
    icon: Scissors,
    gradient: "from-amber-400 to-orange-600",
    bg: "bg-amber-500/10 border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
};

export default function VerdictBanner({ verdict, confidence }: { verdict: Verdict; confidence: number }) {
  const c = config[verdict];
  const Icon = c.icon;
  const [displayConf, setDisplayConf] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    const step = (now: number) => {
      const progress = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayConf(Math.round(eased * confidence));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [confidence]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-2xl border p-6 ${c.bg} shadow-lg ${c.glow}`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className={`p-4 rounded-xl bg-gradient-to-br ${c.gradient}`}
        >
          <Icon className="h-8 w-8 text-white" />
        </motion.div>
        <div className="text-center sm:text-left flex-1">
          <h2 className={`text-2xl font-heading font-bold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
            {c.label}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Confidence: <span className="font-mono-score font-semibold text-foreground">{displayConf}%</span>
            {confidence < 70 && " — Result may be inconclusive"}
          </p>
        </div>
        {confidence < 70 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            LOW CONFIDENCE
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
