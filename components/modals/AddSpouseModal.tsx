"use client";

import { useState, useTransition } from "react";
import type { Gender } from "@prisma/client";
import { defaultSpouseGender, toUserFacingMessage, ruleMessages } from "@/shared/relationshipRules";
import { createPersonAndUnion } from "@/actions/familyTree";
import { Modal } from "@/components/modals/Modal";
import { inputClassName, labelClassName } from "@/components/modals/formStyles";

type AddSpouseModalProps = {
  open: boolean;
  onClose: () => void;
  personId: string;
  personGender?: Gender;
  defaultLastName?: string;
  onSuccess: (familyCode: string) => void;
};

export function AddSpouseModal({
  open,
  onClose,
  personId,
  personGender = "MALE",
  defaultLastName = "",
  onSuccess,
}: AddSpouseModalProps) {
  const suggestedGender = defaultSpouseGender(personGender) ?? "";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    startTransition(async () => {
      setError(null);
      try {
        const result = await createPersonAndUnion({
          mode: "spouse",
          relatedPersonId: personId,
          firstName: String(fd.get("firstName") ?? ""),
          lastName: String(fd.get("lastName") ?? ""),
          gender: fd.get("gender") as Gender,
          birthDate: String(fd.get("birthDate") || "") || undefined,
          deathDate: String(fd.get("deathDate") || "") || undefined,
          photoUrl: String(fd.get("photoUrl") || "") || undefined,
          bio: String(fd.get("bio") || "") || undefined,
          marriageDate: String(fd.get("marriageDate") || "") || undefined,
        });
        onSuccess(result.familyCode);
        onClose();
      } catch (e) {
        console.error(e);
        setError(toUserFacingMessage(e, ruleMessages.saveRelationship));
      }
    });
  };

  return (
    <Modal
      open={open}
      title="Add spouse"
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
            form="add-spouse-form"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Add spouse"}
          </button>
        </div>
      }
    >
      <form
        id="add-spouse-form"
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
            <label className={labelClassName} htmlFor="spouse-firstName">
              First name
            </label>
            <input
              id="spouse-firstName"
              name="firstName"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="spouse-lastName">
              Last name
            </label>
            <input
              id="spouse-lastName"
              name="lastName"
              required
              defaultValue={defaultLastName}
              className={inputClassName}
            />
          </div>
        </div>
        <div>
          <label className={labelClassName} htmlFor="spouse-gender">
            Gender
          </label>
          <select
            id="spouse-gender"
            name="gender"
            required
            className={inputClassName}
            defaultValue={suggestedGender}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="spouse-birthDate">
              Birth date
            </label>
            <input
              id="spouse-birthDate"
              name="birthDate"
              type="date"
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="spouse-deathDate">
              Death date
            </label>
            <input
              id="spouse-deathDate"
              name="deathDate"
              type="date"
              className={inputClassName}
            />
          </div>
        </div>
        <div>
          <label className={labelClassName} htmlFor="spouse-marriageDate">
            Marriage date
          </label>
          <input
            id="spouse-marriageDate"
            name="marriageDate"
            type="date"
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="spouse-photoUrl">
            Photo URL
          </label>
          <input
            id="spouse-photoUrl"
            name="photoUrl"
            type="url"
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="spouse-bio">
            Bio
          </label>
          <textarea
            id="spouse-bio"
            name="bio"
            rows={3}
            className={inputClassName}
          />
        </div>
      </form>
    </Modal>
  );
}
