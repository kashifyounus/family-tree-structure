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
    <Input className="w-full bg-muted/30">
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
