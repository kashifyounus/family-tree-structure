import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";

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
import { getLocalMemberById } from "@/lib/db/localRepository.ext";
import { peopleForPicker } from "@/lib/data/personService";
import {
  computeRelationFinderResult,
  type RelationFinderResult,
} from "@/lib/kinship/relationPaths";
import { runMutualRelationshipProcess } from "@/lib/kinship/mutualRelationshipProcess";

function memberName(members: BriefMember[], id: string): string {
  return members.find((m) => m.id === id)?.name ?? "Member";
}

export default function FindRelationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    personA?: string;
    personB?: string;
    compareA?: string;
  }>();
  const { mode } = useStorage();
  const members: BriefMember[] = useMemo(
    () => (mode === "local" ? peopleForPicker(mode) : []),
    [mode],
  );
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");
  const [result, setResult] = useState<RelationFinderResult | null>(null);
  const [mutual, setMutual] = useState<ReturnType<
    typeof runMutualRelationshipProcess
  > | null>(null);
  const [pathIndex, setPathIndex] = useState(0);
  const [treeFocalSide, setTreeFocalSide] = useState<"a" | "b">("a");

  useEffect(() => {
    const a =
      typeof params.personA === "string"
        ? params.personA
        : typeof params.compareA === "string"
          ? params.compareA
          : "";
    const b = typeof params.personB === "string" ? params.personB : "";
    if (a.trim()) setPersonA(a.trim());
    if (b.trim()) setPersonB(b.trim());
  }, [params.personA, params.personB, params.compareA]);

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
      setMutual(
        runMutualRelationshipProcess(personA, personB),
      );
      setPathIndex(0);
      return;
    }
    const next = computeRelationFinderResult(personA, personB);
    setResult(next);
    setMutual(runMutualRelationshipProcess(personA, personB));
    setPathIndex(0);
  };

  const activePath = result?.paths[pathIndex] ?? [];
  const activeSummary = result?.summaries[pathIndex] ?? result?.message;

  const openOnTree = () => {
    if (!personA || !personB || !result?.ok) return;
    const pathNodeIds = [personA, ...activePath.map((s) => s.toId)];
    const focalPersonId = treeFocalSide === "a" ? personA : personB;
    const focalMember = getLocalMemberById(focalPersonId);
    router.push({
      pathname: "/(tabs)/tree",
      params: {
        familyCode: focalMember?.familyCode ?? "",
        highlightA: personA,
        highlightB: personB,
        pathNodes: pathNodeIds.join(","),
      },
    });
  };

  const nameA = memberName(members, personA);
  const nameB = memberName(members, personB);

  return (
    <>
      <Stack.Screen
        options={{ title: copy.tools.findRelationTitle, headerBackTitle: copy.tree.title }}
      />
      <Screen safeTop scroll>
        <AppText variant="headlineSmall" className="font-semibold mb-2">
          {copy.tools.findRelationTitle}
        </AppText>
        <AppText variant="bodySmall" className="text-muted-foreground mb-4">
          {copy.tools.findRelationIntro}
        </AppText>
        <View className="gap-4">
          <View>
            <AppText variant="labelLarge" className="mb-2">
              {copy.tools.findRelationPerson1}
            </AppText>
            <ExistingMemberPicker
              members={members}
              selectedId={personA}
              onSelect={setPersonA}
            />
          </View>
          <View>
            <AppText variant="labelLarge" className="mb-2">
              {copy.tools.findRelationPerson2}
            </AppText>
            <ExistingMemberPicker
              members={members}
              excludeIds={personA ? [personA] : []}
              selectedId={personB}
              onSelect={setPersonB}
            />
          </View>
          <Button onPress={runSearch} disabled={!personA || !personB}>
            <ButtonText>{copy.tools.findRelationRun}</ButtonText>
          </Button>

          {mutual?.ok && personA && personB && personA !== personB ? (
            <SectionCard title={copy.tools.findRelationMutualTitle}>
              <AppText variant="bodyMedium" className="text-foreground mb-2">
                {copy.tools.findRelationMutualLine(
                  nameA,
                  mutual.howPersonARelatesToB,
                  nameB,
                )}
              </AppText>
              <AppText variant="bodyMedium" className="text-foreground mb-3">
                {copy.tools.findRelationMutualLine(
                  nameB,
                  mutual.howPersonBRelatesToA,
                  nameA,
                )}
              </AppText>
              {mutual.mutualLinks.length > 0 ? (
                <>
                  <AppText variant="labelMedium" className="text-muted-foreground mb-2">
                    {copy.tools.findRelationLinkChainTitle}
                  </AppText>
                  {mutual.mutualLinks.map((link, i) => (
                    <AppText
                      key={`link-${i}`}
                      variant="bodySmall"
                      className="text-foreground mb-1"
                    >
                      {copy.tools.findRelationLinkRow(
                        memberName(members, link.fromPersonId),
                        link.linkPhrase,
                        memberName(members, link.toPersonId),
                      )}
                    </AppText>
                  ))}
                </>
              ) : null}
            </SectionCard>
          ) : null}

          {result ? (
            <SectionCard title={copy.tools.findRelationResult}>
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
                  {copy.tools.findRelationPathsTruncated}
                </AppText>
              ) : null}
              {result.ok ? (
                <>
                  <AppText variant="labelMedium" className="text-muted-foreground mb-1">
                    {copy.tools.findRelationPathMeta(
                      result.paths.length,
                      result.nodeIdsOnPaths.length,
                    )}
                  </AppText>
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    <OutlineChip
                      label={nameA}
                      selected={treeFocalSide === "a"}
                      onPress={() => setTreeFocalSide("a")}
                    />
                    <OutlineChip
                      label={nameB}
                      selected={treeFocalSide === "b"}
                      onPress={() => setTreeFocalSide("b")}
                    />
                  </View>
                  <AppText variant="labelSmall" className="text-muted-foreground mb-2">
                    {copy.tools.findRelationTreeFocalHint}
                  </AppText>
                  <Button variant="outline" onPress={openOnTree}>
                    <ButtonText>{copy.tools.findRelationOpenTree}</ButtonText>
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
