"use client";

import { useState, useTransition } from "react";
import {
  getRelationshipBetween,
  listMembersForPicker,
} from "@/actions/familyTree";
import type { RelationshipPath, SearchResult } from "@/types/family";

type RelationshipCalculatorProps = {
  focalPersonId?: string;
};

export function RelationshipCalculator({
  focalPersonId,
}: RelationshipCalculatorProps) {
  const [members, setMembers] = useState<SearchResult[]>([]);
  const [fromId, setFromId] = useState(focalPersonId ?? "");
  const [toId, setToId] = useState("");
  const [path, setPath] = useState<RelationshipPath | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadMembers = () => {
    startTransition(async () => {
      const list = await listMembersForPicker();
      setMembers(list);
      if (!fromId && focalPersonId) setFromId(focalPersonId);
    });
  };

  const calculate = () => {
    if (!fromId || !toId) return;
    startTransition(async () => {
      const result = await getRelationshipBetween(fromId, toId);
      setPath(result);
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Relationship calculator
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        Pick any two members to see how they are connected.
      </p>
      <button
        type="button"
        onClick={loadMembers}
        className="mt-3 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Load member list
      </button>
      {members.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            aria-label="First person"
          >
            <option value="">From…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} ({m.familyCode})
              </option>
            ))}
          </select>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            aria-label="Second person"
          >
            <option value="">To…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} ({m.familyCode})
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="button"
        disabled={!fromId || !toId || isPending}
        onClick={calculate}
        className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Computing…" : "Show path"}
      </button>
      {path && (
        <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/50">
          <p className="font-medium">
            {path.from.firstName} {path.from.lastName} → {path.to.firstName}{" "}
            {path.to.lastName}
          </p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{path.summary}</p>
          {path.steps.length > 0 && (
            <ol className="mt-2 list-decimal pl-4 text-xs text-zinc-500">
              {path.steps.map((s, i) => (
                <li key={i}>
                  Step {i + 1}: ({s.relation})
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
