import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/appMeta";
import {
  getFamilyGraph,
  getPersonDetailsByFamilyCode,
} from "@/actions/familyTree";
import { getSession } from "@/actions/auth";
import { TreeView } from "@/components/TreeView";

type PageProps = {
  params: Promise<{ familyCode: string }>;
};

export default async function TreePage({ params }: PageProps) {
  const { familyCode } = await params;
  const decoded = decodeURIComponent(familyCode);

  const [graph, details, session] = await Promise.all([
    getFamilyGraph(decoded),
    getPersonDetailsByFamilyCode(decoded),
    getSession(),
  ]);

  if (!graph || !details) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black">
      <nav className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 py-2 sm:px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="text-sm font-semibold text-indigo-600">
          ← {APP_NAME}
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 sm:gap-3">
          <Link
            href="/dashboard"
            className="font-medium text-indigo-600 hover:underline"
          >
            Dashboard
          </Link>
          <Link
            href={`/tree/${decoded}/reports`}
            className="font-medium text-indigo-600 hover:underline"
          >
            Reports
          </Link>
          <span className="hidden sm:inline">Pan · pinch · tap nodes</span>
        </div>
      </nav>
      <TreeView
        familyCode={decoded}
        initialGraph={graph}
        initialDetails={details}
        session={session}
      />
    </div>
  );
}
