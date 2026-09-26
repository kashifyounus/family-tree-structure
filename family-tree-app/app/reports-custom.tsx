import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { PersonRow } from "@/components/members/PersonRow";
import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { AppText } from "@/components/ui/AppText";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { OutlineChip } from "@/components/ui/OutlineChip";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { copy } from "@/content/businessCopy";
import type { Gender } from "@/lib/data/types";
import { memberInitials, memberRecordSubtitle } from "@/lib/members/memberPickerSubtitle";
import { listLocalMembersMatching } from "@/lib/reports/archiveMembers";
import type { ArchiveQuery } from "../../shared/archiveQuery";

export default function ReportsCustomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ preset?: string }>();
  const presetId = typeof params.preset === "string" ? params.preset : "";
  const [livingOnly, setLivingOnly] = useState(
    presetId === "living" || presetId === "deceased" ? presetId === "living" : false,
  );
  const [gender, setGender] = useState<Gender | "">(
    presetId === "men" ? "MALE" : presetId === "women" ? "FEMALE" : "",
  );
  const [city, setCity] = useState("");
  const [requireNickname, setRequireNickname] = useState(presetId === "nicknames");
  const [ran, setRan] = useState(false);

  const query = useMemo((): ArchiveQuery => {
    const and: ArchiveQuery["and"] = [];
    if (livingOnly) and.push({ field: "living", value: "true" });
    if (gender) and.push({ field: "gender", value: gender });
    if (city.trim()) and.push({ field: "currentCity", value: city.trim() });
    if (requireNickname) and.push({ field: "hasNickname", value: "true" });
    return { and };
  }, [livingOnly, gender, city, requireNickname]);

  const results = useMemo(() => {
    if (!ran) return [];
    return listLocalMembersMatching(query);
  }, [query, ran]);

  return (
    <>
      <Stack.Screen options={{ title: copy.reports.customTitle }} />
      <Screen safeTop scroll keyboardAvoiding testID="reports-custom-screen">
        <AppText variant="headlineSmall" className="font-semibold mb-1">
          {copy.reports.customTitle}
        </AppText>
        <AppText variant="bodySmall" className="text-muted-foreground mb-4">
          {copy.reports.customHint}
        </AppText>

        <SectionCard title={copy.reports.customFiltersTitle}>
          <View className="flex-row flex-wrap gap-2">
            <OutlineChip
              label={copy.reports.filterLiving}
              selected={livingOnly}
              onPress={() => setLivingOnly((v) => !v)}
            />
            <OutlineChip
              label={copy.reports.filterNickname}
              selected={requireNickname}
              onPress={() => setRequireNickname((v) => !v)}
            />
          </View>
          <View className="gap-2">
            <AppText variant="labelLarge">{copy.reports.filterGender}</AppText>
            <View className="flex-row flex-wrap gap-2">
              {(["MALE", "FEMALE", "OTHER"] as Gender[]).map((g) => (
                <OutlineChip
                  key={g}
                  label={copy.gender[g]}
                  selected={gender === g}
                  onPress={() => setGender((prev) => (prev === g ? "" : g))}
                />
              ))}
            </View>
          </View>
          <FormTextInput
            label={copy.reports.filterCity}
            value={city}
            onChangeText={setCity}
            placeholder={copy.reports.filterCityPlaceholder}
          />
          <PrimaryPillButton
            testID="reports-custom-run"
            label={copy.reports.runCustom}
            onPress={() => setRan(true)}
          />
        </SectionCard>

        {ran ? (
          <SectionCard
            title={copy.reports.customResultsTitle(results.length)}
            subtitle={copy.reports.customAndOnly}
          >
            {results.length === 0 ? (
              <AppText variant="bodyMedium" className="text-muted-foreground">
                {copy.reports.customEmpty}
              </AppText>
            ) : (
              results.slice(0, 80).map((m) => (
                <PersonRow
                  key={m.id}
                  initials={memberInitials(`${m.firstName} ${m.lastName}`)}
                  name={`${m.firstName} ${m.lastName}`.trim()}
                  nickname={m.nickname}
                  subtitle={memberRecordSubtitle(m)}
                  onPress={() =>
                    router.push({
                      pathname: "/member/[personId]",
                      params: { personId: m.id, code: m.familyCode },
                    })
                  }
                />
              ))
            )}
            {results.length > 80 ? (
              <AppText variant="labelSmall" className="text-muted-foreground">
                {copy.reports.customTruncated(results.length)}
              </AppText>
            ) : null}
          </SectionCard>
        ) : null}
      </Screen>
    </>
  );
}
