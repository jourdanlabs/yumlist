import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home as HomeIcon, Carrot, ChefHat, Share2, Users, LogOut, ShoppingCart, Shield, Settings as SettingsIcon, ChevronLeft } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import NotificationsBell from "@/components/NotificationsBell";
import PullToRefresh from "@/components/PullToRefresh";

const nav = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/items", label: "Pantry", icon: Carrot },
  { to: "/shopping-list", label: "Shopping", icon: ShoppingCart },
  { to: "/recipes", label: "Recipes", icon: ChefHat },
  { to: "/share", label: "Share", icon: Share2 },
  { to: "/family", label: "Family", icon: Users },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

// Determine which tab a path belongs to (for per-tab stack preservation)
function tabForPath(path) {
  for (const item of nav) {
    if (path === item.to) return item.to;
  }
  if (path.startsWith("/shared/")) return "/";
  return null;
}

export default function Layout() {
  const { user, loading } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Per-tab stack: track last visited location per tab
  const tabLocations = useRef({});
  const [activeTab, setActiveTab] = useState("/");

  useEffect(() => {
    if (!user?.id) return;
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const source = isIOS ? "App Store" : /Android/.test(ua) ? "Google Play" : "Web";
    const updates = { last_active: new Date().toISOString() };
    if (!user.download_source) updates.download_source = source;
    base44.auth.updateMe(updates).catch(() => {});
  }, [user?.id]);

  // Track location per tab for stack preservation
  useEffect(() => {
    const tab = tabForPath(location.pathname);
    if (tab) {
      tabLocations.current[tab] = location.pathname;
      setActiveTab(tab);
    }
  }, [location.pathname]);

  const navItems = user?.role === "admin" ? [...nav, { to: "/admin", label: "Admin", icon: Shield }] : nav;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (user && !user.family_id && location.pathname !== "/family") {
    return <Navigate to="/family" replace />;
  }

  const handleLogout = () => base44.auth.logout();

  const handleTabClick = (e, item) => {
    e.preventDefault();
    if (item.to === activeTab) {
      // Re-selecting active tab: navigate to root and reset stack
      tabLocations.current[item.to] = item.to;
      navigate(item.to);
    } else {
      // Switching tab: restore last location for that tab
      const last = tabLocations.current[item.to] || item.to;
      navigate(last);
    }
  };

  // Dynamic header: show back button on non-root routes
  const isRootRoute = navItems.some((item) => item.to === location.pathname);
  const showBack = !isRootRoute;
  const handleBack = () => navigate(-1);

  const handleRefresh = () => window.location.reload();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card">
        <div className="px-6 py-7 flex flex-col items-center text-center picnic-bg border-2 border-black rounded-lg">
          <img src="https://media.base44.com/images/public/6a85c116bb660295b89c8343/25976f754_FPLogo.png" alt="Family Pantry" className="w-24 h-24 rounded-xl object-cover mb-2" />
          <div className="font-heading font-semibold leading-tight">Family Pantry</div>
          <div className="text-xs font-bold text-orange-500">{user?.family_name || "No family"}</div>
        </div>
        <nav className="flex-1 px-3 space-y-1 pt-6">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium truncate">{user?.full_name || user?.email}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar with safe area + dynamic header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2 min-w-0">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <img src="https://media.base44.com/images/public/6a85c116bb660295b89c8343/25976f754_FPLogo.png" alt="Family Pantry" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-heading font-semibold">Family Pantry</span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">{user?.family_name || ""}</span>
        </div>
      </header>

      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen picnic-bg overscroll-none">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 safe-bottom">
          <div className="flex justify-end mb-2 gap-2">
            <NotificationsBell />
            <button
              onClick={() => base44.auth.logout()}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
          <PullToRefresh onRefresh={handleRefresh}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </PullToRefresh>
        </div>
      </main>

      {/* Mobile bottom nav with safe area */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border safe-bottom">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={(e) => handleTabClick(e, item)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors min-h-[44px] justify-center",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}