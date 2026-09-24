import { Text, View, type TextInputProps } from "react-native";

import { Input, InputField } from "@/components/ui/input";

export type FormTextInputProps = TextInputProps & {
  label?: string;
  errorText?: string;
};

/** Gluestack outlined field with label and error line (used across forms). */
export function FormTextInput({
  label,
  errorText,
  style,
  ...props
}: FormTextInputProps) {
  return (
    <View className="gap-1 mb-1 w-full">
      {label ? (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      ) : null}
      <Input
        className={`w-full ${errorText ? "border-destructive" : ""}`}
        isDisabled={props.editable === false}
      >
        <InputField
          {...props}
          style={style}
          placeholderTextColor={undefined}
        />
      </Input>
      {errorText ? (
        <Text className="text-xs text-destructive">{errorText}</Text>
      ) : null}
    </View>
  );
}
