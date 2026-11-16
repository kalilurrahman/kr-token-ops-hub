import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, LogOut, Mail, MailCheck, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { buildEmailRedirect, readAuthLinkError, safeRedirect } from "@/lib/auth-redirect";

type AuthSearch = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — TokenOps Atlas" },
      {
        name: "description",
        content: "Sign in to TokenOps Atlas with an emailed link to use the AI workload adviser.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const panelClass =
  "grid max-w-xl gap-4 rounded-lg border border-[var(--to-line)] bg-[var(--to-surface)] p-5 shadow-[var(--to-shadow-1)]";
const alertClass = "m-0 rounded-md border border-[var(--to-line)] p-3 text-[var(--to-risk-text)]";

function friendlyAuthError(caught: unknown, fallback: string): string {
  if (caught instanceof Error) {
    if (caught.name === "AuthRetryableFetchError" || /fetch/i.test(caught.message)) {
      return "The sign-in service could not be reached. Check your connection and try again.";
    }
    if (caught.message) return caught.message;
  }
  return fallback;
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safeRedirect(redirect);
  const { ready, session } = useSupabaseSession();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLinkError(readAuthLinkError(window.location.hash));
  }, []);

  const sendLink = async (address: string) => {
    setBusy(true);
    setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: address,
        options: {
          emailRedirectTo: buildEmailRedirect(window.location.origin, target),
          shouldCreateUser: true,
        },
      });
      if (otpError) throw otpError;
      setSentTo(address);
      setLinkError(null);
    } catch (caught) {
      setError(friendlyAuthError(caught, "The sign-in link could not be sent. Try again."));
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = email.trim();
    if (address) void sendLink(address);
  };

  const signOut = async () => {
    setBusy(true);
    setError("");
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setSentTo(null);
    } catch (caught) {
      setError(friendlyAuthError(caught, "Sign-out did not complete. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Account</p>
        <h1>{session ? "You're signed in" : "Sign in"}</h1>
        {session ? (
          <p>
            Your account is used only for the AI workload adviser on model and technique briefings.
          </p>
        ) : (
          <p>
            Sign in with your email to use the AI workload adviser. We email you a one-time link, so
            there is no password to remember.
          </p>
        )}
      </div>

      {!ready ? (
        <div className={panelClass} aria-busy="true">
          <p className="m-0 flex items-center gap-2 text-[var(--to-ink-2)]">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Checking your
            sign-in…
          </p>
        </div>
      ) : session ? (
        <div className={panelClass}>
          <p className="m-0 flex items-start gap-2 text-[var(--to-ink)]">
            <UserRoundCheck
              className="mt-0.5 size-5 shrink-0 text-[var(--to-saving)]"
              aria-hidden="true"
            />
            <span>
              Signed in as{" "}
              <strong className="break-all">{session.user.email ?? "your account"}</strong>.
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            {redirect ? (
              <Button asChild>
                <a href={target}>Continue where you left off</a>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/library">Browse the library</Link>
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => void signOut()} disabled={busy}>
              {busy ? <LoaderCircle className="animate-spin" /> : <LogOut />} Sign out
            </Button>
          </div>
          {error && (
            <p className={alertClass} role="alert">
              {error}
            </p>
          )}
        </div>
      ) : sentTo ? (
        <div className={panelClass} role="status">
          <h2 className="m-0 flex items-center gap-2 text-[var(--to-ink)]">
            <MailCheck className="size-5 shrink-0 text-[var(--to-saving)]" aria-hidden="true" />
            Check your email
          </h2>
          <p className="m-0 text-[var(--to-ink)]">
            We sent a sign-in link to <strong className="break-all">{sentTo}</strong>. Open it to
            finish signing in.
          </p>
          <p className="m-0 text-sm text-[var(--to-ink-2)]">
            No email after a few minutes? Check your spam folder, then send the link again.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void sendLink(sentTo)}
              disabled={busy}
            >
              {busy ? <LoaderCircle className="animate-spin" /> : <Mail />} Send the link again
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSentTo(null);
                setError("");
              }}
            >
              Use a different email
            </Button>
          </div>
          {error && (
            <p className={alertClass} role="alert">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className={panelClass}>
          {linkError && (
            <p className={alertClass} role="alert">
              {linkError}
            </p>
          )}
          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2 font-semibold text-[var(--to-ink)]">
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <div>
              <Button type="submit" disabled={busy}>
                {busy ? <LoaderCircle className="animate-spin" /> : <Mail />} Email me a sign-in
                link
              </Button>
            </div>
          </form>
          {error && (
            <p className={alertClass} role="alert">
              {error}
            </p>
          )}
          <p className="m-0 text-sm text-[var(--to-ink-2)]">
            Your email address is used only to sign you in. Reading lists stay in this browser and
            are not linked to your account.
          </p>
        </div>
      )}
    </section>
  );
}
