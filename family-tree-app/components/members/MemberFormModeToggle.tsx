import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { copy } from "@/content/businessCopy";

export type MemberFormMode = "create" | "link";

type MemberFormModeToggleProps = {
  mode: MemberFormMode;
  onChange: (mode: MemberFormMode) => void;
};

export function MemberFormModeToggle({ mode, onChange }: MemberFormModeToggleProps) {
  return (
    <SegmentedControl
      value={mode}
      onChange={onChange}
      options={[
        { value: "create", label: copy.profile.memberFormCreate },
        { value: "link", label: copy.profile.memberFormLink },
      ]}
    />
  );
}
