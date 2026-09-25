import { Input, InputField } from "@/components/ui/input";

type MembersSearchFieldProps = {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  testID?: string;
};

export function MembersSearchField({
  value,
  placeholder,
  onChangeText,
  onSubmit,
  testID = "members-search",
}: MembersSearchFieldProps) {
  return (
    <Input className="w-full min-h-12 rounded-xl bg-muted/30 border-border">
      <InputField
        testID={testID}
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </Input>
  );
}
