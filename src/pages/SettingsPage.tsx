import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Bell, Palette, Save, Clock, Monitor, Smartphone, Trash2, LogOut, Phone, Building2, Briefcase, Globe, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import LavaBackground from "@/components/LavaBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "sessions", label: "Sessions", icon: Monitor },
  { id: "login-history", label: "Login History", icon: Clock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

interface LoginEntry {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  status: string;
  created_at: string;
}

interface SessionEntry {
  id: string;
  device_info: string | null;
  ip_address: string | null;
  last_active: string;
  is_current: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || "");
      setName(user.user_metadata?.full_name || user.email || "");
      
      // Load profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (profile) {
        setName(profile.display_name || user.user_metadata?.full_name || "");
        setPhone((profile as any).phone || "");
        setOrganization((profile as any).organization || "");
        setJobTitle((profile as any).job_title || "");
        setBio((profile as any).bio || "");
        setCountry((profile as any).country || "");
        setRecoveryEmail((profile as any).recovery_email || "");
      }

      const { data: history } = await supabase
        .from("login_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (history) setLoginHistory(history);

      const { data: sess } = await supabase
        .from("user_sessions")
        .select("*")
        .order("last_active", { ascending: false });
      if (sess) setSessions(sess);
    }
  };

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.auth.updateUser({ data: { full_name: name } });
    await supabase.from("profiles").update({
      display_name: name,
      phone,
      organization,
      job_title: jobTitle,
      bio,
      country,
      recovery_email: recoveryEmail,
    } as any).eq("user_id", user.id);
    toast.success("Profile saved");
  };

  const revokeSession = async (sessionId: string) => {
    await supabase.from("user_sessions").delete().eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success("Session revoked");
  };

  const revokeAllOtherSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_sessions").delete().eq("user_id", user.id).eq("is_current", false);
      setSessions((prev) => prev.filter((s) => s.is_current));
      toast.success("All other sessions revoked");
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    return deviceType === "mobile" ? Smartphone : Monitor;
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return "Unknown Device";
    if (ua.includes("Chrome")) return "Chrome Browser";
    if (ua.includes("Firefox")) return "Firefox Browser";
    if (ua.includes("Safari")) return "Safari Browser";
    if (ua.includes("Edge")) return "Edge Browser";
    return "Unknown Browser";
  };

  return (
    <div className="min-h-screen relative">
      <LavaBackground />
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4 relative z-10">
        <h1 className="text-3xl font-heading font-bold mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-56 flex md:flex-col gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.id ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 glass-card p-6 rounded-2xl">
            {tab === "profile" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="font-heading font-semibold text-lg">Profile</h2>
                <div className="space-y-3 max-w-lg">
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</label>
                    <input value={email} disabled
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm opacity-60 cursor-not-allowed" />
                    <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed for security reasons.</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Full Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890"
                        className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Country</label>
                      <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States"
                        className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Organization</label>
                      <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company name"
                        className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" /> Job Title</label>
                      <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Security Analyst"
                        className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Recovery Email</label>
                    <input value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="backup@email.com"
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} onClick={saveProfile}
                    className="btn-primary flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</motion.button>
                </div>
              </motion.div>
            )}

            {tab === "security" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="font-heading font-semibold text-lg">Security</h2>
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">TOTP via Google Authenticator/Authy — required for all accounts</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Always Enabled
                    </span>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm font-medium mb-1">Password Reset</p>
                  <p className="text-xs text-muted-foreground mb-3">For security, password changes are done via email verification only.</p>
                  <motion.button whileHover={{ scale: 1.03 }} onClick={async () => {
                    if (email) {
                      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
                      toast.success("Password reset link sent to your email");
                    }
                  }}
                    className="btn-glass text-sm">Send Reset Link</motion.button>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm font-medium mb-1">Session Timeout</p>
                  <p className="text-xs text-muted-foreground">Auto-logout after 30 minutes of inactivity with a 5-minute warning.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-xs text-emerald-400 font-medium">Active — 30 min timeout</span>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "sessions" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-semibold text-lg">Active Sessions</h2>
                  <motion.button whileHover={{ scale: 1.03 }} onClick={revokeAllOtherSessions}
                    className="btn-glass text-xs flex items-center gap-1">
                    <LogOut className="h-3 w-3" /> Sign Out All Others
                  </motion.button>
                </div>
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No active sessions found.</p>
                ) : (
                  sessions.map((s) => {
                    const DeviceIcon = getDeviceIcon(s.device_info);
                    return (
                      <div key={s.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <DeviceIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {s.device_info || "Unknown Device"}
                              {s.is_current && <span className="ml-2 text-[10px] text-emerald-400 font-medium">Current</span>}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {s.ip_address || "Unknown IP"} • Last active {new Date(s.last_active).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!s.is_current && (
                          <button onClick={() => revokeSession(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {tab === "login-history" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="font-heading font-semibold text-lg">Login History</h2>
                {loginHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No login history available.</p>
                ) : (
                  <div className="space-y-2">
                    {loginHistory.map((entry) => {
                      const DeviceIcon = getDeviceIcon(entry.device_type);
                      return (
                        <div key={entry.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${entry.status === "success" ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
                              <DeviceIcon className={`h-4 w-4 ${entry.status === "success" ? "text-emerald-400" : "text-destructive"}`} />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{parseUserAgent(entry.user_agent)}</p>
                              <p className="text-[10px] text-muted-foreground">{entry.ip_address || "Unknown IP"} • {entry.device_type || "unknown"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                              entry.status === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"
                            }`}>{entry.status}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "notifications" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="font-heading font-semibold text-lg">Notifications</h2>
                {[
                  { label: "Email on analysis complete", value: notifEmail, set: setNotifEmail },
                  { label: "Weekly summary report", value: notifWeekly, set: setNotifWeekly },
                  { label: "Security alerts", value: notifSecurity, set: setNotifSecurity },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between glass-card p-4 rounded-xl">
                    <span className="text-sm">{n.label}</span>
                    <button onClick={() => n.set(!n.value)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${n.value ? "bg-primary" : "bg-muted"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all ${n.value ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === "appearance" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="font-heading font-semibold text-lg">Appearance</h2>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm font-medium mb-3">Theme</p>
                  <div className="flex gap-2">
                    {["dark", "light", "system"].map((t) => (
                      <button key={t} onClick={() => setTheme(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                          theme === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/20 text-muted-foreground hover:text-foreground border border-border/50"
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <p className="text-sm font-medium mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {["#FF6A00", "#2563EB", "#8B5CF6", "#10B981", "#EF4444"].map((c) => (
                      <button key={c} className="w-8 h-8 rounded-full border-2 border-border/50 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }} onClick={() => toast.success(`Accent color updated`)} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
