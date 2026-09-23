"use client";

import type { FamilyGraph } from "@/types/family";
import clsx from "clsx";

type MobileGraphMemberStripProps = {
  graph: FamilyGraph;
  selectedId: string;
  onSelect: (personId: string) => void;
};

export function MobileGraphMemberStrip({
  graph,
  selectedId,
  onSelect,
}: MobileGraphMemberStripProps) {
  const people = graph.nodes
    .map((n) => n.data.person)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (people.length === 0) return null;

  return (
    <div
      className="shrink-0 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:hidden"
      data-testid="mobile-member-strip"
    >
      <p className="px-3 pt-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        Members in view ({people.length})
      </p>
      <ul className="flex gap-2 overflow-x-auto px-3 pb-3 pt-1">
        {people.map((p) => {
          const selected = p.id === selectedId;
          return (
            <li key={p.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                className={clsx(
                  "touch-manipulation rounded-xl border px-3 py-2 text-left text-xs shadow-sm",
                  selected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900",
                )}
              >
                <span className="block font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.firstName} {p.lastName}
                </span>
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                  {p.familyCode}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
