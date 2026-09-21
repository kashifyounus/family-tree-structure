"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "@/actions/auth";
import { inputClassName } from "@/components/modals/formStyles";
import { APP_NAME, APP_OWNER, APP_OWNER_EMAIL } from "@/lib/appMeta";
import { DEMO_AUTH_HINT } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(APP_OWNER_EMAIL);
  const [password, setPassword] = useState("mughal");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4 dark:from-zinc-950 dark:to-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="text-xs font-semibold text-indigo-600">
          ← {APP_NAME}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {APP_OWNER} and authorized contributors can manage family records from
          the dashboard.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              setError(null);
              const res = await signIn(email, password);
              if (!res.ok) {
                setError(res.error ?? "Sign in failed");
                return;
              }
              router.push("/dashboard");
              router.refresh();
            });
          }}
        >
          <div>
            <label className="text-xs font-medium text-zinc-600" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClassName} mt-1`}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClassName} mt-1`}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            data-testid="login-submit"
            disabled={isPending}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isPending ? "Signing in…" : "Sign in to dashboard"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
        <p className="mt-6 text-[11px] leading-relaxed text-zinc-500">
          {DEMO_AUTH_HINT}
        </p>
      </div>
    </main>
  );
}
