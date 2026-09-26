import { useMemo, useState } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";

import {
  ExistingMemberPicker,
  type BriefMember,
} from "@/components/members/ExistingMemberPicker";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { OutlineChip } from "@/components/ui/OutlineChip";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { copy } from "@/content/businessCopy";
import { useStorage } from "@/context/StorageContext";
import { peopleForPicker } from "@/lib/data/personService";
import {
  computeRelationFinderResult,
  type RelationFinderResult,
} from "@/lib/kinship/relationPaths";

export default function FindRelationScreen() {
  const router = useRouter();
  const { mode } = useStorage();
  const members: BriefMember[] = useMemo(
    () => (mode === "local" ? peopleForPicker(mode) : []),
    [mode],
  );
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");
  const [result, setResult] = useState<RelationFinderResult | null>(null);
  const [pathIndex, setPathIndex] = useState(0);

  const runSearch = () => {
    if (!personA || !personB) return;
    if (personA === personB) {
      setResult({
        ok: true,
        message: copy.tools.compareSame,
        paths: [[]],
        truncated: false,
        summaries: [copy.tools.compareSame],
        nodeIdsOnPaths: [personA],
        edgeKeysOnPaths: [],
      });
      setPathIndex(0);
      return;
    }
    const next = computeRelationFinderResult(personA, personB);
    setResult(next);
    setPathIndex(0);
  };

  const activePath = result?.paths[pathIndex] ?? [];
  const activeSummary = result?.summaries[pathIndex] ?? result?.message;

  const openOnTree = () => {
    if (!personA || !personB || !result?.ok) return;
    const pathNodeIds = [
      personA,
      ...activePath.map((s) => s.toId),
    ];
    router.push({
      pathname: "/(tabs)/tree",
      params: {
        highlightA: personA,
        highlightB: personB,
        pathNodes: pathNodeIds.join(","),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Find relation", headerBackTitle: "Tree" }} />
      <Screen safeTop scroll>
        <AppText variant="headlineSmall" className="font-semibold mb-2">
          Find relation
        </AppText>
        <AppText variant="bodySmall" className="text-muted-foreground mb-4">
          Choose two people in your archive. We list every kinship path we find (up to 32) and summarize how they relate.
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

          {result ? (
            <SectionCard title="Result">
              <AppText variant="bodyMedium" className="text-foreground mb-2">
                {result.ok ? activeSummary : result.message}
              </AppText>
              {result.ok && result.paths.length > 1 ? (
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {result.summaries.map((label, i) => (
                    <OutlineChip
                      key={`path-${i}`}
                      label={`Path ${String.fromCharCode(65 + i)}`}
                      selected={pathIndex === i}
                      onPress={() => setPathIndex(i)}
                    />
                  ))}
                </View>
              ) : null}
              {result.truncated ? (
                <AppText variant="labelSmall" className="text-muted-foreground mb-2">
                  Large family — only the first 32 paths are listed. Narrow the tree or pick closer relatives to see more.
                </AppText>
              ) : null}
              {result.ok ? (
                <>
                  <AppText variant="labelMedium" className="text-muted-foreground mb-1">
                    {result.paths.length} path{result.paths.length === 1 ? "" : "s"} · {result.nodeIdsOnPaths.length} people on paths
                  </AppText>
                  <Button variant="outline" onPress={openOnTree}>
                    <ButtonText>Open tree (selected path)</ButtonText>
                  </Button>
                </>
              ) : null}
            </SectionCard>
          ) : null}
        </View>
      </Screen>
    </>
  );
}
