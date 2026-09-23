import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { APP_NAME, APP_OWNER, APP_TAGLINE, APP_VERSION } from "@/lib/appMeta";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  let sampleCode: string | null = null;
  try {
    const first = await prisma.person.findFirst({
      orderBy: { createdAt: "asc" },
    });
    sampleCode = first?.familyCode ?? null;
  } catch {
    sampleCode = null;
  }

  return (
    <main className="min-h-full bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10 text-center sm:py-16">
        <p className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
          v{APP_VERSION} · {APP_OWNER}
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {APP_NAME}
        </h1>
        <p className="mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
          {APP_TAGLINE}
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3">
          <SearchBar placeholder="Enter family code or name…" />
          <Link
            href="/login"
            className="rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-900 dark:bg-zinc-900 dark:text-indigo-300"
          >
            Sign in · Admin dashboard
          </Link>
        </div>

        {sampleCode ? (
          <Link
            href={`/tree/${sampleCode}`}
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500"
          >
            Open sample tree ({sampleCode})
          </Link>
        ) : (
          <p className="mt-6 text-sm text-amber-700 dark:text-amber-400">
            Database not seeded yet. Run{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              npm run db:seed
            </code>{" "}
            after starting PostgreSQL.
          </p>
        )}

        <ul className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3">
          {[
            {
              title: "People and marriages",
              body: "Record each person once, then add spouses and children without losing earlier marriages.",
            },
            {
              title: "Parents and relatives",
              body: "Link parents, and see siblings, aunts, and uncles from the marriages already recorded.",
            },
            {
              title: "Family tree",
              body: "Move through the tree, open a person, and return to the same branch after you save.",
            },
          ].map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
