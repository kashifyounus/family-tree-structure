import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { Button, ButtonText } from "@/components/ui/button";
import { formatDisplayDate, isoFromDate } from "@/lib/format/displayDate";

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  testID?: string;
};

function parseIso(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date();
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  testID,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseIso(value));

  const display = formatDisplayDate(value) ?? "";

  const onPickerChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
    }
    if (date) {
      setDraft(date);
      if (Platform.OS === "android") {
        onChange(isoFromDate(date));
      }
    }
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button">
        <FormTextInput
          testID={testID}
          label={label}
          value={display}
          editable={false}
          placeholder={placeholder}
          pointerEvents="none"
        />
      </Pressable>
      {Platform.OS === "ios" && open ? (
        <Modal transparent animationType="slide" visible={open}>
          <View className="flex-1 justify-end bg-black/30">
            <View className="bg-card rounded-t-3xl p-4 pb-8">
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                onChange={onPickerChange}
              />
              <Button
                className="rounded-full min-h-12 mt-2"
                onPress={() => {
                  onChange(isoFromDate(draft));
                  setOpen(false);
                }}
              >
                <ButtonText>Done</ButtonText>
              </Button>
            </View>
          </View>
        </Modal>
      ) : null}
      {Platform.OS === "android" && open ? (
        <DateTimePicker
          value={draft}
          mode="date"
          display="default"
          onChange={onPickerChange}
        />
      ) : null}
    </>
  );
}
