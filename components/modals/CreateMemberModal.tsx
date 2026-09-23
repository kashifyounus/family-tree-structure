"use client";

import { useState, useTransition } from "react";
import type { Gender } from "@prisma/client";
import { createStandalonePerson } from "@/actions/familyTree";
import { Modal } from "@/components/modals/Modal";
import { inputClassName, labelClassName } from "@/components/modals/formStyles";

type CreateMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (familyCode: string) => void;
};

export function CreateMemberModal({
  open,
  onClose,
  onSuccess,
}: CreateMemberModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    startTransition(async () => {
      setError(null);
      try {
        const result = await createStandalonePerson({
          firstName: String(fd.get("firstName") ?? ""),
          lastName: String(fd.get("lastName") ?? ""),
          gender: fd.get("gender") as Gender,
          urduFirstName: String(fd.get("urduFirstName") || "") || undefined,
          urduLastName: String(fd.get("urduLastName") || "") || undefined,
          birthDate: String(fd.get("birthDate") || "") || undefined,
          currentCity: String(fd.get("currentCity") || "") || undefined,
          occupation: String(fd.get("occupation") || "") || undefined,
        });
        onSuccess(result.familyCode);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create member");
      }
    });
  };

  return (
    <Modal
      open={open}
      title="Create new member"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-member-form"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            data-testid="create-member-submit"
          >
            {isPending ? "Creating…" : "Create member"}
          </button>
        </div>
      }
    >
      <form
        id="create-member-form"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit(e.currentTarget);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClassName} htmlFor="cm-first">First name</label>
            <input
              id="cm-first"
              name="firstName"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="cm-last">Last name</label>
            <input
              id="cm-last"
              name="lastName"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="cm-gender">Gender</label>
            <select id="cm-gender" name="gender" className={inputClassName} required>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClassName} htmlFor="cm-birth">Birth date</label>
            <input id="cm-birth" name="birthDate" type="date" className={inputClassName} />
          </div>
          <div>
            <label className={labelClassName} htmlFor="cm-urdu-first">Urdu first name</label>
            <input id="cm-urdu-first" name="urduFirstName" className={inputClassName} />
          </div>
          <div>
            <label className={labelClassName} htmlFor="cm-urdu-last">Urdu last name</label>
            <input id="cm-urdu-last" name="urduLastName" className={inputClassName} />
          </div>
          <div>
            <label className={labelClassName} htmlFor="cm-city">Current city</label>
            <input id="cm-city" name="currentCity" className={inputClassName} />
          </div>
          <div>
            <label className={labelClassName} htmlFor="cm-occupation">Occupation</label>
            <input id="cm-occupation" name="occupation" className={inputClassName} />
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          A unique family code is assigned automatically. Link spouses and children
          from the tree view or by editing this member later.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}
