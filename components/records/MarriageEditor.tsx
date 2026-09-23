"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Gender, RelationshipType } from "@prisma/client";
import { createPersonAndUnion, updateUnion } from "@/actions/familyTree";
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
  formatRecordDate,
  formatRelationshipLabel,
  inputDate,
  personName,
  spouseTitle,
} from "@/lib/records/format";
import { formatUrduName } from "@/lib/personMapper";
import type { MarriageRecord } from "@/types/family";
import { ruleMessages, toUserFacingMessage } from "@/shared/relationshipRules";

type MarriageEditorProps = {
  marriage: MarriageRecord;
  canEdit: boolean;
};

export function MarriageEditor({ marriage, canEdit }: MarriageEditorProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [addingChild, setAddingChild] = useState(false);
  const saveDates = (form: HTMLFormElement, endMarriage: boolean) => {
    const data = new FormData(form);
    const marriageDate = String(data.get("marriageDate") || "");
    const divorceDate = String(data.get("divorceDate") || "");
    startTransition(async () => {
      setError(null);
      try {
        await updateUnion({
          unionId: marriage.id,
          marriageDate: marriageDate || null,
          divorceDate: endMarriage ? divorceDate || null : divorceDate || null,
          isActive: endMarriage ? false : !divorceDate,
        });
        setNotice(endMarriage ? "This marriage is now recorded as ended. The history is kept." : "Marriage details saved.");
        router.refresh();
      } catch (caught) {
        console.error(caught);
        setError(toUserFacingMessage(caught, ruleMessages.saveMarriage));
      }
    });
  };

  const addChild = (form: HTMLFormElement) => {
    const data = new FormData(form);
    startTransition(async () => {
      setError(null);
      try {
        await createPersonAndUnion({
          mode: "child",
          relatedPersonId: marriage.partner1.id,
          existingUnionId: marriage.id,
          firstName: String(data.get("firstName") ?? "").trim(),
          lastName: String(data.get("lastName") ?? "").trim(),
          gender: String(data.get("gender") || "MALE") as Gender,
          relationshipType: String(data.get("relationshipType") || "BIOLOGICAL") as RelationshipType,
        });
        setNotice("Child added to this marriage.");
        setAddingChild(false);
        router.refresh();
      } catch (caught) {
        console.error(caught);
        setError(toUserFacingMessage(caught, ruleMessages.saveRelationship));
      }
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${personName(marriage.partner1)} and ${personName(marriage.partner2)}`}
        meta="Marriage record"
        actions={
          <>
            <SecondaryButton href={`/people/${marriage.partner1.id}`}>
              View {personName(marriage.partner1)}
            </SecondaryButton>
            <SecondaryButton href={`/people/${marriage.partner2.id}`}>
              View {personName(marriage.partner2)}
            </SecondaryButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <PartnerCard
          role={spouseTitle(marriage.partner2.gender, marriage.partner1.gender)}
          person={marriage.partner1}
        />
        <PartnerCard
          role={spouseTitle(marriage.partner1.gender, marriage.partner2.gender)}
          person={marriage.partner2}
        />
      </div>

      <SectionCard title="Marriage information">
        <div className="mb-4 flex flex-wrap gap-2">
          <StatusBadge tone={marriage.isActive ? "current" : "ended"}>
            {marriage.isActive ? "Current marriage" : "Previous marriage"}
          </StatusBadge>
          {!marriage.partner1.isLiving && <StatusBadge tone="deceased">{personName(marriage.partner1)} is deceased</StatusBadge>}
          {!marriage.partner2.isLiving && <StatusBadge tone="deceased">{personName(marriage.partner2)} is deceased</StatusBadge>}
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Marriage date</dt>
            <dd className="font-medium">{formatRecordDate(marriage.marriageDate)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Divorce date</dt>
            <dd className="font-medium">{marriage.divorceDate ? formatRecordDate(marriage.divorceDate) : "Not recorded"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Death of {personName(marriage.partner1)}</dt>
            <dd className="font-medium">{marriage.partner1.deathDate ? formatRecordDate(marriage.partner1.deathDate) : "Living"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Death of {personName(marriage.partner2)}</dt>
            <dd className="font-medium">{marriage.partner2.deathDate ? formatRecordDate(marriage.partner2.deathDate) : "Living"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-stone-500">
          Death is recorded on each person. Ending this marriage keeps the record and the children.
        </p>
        {notice && <p role="status" className="mt-3 text-sm text-emerald-800 dark:text-emerald-200">{notice}</p>}
        <ErrorNote message={error} />
        {canEdit && (
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const end = event.currentTarget.dataset.endMarriage === "true";
              const divorceDate = String(new FormData(event.currentTarget).get("divorceDate") || "");
              if (end && !divorceDate) {
                setError("Enter a divorce date to record that this marriage has ended.");
                return;
              }
              saveDates(event.currentTarget, end);
            }}
          >
            <Field label="Marriage date" htmlFor="marriageDate">
              <input id="marriageDate" name="marriageDate" type="date" defaultValue={inputDate(marriage.marriageDate)} className={fieldClass} />
            </Field>
            <Field label="Divorce date" htmlFor="divorceDate" hint="Required when you mark the marriage as ended.">
              <input id="divorceDate" name="divorceDate" type="date" defaultValue={inputDate(marriage.divorceDate)} className={fieldClass} />
            </Field>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <PrimaryButton
                type="submit"
                disabled={pending}
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  if (form) form.dataset.endMarriage = "false";
                }}
              >
                {pending ? "Saving…" : "Save marriage"}
              </PrimaryButton>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  if (form) form.dataset.endMarriage = "true";
                }}
              >
                Mark marriage as ended
              </button>
            </div>
          </form>
        )}
      </SectionCard>

      <SectionCard
        title="Children"
        actions={
          canEdit ? (
            <SecondaryButton type="button" onClick={() => setAddingChild((value) => !value)}>
              Add child
            </SecondaryButton>
          ) : undefined
        }
      >
        {marriage.children.length === 0 ? (
          <EmptyState title="No children recorded" body="Children added here stay attached to this marriage, including after a divorce." />
        ) : (
          <ul className="space-y-2 text-sm">
            {marriage.children.map((child) => (
              <li key={child.id} className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/people/${child.id}`} className="font-medium hover:underline">
                  {personName(child)}
                </Link>
                <span className="text-stone-500">{formatRelationshipLabel(child.relationshipType)}</span>
              </li>
            ))}
          </ul>
        )}
        {addingChild && canEdit && (
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              addChild(event.currentTarget);
            }}
          >
            <Field label="Given name" htmlFor="child-first" required>
              <input id="child-first" name="firstName" required className={fieldClass} />
            </Field>
            <Field label="Family name" htmlFor="child-last" required>
              <input id="child-last" name="lastName" required defaultValue={marriage.partner1.lastName} className={fieldClass} />
            </Field>
            <Field label="Gender" htmlFor="child-gender" required>
              <select id="child-gender" name="gender" required defaultValue="MALE" className={fieldClass}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Relationship" htmlFor="child-type">
              <select id="child-type" name="relationshipType" defaultValue="BIOLOGICAL" className={fieldClass}>
                <option value="BIOLOGICAL">Biological</option>
                <option value="ADOPTED">Adopted</option>
                <option value="STEP">Step</option>
              </select>
            </Field>
            <PrimaryButton type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save child"}
            </PrimaryButton>
          </form>
        )}
      </SectionCard>
    </div>
  );
}

function PartnerCard({
  role,
  person,
}: {
  role: string;
  person: MarriageRecord["partner1"];
}) {
  const urdu = formatUrduName(person);
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{role}</p>
      <h2 className="mt-1 text-lg font-semibold">
        <Link href={`/people/${person.id}`} className="hover:underline">
          {personName(person)}
        </Link>
      </h2>
      {urdu && <p className="font-urdu text-lg">{urdu}</p>}
      <p className="mt-2 text-sm text-stone-500">
        {person.isLiving ? "Living" : `Died ${formatRecordDate(person.deathDate)}`}
      </p>
    </article>
  );
}
