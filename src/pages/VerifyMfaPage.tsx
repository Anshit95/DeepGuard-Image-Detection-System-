import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import LavaBackground from "@/components/LavaBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function VerifyMfaPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
    loadFactor();
  }, []);

  const loadFactor = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (data?.totp && data.totp.length > 0) {
      setFactorId(data.totp[0].id);
    }
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputsRef.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    if (otp.some((d) => !d)) { toast.error("Enter all digits"); return; }
    if (!factorId) { toast.error("MFA not configured"); return; }
    
    setLoading(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      toast.error(challengeError.message);
      setLoading(false);
      return;
    }
    
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: otp.join(""),
    });
    setLoading(false);

    if (verifyError) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Invalid code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      return;
    }

    toast.success("Verified!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <LavaBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md mx-4 relative z-10`}
        style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}>
        <style>{`@keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }`}</style>
        <div className="glass-card p-8 rounded-2xl text-center">
          <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-heading font-bold mb-1">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground mb-8">Enter the code from your authenticator app</p>

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <input key={i} ref={(el) => { inputsRef.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-mono-score font-bold rounded-xl bg-muted/30 border transition-all focus:outline-none ${
                  digit ? "border-primary shadow-[0_0_12px_rgba(255,106,0,0.3)]" : "border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                }`} />
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={handleVerify} disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50">
            {loading ? "Verifying..." : "Verify"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
