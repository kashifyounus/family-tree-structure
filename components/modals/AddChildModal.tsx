"use client";

import { useEffect, useState, useTransition } from "react";
import type { Gender, RelationshipType } from "@prisma/client";
import {
  createPersonAndUnion,
  listMembersForPicker,
  listUnionOptionsForPerson,
} from "@/actions/familyTree";
import { Modal } from "@/components/modals/Modal";
import { inputClassName, labelClassName } from "@/components/modals/formStyles";

type AddChildModalProps = {
  open: boolean;
  onClose: () => void;
  personId: string;
  defaultLastName?: string;
  onSuccess: (familyCode: string) => void;
};

export function AddChildModal({
  open,
  onClose,
  personId,
  defaultLastName = "",
  onSuccess,
}: AddChildModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [unions, setUnions] = useState<{ id: string; label: string }[]>([]);
  const [members, setMembers] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const [u, m] = await Promise.all([
        listUnionOptionsForPerson(personId),
        listMembersForPicker(),
      ]);
      setUnions(u);
      setMembers(m);
    })();
  }, [open, personId]);

  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const unionMode = String(fd.get("unionMode"));
    startTransition(async () => {
      setError(null);
      try {
        const result = await createPersonAndUnion({
          mode: "child",
          relatedPersonId: personId,
          firstName: String(fd.get("firstName") ?? ""),
          lastName: String(fd.get("lastName") ?? ""),
          gender: fd.get("gender") as Gender,
          birthDate: String(fd.get("birthDate") || "") || undefined,
          deathDate: String(fd.get("deathDate") || "") || undefined,
          relationshipType: fd.get("relationshipType") as RelationshipType,
          existingUnionId:
            unionMode === "existing"
              ? String(fd.get("existingUnionId") || "") || undefined
              : undefined,
          secondParentId:
            unionMode === "new"
              ? String(fd.get("secondParentId") || "") || undefined
              : undefined,
        });
        onSuccess(result.familyCode);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add child");
      }
    });
  };

  return (
    <Modal
      open={open}
      title="Add child"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-child-form"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Add child"}
          </button>
        </div>
      }
    >
      <form
        id="add-child-form"
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(e.currentTarget);
        }}
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="child-firstName">
              First name
            </label>
            <input
              id="child-firstName"
              name="firstName"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="child-lastName">
              Last name
            </label>
            <input
              id="child-lastName"
              name="lastName"
              required
              defaultValue={defaultLastName}
              className={inputClassName}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="child-gender">
              Gender
            </label>
            <select
              id="child-gender"
              name="gender"
              required
              className={inputClassName}
              defaultValue="MALE"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClassName} htmlFor="child-relationshipType">
              Relationship
            </label>
            <select
              id="child-relationshipType"
              name="relationshipType"
              className={inputClassName}
              defaultValue="BIOLOGICAL"
            >
              <option value="BIOLOGICAL">Biological</option>
              <option value="ADOPTED">Adopted</option>
              <option value="STEP">Step</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="child-birthDate">
              Birth date
            </label>
            <input
              id="child-birthDate"
              name="birthDate"
              type="date"
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="child-deathDate">
              Death date
            </label>
            <input
              id="child-deathDate"
              name="deathDate"
              type="date"
              className={inputClassName}
            />
          </div>
        </div>

        <fieldset className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
          <legend className="px-1 text-xs font-medium text-zinc-600">
            Parent union
          </legend>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="unionMode"
                value="existing"
                defaultChecked={unions.length > 0}
              />
              Existing union
            </label>
            <select
              name="existingUnionId"
              className={inputClassName}
              disabled={unions.length === 0}
              defaultValue={unions[0]?.id}
            >
              {unions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="unionMode"
                value="new"
                defaultChecked={unions.length === 0}
              />
              New union (second parent)
            </label>
            <select name="secondParentId" className={inputClassName}>
              <option value="">Select second parent…</option>
              {members
                .filter((m) => m.id !== personId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
            </select>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
