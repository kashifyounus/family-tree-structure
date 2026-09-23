import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, List, Text, useTheme } from "react-native-paper";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { loadMarriage, saveMarriage } from "@/lib/data/personService";
import { space } from "@/theme/tokens";

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

  const title = `${marriage.partner1.firstName} ${marriage.partner1.lastName} · ${marriage.partner2.firstName} ${marriage.partner2.lastName}`;

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
      <PageHeader
        title={title}
        subtitle={marriage.isActive ? copy.profile.currentMarriage : copy.profile.previousMarriage}
      />
      <View style={styles.row}>
        <Button
          mode="outlined"
          icon="account"
          onPress={() =>
            router.push({ pathname: "/member/[personId]", params: { personId: marriage.partner1!.id } })
          }
        >
          {marriage.partner1.firstName}
        </Button>
        <Button
          mode="outlined"
          icon="account"
          onPress={() =>
            router.push({ pathname: "/member/[personId]", params: { personId: marriage.partner2!.id } })
          }
        >
          {marriage.partner2.firstName}
        </Button>
      </View>
      <SectionCard title="Marriage dates" delay={40}>
        <FormTextInput
          label="Marriage date"
          value={marriageDate}
          onChangeText={setMarriageDate}
          placeholder="YYYY-MM-DD"
        />
        <FormTextInput
          label="Divorce date"
          value={divorceDate}
          onChangeText={setDivorceDate}
          placeholder="YYYY-MM-DD"
        />
        <Button mode="contained" icon="content-save" onPress={() => save(false)}>
          Save marriage
        </Button>
        <Button mode="outlined" icon="heart-broken" onPress={() => save(true)}>
          Mark marriage as ended
        </Button>
      </SectionCard>
      <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
        Children
      </Text>
      {marriage.children.length === 0 ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No children recorded for this marriage.
        </Text>
      ) : (
        marriage.children.map((child) => (
          <List.Item
            key={child.id}
            title={`${child.first_name} ${child.last_name}`}
            description={child.family_code}
            left={(props) => <List.Icon {...props} icon="account-child" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() =>
              router.push({
                pathname: "/member/[personId]",
                params: { personId: child.id, code: child.family_code },
              })
            }
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginBottom: space.md },
  section: { marginTop: space.lg, marginBottom: space.sm },
});
