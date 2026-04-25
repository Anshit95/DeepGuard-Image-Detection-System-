import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, ArrowLeft, Mail, Lock, User } from "lucide-react";
import LavaBackground from "@/components/LavaBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function getStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^a-zA-Z\d]/.test(p)) s++;
  return s;
}

const strengthLabels = ["", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = ["", "bg-destructive", "bg-amber-500", "bg-emerald-400", "bg-emerald-500"];

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) { toast.error("Please fill all fields"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (!terms) { toast.error("Please accept the terms"); return; }
    if (strength < 2) { toast.error("Password is too weak"); return; }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Check your email for the verification link!");
    navigate("/verify-otp", { state: { email } });
  };

  return (
    <div className="min-h-screen relative flex">
      <LavaBackground />

      <div className="hidden lg:flex flex-col justify-center items-center w-[60%] relative z-10 p-12">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-lava-red/20 flex items-center justify-center relative">
            <Shield className="h-20 w-20 text-primary" />
            <motion.div className="absolute inset-0 rounded-full border-2 border-primary/30" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
          </div>
        </motion.div>
        <div className="mt-12 space-y-4">
          {[{ v: "2.4M+", l: "Images Analyzed" }, { v: "99.2%", l: "Accuracy" }].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }}
              className="glass-card px-6 py-3 text-center">
              <p className="text-xl font-mono-score font-bold gradient-text">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 glass-card px-3 py-2 rounded-xl hover:scale-[1.03] transition-transform">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="glass-card p-8 rounded-2xl">
            <h1 className="text-2xl font-heading font-bold mb-1">Create Account</h1>
            <p className="text-sm text-muted-foreground mb-6">Start detecting deepfakes today</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : "bg-muted/30"}`}
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} />
                      ))}
                    </div>
                    <span className={`text-[10px] font-medium ${strength <= 1 ? "text-destructive" : strength === 2 ? "text-amber-400" : "text-emerald-400"}`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="rounded accent-primary mt-0.5" />
                I agree to the <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
              </label>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? "Creating account..." : "Create Account"}
              </motion.button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
