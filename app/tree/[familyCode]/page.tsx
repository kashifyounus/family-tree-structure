import Link from "next/link";
import { notFound } from "next/navigation";
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
      <nav className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="text-sm font-semibold text-indigo-600">
          ← Kinship Graph
        </Link>
        <span className="text-xs text-zinc-500">Pan · zoom · tap nodes</span>
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
