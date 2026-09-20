"use client";

import { useState, useTransition } from "react";
import type { Gender, PrivacyLevel } from "@prisma/client";
import { updatePerson, updateUnion } from "@/actions/familyTree";
import type { PersonDetails } from "@/types/family";
import { Modal } from "@/components/modals/Modal";
import { inputClassName, labelClassName } from "@/components/modals/formStyles";
import { UrduText } from "@/components/UrduText";

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
          title: String(fd.get("title") || "") || null,
          firstName: String(fd.get("firstName") ?? ""),
          lastName: String(fd.get("lastName") ?? ""),
          nickname: String(fd.get("nickname") || "") || null,
          urduFirstName: String(fd.get("urduFirstName") || "") || null,
          urduLastName: String(fd.get("urduLastName") || "") || null,
          gender: fd.get("gender") as Gender,
          birthDate: String(fd.get("birthDate") || "") || null,
          deathDate: String(fd.get("deathDate") || "") || null,
          photoUrl: String(fd.get("photoUrl") || "") || null,
          bio: String(fd.get("bio") || "") || null,
          occupation: String(fd.get("occupation") || "") || null,
          motherTongue: String(fd.get("motherTongue") || "") || null,
          privacyLevel: fd.get("privacyLevel") as PrivacyLevel,
          birthPlace: String(fd.get("birthPlace") || "") || null,
          currentCity: String(fd.get("currentCity") || "") || null,
          permanentCity: String(fd.get("permanentCity") || "") || null,
          homeTown: String(fd.get("homeTown") || "") || null,
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
            <label className={labelClassName} htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              name="title"
              defaultValue={person.title ?? ""}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-nickname">Nickname</label>
            <input
              id="edit-nickname"
              name="nickname"
              defaultValue={person.nickname ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="edit-firstName">First name</label>
            <input
              id="edit-firstName"
              name="firstName"
              required
              defaultValue={person.firstName}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-lastName">Last name</label>
            <input
              id="edit-lastName"
              name="lastName"
              required
              defaultValue={person.lastName}
              className={inputClassName}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3" dir="rtl">
          <div>
            <label className={labelClassName} htmlFor="edit-urduFirstName">
              <UrduText>Urdu first name</UrduText>
            </label>
            <input
              id="edit-urduFirstName"
              name="urduFirstName"
              defaultValue={person.urduFirstName ?? ""}
              className={`${inputClassName} font-urdu`}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-urduLastName">
              <UrduText>Urdu last name</UrduText>
            </label>
            <input
              id="edit-urduLastName"
              name="urduLastName"
              defaultValue={person.urduLastName ?? ""}
              className={`${inputClassName} font-urdu`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="edit-gender">Gender</label>
            <select
              id="edit-gender"
              name="gender"
              defaultValue={person.gender}
              className={inputClassName}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-privacyLevel">Privacy</label>
            <select
              id="edit-privacyLevel"
              name="privacyLevel"
              defaultValue={person.privacyLevel}
              className={inputClassName}
            >
              <option value="PUBLIC">Public</option>
              <option value="MEMBERS_ONLY">Members only</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="edit-birthDate">Birth date</label>
            <input
              id="edit-birthDate"
              name="birthDate"
              type="date"
              defaultValue={toDateInput(person.birthDate)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-deathDate">Death date</label>
            <input
              id="edit-deathDate"
              name="deathDate"
              type="date"
              defaultValue={toDateInput(person.deathDate)}
              className={inputClassName}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName} htmlFor="edit-birthPlace">Birth place</label>
            <input
              id="edit-birthPlace"
              name="birthPlace"
              defaultValue={person.birthPlace ?? ""}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-currentCity">Current city</label>
            <input
              id="edit-currentCity"
              name="currentCity"
              defaultValue={person.currentCity ?? ""}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-permanentCity">Permanent city</label>
            <input
              id="edit-permanentCity"
              name="permanentCity"
              defaultValue={person.permanentCity ?? ""}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="edit-homeTown">Home town</label>
            <input
              id="edit-homeTown"
              name="homeTown"
              defaultValue={person.homeTown ?? ""}
              className={inputClassName}
            />
          </div>
        </div>
        <div>
          <label className={labelClassName} htmlFor="edit-photoUrl">Photo URL</label>
          <input
            id="edit-photoUrl"
            name="photoUrl"
            type="url"
            defaultValue={person.photoUrl ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="edit-bio">Bio</label>
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
              Primary union
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
