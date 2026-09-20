"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getFamilyGraph, getPersonDetails } from "@/actions/familyTree";
import type { FamilyGraph, PersonDetails } from "@/types/family";
import type { AuthContext } from "@/lib/auth";
import { canEditTree } from "@/lib/auth";
import { TreeCanvas } from "@/components/TreeCanvas";
import { PersonDrawer } from "@/components/PersonDrawer";
import { SearchBar } from "@/components/SearchBar";
import { RelationshipCalculator } from "@/components/RelationshipCalculator";
import { AuthPanel } from "@/components/AuthPanel";

type TreeViewProps = {
  familyCode: string;
  initialGraph: FamilyGraph;
  initialDetails: PersonDetails;
  session: AuthContext;
};

export function TreeView({
  familyCode,
  initialGraph,
  initialDetails,
  session,
}: TreeViewProps) {
  const router = useRouter();
  const [graph, setGraph] = useState(initialGraph);
  const [details, setDetails] = useState<PersonDetails>(initialDetails);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [, startTransition] = useTransition();

  const canEdit = canEditTree(session.role);

  const refreshTree = useCallback(() => {
    startTransition(async () => {
      const next = await getPersonDetails(details.person.id);
      if (next) setDetails(next);
      const g = await getFamilyGraph(familyCode);
      if (g) setGraph(g);
      router.refresh();
    });
  }, [details.person.id, familyCode, router]);

  const focusPerson = useCallback(
    (personId: string) => {
      startTransition(async () => {
        const next = await getPersonDetails(personId);
        if (!next) return;
        setDetails(next);
        setDrawerOpen(true);
        const g = await getFamilyGraph(next.person.familyCode);
        if (g) setGraph(g);
      });
    },
    [],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-3 p-4 lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Kinship Graph
            </h1>
            <p className="text-sm text-zinc-500">
              Focal member:{" "}
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {familyCode}
              </span>
            </p>
          </div>
          <SearchBar className="w-full sm:max-w-md" />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <AuthPanel
            session={session}
            onSessionChange={() => router.refresh()}
          />
        </div>
        <div className="min-h-[320px] flex-1">
          <TreeCanvas
            graph={graph}
            onSelectPerson={focusPerson}
            onGraphChange={setGraph}
          />
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
        <RelationshipCalculator focalPersonId={details.person.id} />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium lg:hidden dark:border-zinc-700"
        >
          Open profile drawer
        </button>
      </div>
      <PersonDrawer
        details={details}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        canEdit={canEdit}
        viewer={session}
        onRefresh={refreshTree}
      />
    </div>
  );
}
