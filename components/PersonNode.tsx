"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import clsx from "clsx";
import type { PersonSummary } from "@/types/family";
import { formatUrduName } from "@/lib/personMapper";
import { UrduText } from "@/components/UrduText";

export type PersonNodeData = {
  person?: PersonSummary;
  isFocal?: boolean;
  isDeceased?: boolean;
  hasUnexpandedParents?: boolean;
  hasUnexpandedChildren?: boolean;
  hasUnexpandedSiblings?: boolean;
  onExpandBranch?: (direction: "up" | "down" | "both") => void;
};

export function PersonNode({
  data,
}: NodeProps<Node<PersonNodeData>>) {
  const nodeData = data;
  const person = nodeData.person;
  if (!person) return null;

  const initials = `${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`;

  return (
    <div
      className={clsx(
        "min-w-[120px] max-w-[160px] rounded-xl border-2 bg-white px-2.5 py-2 shadow-md transition-shadow sm:min-w-[140px] dark:bg-zinc-900",
        nodeData.isFocal
          ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900"
          : "border-zinc-200 dark:border-zinc-700",
        nodeData.isDeceased && "opacity-75",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-400" />
      <div className="flex items-center gap-2">
        <div
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            nodeData.isDeceased
              ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
          )}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {person.firstName} {person.lastName}
            {formatUrduName(person) ? (
              <>
                {" · "}
                <UrduText>{formatUrduName(person)}</UrduText>
              </>
            ) : null}
          </p>
          <p className="truncate text-[10px] font-mono text-zinc-500">
            {person.familyCode}
          </p>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {nodeData.isDeceased && (
          <span className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Deceased
          </span>
        )}
        {nodeData.hasUnexpandedParents && (
          <button
            type="button"
            className="touch-manipulation rounded bg-amber-100 px-2 py-1 text-[9px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200"
            title="Load more ancestors"
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onExpandBranch?.("up");
            }}
          >
            ↑ Ancestors
          </button>
        )}
        {nodeData.hasUnexpandedChildren && (
          <button
            type="button"
            className="touch-manipulation rounded bg-sky-100 px-2 py-1 text-[9px] font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-200"
            title="Load more descendants"
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onExpandBranch?.("down");
            }}
          >
            ↓ Descendants
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400" />
      <Handle type="source" position={Position.Right} id="spouse" className="!bg-rose-400" />
      <Handle type="target" position={Position.Left} id="spouse-in" className="!bg-rose-400" />
    </div>
  );
}
