import { AddRelationSheet } from "@/components/members/AddRelationSheet";
import { CoupleParentPickerSheet } from "@/components/parents/CoupleParentPickerSheet";
import { copy } from "@/content/businessCopy";
import type { PersonBundle } from "@/lib/data/personService";
import type { Gender, MemberRecord } from "@/lib/data/types";
import type { FieldErrors } from "@/lib/forms/fieldErrors";
import type { BriefMember } from "@/components/members/ExistingMemberPicker";
import type { ParentCoupleRow } from "@/lib/db/parentCouples";

type MemberProfileRelationSheetsProps = {
  member: MemberRecord;
  bundle: PersonBundle;
  localPeople: BriefMember[];
  marriageOptions: { id: string; label: string }[];
  childExcludeIds: string[];
  parentCoupleRows: ParentCoupleRow[];
  fieldErrors: FieldErrors;
  defaultSpouseGender: Gender;
  spouseOpen: boolean;
  childOpen: boolean;
  coupleParentsOpen: boolean;
  chUnionId: string;
  onDismissSpouse: () => void;
  onDismissChild: () => void;
  onDismissCoupleParents: () => void;
  onUnionChange: (unionId: string) => void;
  onSubmitCreateSpouse: (payload: {
    firstName: string;
    lastName: string;
    gender: Gender;
    marriageDate?: string;
  }) => void;
  onSubmitLinkSpouse: (memberId: string) => void;
  onSubmitCreateChild: (payload: {
    firstName: string;
    lastName: string;
    gender: Gender;
    birthDate?: string;
    relationshipType?: "BIOLOGICAL" | "ADOPTED" | "STEP";
  }) => void;
  onSubmitLinkChild: (
    memberId: string,
    options?: { relationshipType?: "BIOLOGICAL" | "ADOPTED" | "STEP" },
  ) => void;
  onSubmitLinkChildren?: (
    memberIds: string[],
    options?: { relationshipType?: "BIOLOGICAL" | "ADOPTED" | "STEP" },
  ) => void;
  onSelectParentCouple: (row: ParentCoupleRow) => void;
  relationSaving?: boolean;
};

export function MemberProfileRelationSheets({
  member,
  bundle,
  localPeople,
  marriageOptions,
  childExcludeIds,
  parentCoupleRows,
  fieldErrors,
  defaultSpouseGender,
  spouseOpen,
  childOpen,
  coupleParentsOpen,
  chUnionId,
  onDismissSpouse,
  onDismissChild,
  onDismissCoupleParents,
  onUnionChange,
  onSubmitCreateSpouse,
  onSubmitLinkSpouse,
  onSubmitCreateChild,
  onSubmitLinkChild,
  onSubmitLinkChildren,
  onSelectParentCouple,
  relationSaving = false,
}: MemberProfileRelationSheetsProps) {
  return (
    <>
      <AddRelationSheet
        visible={spouseOpen}
        kind="spouse"
        title={copy.profile.addSpouse}
        members={localPeople}
        excludeIds={[member.id]}
        defaultGender={defaultSpouseGender}
        onDismiss={onDismissSpouse}
        onSubmitCreate={onSubmitCreateSpouse}
        onSubmitLink={onSubmitLinkSpouse}
        submitTestID="member-spouse-save"
        fieldErrors={fieldErrors}
        submitting={relationSaving}
      />

      <AddRelationSheet
        visible={childOpen}
        kind="child"
        title={copy.profile.addChild}
        members={localPeople}
        excludeIds={childExcludeIds}
        marriageOptions={marriageOptions}
        selectedUnionId={chUnionId || marriageOptions[0]?.id}
        onUnionChange={onUnionChange}
        onDismiss={onDismissChild}
        onSubmitCreate={onSubmitCreateChild}
        onSubmitLink={onSubmitLinkChild}
        onSubmitLinkMany={onSubmitLinkChildren}
        submitTestID="member-child-save"
        fieldErrors={fieldErrors}
        submitting={relationSaving}
      />

      <CoupleParentPickerSheet
        visible={coupleParentsOpen}
        title={bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents}
        rows={parentCoupleRows}
        replacingExisting={bundle.parents.length > 0}
        onDismiss={onDismissCoupleParents}
        onSelectCouple={onSelectParentCouple}
      />
    </>
  );
}
