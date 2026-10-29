import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const withDisplayName = (u) => (u && u.display_name ? { ...u, full_name: u.display_name } : u);

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.auth.me()
      .then((u) => { if (active) { setUser(withDisplayName(u)); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const refresh = async () => {
    const u = withDisplayName(await base44.auth.me());
    setUser(u);
    return u;
  };

  return { user, loading, refresh, setUser };
}