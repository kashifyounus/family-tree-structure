"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Gender, RelationshipType } from "@prisma/client";
import {
  createPersonAndUnion,
  linkExistingChild,
  linkExistingSpouse,
  searchMembers,
  setParents,
} from "@/actions/familyTree";
import { CreatePersonForm } from "@/components/records/CreatePersonForm";
import {
  EmptyState,
  ErrorNote,
  Field,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusBadge,
  fieldClass,
} from "@/components/records/ui";
import {
  formatGenderLabel,
  formatRecordDate,
  formatRelationshipLabel,
  parentTitle,
  personName,
} from "@/lib/records/format";
import { formatUrduName } from "@/lib/personMapper";
import type { PersonDetails, SearchResult } from "@/types/family";
import {
  defaultSpouseGender,
  ruleMessages,
  toUserFacingMessage,
} from "@/shared/relationshipRules";

type PersonWorkspaceProps = {
  details: PersonDetails;
  canEdit: boolean;
  justCreated?: boolean;
};

export function PersonWorkspace({
  details,
  canEdit,
  justCreated = false,
}: PersonWorkspaceProps) {
  const router = useRouter();
  const { person, unions, parentLinks, computed } = details;
  const [editing, setEditing] = useState(false);
  const [panel, setPanel] = useState<"spouse" | "child" | "parents" | null>(null);
  const current = unions.filter((union) => union.isActive);
  const previous = unions.filter((union) => !union.isActive);
  const urdu = formatUrduName(person);

  return (
    <div className="space-y-5">
      <PageHeader
        title={personName(person)}
        subtitle={urdu}
        meta={`Member reference ${person.familyCode}`}
        actions={
          canEdit ? (
            <>
              <SecondaryButton type="button" onClick={() => setEditing((value) => !value)}>
                {editing ? "Close editor" : "Edit person"}
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => setPanel("spouse")}>
                Add spouse
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => setPanel("child")}>
                Add child
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => setPanel("parents")}>
                {parentLinks.length > 0 ? "Change parents" : "Add parents"}
              </SecondaryButton>
            </>
          ) : undefined
        }
      />

      {justCreated && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
          Person saved. Member reference {person.familyCode}. You can add a marriage from this page.
        </p>
      )}

      {!canEdit && (
        <p className="text-sm text-stone-500">
          Sign in as an editor to change this record. Viewers can read what their role allows.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="neutral">{formatGenderLabel(person.gender)}</StatusBadge>
        <StatusBadge tone={person.isLiving ? "living" : "deceased"}>
          {person.isLiving ? "Living" : "Deceased"}
        </StatusBadge>
        {person.age != null && <StatusBadge tone="neutral">Age {person.age}</StatusBadge>}
      </div>

      {editing && canEdit && (
        <CreatePersonForm
          mode="edit"
          personId={person.id}
          initial={person}
          onCancel={() => setEditing(false)}
        />
      )}

      <SectionCard title="Summary">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Fact label="Date of birth" value={formatRecordDate(person.birthDate)} />
          <Fact label="Date of death" value={person.deathDate ? formatRecordDate(person.deathDate) : "Living"} />
          <Fact label="Place of birth" value={person.birthPlace ?? "Not recorded"} />
          <Fact label="Current city" value={person.currentCity ?? "Not recorded"} />
          <Fact label="Permanent city" value={person.permanentCity ?? "Not recorded"} />
          <Fact label="Home town" value={person.homeTown ?? "Not recorded"} />
          <Fact label="Occupation" value={person.occupation ?? "Not recorded"} />
          <Fact label="Mother tongue" value={person.motherTongue ?? "Not recorded"} />
        </dl>
        {person.bio && <p className="mt-4 text-sm leading-6 text-stone-700 dark:text-stone-300">{person.bio}</p>}
      </SectionCard>

      {panel === "spouse" && canEdit && (
        <SpousePanel
          personId={person.id}
          personGender={person.gender}
          defaultLastName={person.lastName}
          onClose={() => setPanel(null)}
          onDone={() => {
            setPanel(null);
            router.refresh();
          }}
        />
      )}
      {panel === "child" && canEdit && (
        <ChildPanel
          personId={person.id}
          defaultLastName={person.lastName}
          marriages={unions.map((union) => ({
            id: union.id,
            label: `${personName(union.partner1)} and ${personName(union.partner2)}`,
          }))}
          onClose={() => setPanel(null)}
          onDone={() => {
            setPanel(null);
            router.refresh();
          }}
        />
      )}
      {panel === "parents" && canEdit && (
        <ParentsPanel
          personId={person.id}
          existingNames={parentLinks.flatMap((link) => link.partners.map(personName))}
          childshipId={parentLinks[0]?.childshipId}
          onClose={() => setPanel(null)}
          onDone={() => {
            setPanel(null);
            router.refresh();
          }}
        />
      )}

      <SectionCard title="Parents">
        {parentLinks.length === 0 ? (
          <EmptyState
            title="No parents recorded"
            body="Add parents by choosing two people who are, or will become, a married couple."
          />
        ) : (
          <ul className="space-y-3">
            {parentLinks.map((link) => (
              <li key={link.childshipId} className="rounded-lg bg-stone-50 p-3 dark:bg-stone-950">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  {formatRelationshipLabel(link.relationshipType)} child of
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {link.partners.map((partner) => (
                    <Link
                      key={partner.id}
                      href={`/people/${partner.id}`}
                      className="text-sm font-medium text-emerald-900 hover:underline dark:text-emerald-200"
                    >
                      {parentTitle(partner.gender)}: {personName(partner)}
                    </Link>
                  ))}
                  <Link href={`/marriages/${link.unionId}`} className="text-sm text-stone-500 hover:underline">
                    View marriage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <MarriageList title="Current marriages" unions={current} empty="No current marriage is recorded. Another marriage can still be added." />
      <MarriageList title="Previous marriages" unions={previous} empty="No previous marriages are recorded." />

      <SectionCard title="Other relatives">
        <RelativeGroup title="Full siblings" people={computed.fullSiblings} />
        <RelativeGroup title="Half siblings" people={computed.halfSiblings} />
        <RelativeGroup title="Paternal uncles" people={computed.paternalUncles} />
        <RelativeGroup title="Paternal aunts" people={computed.paternalAunts} />
        <RelativeGroup title="Maternal uncles" people={computed.maternalUncles} />
        <RelativeGroup title="Maternal aunts" people={computed.maternalAunts} />
      </SectionCard>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-stone-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function MarriageList({
  title,
  unions,
  empty,
}: {
  title: string;
  unions: PersonDetails["unions"];
  empty: string;
}) {
  return (
    <SectionCard title={title}>
      {unions.length === 0 ? (
        <EmptyState title={title} body={empty} />
      ) : (
        <ul className="space-y-3">
          {unions.map((union) => {
            const otherNote = union.isActive ? "Current marriage" : "Previous marriage";
            return (
              <li key={union.id} className="rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={union.isActive ? "current" : "ended"}>{otherNote}</StatusBadge>
                  <span className="text-sm">
                    {personName(union.partner1)} and {personName(union.partner2)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-500">
                  Marriage date {formatRecordDate(union.marriageDate)}
                  {union.divorceDate ? ` · Divorce date ${formatRecordDate(union.divorceDate)}` : ""}
                </p>
                {union.children.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {union.children.map((child) => (
                      <li key={child.id}>
                        <Link href={`/people/${child.id}`} className="hover:underline">
                          {personName(child)}
                        </Link>
                        <span className="text-stone-500"> · {formatRelationshipLabel(child.relationshipType)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3">
                  <SecondaryButton href={`/marriages/${union.id}`}>View marriage</SecondaryButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

function RelativeGroup({
  title,
  people,
}: {
  title: string;
  people: { id: string; firstName: string; lastName: string }[];
}) {
  if (people.length === 0) return null;
  return (
    <div className="mb-3">
      <h3 className="text-sm font-medium text-stone-500">{title}</h3>
      <ul className="mt-1 space-y-1 text-sm">
        {people.map((person) => (
          <li key={person.id}>
            <Link href={`/people/${person.id}`} className="hover:underline">
              {personName(person)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function usePersonSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, startTransition] = useTransition();
  const search = (query: string) => {
    startTransition(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setResults(await searchMembers(query));
    });
  };
  return { results, pending, search };
}

function SpousePanel({
  personId,
  personGender,
  defaultLastName,
  onClose,
  onDone,
}: {
  personId: string;
  personGender: Gender;
  defaultLastName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const suggested = defaultSpouseGender(personGender);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [spouseId, setSpouseId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const finder = usePersonSearch();
  const genderDefault = useMemo(() => suggested ?? "", [suggested]);

  const submit = (form: HTMLFormElement) => {
    const data = new FormData(form);
    startTransition(async () => {
      setError(null);
      try {
        if (mode === "existing") {
          if (!spouseId) {
            setError("Choose the spouse from the family records.");
            return;
          }
          await linkExistingSpouse({
            personId,
            spouseId,
            marriageDate: String(data.get("marriageDate") || "") || undefined,
          });
        } else {
          const gender = String(data.get("gender") || "") as Gender;
          if (!gender) {
            setError("Select a gender for the spouse.");
            return;
          }
          await createPersonAndUnion({
            mode: "spouse",
            relatedPersonId: personId,
            firstName: String(data.get("firstName") ?? "").trim(),
            lastName: String(data.get("lastName") ?? "").trim(),
            gender,
            marriageDate: String(data.get("marriageDate") || "") || undefined,
          });
        }
        setNotice("Marriage saved. Both people are now linked.");
        onDone();
      } catch (caught) {
        console.error(caught);
        setError(toUserFacingMessage(caught, ruleMessages.saveRelationship));
      }
    });
  };

  return (
    <SectionCard title="Add spouse" description="A given name, family name, and gender are enough to start. You can complete the profile afterwards.">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit(event.currentTarget);
        }}
      >
        <ErrorNote message={error} />
        {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} />
            Create a new person
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "existing"} onChange={() => setMode("existing")} />
            Choose an existing person
          </label>
        </div>
        {mode === "new" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Given name" htmlFor="spouse-first" required>
              <input id="spouse-first" name="firstName" required className={fieldClass} />
            </Field>
            <Field label="Family name" htmlFor="spouse-last" required>
              <input id="spouse-last" name="lastName" required defaultValue={defaultLastName} className={fieldClass} />
            </Field>
            <Field label="Gender" htmlFor="spouse-gender" required hint={suggested ? "Suggested from the selected person. You can change it." : "Select a gender."}>
              <select id="spouse-gender" name="gender" required defaultValue={genderDefault} className={fieldClass}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
          </div>
        ) : (
          <PersonSearch
            label="Spouse"
            results={finder.results}
            pending={finder.pending}
            excludeId={personId}
            onQuery={finder.search}
            onPick={(id) => setSpouseId(id)}
            selectedId={spouseId}
          />
        )}
        <Field label="Marriage date" htmlFor="spouse-marriage">
          <input id="spouse-marriage" name="marriageDate" type="date" className={fieldClass} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save marriage"}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </SectionCard>
  );
}

function ChildPanel({
  personId,
  defaultLastName,
  marriages,
  onClose,
  onDone,
}: {
  personId: string;
  defaultLastName: string;
  marriages: { id: string; label: string }[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [linkExisting, setLinkExisting] = useState(false);
  const [childId, setChildId] = useState("");
  const [secondParentId, setSecondParentId] = useState("");
  const [useExistingMarriage, setUseExistingMarriage] = useState(marriages.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const childSearch = usePersonSearch();
  const parentSearch = usePersonSearch();

  const submit = (form: HTMLFormElement) => {
    const data = new FormData(form);
    startTransition(async () => {
      setError(null);
      try {
        const relationshipType = String(data.get("relationshipType") || "BIOLOGICAL") as RelationshipType;
        if (linkExisting) {
          const unionId = String(data.get("existingUnionId") || "");
          if (!childId || !unionId) {
            setError("Choose the child and the marriage.");
            return;
          }
          await linkExistingChild({ unionId, childId, relationshipType });
        } else if (useExistingMarriage) {
          await createPersonAndUnion({
            mode: "child",
            relatedPersonId: personId,
            firstName: String(data.get("firstName") ?? "").trim(),
            lastName: String(data.get("lastName") ?? "").trim(),
            gender: String(data.get("gender") || "") as Gender,
            relationshipType,
            existingUnionId: String(data.get("existingUnionId") || "") || undefined,
          });
        } else {
          if (!secondParentId) {
            setError("Choose the other parent, or add a spouse first.");
            return;
          }
          await createPersonAndUnion({
            mode: "child",
            relatedPersonId: personId,
            firstName: String(data.get("firstName") ?? "").trim(),
            lastName: String(data.get("lastName") ?? "").trim(),
            gender: String(data.get("gender") || "") as Gender,
            relationshipType,
            secondParentId,
          });
        }
        onDone();
      } catch (caught) {
        console.error(caught);
        setError(toUserFacingMessage(caught, ruleMessages.saveRelationship));
      }
    });
  };

  return (
    <SectionCard
      title="Add child"
      description="A child is recorded against one marriage. If this person has more than one marriage, choose which one."
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit(event.currentTarget);
        }}
      >
        <ErrorNote message={error} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={linkExisting} onChange={(event) => setLinkExisting(event.target.checked)} />
          Link a person who is already in the records
        </label>
        {linkExisting ? (
          <PersonSearch
            label="Child"
            results={childSearch.results}
            pending={childSearch.pending}
            excludeId={personId}
            onQuery={childSearch.search}
            onPick={setChildId}
            selectedId={childId}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Given name" htmlFor="child-first" required>
              <input id="child-first" name="firstName" required className={fieldClass} />
            </Field>
            <Field label="Family name" htmlFor="child-last" required>
              <input id="child-last" name="lastName" required defaultValue={defaultLastName} className={fieldClass} />
            </Field>
            <Field label="Gender" htmlFor="child-gender" required>
              <select id="child-gender" name="gender" required defaultValue="MALE" className={fieldClass}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
          </div>
        )}
        <Field label="Relationship" htmlFor="child-rel">
          <select id="child-rel" name="relationshipType" defaultValue="BIOLOGICAL" className={fieldClass}>
            <option value="BIOLOGICAL">Biological</option>
            <option value="ADOPTED">Adopted</option>
            <option value="STEP">Step</option>
          </select>
        </Field>
        {marriages.length > 0 && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useExistingMarriage}
              onChange={(event) => setUseExistingMarriage(event.target.checked)}
            />
            Add to an existing marriage
          </label>
        )}
        {useExistingMarriage && marriages.length > 0 ? (
          <Field label="Marriage" htmlFor="child-marriage" required>
            <select id="child-marriage" name="existingUnionId" required className={fieldClass} defaultValue={marriages[0]?.id}>
              {marriages.map((marriage) => (
                <option key={marriage.id} value={marriage.id}>
                  {marriage.label}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <PersonSearch
            label="Other parent"
            results={parentSearch.results}
            pending={parentSearch.pending}
            excludeId={personId}
            onQuery={parentSearch.search}
            onPick={setSecondParentId}
            selectedId={secondParentId}
          />
        )}
        <div className="flex flex-wrap gap-2">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save child"}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </SectionCard>
  );
}

function ParentsPanel({
  personId,
  existingNames,
  childshipId,
  onClose,
  onDone,
}: {
  personId: string;
  existingNames: string[];
  childshipId?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [parentAId, setParentAId] = useState("");
  const [parentBId, setParentBId] = useState("");
  const [confirmed, setConfirmed] = useState(existingNames.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const searchA = usePersonSearch();
  const searchB = usePersonSearch();

  const save = (relationshipType: RelationshipType) => {
    if (!confirmed) {
      setError("Confirm that you want to replace the current parents.");
      return;
    }
    startTransition(async () => {
      setError(null);
      try {
        await setParents({
          personId,
          parentAId,
          parentBId,
          relationshipType,
          childshipId,
        });
        onDone();
      } catch (caught) {
        console.error(caught);
        setError(toUserFacingMessage(caught, ruleMessages.saveRelationship));
      }
    });
  };

  return (
    <SectionCard
      title={existingNames.length > 0 ? "Change parents" : "Add parents"}
      description="Parents are the two people in one marriage. Siblings are the other children of that same marriage."
    >
      <div className="space-y-3">
        <ErrorNote message={error} />
        {existingNames.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
            <p>
              This replaces the parent relationship currently recorded with {existingNames.join(" and ")}. Other children of that marriage stay where they are.
            </p>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
              I understand and want to update the parents
            </label>
          </div>
        )}
        <PersonSearch label="First parent" results={searchA.results} pending={searchA.pending} excludeId={personId} onQuery={searchA.search} onPick={setParentAId} selectedId={parentAId} />
        <PersonSearch label="Second parent" results={searchB.results} pending={searchB.pending} excludeId={personId} onQuery={searchB.search} onPick={setParentBId} selectedId={parentBId} />
        <ParentSave relationshipDisabled={pending || !parentAId || !parentBId} onSave={save} onClose={onClose} pending={pending} />
      </div>
    </SectionCard>
  );
}

function ParentSave({
  onSave,
  onClose,
  pending,
  relationshipDisabled,
}: {
  onSave: (type: RelationshipType) => void;
  onClose: () => void;
  pending: boolean;
  relationshipDisabled: boolean;
}) {
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("BIOLOGICAL");
  return (
    <>
      <Field label="Relationship" htmlFor="parent-rel">
        <select
          id="parent-rel"
          className={fieldClass}
          value={relationshipType}
          onChange={(event) => setRelationshipType(event.target.value as RelationshipType)}
        >
          <option value="BIOLOGICAL">Biological</option>
          <option value="ADOPTED">Adopted</option>
          <option value="STEP">Step</option>
        </select>
      </Field>
      <div className="flex flex-wrap gap-2">
        <PrimaryButton type="button" disabled={relationshipDisabled} onClick={() => onSave(relationshipType)}>
          {pending ? "Saving…" : "Save parents"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onClose}>
          Cancel
        </SecondaryButton>
      </div>
    </>
  );
}

function PersonSearch({
  label,
  results,
  pending,
  excludeId,
  onQuery,
  onPick,
  selectedId,
}: {
  label: string;
  results: SearchResult[];
  pending: boolean;
  excludeId: string;
  onQuery: (query: string) => void;
  onPick: (id: string) => void;
  selectedId: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <Field label={label} htmlFor={id} hint="Search by name or member reference.">
      <input id={id} className={fieldClass} onChange={(event) => onQuery(event.target.value)} placeholder="Start typing a name" />
      <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-sm" aria-label={`${label} results`}>
        {pending && <li className="text-stone-500">Searching…</li>}
        {results
          .filter((person) => person.id !== excludeId)
          .map((person) => (
            <li key={person.id}>
              <button
                type="button"
                className={`w-full rounded-md px-2 py-1 text-left hover:bg-stone-100 dark:hover:bg-stone-800 ${selectedId === person.id ? "bg-emerald-50 dark:bg-emerald-950" : ""}`}
                onClick={() => onPick(person.id)}
              >
                {person.firstName} {person.lastName}
                <span className="ml-2 text-stone-500">{person.familyCode}</span>
              </button>
            </li>
          ))}
      </ul>
    </Field>
  );
}
