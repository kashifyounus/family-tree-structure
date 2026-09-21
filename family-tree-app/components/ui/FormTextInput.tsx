import { StyleSheet } from "react-native";
import { TextInput, type TextInputProps } from "react-native-paper";

/** Outlined Paper field with consistent spacing for forms. */
export function FormTextInput(props: TextInputProps) {
  return (
    <TextInput
      mode="outlined"
      dense={false}
      style={[styles.field, props.style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 4 },
});
