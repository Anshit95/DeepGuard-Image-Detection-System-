import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Search, FileCheck, Shield, BarChart3, Settings } from "lucide-react";

interface WatchDemoModalProps {
  open: boolean;
  onClose: () => void;
}

const demoSteps = [
  { icon: Shield, title: "Create Your Account", description: "Sign up with your email. You'll receive a verification link — click it to verify, then sign in and set up mandatory MFA with an authenticator app." },
  { icon: Upload, title: "Upload an Image", description: "On the home page or Analyze page, drag & drop any image (JPEG, PNG, WebP) or click to browse. Max file size is 10MB." },
  { icon: Search, title: "AI Analysis Begins", description: "Our ensemble neural network runs 6 forensic checks: facial landmarks, frequency analysis, noise patterns, metadata, compression artifacts, and skin texture." },
  { icon: FileCheck, title: "View Your Results", description: "Get a detailed verdict (Real, AI Generated, or Manipulated) with confidence score, heatmap overlay, and breakdown of all detection signals." },
  { icon: BarChart3, title: "Track on Dashboard", description: "Visit the Dashboard to see all your analyses, charts of verdict distribution, trend lines, and the Threat Intelligence feed." },
  { icon: Settings, title: "Manage Security", description: "Go to Settings to view active sessions, login history, and profile details. Visit the Cyber Hub for all security features in one place." },
];

export default function WatchDemoModal({ open, onClose }: WatchDemoModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
          style={{
            background: "rgba(15, 8, 4, 0.95)",
            border: "1px solid rgba(255, 120, 50, 0.2)",
            backdropFilter: "blur(20px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-primary/10 shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">How to Use DeepGuard AI</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            {demoSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 glass-card p-4 rounded-xl group hover:border-primary/30 transition-colors"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-lava-red text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t border-primary/10 shrink-0">
            <p className="text-[10px] text-muted-foreground text-center">
              Need more help? Visit the About page or ask our AI Assistant for guidance.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
