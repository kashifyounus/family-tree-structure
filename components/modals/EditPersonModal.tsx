"use client";

import { useState, useTransition } from "react";
import type { Gender, PrivacyLevel } from "@prisma/client";
import { updatePerson, updateUnion } from "@/actions/familyTree";
import type { PersonDetails } from "@/types/family";
import { Modal } from "@/components/modals/Modal";
import { inputClassName, labelClassName } from "@/components/modals/formStyles";

type EditPersonModalProps = {
  open: boolean;
  onClose: () => void;
  details: PersonDetails;
  onSuccess: () => void;
};

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function EditPersonModal({
  open,
  onClose,
  details,
  onSuccess,
}: EditPersonModalProps) {
  const { person, unions } = details;
  const primaryUnion = unions[0];
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    startTransition(async () => {
      setError(null);
      try {
        await updatePerson({
          personId: person.id,
          firstName: String(fd.get("firstName") ?? ""),
          lastName: String(fd.get("lastName") ?? ""),
          gender: fd.get("gender") as Gender,
          birthDate: String(fd.get("birthDate") || "") || null,
          deathDate: String(fd.get("deathDate") || "") || null,
          photoUrl: String(fd.get("photoUrl") || "") || null,
          bio: String(fd.get("bio") || "") || null,
          isLiving: fd.get("isLiving") === "on",
          privacyLevel: fd.get("privacyLevel") as PrivacyLevel,
        });

        if (primaryUnion) {
          await updateUnion({
            unionId: primaryUnion.id,
            marriageDate: String(fd.get("marriageDate") || "") || null,
            divorceDate: String(fd.get("divorceDate") || "") || null,
            isActive: fd.get("unionActive") === "on",
          });
        }

        onSuccess();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save profile");
      }
    });
  };

  return (
    <Modal
      open={open}
      title="Edit profile"
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
            form="edit-person-form"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      }
    >
      <form
        id="edit-person-form"
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
            <label className={labelClassName} htmlFor="edit-firstName">
              First name
            </label>
            <input
              id="edit-firstName"
              name="firstName"
              required
              defaultValue={person.firstName}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-lastName">
              Last name
            </label>
            <input
              id="edit-lastName"
              name="lastName"
              required
              defaultValue={person.lastName}
              className={inputClassName}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="edit-gender">
              Gender
            </label>
            <select
              id="edit-gender"
              name="gender"
              defaultValue={person.gender}
              className={inputClassName}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-privacyLevel">
              Privacy
            </label>
            <select
              id="edit-privacyLevel"
              name="privacyLevel"
              defaultValue={person.privacyLevel}
              className={inputClassName}
            >
              <option value="PUBLIC">Public</option>
              <option value="TREE">Tree members</option>
              <option value="IMMEDIATE_FAMILY">Immediate family</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="edit-birthDate">
              Birth date
            </label>
            <input
              id="edit-birthDate"
              name="birthDate"
              type="date"
              defaultValue={toDateInput(person.birthDate)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-deathDate">
              Death date
            </label>
            <input
              id="edit-deathDate"
              name="deathDate"
              type="date"
              defaultValue={toDateInput(person.deathDate)}
              className={inputClassName}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isLiving"
            defaultChecked={person.isLiving}
          />
          Living
        </label>
        <div>
          <label className={labelClassName} htmlFor="edit-photoUrl">
            Photo URL
          </label>
          <input
            id="edit-photoUrl"
            name="photoUrl"
            type="url"
            defaultValue={person.photoUrl ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="edit-bio">
            Bio
          </label>
          <textarea
            id="edit-bio"
            name="bio"
            rows={3}
            defaultValue={person.bio ?? ""}
            className={inputClassName}
          />
        </div>

        {primaryUnion && (
          <fieldset className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
            <legend className="px-1 text-xs font-medium text-zinc-600">
              Primary union ({primaryUnion.partner1.firstName} &{" "}
              {primaryUnion.partner2.firstName})
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName} htmlFor="edit-marriageDate">
                  Marriage date
                </label>
                <input
                  id="edit-marriageDate"
                  name="marriageDate"
                  type="date"
                  defaultValue={toDateInput(primaryUnion.marriageDate)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="edit-divorceDate">
                  Divorce date
                </label>
                <input
                  id="edit-divorceDate"
                  name="divorceDate"
                  type="date"
                  defaultValue={toDateInput(primaryUnion.divorceDate)}
                  className={inputClassName}
                />
              </div>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="unionActive"
                defaultChecked={primaryUnion.isActive}
              />
              Union active
            </label>
          </fieldset>
        )}
      </form>
    </Modal>
  );
}
