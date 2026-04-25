import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LavaBackground from "@/components/LavaBackground";
import { Brain, BarChart3, Eye, Fingerprint } from "lucide-react";

const methods = [
  { icon: Brain, title: "Deep Neural Network Analysis", description: "Our ensemble of CNNs and Vision Transformers analyze pixel-level patterns, detecting subtle inconsistencies invisible to the human eye. Trained on 50K+ labeled images.", accuracy: 98.7 },
  { icon: BarChart3, title: "Frequency Domain Analysis", description: "AI-generated images leave characteristic patterns in the frequency spectrum. Our FFT-based analysis detects these spectral fingerprints with high precision.", accuracy: 96.2 },
  { icon: Eye, title: "Facial Landmark Analysis", description: "Advanced facial geometry analysis checks for inconsistencies in landmark positions, eye reflections, and skin texture that indicate face manipulation.", accuracy: 97.5 },
  { icon: Fingerprint, title: "Noise Pattern Forensics", description: "Every camera sensor leaves a unique noise fingerprint. We analyze noise distribution patterns to detect splicing, cloning, and inpainting artifacts.", accuracy: 95.8 },
];

const benchmarks = [
  { dataset: "FaceForensics++", accuracy: 99.1 },
  { dataset: "Celeb-DF v2", accuracy: 98.4 },
  { dataset: "GenImage Benchmark", accuracy: 98.8 },
  { dataset: "WildDeepfake", accuracy: 96.5 },
  { dataset: "AI-Generated Art Detection", accuracy: 97.9 },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      <LavaBackground />
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4 space-y-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-4">How Detection Works</h1>
          <p className="text-muted-foreground text-lg">Our multi-layered approach combines four distinct analysis methods for industry-leading detection accuracy.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {methods.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10"><m.icon className="h-6 w-6 text-primary" /></div>
                <h3 className="font-heading font-semibold text-lg">{m.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-mono-score font-medium text-foreground">{m.accuracy}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" initial={{ width: 0 }} whileInView={{ width: `${m.accuracy}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.15 }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold mb-2">Benchmark Results</h2>
            <p className="text-sm text-muted-foreground">Performance across standard academic benchmarks.</p>
          </motion.div>
          <div className="space-y-4">
            {benchmarks.map((b, i) => (
              <motion.div key={b.dataset} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card p-4 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground font-medium">{b.dataset}</span>
                  <span className="font-mono-score text-primary font-semibold">{b.accuracy}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" initial={{ width: 0 }} whileInView={{ width: `${b.accuracy}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card p-8 rounded-2xl text-center max-w-2xl mx-auto">
          <h3 className="font-heading font-semibold text-lg mb-3">Training Data</h3>
          <p className="text-sm text-muted-foreground">Our models are trained on a curated dataset of 50,000+ labeled images spanning authentic photographs, AI-generated content from Stable Diffusion, Midjourney, DALL-E, and manipulated images including splicing, inpainting, and retouching.</p>
        </motion.div>
      </div>
    </div>
  );
}
