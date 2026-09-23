import { StyleSheet, View } from "react-native";
import { HelperText, TextInput, type TextInputProps } from "react-native-paper";

type FormTextInputProps = TextInputProps & {
  errorText?: string;
};

/** Outlined Paper field with consistent spacing for forms. */
export function FormTextInput({ errorText, ...props }: FormTextInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        mode="outlined"
        dense={false}
        error={!!errorText}
        style={[styles.field, props.style]}
        {...props}
      />
      {errorText ? (
        <HelperText type="error" visible padding="none">
          {errorText}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  field: {},
});
