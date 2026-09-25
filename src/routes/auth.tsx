import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type Search = { mode?: "signin" | "signup"; redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    mode: search['mode'] === "signup" ? "signup" : "signin",
    ...(typeof search['redirect'] === "string" && search['redirect'].startsWith("/")
      ? { redirect: search['redirect'] }
      : {}),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Al-Jāmiʿ al-Kāmil" },
      {
        name: "description",
        content:
          "Create an account or sign in to save bookmarks in Al-Jāmiʿ al-Kāmil. Reading and searching the hadith library remains free and open to everyone.",
      },
      { property: "og:title", content: "Sign in — Al-Jāmiʿ al-Kāmil" },
      {
        property: "og:description",
        content: "Create a free reader account to save hadith bookmarks across your devices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup" | "reset" | "update">(
    search.mode ?? "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  // Recovery links land back on /auth with the token in the URL hash; the
  // client picks it up and fires PASSWORD_RECOVERY, which switches the form
  // to setting a new password.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      setPending(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Check your email for a password reset link.");
      setMode("signin");
      return;
    }

    if (mode === "update") {
      const { error } = await supabase.auth.updateUser({ password });
      setPending(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated.");
      navigate({ to: search.redirect ?? "/bookmarks" });
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setPending(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        toast.success("Check your email to confirm your account, then sign in.");
        setMode("signin");
        return;
      }
      toast.success("Account created.");
      navigate({ to: search.redirect ?? "/bookmarks" });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        toast.error("Your email isn't confirmed yet.", {
          description: "Open the confirmation link we emailed you, or resend it.",
          action: {
            label: "Resend email",
            onClick: async () => {
              const { error: resendError } = await supabase.auth.resend({
                type: "signup",
                email,
                options: { emailRedirectTo: window.location.origin },
              });
              if (resendError) toast.error(resendError.message);
              else toast.success("Confirmation email sent. Check your inbox and spam folder.");
            },
          },
        });
        return;
      }
      if (/invalid login credentials/i.test(error.message)) {
        toast.error("Email or password is incorrect.", {
          description: "Use “Forgot password?” to reset it if needed.",
        });
        return;
      }
      toast.error(error.message);
      return;
    }
    navigate({ to: search.redirect ?? "/bookmarks" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-lg border border-border bg-card p-6"
        >
          <div>
            <h1 className="text-xl font-semibold">
              {mode === "signup"
                ? "Create an account"
                : mode === "reset"
                  ? "Reset your password"
                  : mode === "update"
                    ? "Set a new password"
                    : "Sign in"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The library is free to read without an account. Sign in only to save bookmarks
              across your devices.
            </p>
          </div>
          {mode !== "update" ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          ) : null}
          {mode !== "reset" ? (
            <div className="space-y-2">
              <Label htmlFor="password">
                {mode === "update" ? "New password" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "signup" || mode === "update" ? "new-password" : "current-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Working…"
              : mode === "signup"
                ? "Create account"
                : mode === "reset"
                  ? "Send reset link"
                  : mode === "update"
                    ? "Update password"
                    : "Sign in"}
          </Button>
          {mode === "signin" || mode === "signup" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </Button>
              {mode === "signin" ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode("reset")}
                >
                  Forgot password?
                </Button>
              ) : null}
            </>
          ) : null}
          {mode === "reset" ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setMode("signin")}
            >
              Back to sign in
            </Button>
          ) : null}
        </form>
        <Button asChild variant="outline" className="w-full">
          <Link to="/">
            <ArrowLeft aria-hidden /> Back to the library
          </Link>
        </Button>
      </div>
    </div>
  );
}
