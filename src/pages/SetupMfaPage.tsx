import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Smartphone, QrCode, Copy, Check } from "lucide-react";
import LavaBackground from "@/components/LavaBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SetupMfaPage() {
  const navigate = useNavigate();
  const [qrUri, setQrUri] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    enrollMfa();
  }, []);

  const enrollMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "DeepGuard Authenticator" });
    if (error) {
      toast.error("Failed to set up MFA: " + error.message);
      return;
    }
    if (data) {
      setQrUri(data.totp.uri);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) { toast.error("Enter the 6-digit code"); return; }
    setLoading(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      toast.error(challengeError.message);
      setLoading(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    setLoading(false);
    if (verifyError) {
      toast.error("Invalid code. Please try again.");
      setCode("");
      return;
    }
    toast.success("MFA enabled successfully! Your account is now secured.");
    navigate("/dashboard");
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <LavaBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-4 relative z-10">
        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center mb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-heading font-bold mb-1">Enable Two-Factor Authentication</h1>
            <p className="text-sm text-muted-foreground">MFA is <span className="text-primary font-semibold">required</span> for all DeepGuard AI accounts</p>
          </div>

          <div className="glass-card p-4 rounded-xl mb-4 flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Authenticator App (TOTP)</p>
              <p className="text-xs text-muted-foreground">Use Google Authenticator, Authy, or any TOTP app</p>
            </div>
          </div>

          {qrUri ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-card p-4 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-3">Scan with your authenticator app</p>
                <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center p-2">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUri)}`} alt="QR Code" className="w-full h-full" />
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <code className="text-[10px] font-mono-score text-muted-foreground bg-muted/30 px-2 py-1 rounded select-all">{secret}</code>
                  <button onClick={copySecret} className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Enter the 6-digit code from your app</label>
                <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-center text-lg font-mono-score tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={handleVerify} disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? "Verifying..." : "Activate MFA"}
              </motion.button>
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Generating QR code...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
