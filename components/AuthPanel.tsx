"use client";

import { useState, useTransition } from "react";
import { signIn, signOut } from "@/actions/auth";
import { APP_OWNER_EMAIL } from "@/lib/appMeta";
import { DEMO_AUTH_HINT, type AuthContext } from "@/lib/auth";
import { inputClassName } from "@/components/modals/formStyles";

type AuthPanelProps = {
  session: AuthContext;
  onSessionChange?: () => void;
};

export function AuthPanel({ session, onSessionChange }: AuthPanelProps) {
  const [email, setEmail] = useState(APP_OWNER_EMAIL);
  const [password, setPassword] = useState("mughal");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (session.isAuthenticated) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {session.role}
        </span>
        <span className="text-zinc-600 dark:text-zinc-400">
          {session.displayName}
        </span>
        <button
          type="button"
          className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          onClick={() =>
            startTransition(async () => {
              await signOut();
              onSessionChange?.();
            })
          }
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          setError(null);
          const res = await signIn(email, password);
          if (!res.ok) setError(res.error ?? "Sign in failed");
          else onSessionChange?.();
        });
      }}
    >
      <div className="min-w-[140px] flex-1">
        <label className="sr-only" htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          data-testid="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClassName}
          placeholder="Email"
        />
      </div>
      <div className="min-w-[100px] flex-1">
        <label className="sr-only" htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          data-testid="auth-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClassName}
          placeholder="Password"
        />
      </div>
      <button
        type="submit"
        data-testid="auth-submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending ? "…" : "Sign in"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
      <p className="w-full text-[10px] leading-relaxed text-zinc-500">
        {DEMO_AUTH_HINT}
      </p>
    </form>
  );
}
