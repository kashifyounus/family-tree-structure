"use client";

type TreeExpansionToolbarProps = {
  canLoadParents: boolean;
  canLoadChildren: boolean;
  canLoadSiblings: boolean;
  onLoadParents: () => void;
  onLoadChildren: () => void;
  onLoadSiblings: () => void;
  onCenterMarriage: () => void;
  loading?: boolean;
};

export function TreeExpansionToolbar({
  canLoadParents,
  canLoadChildren,
  canLoadSiblings,
  onLoadParents,
  onLoadChildren,
  onLoadSiblings,
  onCenterMarriage,
  loading,
}: TreeExpansionToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white/95 p-2 dark:border-zinc-800 dark:bg-zinc-950/95"
      data-testid="tree-expansion-toolbar"
    >
      <button
        type="button"
        disabled={!canLoadParents || loading}
        onClick={onLoadParents}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
      >
        Load parents
      </button>
      <button
        type="button"
        disabled={!canLoadSiblings || loading}
        onClick={onLoadSiblings}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
      >
        Load siblings
      </button>
      <button
        type="button"
        disabled={!canLoadChildren || loading}
        onClick={onLoadChildren}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
      >
        Load children
      </button>
      <button
        type="button"
        onClick={onCenterMarriage}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Center on my marriage
      </button>
    </div>
  );
}
