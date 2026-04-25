import { motion } from "framer-motion";
import { X, Copy, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { AnalysisResult } from "@/store/useAnalysisStore";

interface Props {
  analysis: AnalysisResult;
  onClose: () => void;
}

export default function ShareModal({ analysis, onClose }: Props) {
  const shareUrl = `${window.location.origin}/analyze?shared=${btoa(JSON.stringify({
    v: analysis.verdict,
    c: analysis.confidence,
    n: analysis.imageName,
  }))}`;

  const tweetText = encodeURIComponent(
    `🛡️ DeepGuard AI analyzed "${analysis.imageName}" — Verdict: ${analysis.verdict.replace("_", " ").toUpperCase()} (${analysis.confidence}% confidence). Try it free!`
  );

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-6 rounded-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-heading font-bold text-lg mb-4">Share Results</h2>

        <div className="glass-card p-4 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${analysis.verdict === "real" ? "bg-emerald-500" : analysis.verdict === "ai_generated" ? "bg-violet-500" : "bg-amber-500"}`} />
            <div>
              <p className="text-sm font-medium">{analysis.imageName}</p>
              <p className="text-xs text-muted-foreground">{analysis.verdict.replace("_", " ")} — {analysis.confidence}% confidence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input value={shareUrl} readOnly className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground truncate" />
          <motion.button whileHover={{ scale: 1.05 }} onClick={copyLink} className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30">
            <Copy className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white rounded-xl">
            <QRCodeSVG value={shareUrl} size={120} />
          </div>
        </div>

        <a href={`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
          className="btn-glass w-full flex items-center justify-center gap-2 py-2.5 text-sm">
          <ExternalLink className="h-4 w-4" /> Share on Twitter
        </a>
      </motion.div>
    </motion.div>
  );
}
