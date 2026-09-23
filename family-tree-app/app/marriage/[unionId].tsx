import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { loadMarriage, saveMarriage } from "@/lib/data/personService";

export default function MarriageScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showError, showSuccess } = useAppFeedback();
  const { mode, bumpDataRevision } = useStorage();
  const { unionId } = useLocalSearchParams<{ unionId: string }>();
  const marriage = mode === "local" ? loadMarriage(mode, String(unionId)) : null;
  const [marriageDate, setMarriageDate] = useState(marriage?.marriageDate ?? "");
  const [divorceDate, setDivorceDate] = useState(marriage?.divorceDate ?? "");

  if (mode !== "local") {
    return (
      <Screen>
        <Text variant="bodyLarge">{copy.profile.cloudReadOnly}</Text>
      </Screen>
    );
  }

  if (!marriage || !marriage.partner1 || !marriage.partner2) {
    return (
      <Screen>
        <Text variant="bodyLarge">{copy.profile.notFound}</Text>
      </Screen>
    );
  }

  const save = (endMarriage: boolean) => {
    if (endMarriage && !divorceDate) {
      showError(new Error("Enter a divorce date to record that this marriage has ended."));
      return;
    }
    try {
      saveMarriage(mode, {
        unionId: marriage.id,
        marriageDate: marriageDate || null,
        divorceDate: divorceDate || null,
        isActive: endMarriage ? false : !divorceDate,
      });
      bumpDataRevision();
      showSuccess(endMarriage ? "This marriage is now recorded as ended." : copy.profile.marriageSaved);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <Screen testID="marriage-screen" keyboardAvoiding>
      <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
        {marriage.partner1.firstName} {marriage.partner1.lastName} and {marriage.partner2.firstName}{" "}
        {marriage.partner2.lastName}
      </Text>
      <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
        {marriage.isActive ? copy.profile.currentMarriage : copy.profile.previousMarriage}
      </Text>
      <View style={styles.row}>
        <Button mode="outlined" onPress={() => router.push({ pathname: "/member/[personId]", params: { personId: marriage.partner1!.id } })}>
          View {marriage.partner1.firstName}
        </Button>
        <Button mode="outlined" onPress={() => router.push({ pathname: "/member/[personId]", params: { personId: marriage.partner2!.id } })}>
          View {marriage.partner2.firstName}
        </Button>
      </View>
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.gap}>
          <FormTextInput label="Marriage date" value={marriageDate} onChangeText={setMarriageDate} placeholder="YYYY-MM-DD" />
          <FormTextInput label="Divorce date" value={divorceDate} onChangeText={setDivorceDate} placeholder="YYYY-MM-DD" />
          <Button mode="contained" onPress={() => save(false)}>
            Save marriage
          </Button>
          <Button mode="outlined" onPress={() => save(true)}>
            Mark marriage as ended
          </Button>
        </Card.Content>
      </Card>
      <Text variant="titleMedium" style={styles.section}>
        Children
      </Text>
      {marriage.children.length === 0 ? (
        <Text variant="bodyMedium">No children recorded for this marriage.</Text>
      ) : (
        marriage.children.map((child) => (
          <Button
            key={child.id}
            mode="text"
            onPress={() =>
              router.push({
                pathname: "/member/[personId]",
                params: { personId: child.id, code: child.family_code },
              })
            }
          >
            {child.first_name} {child.last_name}
          </Button>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  card: { marginTop: 16, borderRadius: 16 },
  gap: { gap: 10 },
  section: { marginTop: 20 },
});
