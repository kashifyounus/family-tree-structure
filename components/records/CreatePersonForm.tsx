"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Gender, PrivacyLevel } from "@prisma/client";
import { createStandalonePerson, updatePerson } from "@/actions/familyTree";
import {
  ErrorNote,
  Field,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  fieldClass,
} from "@/components/records/ui";
import { assertLifeDates, ruleMessages, toUserFacingMessage } from "@/shared/relationshipRules";

type InitialValues = {
  title?: string | null;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  urduFirstName?: string | null;
  urduLastName?: string | null;
  gender: Gender;
  birthDate?: string | null;
  deathDate?: string | null;
  birthPlace?: string | null;
  occupation?: string | null;
  motherTongue?: string | null;
  currentCity?: string | null;
  permanentCity?: string | null;
  homeTown?: string | null;
  bio?: string | null;
  privacyLevel?: PrivacyLevel;
  photoUrl?: string | null;
};

type CreatePersonFormProps = {
  mode: "create" | "edit";
  personId?: string;
  initial?: InitialValues;
  onCancel?: () => void;
};

const empty: InitialValues = {
  firstName: "",
  lastName: "",
  gender: "MALE",
  privacyLevel: "MEMBERS_ONLY",
};

export function CreatePersonForm({
  mode,
  personId,
  initial = empty,
  onCancel,
}: CreatePersonFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty || pending) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty, pending]);

  const mark = () => setDirty(true);

  const submit = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const gender = String(data.get("gender") ?? "") as Gender;
    const birthDate = String(data.get("birthDate") ?? "");
    const deathDate = String(data.get("deathDate") ?? "");

    if (!firstName || !lastName || !gender) {
      setError("Enter a given name, family name, and gender.");
      return;
    }

    try {
      assertLifeDates(birthDate, deathDate);
    } catch (caught) {
      setError(toUserFacingMessage(caught, ruleMessages.savePerson));
      return;
    }

    const payload = {
      title: String(data.get("title") ?? "") || undefined,
      firstName,
      lastName,
      nickname: String(data.get("nickname") ?? "") || undefined,
      urduFirstName: String(data.get("urduFirstName") ?? "") || undefined,
      urduLastName: String(data.get("urduLastName") ?? "") || undefined,
      gender,
      birthDate: birthDate || undefined,
      deathDate: deathDate || undefined,
      birthPlace: String(data.get("birthPlace") ?? "") || undefined,
      occupation: String(data.get("occupation") ?? "") || undefined,
      motherTongue: String(data.get("motherTongue") ?? "") || undefined,
      currentCity: String(data.get("currentCity") ?? "") || undefined,
      permanentCity: String(data.get("permanentCity") ?? "") || undefined,
      homeTown: String(data.get("homeTown") ?? "") || undefined,
      bio: String(data.get("bio") ?? "") || undefined,
      photoUrl: String(data.get("photoUrl") ?? "") || undefined,
      privacyLevel: String(data.get("privacyLevel") ?? "MEMBERS_ONLY") as PrivacyLevel,
    };

    startTransition(async () => {
      setError(null);
      try {
        if (mode === "create") {
          const result = await createStandalonePerson(payload);
          setDirty(false);
          router.push(`/people/${result.personId}?created=1`);
          router.refresh();
          return;
        }
        if (!personId) {
          setError(ruleMessages.savePerson);
          return;
        }
        await updatePerson({
          personId,
          ...payload,
          title: payload.title ?? null,
          nickname: payload.nickname ?? null,
          urduFirstName: payload.urduFirstName ?? null,
          urduLastName: payload.urduLastName ?? null,
          birthDate: birthDate || null,
          deathDate: deathDate || null,
          birthPlace: payload.birthPlace ?? null,
          occupation: payload.occupation ?? null,
          motherTongue: payload.motherTongue ?? null,
          currentCity: payload.currentCity ?? null,
          permanentCity: payload.permanentCity ?? null,
          homeTown: payload.homeTown ?? null,
          bio: payload.bio ?? null,
          photoUrl: payload.photoUrl ?? null,
        });
        setDirty(false);
        router.refresh();
        onCancel?.();
      } catch (caught) {
        console.error(caught);
        setError(toUserFacingMessage(caught, ruleMessages.savePerson));
      }
    });
  };

  const cancel = () => {
    if (dirty && !window.confirm("Leave this page? The details you entered will not be saved.")) {
      return;
    }
    if (onCancel) onCancel();
    else router.push("/dashboard");
  };

  return (
    <form
      className="space-y-4"
      onChange={mark}
      onSubmit={(event) => {
        event.preventDefault();
        submit(event.currentTarget);
      }}
    >
      <ErrorNote message={error} />
      <SectionCard title="Personal information" description="Required fields are marked with an asterisk.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title">
            <input id="title" name="title" defaultValue={initial.title ?? ""} className={fieldClass} />
          </Field>
          <Field label="Given name" htmlFor="firstName" required>
            <input id="firstName" name="firstName" required defaultValue={initial.firstName} className={fieldClass} />
          </Field>
          <Field label="Family name" htmlFor="lastName" required>
            <input id="lastName" name="lastName" required defaultValue={initial.lastName} className={fieldClass} />
          </Field>
          <Field label="Nickname" htmlFor="nickname">
            <input id="nickname" name="nickname" defaultValue={initial.nickname ?? ""} className={fieldClass} />
          </Field>
          <Field label="Given name in Urdu" htmlFor="urduFirstName">
            <input id="urduFirstName" name="urduFirstName" defaultValue={initial.urduFirstName ?? ""} className={`${fieldClass} font-urdu`} />
          </Field>
          <Field label="Family name in Urdu" htmlFor="urduLastName">
            <input id="urduLastName" name="urduLastName" defaultValue={initial.urduLastName ?? ""} className={`${fieldClass} font-urdu`} />
          </Field>
          <Field label="Gender" htmlFor="gender" required>
            <select id="gender" name="gender" required defaultValue={initial.gender} className={fieldClass}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="Date of birth" htmlFor="birthDate">
            <input id="birthDate" name="birthDate" type="date" defaultValue={initial.birthDate?.slice(0, 10) ?? ""} className={fieldClass} />
          </Field>
          <Field label="Date of death" htmlFor="deathDate" hint="Leave blank if the person is living.">
            <input id="deathDate" name="deathDate" type="date" defaultValue={initial.deathDate?.slice(0, 10) ?? ""} className={fieldClass} />
          </Field>
          <Field label="Place of birth" htmlFor="birthPlace">
            <input id="birthPlace" name="birthPlace" defaultValue={initial.birthPlace ?? ""} className={fieldClass} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Life and residence">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Occupation" htmlFor="occupation">
            <input id="occupation" name="occupation" defaultValue={initial.occupation ?? ""} className={fieldClass} />
          </Field>
          <Field label="Mother tongue" htmlFor="motherTongue">
            <input id="motherTongue" name="motherTongue" defaultValue={initial.motherTongue ?? ""} className={fieldClass} />
          </Field>
          <Field label="Current city" htmlFor="currentCity">
            <input id="currentCity" name="currentCity" defaultValue={initial.currentCity ?? ""} className={fieldClass} />
          </Field>
          <Field label="Permanent city" htmlFor="permanentCity">
            <input id="permanentCity" name="permanentCity" defaultValue={initial.permanentCity ?? ""} className={fieldClass} />
          </Field>
          <Field label="Home town" htmlFor="homeTown">
            <input id="homeTown" name="homeTown" defaultValue={initial.homeTown ?? ""} className={fieldClass} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Record">
        <div className="grid gap-4">
          <Field label="Notes" htmlFor="bio">
            <textarea id="bio" name="bio" rows={4} defaultValue={initial.bio ?? ""} className={fieldClass} />
          </Field>
          <Field label="Who can see personal details" htmlFor="privacyLevel">
            <select id="privacyLevel" name="privacyLevel" defaultValue={initial.privacyLevel ?? "MEMBERS_ONLY"} className={fieldClass}>
              <option value="MEMBERS_ONLY">Family members who are signed in</option>
              <option value="PUBLIC">Anyone who can open the family tree</option>
              <option value="PRIVATE">Editors only</option>
            </select>
          </Field>
          <Field label="Photo address" htmlFor="photoUrl" hint="Optional web address of a portrait.">
            <input id="photoUrl" name="photoUrl" type="url" defaultValue={initial.photoUrl ?? ""} className={fieldClass} />
          </Field>
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Save person" : "Save changes"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={cancel} disabled={pending}>
          Cancel
        </SecondaryButton>
      </div>
      {mode === "create" && (
        <p className="text-sm text-stone-500">
          After this person is saved, you can record a marriage from their page. Leaving now discards what you have typed.
        </p>
      )}
    </form>
  );
}
