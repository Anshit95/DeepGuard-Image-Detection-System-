import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import Navbar from "@/components/Navbar";
import LavaBackground from "@/components/LavaBackground";
import ScanningOverlay from "@/components/ScanningOverlay";
import VerdictBanner from "@/components/VerdictBanner";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import DetectionSignalsGrid from "@/components/DetectionSignalsGrid";
import HeatmapOverlay from "@/components/HeatmapOverlay";
import ShareModal from "@/components/ShareModal";
import { ANALYSIS_STEPS } from "@/lib/analyzeImage";
import { ArrowLeft, Download, Share2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function generatePDF(analysis: any) {
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(255, 106, 0);
    doc.text("DeepGuard AI - Forensic Report", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`Verdict: ${analysis.verdict.replace("_", " ").toUpperCase()}`, 20, 44);
    doc.text(`Confidence: ${analysis.confidence}%`, 20, 52);
    doc.text(`Image: ${analysis.imageName}`, 20, 60);

    doc.setFontSize(12);
    doc.text("Detection Signals", 20, 76);
    doc.setFontSize(10);
    const signals = [
      `Facial Landmarks: ${analysis.signals.facialLandmarkConsistency ? "Consistent" : "Anomalous"}`,
      `Frequency Artifacts: ${analysis.signals.frequencyArtifactScore}/10`,
      `Noise Pattern: ${analysis.signals.noisePatternResult}`,
      `Metadata: ${analysis.signals.metadataIntegrity ? "Verified" : "Tampered"}`,
      `Compression: ${analysis.signals.compressionArtifacts}/10`,
      `Skin Texture: ${analysis.signals.skinTextureNaturalness}/10`,
      `Eye Reflections: ${analysis.signals.eyeReflectionConsistency ? "Consistent" : "Inconsistent"}`,
      `Background: ${analysis.signals.backgroundCoherence}/10`,
    ];
    signals.forEach((s, i) => doc.text(s, 20, 86 + i * 8));

    doc.setFontSize(11);
    doc.text("Summary", 20, 160);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(analysis.explanation, 170);
    doc.text(lines, 20, 170);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This analysis is AI-assisted and should be used as investigative guidance.", 20, 280);

    doc.save(`deepguard-report-${analysis.id.slice(0, 8)}.pdf`);
    toast.success("PDF report downloaded!");
  });
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { isAnalyzing, analysisStep, currentAnalysis } = useAnalysisStore();
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!isAnalyzing && !currentAnalysis) navigate("/");
  }, [isAnalyzing, currentAnalysis, navigate]);

  const currentIdx = ANALYSIS_STEPS.indexOf(analysisStep);
  const progress = isAnalyzing ? ((currentIdx + 1) / ANALYSIS_STEPS.length) * 100 : 100;

  return (
    <div className="min-h-screen relative">
      <LavaBackground />
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4 relative z-10">
        {isAnalyzing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh]">
            <ScanningOverlay imageUrl={currentAnalysis?.imageUrl || ""} currentStep={analysisStep} progress={progress} />
          </motion.div>
        ) : currentAnalysis ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 max-w-5xl mx-auto">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </button>

            <VerdictBanner verdict={currentAnalysis.verdict} confidence={currentAnalysis.confidence} />

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="glass-card p-4 rounded-2xl">
                  <HeatmapOverlay imageUrl={currentAnalysis.imageUrl} />
                </div>
              </div>
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                  <ConfidenceGauge value={currentAnalysis.confidence} />
                </div>
                <div className="glass-card p-6 rounded-2xl">
                  <ScoreBreakdown scores={currentAnalysis.scores} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <DetectionSignalsGrid signals={currentAnalysis.signals} />
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-heading font-semibold text-foreground mb-3">Analysis Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentAnalysis.explanation}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/")} className="btn-primary flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Analyze Another
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => generatePDF(currentAnalysis)} className="btn-glass flex items-center gap-2">
                <Download className="h-4 w-4" /> Download Report
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setShareOpen(true)} className="btn-glass flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Share Results
              </motion.button>
            </div>

            {shareOpen && <ShareModal analysis={currentAnalysis} onClose={() => setShareOpen(false)} />}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
