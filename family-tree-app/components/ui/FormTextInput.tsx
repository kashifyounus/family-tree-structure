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
  className,
  ...props
}: FormTextInputProps & { className?: string }) {
  return (
    <View className="gap-1.5 w-full">
      {label ? (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      ) : null}
      <Input
        className={`min-h-12 w-full rounded-xl border-border bg-muted/40 dark:bg-muted/20 px-1 ${errorText ? "border-destructive" : ""} ${className ?? ""}`}
        isDisabled={props.editable === false}
      >
        <InputField
          {...props}
          accessibilityLabel={label}
          style={[{ fontSize: 16, paddingVertical: 10 }, style]}
          placeholderTextColor={undefined}
          className="text-base text-foreground placeholder:text-muted-foreground"
        />
      </Input>
      {errorText ? (
        <Text className="text-xs text-destructive" accessibilityLiveRegion="polite">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}
