import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/SearchBar";

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
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
        <p className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
          Modern family tree
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Kinship Graph
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Polygamy-aware unions, half-siblings, and automatically computed
          paternal and maternal aunts and uncles — built for large, complex
          families.
        </p>

        <div className="mt-10 w-full max-w-md">
          <SearchBar placeholder="Enter family code or name…" />
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
              title: "Union engine",
              body: "Multiple spouses per person with ordered unions and per-union children.",
            },
            {
              title: "Computed kinship",
              body: "Uncles, aunts, and siblings derived from the graph — not manual tags.",
            },
            {
              title: "Focal tree view",
              body: "React Flow canvas with horizontal spouses and expandable branches.",
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
