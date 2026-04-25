import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";
import LavaBackground from "@/components/LavaBackground";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || "your@email.com";

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <LavaBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4 relative z-10">
        <div className="glass-card p-8 rounded-2xl text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-heading font-bold mb-1">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We've sent a verification link to <span className="text-foreground font-medium">{email}</span>
          </p>

          <div className="glass-card p-4 rounded-xl mb-6 space-y-3 text-left">
            {[
              "Open your email inbox",
              "Find the email from DeepGuard AI",
              "Click the verification link in the email",
              "You'll be redirected back to the login page",
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{step}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground mb-6">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>After verification, sign in to complete MFA setup</span>
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login")}
            className="w-full btn-primary py-3">
            Go to Login
          </motion.button>

          <p className="text-[10px] text-muted-foreground mt-4">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
