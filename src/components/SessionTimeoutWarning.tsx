import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 25 * 60 * 1000; // 25 minutes (5 min warning)

export default function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [remaining, setRemaining] = useState(300);
  const navigate = useNavigate();

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setRemaining(300);
  }, []);

  useEffect(() => {
    let warningTimeout: ReturnType<typeof setTimeout>;
    let logoutTimeout: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    const startTimers = () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      clearInterval(countdownInterval);
      setShowWarning(false);

      warningTimeout = setTimeout(() => {
        setShowWarning(true);
        setRemaining(300);
        countdownInterval = setInterval(() => {
          setRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, WARNING_MS);

      logoutTimeout = setTimeout(async () => {
        await supabase.auth.signOut();
        toast.error("Session expired. Please sign in again.");
        navigate("/login");
      }, TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "mousemove", "scroll", "touchstart"];
    const handleActivity = () => {
      startTimers();
      resetTimer();
    };

    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        startTimers();
        events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
      }
    });

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      clearInterval(countdownInterval);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [navigate, resetTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full mx-4"
        >
          <div
            className="rounded-xl p-4 flex items-center gap-3 shadow-2xl"
            style={{
              background: "rgba(20, 10, 5, 0.95)",
              border: "1px solid rgba(255, 120, 50, 0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Session Expiring</p>
              <p className="text-xs text-muted-foreground">
                Auto-logout in <span className="font-mono-score text-amber-400">{formatTime(remaining)}</span>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Stay Active
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
