import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import LavaBackground from "@/components/LavaBackground";
import { toast } from "sonner";

function getStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^a-zA-Z\d]/.test(p)) s++;
  return s;
}

const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-400", "bg-emerald-500"];

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const strength = getStrength(pw);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) { toast.error("Passwords don't match"); return; }
    if (strength < 2) { toast.error("Password too weak"); return; }
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password reset successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <LavaBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4 relative z-10">
        <div className="glass-card p-8 rounded-2xl">
          <h1 className="text-2xl font-heading font-bold mb-1 text-center">Reset Password</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">Enter your new password</p>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pw && (
              <div className="flex gap-1">
                {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : "bg-muted/30"}`} />)}
              </div>
            )}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <motion.button whileHover={{ scale: 1.03 }} type="submit" className="w-full btn-primary py-3">Reset Password</motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
