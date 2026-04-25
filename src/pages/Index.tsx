import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, Brain, BarChart3, Zap, Upload, Search, FileCheck, ArrowRight, Scan, Fingerprint, Eye, Play, AlertTriangle, Mic, Image, Lock, Wifi, FileWarning } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import Navbar from "@/components/Navbar";
import LavaBackground from "@/components/LavaBackground";
import WatchDemoModal from "@/components/WatchDemoModal";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { analyzeImage } from "@/lib/analyzeImage";
import { useState } from "react";

const stats = [
  { label: "Accuracy", value: "99.2%" },
  { label: "Detection Speed", value: "<500ms" },
  { label: "Threat Categories", value: "3" },
  { label: "Images Scanned", value: "2.4M+" },
];

const features = [
  { icon: Brain, title: "Ensemble Neural Networks", description: "XceptionNet + EfficientNet + ViT working together for industry-leading accuracy across all manipulation types." },
  { icon: BarChart3, title: "Frequency Domain Analysis", description: "FFT/DCT reveals invisible GAN fingerprints in the frequency spectrum that AI generators leave behind." },
  { icon: Eye, title: "Facial Landmark Analysis", description: "468-point facial mesh detects geometric anomalies and inconsistencies in manipulated faces." },
  { icon: Fingerprint, title: "Noise Pattern Forensics", description: "SRM filters expose manipulation traces by analyzing camera sensor noise distributions." },
  { icon: Zap, title: "Explainable AI Heatmaps", description: "Visual overlays showing exactly which pixels and regions triggered detection algorithms." },
  { icon: Scan, title: "Metadata Forensics", description: "EXIF data integrity verification and compression artifact analysis across image regions." },
];

const steps = [
  { icon: Upload, title: "Upload", description: "Drag & drop any image or paste a URL" },
  { icon: Search, title: "Analyze", description: "Our ensemble AI scans for manipulation signals" },
  { icon: FileCheck, title: "Results", description: "Get a detailed verdict with confidence scores" },
];

const securityTips = [
  { icon: Mic, title: "Audio Deepfakes Are Rising", description: "Voice cloning can replicate anyone in seconds. Always verify voice-based requests through a secondary channel." },
  { icon: Image, title: "Reverse Image Search", description: "Before trusting any image, use reverse search to check if it's been altered or taken out of context." },
  { icon: FileWarning, title: "EXIF Data Manipulation", description: "Metadata like GPS, camera model, and timestamps can be forged. Never rely on EXIF alone for verification." },
  { icon: Lock, title: "Enable MFA Everywhere", description: "Multi-factor authentication blocks 99.9% of automated attacks. Use authenticator apps, not SMS." },
  { icon: Wifi, title: "Public Wi-Fi Risks", description: "Never access sensitive accounts on public networks without a VPN. Attackers can intercept unencrypted traffic." },
  { icon: AlertTriangle, title: "Social Engineering via AI", description: "AI-generated faces create fake profiles at scale. Verify identities before sharing sensitive information." },
];

const testimonials = [
  { name: "Sarah Chen", role: "CTO @ TechCorp", text: "DeepGuard AI has become an essential part of our content verification pipeline. The accuracy is remarkable." },
  { name: "Marcus Webb", role: "Head of Security @ MediaCo", text: "We've prevented dozens of misinformation campaigns thanks to DeepGuard's real-time detection capabilities." },
  { name: "Dr. Lisa Park", role: "AI Research Lead @ DataTrust", text: "The forensic signals breakdown is incredibly detailed. It's the most comprehensive tool we've evaluated." },
];

export default function Index() {
  const navigate = useNavigate();
  const { setIsAnalyzing, setAnalysisStep, setCurrentAnalysis, addToHistory } = useAnalysisStore();
  const [demoOpen, setDemoOpen] = useState(false);

  const handleFile = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    navigate("/analyze");
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(file, imageUrl, (step) => setAnalysisStep(step));
      setCurrentAnalysis(result);
      addToHistory(result);
    } catch (err: any) {
      toast.error(err?.message || "Analysis failed. Please try again.");
      navigate("/");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <LavaBackground />
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden z-10">
        <div className="container mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-12">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
              <div className="relative">
                <Shield className="h-4 w-4" />
                <motion.div className="absolute inset-0 rounded-full border border-primary/50" animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              </div>
              🛡️ Enterprise-Grade AI Detection
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Detect Deepfakes &{" "}
              <span className="gradient-text animate-shimmer bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                AI Images
              </span>{" "}
              Instantly
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Military-grade image forensics powered by ensemble neural networks. Stop misinformation before it spreads.
            </p>

            <div className="flex justify-center gap-4 mt-8">
              <motion.button whileHover={{ scale: 1.03 }} className="btn-primary flex items-center gap-2"
                onClick={() => document.getElementById("upload-zone")?.scrollIntoView({ behavior: "smooth" })}>
                Start Analyzing <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} className="btn-glass flex items-center gap-2"
                onClick={() => setDemoOpen(true)}>
                <Play className="h-4 w-4" /> Watch Demo
              </motion.button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex justify-center gap-6 sm:gap-10 mb-14 flex-wrap">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-mono-score font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div id="upload-zone" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <UploadZone onFileSelected={handleFile} />
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold mb-3">How We Detect Manipulation</h2>
            <p className="text-muted-foreground">Six forensic analysis methods working in concert.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} className="glass-card-hover p-6">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <f.icon className="h-6 w-6 text-primary animate-float" style={{ animationDelay: `${i * 0.5}s` }} />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to verify any image.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 }} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="p-4 rounded-2xl glass-card border-primary/20">
                    <s.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-lava-red text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
                {i < 2 && <ArrowRight className="h-5 w-5 text-muted-foreground mt-4 hidden md:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Awareness Tips */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-4">
              <Shield className="h-3 w-3" /> Security Awareness
            </div>
            <h2 className="text-3xl font-heading font-bold mb-3">Cybersecurity Best Practices</h2>
            <p className="text-muted-foreground">Stay informed. Stay protected. Here's what every user should know.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityTips.map((tip, i) => (
              <motion.div key={tip.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} className="glass-card-hover p-6 group">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <tip.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-2 text-foreground">{tip.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold mb-3">Trusted by Security Teams</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="glass-card-hover p-6">
                <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 border-t border-primary/10 relative z-10">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-heading font-semibold text-sm">DeepGuard<span className="text-primary">AI</span></span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 DeepGuard AI. All rights reserved.</p>
        </div>
      </footer>

      <WatchDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
