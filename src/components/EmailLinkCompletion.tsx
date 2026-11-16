import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { decodeReturnPath, hasEmailLinkResult, RETURN_PATH_KEY } from "@/lib/adviser-auth";

/** Reads and clears the briefing the sign-in link was requested from. */
function takeReturnPath(): string | null {
  try {
    const raw = window.localStorage.getItem(RETURN_PATH_KEY);
    window.localStorage.removeItem(RETURN_PATH_KEY);
    return decodeReturnPath(raw, Date.now());
  } catch {
    return null;
  }
}

/**
 * Finishes the adviser's emailed sign-in link on whichever page it opens. Supabase sends the
 * reader to the Site URL (the homepage) when the briefing isn't on its redirect allow-list, and
 * only the adviser started the Supabase client, so the session was never stored there and the
 * access token stayed in the address bar. Here the client starts only when the URL carries a
 * link result: supabase-js stores the session and strips the token, then the reader goes back
 * to the briefing they asked from (signed in, or with the link error for the adviser to show).
 */
export function EmailLinkCompletion() {
  useEffect(() => {
    if (!hasEmailLinkResult(window.location.href)) return;
    const fragment = window.location.hash;
    const linkError = /(^|[#&])error(_code|_description)?=/.test(fragment) ? fragment : "";
    let cancelled = false;
    void (async () => {
      let signedIn = false;
      try {
        const { data } = await supabase.auth.getSession();
        signedIn = Boolean(data.session);
      } catch {
        // The reader can request a new link from the adviser.
      }
      if (cancelled) return;
      const target = takeReturnPath();
      if (!target || target === `${window.location.pathname}${window.location.search}`) return;
      window.location.replace(signedIn ? target : `${target}${linkError}`);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
