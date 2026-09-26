import { useMemo, useState } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";

import {
  ExistingMemberPicker,
  type BriefMember,
} from "@/components/members/ExistingMemberPicker";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useStorage } from "@/context/StorageContext";
import { peopleForPicker } from "@/lib/data/personService";
import { computeRelationSummary } from "@/lib/kinship/relationshipPath";

export default function FindRelationScreen() {
  const router = useRouter();
  const { mode } = useStorage();
  const members: BriefMember[] = useMemo(
    () => (mode === "local" ? peopleForPicker(mode) : []),
    [mode],
  );
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");
  const [summary, setSummary] = useState<string | null>(null);

  const runSearch = () => {
    if (!personA || !personB) return;
    if (personA === personB) {
      setSummary(copy.tools.compareSame);
      return;
    }
    const text = computeRelationSummary(personA, personB);
    setSummary(text);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Find relation", headerBackTitle: "Tree" }} />
      <Screen safeTop scroll>
        <AppText variant="headlineSmall" className="font-semibold mb-2">
          Find relation
        </AppText>
        <AppText variant="bodySmall" className="text-muted-foreground mb-4">
          Choose two people in your archive. We show how they are related and highlight paths on the tree (read-only).
        </AppText>
        <View className="gap-4">
          <View>
            <AppText variant="labelLarge" className="mb-2">Person 1</AppText>
            <ExistingMemberPicker
              members={members}
              selectedId={personA}
              onSelect={setPersonA}
            />
          </View>
          <View>
            <AppText variant="labelLarge" className="mb-2">Person 2</AppText>
            <ExistingMemberPicker
              members={members}
              excludeIds={personA ? [personA] : []}
              selectedId={personB}
              onSelect={setPersonB}
            />
          </View>
          <Button onPress={runSearch} disabled={!personA || !personB}>
            <ButtonText>Show relation</ButtonText>
          </Button>
          {summary ? (
            <AppText variant="bodyMedium" className="text-foreground">
              {summary}
            </AppText>
          ) : null}
          <Button
            variant="outline"
            onPress={() => {
              if (!personA || !personB) return;
              router.push({
                pathname: "/(tabs)/tree",
                params: { highlightA: personA, highlightB: personB },
              });
            }}
          >
            <ButtonText>Open tree with these people</ButtonText>
          </Button>
        </View>
      </Screen>
    </>
  );
}
