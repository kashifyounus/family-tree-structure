"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  deletePerson,
  getPersonDetails,
  listMembersForDashboard,
} from "@/actions/familyTree";
import type { DashboardMember } from "@/types/family";
import { CreateMemberModal } from "@/components/modals/CreateMemberModal";
import { EditPersonModal } from "@/components/modals/EditPersonModal";
import type { PersonDetails } from "@/types/family";
import { inputClassName } from "@/components/modals/formStyles";

type MemberAdminPanelProps = {
  initialMembers: DashboardMember[];
  canEdit: boolean;
  defaultReportsFamilyCode: string;
};

export function MemberAdminPanel({
  initialMembers,
  canEdit,
  defaultReportsFamilyCode,
}: MemberAdminPanelProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editDetails, setEditDetails] = useState<PersonDetails | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshList = useCallback(
    (search = query) => {
      startTransition(async () => {
        const next = await listMembersForDashboard(search);
        setMembers(next);
        router.refresh();
      });
    },
    [query, router],
  );

  const openEdit = (personId: string) => {
    startTransition(async () => {
      setMessage(null);
      const details = await getPersonDetails(personId);
      if (!details) {
        setMessage("Could not load member for editing.");
        return;
      }
      setEditDetails(details);
      setEditOpen(true);
    });
  };

  const handleDelete = (member: DashboardMember) => {
    const label = `${member.firstName} ${member.lastName} (${member.familyCode})`;
    if (
      !window.confirm(
        `Delete ${label}? This cannot be undone. Members with union or child links must be unlinked first.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      setMessage(null);
      try {
        await deletePerson(member.id);
        refreshList();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Delete failed");
      }
    });
  };

  if (!canEdit) {
    return (
      <div
        className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
        data-testid="dashboard-sign-in-prompt"
      >
        <p className="font-semibold">Sign in to manage records</p>
        <p className="mt-2 text-amber-800/90 dark:text-amber-200/90">
          Use the sign-in form above with{" "}
          <span className="font-mono">contributor@mughals.local</span> /{" "}
          <span className="font-mono">contributor</span> (or owner admin) to create,
          update, and delete family members.
        </p>
        <p className="mt-4">
          <Link
            href={`/tree/${defaultReportsFamilyCode}/reports`}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View reports (read-only)
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="member-admin-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") refreshList(query);
            }}
            placeholder="Search by name, code, Urdu…"
            className={`${inputClassName} max-w-md`}
            data-testid="dashboard-member-search"
          />
          <button
            type="button"
            onClick={() => refreshList(query)}
            disabled={isPending}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Search
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            data-testid="dashboard-create-member"
          >
            + New member
          </button>
          <Link
            href={`/tree/${defaultReportsFamilyCode}/reports`}
            className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300"
            data-testid="dashboard-reports-link"
          >
            Open reports
          </Link>
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-[520px] w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3 hidden sm:table-cell">City</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No members match your search.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {m.firstName} {m.lastName}
                    <span className="ml-2 text-xs font-normal text-zinc-500">
                      {m.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                    {m.familyCode}
                  </td>
                  <td className="px-4 py-3 hidden text-zinc-600 sm:table-cell dark:text-zinc-400">
                    {m.currentCity ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/tree/${m.familyCode}`}
                        className="text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Tree
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(m.id)}
                        className="text-xs font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                        data-testid={`edit-member-${m.familyCode}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        className="text-xs font-medium text-red-600 hover:underline"
                        data-testid={`delete-member-${m.familyCode}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateMemberModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => refreshList()}
      />

      {editDetails && (
        <EditPersonModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditDetails(null);
          }}
          details={editDetails}
          onSuccess={() => refreshList()}
        />
      )}
    </div>
  );
}
