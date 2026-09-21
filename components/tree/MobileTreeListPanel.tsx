"use client";

import type { FamilyGraph } from "@/types/family";
import clsx from "clsx";

type MobileTreeListPanelProps = {
  graph: FamilyGraph;
  selectedId: string;
  onSelect: (personId: string) => void;
};

export function MobileTreeListPanel({
  graph,
  selectedId,
  onSelect,
}: MobileTreeListPanelProps) {
  const people = graph.nodes
    .map((n) => ({
      person: n.data.person,
      isFocal: n.data.isFocal,
    }))
    .filter((x) => x.person)
    .sort((a, b) => {
      if (a.isFocal) return -1;
      if (b.isFocal) return 1;
      return `${a.person!.lastName}`.localeCompare(`${b.person!.lastName}`);
    });

  return (
    <div
      className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:hidden"
      data-testid="mobile-tree-list"
    >
      <p className="sticky top-0 border-b border-zinc-100 bg-white px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950">
        Family members ({people.length}) — tap to open profile
      </p>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {people.map(({ person, isFocal }) => {
          if (!person) return null;
          const selected = person.id === selectedId;
          return (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => onSelect(person.id)}
                className={clsx(
                  "flex w-full flex-col px-4 py-3 text-left touch-manipulation",
                  selected ? "bg-indigo-50 dark:bg-indigo-950/30" : "",
                )}
              >
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {person.firstName} {person.lastName}
                  {isFocal && (
                    <span className="ml-2 text-[10px] font-medium text-indigo-600">
                      focal
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                  {person.familyCode}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
