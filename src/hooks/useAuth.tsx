import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "@tanstack/react-router";

export let currentUserId: string | null = null;

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-change'));
  }
};

export function useAuth(requireAuth = false) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (currentUserId !== (session?.user?.id ?? null)) {
        currentUserId = session?.user?.id ?? null;
        notifyAuthChange();
      }
      setLoading(false);
      
      if (requireAuth && !session) {
        navigate({ to: "/login" });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (currentUserId !== (session?.user?.id ?? null)) {
        currentUserId = session?.user?.id ?? null;
        notifyAuthChange();
      }
      
      if (requireAuth && !session) {
        navigate({ to: "/login" });
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth, navigate]);

  return { session, user, loading };
}
