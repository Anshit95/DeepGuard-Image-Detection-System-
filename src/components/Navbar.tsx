import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, Sun, Moon, Bell, Settings, LogOut, Home, Scan, BarChart3, Clock, Info, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Analyze", path: "/analyze", icon: Scan },
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { label: "History", path: "/history", icon: Clock },
  { label: "Cyber Hub", path: "/cyber", icon: ShieldCheck },
  { label: "About", path: "/about", icon: Info },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { history } = useAnalysisStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const recentNotifs = history.slice(0, 3);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !isDark);
  }, [isDark]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10, 5, 3, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 120, 50, 0.1)",
      }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              onMouseEnter={() => setMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-xl"
                  style={{
                    background: "rgba(15, 8, 4, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 120, 50, 0.15)",
                  }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="p-2 space-y-0.5">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] ${
                            isActive
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                          {isActive && (
                            <motion.div
                              layoutId="nav-dot"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                              style={{ boxShadow: "0 0 6px 2px hsl(var(--primary) / 0.5)" }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-primary/10 p-2">
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg">
              DeepGuard<span className="text-primary">AI</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground relative"
            >
              <Bell className="h-4 w-4" />
              {recentNotifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-[9px] font-bold flex items-center justify-center text-primary-foreground">
                  {recentNotifs.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden shadow-xl"
                style={{
                  background: "rgba(15, 8, 4, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 120, 50, 0.15)",
                }}
              >
                <div className="p-3 border-b border-primary/10 flex justify-between items-center">
                  <span className="text-xs font-semibold text-foreground">Notifications</span>
                  <button className="text-[10px] text-primary">Mark all read</button>
                </div>
                {recentNotifs.length === 0 ? (
                  <p className="p-4 text-xs text-muted-foreground text-center">No notifications</p>
                ) : (
                  recentNotifs.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-primary/5 cursor-pointer border-b border-primary/5 last:border-0">
                      <p className="text-xs text-foreground">
                        <span className="font-medium">{n.imageName}</span> — {n.verdict === "real" ? "Real" : n.verdict === "ai_generated" ? "AI Generated" : "Manipulated"} ({n.confidence}%)
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-lava-red flex items-center justify-center text-primary-foreground text-xs font-bold hover:scale-105 transition-transform"
            >
              DG
            </button>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-xl"
                style={{
                  background: "rgba(15, 8, 4, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 120, 50, 0.15)",
                }}
              >
                <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-primary/5 transition-colors text-foreground">
                  <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                </Link>
                <button onClick={() => { setProfileOpen(false); handleSignOut(); }} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-primary/5 transition-colors text-foreground border-t border-primary/10 w-full text-left">
                  <LogOut className="h-4 w-4 text-muted-foreground" /> Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
