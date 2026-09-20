"use client";

import { X } from "lucide-react";
import type { PersonDetails } from "@/types/family";

type PersonDrawerProps = {
  details: PersonDetails | null;
  open: boolean;
  onClose: () => void;
};

function RelativeList({
  title,
  items,
}: {
  title: string;
  items: { firstName: string; lastName: string; familyCode: string; kinshipLabel: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((r) => (
          <li
            key={r.familyCode}
            className="flex items-center justify-between rounded-lg bg-zinc-50 px-2 py-1.5 text-sm dark:bg-zinc-800/50"
          >
            <span>
              {r.firstName} {r.lastName}
              <span className="ml-2 text-xs text-zinc-500">{r.kinshipLabel}</span>
            </span>
            <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
              {r.familyCode}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PersonDrawer({ details, open, onClose }: PersonDrawerProps) {
  if (!open || !details) return null;

  const { person, unions, computed } = details;
  const birth = person.birthDate
    ? new Date(person.birthDate).toLocaleDateString()
    : "—";
  const death =
    person.deathDate ? new Date(person.deathDate).toLocaleDateString() : null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        role="dialog"
        aria-labelledby="person-drawer-title"
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h2
              id="person-drawer-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              {person.firstName} {person.lastName}
            </h2>
            <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              {person.familyCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                {person.gender}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  person.isLiving
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                }`}
              >
                {person.isLiving ? "Living" : "Deceased"}
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Privacy: {person.privacyLevel}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Born</dt>
                <dd>{birth}</dd>
              </div>
              {death && (
                <div>
                  <dt className="text-zinc-500">Died</dt>
                  <dd>{death}</dd>
                </div>
              )}
            </dl>
            {person.bio && (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {person.bio}
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Unions & children
            </h3>
            {unions.length === 0 ? (
              <p className="text-sm text-zinc-500">No unions recorded.</p>
            ) : (
              <ul className="space-y-3">
                {unions.map((u) => (
                  <li
                    key={u.id}
                    className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <p className="text-sm font-medium">
                      {u.partner1.firstName} & {u.partner2.firstName}
                      {!u.isActive && (
                        <span className="ml-2 text-xs text-amber-600">(ended)</span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Order #{u.sequenceOrder + 1}
                      {u.marriageDate &&
                        ` · Married ${new Date(u.marriageDate).getFullYear()}`}
                    </p>
                    {u.children.length > 0 && (
                      <ul className="mt-2 space-y-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                        {u.children.map((c) => (
                          <li
                            key={c.id}
                            className="flex justify-between text-xs"
                          >
                            <span>
                              {c.firstName} {c.lastName}
                              <span className="ml-1 text-zinc-400">
                                ({c.relationshipType})
                              </span>
                            </span>
                            <span className="font-mono text-indigo-600">
                              {c.familyCode}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Computed kinship
            </h3>
            <RelativeList title="Paternal uncles" items={computed.paternalUncles} />
            <RelativeList title="Paternal aunts" items={computed.paternalAunts} />
            <RelativeList title="Maternal uncles" items={computed.maternalUncles} />
            <RelativeList title="Maternal aunts" items={computed.maternalAunts} />
            <RelativeList title="Full siblings" items={computed.fullSiblings} />
            <RelativeList title="Half siblings" items={computed.halfSiblings} />
          </section>
        </div>
      </aside>
    </>
  );
}
