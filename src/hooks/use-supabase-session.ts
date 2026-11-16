import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseSessionState {
  /** False during server render and until the browser has read the stored session. */
  ready: boolean;
  session: Session | null;
}

/**
 * The browser's Supabase session, kept current through sign-in and sign-out (any tab).
 * Reading it also lets supabase-js finish an email sign-in link that lands on any page.
 */
export function useSupabaseSession(): SupabaseSessionState {
  const [state, setState] = useState<SupabaseSessionState>({ ready: false, session: null });
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const update = (session: Session | null) => {
      if (active) setState({ ready: true, session });
    };
    try {
      void supabase.auth
        .getSession()
        .then(({ data }) => update(data.session))
        .catch(() => update(null));
      const { data } = supabase.auth.onAuthStateChange((_event, session) => update(session));
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      update(null);
    }
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  return state;
}
