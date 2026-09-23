import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { APP_NAME } from "@/lib/appMeta";

export function RecordShell({
  treeCode,
  children,
}: {
  treeCode?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-[#fbf7f0] dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold tracking-wide text-emerald-900 dark:text-emerald-200">
              {APP_NAME}
            </Link>
            <nav aria-label="Primary" className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/dashboard" className="text-stone-700 hover:text-emerald-800 dark:text-stone-300">
                Family records
              </Link>
              <Link href="/people/new" className="text-stone-700 hover:text-emerald-800 dark:text-stone-300">
                Create person
              </Link>
              {treeCode && (
                <Link
                  href={`/tree/${treeCode}`}
                  className="text-stone-700 hover:text-emerald-800 dark:text-stone-300"
                >
                  Family tree
                </Link>
              )}
              {treeCode && (
                <Link
                  href={`/tree/${treeCode}/reports`}
                  className="text-stone-700 hover:text-emerald-800 dark:text-stone-300"
                >
                  Insights
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-emerald-800 dark:hover:text-emerald-200">
                {item.label}
              </Link>
            ) : (
              <span className="text-stone-800 dark:text-stone-100">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  meta,
  actions,
}: {
  title: string;
  subtitle?: string | null;
  meta?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-stone-800">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 font-urdu text-xl leading-relaxed text-stone-700 dark:text-stone-200">
            {subtitle}
          </p>
        )}
        {meta && <p className="mt-2 text-sm text-stone-500">{meta}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "neutral" | "current" | "ended" | "living" | "deceased";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
    current: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    ended: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
    living: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    deceased: "bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-100",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 px-4 py-6 text-sm dark:border-stone-700">
      <p className="font-medium text-stone-800 dark:text-stone-100">{title}</p>
      <p className="mt-1 text-stone-500">{body}</p>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      {message}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 outline-none ring-emerald-800/30 focus:border-emerald-800 focus:ring-2 sm:text-sm dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";

export function PrimaryButton({
  children,
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  type = "button",
  disabled,
  onClick,
  href,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "inline-flex items-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100";
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
