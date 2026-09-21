import Link from "next/link";
import { APP_NAME } from "@/lib/appMeta";
import type { AuthContext } from "@/lib/auth";
import { canEditTree } from "@/lib/auth";
import { AuthPanel } from "@/components/AuthPanel";

type DashboardShellProps = {
  session: AuthContext;
  title: string;
  description?: string;
  sampleFamilyCode: string;
  children: React.ReactNode;
};

export function DashboardShell({
  session,
  title,
  description,
  sampleFamilyCode,
  children,
}: DashboardShellProps) {
  const canEdit = canEditTree(session.role);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wide text-indigo-600"
            >
              {APP_NAME}
            </Link>
            <nav className="mt-2 flex flex-wrap gap-3 text-sm">
              <Link
                href="/dashboard"
                className="font-medium text-zinc-900 dark:text-zinc-50"
              >
                Admin dashboard
              </Link>
              {canEdit && (
                <span className="text-zinc-400">·</span>
              )}
              <Link
                href={`/tree/${sampleFamilyCode}`}
                className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400"
              >
                Tree view
              </Link>
              <Link
                href={`/tree/${sampleFamilyCode}/reports`}
                className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400"
              >
                Reports
              </Link>
            </nav>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <AuthPanel session={session} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
