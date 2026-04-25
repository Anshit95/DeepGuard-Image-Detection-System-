import { motion } from "framer-motion";
import { AlertTriangle, Globe, TrendingUp, Shield } from "lucide-react";

const threats = [
  { id: 1, name: "FaceSwap Pro v4.2 Campaign", severity: "critical", region: "Global", type: "Deepfake Video", detected: "2h ago", count: 1247 },
  { id: 2, name: "StyleGAN3 Portrait Farm", severity: "high", region: "North America", type: "AI Generated", detected: "6h ago", count: 892 },
  { id: 3, name: "Audio Clone Phishing Wave", severity: "critical", region: "Europe", type: "Voice Clone", detected: "12h ago", count: 2103 },
  { id: 4, name: "EXIF Manipulation Toolkit", severity: "medium", region: "Asia Pacific", type: "Metadata Tampering", detected: "1d ago", count: 456 },
  { id: 5, name: "GAN Watermark Evasion", severity: "high", region: "Global", type: "AI Generated", detected: "1d ago", count: 678 },
];

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function ThreatIntelWidget() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h3 className="font-heading font-semibold text-sm">Live Threat Intelligence</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Threat Map Miniature */}
      <div className="p-4 border-b border-primary/10">
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-3 rounded-xl text-center">
            <Globe className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-mono-score font-bold text-foreground">5,376</p>
            <p className="text-[10px] text-muted-foreground">Active Threats</p>
          </div>
          <div className="glass-card p-3 rounded-xl text-center">
            <TrendingUp className="h-4 w-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-mono-score font-bold text-foreground">+12%</p>
            <p className="text-[10px] text-muted-foreground">vs Last Week</p>
          </div>
          <div className="glass-card p-3 rounded-xl text-center">
            <Shield className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-mono-score font-bold text-foreground">99.2%</p>
            <p className="text-[10px] text-muted-foreground">Detection Rate</p>
          </div>
        </div>
      </div>

      {/* Threat Feed */}
      <div className="divide-y divide-primary/5">
        {threats.map((threat, i) => (
          <motion.div
            key={threat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{threat.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase border ${severityColors[threat.severity]}`}>
                    {threat.severity}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{threat.type}</span>
                  <span className="text-[10px] text-muted-foreground">• {threat.region}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">{threat.detected}</p>
                <p className="text-[10px] font-mono-score text-foreground">{threat.count.toLocaleString()} hits</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
