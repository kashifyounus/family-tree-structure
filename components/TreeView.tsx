"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { APP_NAME } from "@/lib/appMeta";
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
import { MobileGraphMemberStrip } from "@/components/tree/MobileGraphMemberStrip";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const apply = () => setDrawerOpen(wide.matches);
    apply();
    wide.addEventListener("change", apply);
    return () => wide.removeEventListener("change", apply);
  }, []);

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

  const focusPerson = useCallback((personId: string) => {
    startTransition(async () => {
      const next = await getPersonDetails(personId);
      if (!next) return;
      setDetails(next);
      const narrow = window.matchMedia("(max-width: 1023px)").matches;
      if (narrow) {
        setDrawerOpen(true);
      }
      const g = await getFamilyGraph(next.person.familyCode);
      if (g) setGraph(g);
    });
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[4.25rem] lg:pb-0">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 sm:gap-3 sm:p-4 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden sm:gap-3">
          <div className="shrink-0 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-zinc-900 sm:text-xl dark:text-zinc-50">
                  {APP_NAME}
                </h1>
                <p className="text-xs text-zinc-500 sm:text-sm">
                  Focal{" "}
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {familyCode}
                  </span>
                </p>
              </div>
              <SearchBar className="w-full sm:max-w-md" />
            </div>
            <details className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
              <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-zinc-700 touch-manipulation dark:text-zinc-300">
                Account & sign-in
              </summary>
              <div className="border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
                <AuthPanel
                  session={session}
                  onSessionChange={() => router.refresh()}
                />
              </div>
            </details>
            <div className="hidden rounded-xl border border-zinc-200 bg-white p-3 lg:block dark:border-zinc-800 dark:bg-zinc-950">
              <AuthPanel
                session={session}
                onSessionChange={() => router.refresh()}
              />
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <TreeCanvas
              graph={graph}
              onSelectPerson={focusPerson}
              onGraphChange={setGraph}
            />
          </div>

          <MobileGraphMemberStrip
            graph={graph}
            selectedId={details.person.id}
            onSelect={focusPerson}
          />
        </div>

        <div className="hidden w-80 shrink-0 flex-col gap-3 lg:flex">
          <RelationshipCalculator focalPersonId={details.person.id} />
        </div>
      </div>

      <div className="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-zinc-200 bg-white/95 p-2 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex-1 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white touch-manipulation"
          data-testid="mobile-open-profile"
        >
          {details.person.firstName} · Profile
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
