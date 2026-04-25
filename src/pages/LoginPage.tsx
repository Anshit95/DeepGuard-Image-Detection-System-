import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, ArrowLeft, Mail, Lock, Github, AlertTriangle } from "lucide-react";
import LavaBackground from "@/components/LavaBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ locked: boolean; locked_until?: string; attempts: number } | null>(null);

  const checkLockout = async (email: string) => {
    const { data } = await supabase.rpc("check_login_lockout", { p_email: email });
    return data as { locked: boolean; locked_until?: string; attempts: number } | null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill all fields"); return; }
    
    // Check lockout
    const lockout = await checkLockout(email);
    if (lockout?.locked) {
      const until = lockout.locked_until ? new Date(lockout.locked_until).toLocaleTimeString() : "soon";
      setLockoutInfo(lockout);
      toast.error(`Account locked. Try again after ${until}`);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      // Record failed attempt
      const { data: result } = await supabase.rpc("record_failed_login", { p_email: email });
      const failResult = result as { locked: boolean; locked_until?: string; attempts: number } | null;
      setLockoutInfo(failResult);
      
      if (failResult?.locked) {
        toast.error("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        const attemptsLeft = 3 - (failResult?.attempts || 0);
        toast.error(`Invalid credentials. ${attemptsLeft > 0 ? `${attemptsLeft} attempts remaining.` : ""}`);
      }
      return;
    }

    // Clear failed attempts on success
    await supabase.rpc("clear_failed_logins", { p_email: email });

    // Record login history
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("login_history").insert({
        user_id: user.id,
        user_agent: navigator.userAgent,
        device_type: /Mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
        status: "success",
      });

      // Check MFA status - if no TOTP factors, redirect to setup
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (!factors?.totp || factors.totp.length === 0) {
        toast.success("Please set up MFA to continue");
        navigate("/setup-mfa");
        return;
      }
      // If TOTP exists but not verified in this session, go to verify
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== aal?.nextLevel) {
        navigate("/verify-mfa");
        return;
      }
    }

    toast.success("Logged in successfully!");
    navigate("/dashboard");
  };

  const handleOAuth = (provider: string) => {
    toast.info(`${provider} login coming soon`);
  };

  return (
    <div className="min-h-screen relative flex">
      <LavaBackground />

      {/* Left showcase */}
      <div className="hidden lg:flex flex-col justify-center items-center w-[60%] relative z-10 p-12">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-lava-red/20 flex items-center justify-center relative">
            <Shield className="h-20 w-20 text-primary" />
            <motion.div className="absolute inset-0 rounded-full border-2 border-primary/30" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.div className="absolute inset-[-12px] rounded-full border border-primary/20" animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} />
          </div>
        </motion.div>
        <div className="mt-12 space-y-4">
          {[{ v: "2.4M+", l: "Images Analyzed" }, { v: "99.2%", l: "Accuracy" }, { v: "Enterprise", l: "Trusted" }].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }}
              className="glass-card px-6 py-3 text-center">
              <p className="text-xl font-mono-score font-bold gradient-text">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 glass-card px-3 py-2 rounded-xl hover:scale-[1.03] transition-transform">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="glass-card p-8 rounded-2xl">
            <h1 className="text-2xl font-heading font-bold mb-1">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

            {lockoutInfo?.locked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl border flex items-center gap-2"
                style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }}
              >
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">
                  Account locked until {lockoutInfo.locked_until ? new Date(lockoutInfo.locked_until).toLocaleTimeString() : "15 minutes"}. Too many failed attempts.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded accent-primary" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || lockoutInfo?.locked}
                className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? "Signing in..." : "Sign In"}
              </motion.button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => handleOAuth("Google")}
                className="btn-glass flex items-center justify-center gap-2 py-2.5 text-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => handleOAuth("GitHub")}
                className="btn-glass flex items-center justify-center gap-2 py-2.5 text-sm">
                <Github className="h-4 w-4" /> GitHub
              </motion.button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
