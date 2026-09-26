import { AddRelationSheet } from "@/components/members/AddRelationSheet";
import { CoupleParentPickerSheet } from "@/components/parents/CoupleParentPickerSheet";
import { copy } from "@/content/businessCopy";
import type { PersonBundle } from "@/lib/data/personService";
import type { Gender, MemberRecord } from "@/lib/data/types";
import type { FieldErrors } from "@/lib/forms/fieldErrors";
import type { ParentSlot } from "@/lib/rules/parentSlots";
import type { BriefMember } from "@/components/members/ExistingMemberPicker";
import type { ParentCoupleRow } from "@/lib/db/parentCouples";

type MemberProfileRelationSheetsProps = {
  member: MemberRecord;
  bundle: PersonBundle;
  localPeople: BriefMember[];
  marriageOptions: { id: string; label: string }[];
  childExcludeIds: string[];
  parentExcludeIds: string[];
  parentCoupleRows: ParentCoupleRow[];
  fieldErrors: FieldErrors;
  defaultSpouseGender: Gender;
  spouseOpen: boolean;
  childOpen: boolean;
  parentsOpen: boolean;
  coupleParentsOpen: boolean;
  chUnionId: string;
  parentSlot: ParentSlot;
  parentStepHint: string | null;
  onDismissSpouse: () => void;
  onDismissChild: () => void;
  onDismissParents: () => void;
  onDismissCoupleParents: () => void;
  onUnionChange: (unionId: string) => void;
  onParentSlotChange: (slot: ParentSlot) => void;
  onLinkParentCouple: () => void;
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
  onSubmitCreateParent: (payload: {
    firstName: string;
    lastName: string;
    birthDate?: string;
    parentSlot?: ParentSlot;
  }) => void;
  onSubmitLinkParent: (memberId: string) => void;
  onSelectParentCouple: (row: ParentCoupleRow) => void;
};

export function MemberProfileRelationSheets({
  member,
  bundle,
  localPeople,
  marriageOptions,
  childExcludeIds,
  parentExcludeIds,
  parentCoupleRows,
  fieldErrors,
  defaultSpouseGender,
  spouseOpen,
  childOpen,
  parentsOpen,
  coupleParentsOpen,
  chUnionId,
  parentSlot,
  parentStepHint,
  onDismissSpouse,
  onDismissChild,
  onDismissParents,
  onDismissCoupleParents,
  onUnionChange,
  onParentSlotChange,
  onLinkParentCouple,
  onSubmitCreateSpouse,
  onSubmitLinkSpouse,
  onSubmitCreateChild,
  onSubmitLinkChild,
  onSubmitCreateParent,
  onSubmitLinkParent,
  onSelectParentCouple,
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
        submitTestID="member-child-save"
        fieldErrors={fieldErrors}
      />

      <AddRelationSheet
        visible={parentsOpen}
        kind="parent"
        title={
          bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents
        }
        members={localPeople}
        excludeIds={parentExcludeIds}
        parentSlot={parentSlot}
        onParentSlotChange={onParentSlotChange}
        parentStepHint={parentStepHint}
        onLinkParentCouple={onLinkParentCouple}
        onDismiss={onDismissParents}
        onSubmitCreate={onSubmitCreateParent}
        onSubmitLink={onSubmitLinkParent}
        submitTestID="member-parent-save"
        fieldErrors={fieldErrors}
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
