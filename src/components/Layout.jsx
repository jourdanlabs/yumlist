import React from "react";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { Home as HomeIcon, Carrot, ChefHat, Share2, Users, LogOut, ShoppingCart } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/items", label: "Pantry", icon: Carrot },
  { to: "/shopping-list", label: "Shopping", icon: ShoppingCart },
  { to: "/recipes", label: "Recipes", icon: ChefHat },
  { to: "/share", label: "Share", icon: Share2 },
  { to: "/family", label: "Family", icon: Users },
];

export default function Layout() {
  const { user, loading } = useCurrentUser();
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card">
        <div className="px-6 py-7 flex flex-col items-center text-center">
          <img src="https://media.base44.com/images/public/6a85c116bb660295b89c8343/25976f754_FPLogo.png" alt="Family Pantry" className="w-12 h-12 rounded-xl object-cover mb-2" />
          <div className="font-heading font-semibold leading-tight">Family Pantry</div>
          <div className="text-xs text-muted-foreground">{user?.family_name || "No family"}</div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((item) => {
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

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a85c116bb660295b89c8343/25976f754_FPLogo.png" alt="Family Pantry" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-heading font-semibold">Family Pantry</span>
          </div>
          <span className="text-xs text-muted-foreground">{user?.family_name || ""}</span>
        </div>
      </header>

      <main
        className="md:pl-64 pb-20 md:pb-0 min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://media.base44.com/images/public/6a85c116bb660295b89c8343/fcdd2c958_FamilyPantry.png')" }}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border">
        <div className="grid grid-cols-6">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
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