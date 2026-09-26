import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { DatePickerField } from "@/components/forms/DatePickerField";
import { AddRelationSheet } from "@/components/members/AddRelationSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { copy } from "@/content/businessCopy";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import {
  addChild,
  linkChild,
  loadMarriage,
  peopleForPicker,
  saveMarriage,
} from "@/lib/data/personService";
import type { Gender } from "@/lib/data/types";
import { space } from "@/theme/tokens";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { ListRow } from "@/components/ui/ListRow";

export default function MarriageScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { showError, showSuccess } = useAppFeedback();
  const { impactLight } = useAppPreferences();
  const { mode, bumpDataRevision } = useStorage();
  const { unionId } = useLocalSearchParams<{ unionId: string }>();
  const marriage = mode === "local" ? loadMarriage(mode, String(unionId)) : null;
  const [marriageDate, setMarriageDate] = useState(marriage?.marriageDate ?? "");
  const [divorceDate, setDivorceDate] = useState(marriage?.divorceDate ?? "");
  const [childOpen, setChildOpen] = useState(false);

  if (mode !== "local") {
    return (
      <Screen>
        <AppText variant="bodyLarge">{copy.profile.cloudReadOnly}</AppText>
      </Screen>
    );
  }

  if (!marriage || !marriage.partner1 || !marriage.partner2) {
    return (
      <Screen>
        <AppText variant="bodyLarge">{copy.profile.notFound}</AppText>
      </Screen>
    );
  }

  const partner1 = marriage.partner1;
  const partner2 = marriage.partner2;
  const title = `${partner1.firstName} ${partner1.lastName} · ${partner2.firstName} ${partner2.lastName}`;

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
      impactLight();
      showSuccess(endMarriage ? "This marriage is now recorded as ended." : copy.profile.marriageSaved);
    } catch (error) {
      showError(error);
    }
  };

  const localPeople = peopleForPicker(mode);
  const childExcludeIds = [
    partner1.id,
    partner2.id,
    ...marriage.children.map((c) => c.id),
  ];

  const linkChildMember = (childId: string) => {
    if (!childId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    try {
      linkChild(mode, { unionId: marriage.id, childId });
      setChildOpen(false);
      bumpDataRevision();
      impactLight();
      showSuccess(copy.profile.childLinked);
    } catch (e) {
      showError(e);
    }
  };

  const createChildMember = (payload: {
    firstName: string;
    lastName: string;
    gender: Gender;
  }) => {
    try {
      addChild(mode, {
        parentPersonId: partner1.id,
        unionId: marriage.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
      });
      setChildOpen(false);
      bumpDataRevision();
      impactLight();
      showSuccess(copy.profile.childSaved);
    } catch (e) {
      showError(e);
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
          variant="outline"
          onPress={() =>
            router.push({ pathname: "/member/[personId]", params: { personId: partner1.id } })
          }
        >
          <ButtonText>{partner1.firstName}</ButtonText>
        </Button>
        <Button
          variant="outline"
          onPress={() =>
            router.push({ pathname: "/member/[personId]", params: { personId: partner2.id } })
          }
        >
          <ButtonText>{partner2.firstName}</ButtonText>
        </Button>
      </View>
      <SectionCard title="Marriage dates" delay={40}>
        <DatePickerField label="Marriage date" value={marriageDate} onChange={setMarriageDate} />
        <DatePickerField label="Divorce date" value={divorceDate} onChange={setDivorceDate} />
        <Button onPress={() => save(false)}>
          <ButtonText>Save marriage</ButtonText>
        </Button>
        <Button variant="outline" onPress={() => save(true)}>
          <ButtonText>Mark marriage as ended</ButtonText>
        </Button>
      </SectionCard>
      <AppText variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
        Children
      </AppText>
      <Button
        testID="marriage-add-child"
        variant="secondary"
        style={styles.addChildBtn}
        onPress={() => setChildOpen(true)}
      >
        <ButtonText>{copy.profile.addChild}</ButtonText>
      </Button>
      {marriage.children.length === 0 ? (
        <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No children recorded for this marriage.
        </AppText>
      ) : (
        marriage.children.map((child) => (
          <ListRow
            key={child.id}
            title={`${child.first_name} ${child.last_name}`}
            description={child.family_code}
            leftIcon="account-child"
            onPress={() =>
              router.push({
                pathname: "/member/[personId]",
                params: { personId: child.id, code: child.family_code },
              })
            }
          />
        ))
      )}

      <AddRelationSheet
        visible={childOpen}
        kind="child"
        title={copy.profile.addChild}
        members={localPeople}
        excludeIds={childExcludeIds}
        onDismiss={() => setChildOpen(false)}
        onSubmitCreate={createChildMember}
        onSubmitLink={linkChildMember}
        submitTestID="member-child-save"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginBottom: space.md },
  section: { marginTop: space.lg, marginBottom: space.sm },
  addChildBtn: { marginBottom: space.md, alignSelf: "flex-start" },
});
