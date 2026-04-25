import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import LavaBackground from "@/components/LavaBackground";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    toast.success("Reset link sent to your email!");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <LavaBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4 relative z-10">
        <div className="glass-card p-8 rounded-2xl text-center">
          <h1 className="text-2xl font-heading font-bold mb-1">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mb-6">We'll send you a reset link</p>
          {sent ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Mail className="h-7 w-7 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Check your email for a password reset link.</p>
              <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative text-left">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <motion.button whileHover={{ scale: 1.03 }} type="submit" className="w-full btn-primary py-3">Send Reset Link</motion.button>
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
