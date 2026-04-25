import { useState } from "react";
import { motion } from "framer-motion";
import { useAnalysisStore, Verdict, AnalysisResult } from "@/store/useAnalysisStore";
import Navbar from "@/components/Navbar";
import LavaBackground from "@/components/LavaBackground";
import { Trash2, Search, Download, FileX, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const verdictLabels: Record<Verdict, { label: string; color: string }> = {
  real: { label: "Real", color: "#10b981" },
  ai_generated: { label: "AI Generated", color: "#8b5cf6" },
  manipulated: { label: "Manipulated", color: "#f59e0b" },
};

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const { history, removeFromHistory } = useAnalysisStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<AnalysisResult | null>(null);

  const filtered = history.filter((h) => {
    const matchSearch = h.imageName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || h.verdict === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const deleteSelected = () => {
    selected.forEach((id) => removeFromHistory(id));
    toast.success(`Deleted ${selected.size} items`);
    setSelected(new Set());
  };

  const exportCSV = () => {
    const rows = [["Name", "Verdict", "Confidence", "Date"]];
    (selected.size > 0 ? filtered.filter((h) => selected.has(h.id)) : filtered).forEach((h) => {
      rows.push([h.imageName, h.verdict, `${h.confidence}%`, new Date(h.timestamp).toISOString()]);
    });
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "deepguard-history.csv";
    a.click();
    toast.success("Exported to CSV");
  };

  return (
    <div className="min-h-screen relative">
      <LavaBackground />
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4 space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Analysis History</h1>
            <p className="text-sm text-muted-foreground mt-1">Showing {filtered.length} of {history.length} analyses</p>
          </div>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <button onClick={deleteSelected} className="btn-glass flex items-center gap-1.5 !px-3 !py-2 text-red-400 text-sm">
                <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.size})
              </button>
            )}
            <button onClick={exportCSV} className="btn-glass flex items-center gap-1.5 !px-3 !py-2 text-sm">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search by filename..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-sm" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "real", "ai_generated", "manipulated"] as const).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(0); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/20 text-muted-foreground hover:text-foreground border border-border/50"
                }`}>
                {f === "all" ? "All" : verdictLabels[f as Verdict]?.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
            <FileX className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{history.length === 0 ? "No analyses yet. Start scanning images!" : "No results match your filters."}</p>
          </motion.div>
        ) : (
          <>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/10">
                      <th className="p-3 w-10">
                        <input type="checkbox" checked={selected.size === paged.length && paged.length > 0}
                          onChange={() => setSelected(selected.size === paged.length ? new Set() : new Set(paged.map((h) => h.id)))}
                          className="rounded accent-primary" />
                      </th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Image</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Verdict</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Confidence</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((h) => {
                      const vc = verdictLabels[h.verdict];
                      return (
                        <tr key={h.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => setDrawer(h)}>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selected.has(h.id)} onChange={() => toggleSelect(h.id)} className="rounded accent-primary" />
                          </td>
                          <td className="p-3"><div className="flex items-center gap-2">
                            <img src={h.imageUrl} alt="" className="w-8 h-8 rounded object-cover bg-muted" />
                            <span className="text-foreground truncate max-w-[140px]">{h.imageName}</span>
                          </div></td>
                          <td className="p-3"><span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: vc.color + "20", color: vc.color }}>{vc.label}</span></td>
                          <td className="p-3 font-mono-score text-foreground">{h.confidence}%</td>
                          <td className="p-3 text-muted-foreground">{new Date(h.timestamp).toLocaleDateString()}</td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { removeFromHistory(h.id); toast.success("Deleted"); }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                  className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
                  className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
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
              <p className="text-xs text-muted-foreground">{drawer.imageName} • {new Date(drawer.timestamp).toLocaleString()}</p>
              <div className="space-y-2">
                {[
                  { l: "Facial Landmarks", v: drawer.signals.facialLandmarkConsistency ? "✅" : "❌" },
                  { l: "Frequency", v: `${drawer.signals.frequencyArtifactScore}/10` },
                  { l: "Noise", v: drawer.signals.noisePatternResult },
                  { l: "Metadata", v: drawer.signals.metadataIntegrity ? "✅" : "❌" },
                  { l: "Compression", v: `${drawer.signals.compressionArtifacts}/10` },
                  { l: "Skin", v: `${drawer.signals.skinTextureNaturalness}/10` },
                  { l: "Eyes", v: drawer.signals.eyeReflectionConsistency ? "✅" : "❌" },
                  { l: "Background", v: `${drawer.signals.backgroundCoherence}/10` },
                ].map((s) => (
                  <div key={s.l} className="flex justify-between text-xs glass-card p-2 rounded-lg">
                    <span className="text-muted-foreground">{s.l}</span><span className="font-mono-score">{s.v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{drawer.explanation}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
