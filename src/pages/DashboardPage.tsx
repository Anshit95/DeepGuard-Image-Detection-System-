import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAnalysisStore, Verdict, AnalysisResult } from "@/store/useAnalysisStore";
import Navbar from "@/components/Navbar";
import LavaBackground from "@/components/LavaBackground";
import UploadZone from "@/components/UploadZone";
import ThreatIntelWidget from "@/components/ThreatIntelWidget";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, Bot, Scissors, BarChart3, TrendingUp, Calendar, X } from "lucide-react";
import { useMemo, useState } from "react";
import { analyzeImage } from "@/lib/analyzeImage";
import { toast } from "sonner";

const verdictConfig: Record<Verdict, { label: string; color: string; icon: typeof Shield }> = {
  real: { label: "Real", color: "#10b981", icon: Shield },
  ai_generated: { label: "AI Generated", color: "#8b5cf6", icon: Bot },
  manipulated: { label: "Manipulated", color: "#f59e0b", icon: Scissors },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { history, setIsAnalyzing, setAnalysisStep, setCurrentAnalysis, addToHistory } = useAnalysisStore();
  const [drawer, setDrawer] = useState<AnalysisResult | null>(null);

  const stats = useMemo(() => {
    const total = history.length;
    const realCount = history.filter((h) => h.verdict === "real").length;
    const aiImages = history.filter((h) => h.verdict === "ai_generated").length;
    const manipulated = history.filter((h) => h.verdict === "manipulated").length;
    const avgConfidence = total ? Math.round(history.reduce((a, b) => a + b.confidence, 0) / total) : 0;
    const thisWeek = history.filter((h) => Date.now() - h.timestamp < 7 * 86400000).length;
    return { total, realCount, aiImages, manipulated, avgConfidence, thisWeek };
  }, [history]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => { counts[h.verdict] = (counts[h.verdict] || 0) + 1; });
    return Object.entries(counts).map(([key, value]) => ({
      name: verdictConfig[key as Verdict]?.label || key, value,
      color: verdictConfig[key as Verdict]?.color || "#888",
    }));
  }, [history]);

  const lineData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      days[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    history.forEach((h) => {
      const key = new Date(h.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([name, count]) => ({ name, count }));
  }, [history]);

  const statCards = [
    { label: "Total Analyzed", value: stats.total, icon: BarChart3, color: "text-primary" },
    { label: "Real Images", value: stats.realCount, icon: Shield, color: "text-emerald-400" },
    { label: "AI Generated", value: stats.aiImages, icon: Bot, color: "text-violet-400" },
    { label: "Manipulated", value: stats.manipulated, icon: Scissors, color: "text-amber-400" },
    { label: "Avg Confidence", value: `${stats.avgConfidence}%`, icon: TrendingUp, color: "text-secondary" },
    { label: "This Week", value: stats.thisWeek, icon: Calendar, color: "text-primary" },
  ];

  const handleQuickScan = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    navigate("/analyze");
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(file, imageUrl, (step) => setAnalysisStep(step));
      setCurrentAnalysis(result);
      addToHistory(result);
    } catch (err: any) {
      toast.error(err?.message || "Analysis failed");
      navigate("/dashboard");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <LavaBackground />
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-heading font-bold">Dashboard</h1>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="text-2xl font-mono-score font-bold">{s.value}</p>
                </motion.div>
              ))}
            </div>

            {history.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No analyses yet. Upload an image to get started.</p>
              </div>
            ) : (
              <>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-heading font-semibold mb-4">Verdict Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie><Tooltip contentStyle={{ backgroundColor: "rgba(20,10,5,0.9)", border: "1px solid rgba(255,120,50,0.15)", borderRadius: "8px", color: "#e2e8f0" }} /></PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 justify-center mt-2">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-muted-foreground">{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-heading font-semibold mb-4">Analyses (Last 14 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,120,50,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(20,15%,55%)", fontSize: 11 }} />
                        <YAxis tick={{ fill: "hsl(20,15%,55%)", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(20,10,5,0.9)", border: "1px solid rgba(255,120,50,0.15)", borderRadius: "8px", color: "#e2e8f0" }} />
                        <Line type="monotone" dataKey="count" stroke="#FF6A00" strokeWidth={2} dot={{ fill: "#FF6A00" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-primary/10">
                    <h3 className="font-heading font-semibold">Recent Analyses</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-primary/10">
                          <th className="text-left p-3 text-muted-foreground font-medium">Image</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Verdict</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Confidence</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.slice(0, 10).map((h) => {
                          const vc = verdictConfig[h.verdict];
                          return (
                            <tr key={h.id} onClick={() => setDrawer(h)} className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer">
                              <td className="p-3"><div className="flex items-center gap-2">
                                <img src={h.imageUrl} alt="" className="w-8 h-8 rounded object-cover bg-muted" />
                                <span className="text-foreground truncate max-w-[120px]">{h.imageName}</span>
                              </div></td>
                              <td className="p-3"><span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: vc.color + "20", color: vc.color }}>{vc.label}</span></td>
                              <td className="p-3"><div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${h.confidence}%` }} /></div>
                                <span className="font-mono-score text-foreground text-xs">{h.confidence}%</span>
                              </div></td>
                              <td className="p-3 text-muted-foreground">{new Date(h.timestamp).toLocaleDateString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Threat Intelligence Widget */}
            <ThreatIntelWidget />
          </div>

          {/* Quick Scan sidebar */}
          <div className="lg:w-72 shrink-0">
            <div className="glass-card p-4 rounded-2xl sticky top-24">
              <h3 className="font-heading font-semibold text-sm mb-3">Quick Scan</h3>
              <UploadZone onFileSelected={handleQuickScan} />
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setDrawer(null)}>
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-md h-full overflow-y-auto" style={{ background: "rgba(20,10,5,0.95)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(255,120,50,0.15)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading font-bold">Full Report</h2>
                <button onClick={() => setDrawer(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <img src={drawer.imageUrl} alt="" className="w-full rounded-xl object-contain max-h-64 bg-muted/10" />
              <div>
                <p className="text-xs text-muted-foreground">{drawer.imageName} • {new Date(drawer.timestamp).toLocaleString()}</p>
                <div className="mt-2">
                  {(() => { const vc = verdictConfig[drawer.verdict]; return (
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: vc.color + "20", color: vc.color }}>{vc.label} — {drawer.confidence}%</span>
                  ); })()}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Detection Signals</h3>
                {[
                  { l: "Facial Landmarks", v: drawer.signals.facialLandmarkConsistency ? "✅ Consistent" : "❌ Anomalous" },
                  { l: "Frequency Artifacts", v: `${drawer.signals.frequencyArtifactScore}/10` },
                  { l: "Noise Pattern", v: drawer.signals.noisePatternResult },
                  { l: "Metadata", v: drawer.signals.metadataIntegrity ? "✅ Verified" : "❌ Tampered" },
                  { l: "Compression", v: `${drawer.signals.compressionArtifacts}/10` },
                  { l: "Skin Texture", v: `${drawer.signals.skinTextureNaturalness}/10` },
                  { l: "Eye Reflections", v: drawer.signals.eyeReflectionConsistency ? "✅ Consistent" : "❌ Inconsistent" },
                  { l: "Background", v: `${drawer.signals.backgroundCoherence}/10` },
                ].map((s) => (
                  <div key={s.l} className="flex justify-between text-xs glass-card p-2 rounded-lg">
                    <span className="text-muted-foreground">{s.l}</span>
                    <span className="font-mono-score">{s.v}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Summary</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{drawer.explanation}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
