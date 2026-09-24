import { Input, InputField } from "@/components/ui/input";

type MembersSearchFieldProps = {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

export function MembersSearchField({
  value,
  placeholder,
  onChangeText,
  onSubmit,
}: MembersSearchFieldProps) {
  return (
    <Input className="w-full bg-muted/30">
      <InputField
        testID="members-search"
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
