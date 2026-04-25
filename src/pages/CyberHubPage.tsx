import { motion } from "framer-motion";
import { Shield, Lock, Fingerprint, Eye, Wifi, AlertTriangle, Mic, Image, FileWarning, Key, UserCheck, Globe, Server, ShieldAlert, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import LavaBackground from "@/components/LavaBackground";

const sections = [
  {
    title: "Authentication & Access",
    items: [
      { icon: Key, title: "Mandatory MFA (TOTP)", desc: "All accounts require authenticator app-based two-factor authentication. No exceptions." },
      { icon: Lock, title: "Brute Force Protection", desc: "Accounts lock after 3 failed login attempts for 15 minutes to prevent credential stuffing." },
      { icon: UserCheck, title: "Email Verification", desc: "Every new account must verify their email before gaining access to the platform." },
      { icon: Shield, title: "Secure Password Reset", desc: "Password changes are done exclusively via email verification — never through profile settings." },
    ],
  },
  {
    title: "Session Security",
    items: [
      { icon: Eye, title: "30-Minute Auto-Logout", desc: "Inactive sessions automatically terminate after 30 minutes with a 5-minute warning." },
      { icon: Server, title: "Session Management", desc: "View all active sessions with device and IP info. Revoke individual sessions or sign out all devices." },
      { icon: Globe, title: "Login History", desc: "Full audit trail of all login attempts including IP address, device type, and timestamp." },
      { icon: Fingerprint, title: "Device Tracking", desc: "Each login records device fingerprint for anomaly detection and security monitoring." },
    ],
  },
  {
    title: "Threat Awareness",
    items: [
      { icon: Mic, title: "Audio Deepfakes", desc: "Voice cloning can replicate anyone in seconds. Always verify voice-based requests through a secondary channel." },
      { icon: Image, title: "Visual Deepfakes", desc: "AI-generated faces are now photorealistic. Use forensic tools like DeepGuard to verify before trusting." },
      { icon: FileWarning, title: "EXIF Manipulation", desc: "Metadata like GPS, camera model, and timestamps can be forged. Never rely on EXIF alone." },
      { icon: Wifi, title: "Network Security", desc: "Never access sensitive accounts on public Wi-Fi without a VPN. Use encrypted connections always." },
      { icon: AlertTriangle, title: "Social Engineering", desc: "AI-generated profiles create fake identities at scale. Verify before sharing sensitive data." },
      { icon: ShieldAlert, title: "Zero-Day Exploits", desc: "Keep all software updated. Unpatched vulnerabilities are the #1 attack vector for targeted breaches." },
    ],
  },
];

export default function CyberHubPage() {
  return (
    <div className="min-h-screen relative">
      <LavaBackground />
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-heading font-bold">Cyber Security Hub</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8 ml-14">All security features and awareness resources in one place.</p>
        </motion.div>

        <div className="space-y-10">
          {sections.map((section, si) => (
            <motion.div key={section.title} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-primary" />
                {section.title}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="glass-card-hover p-5 group">
                    <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
