import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ComputedRelations, KinshipPerson, KinshipRelative } from "@/lib/kinship/types";

type KinshipSectionsProps = {
  parents: KinshipPerson[];
  computed: ComputedRelations | null;
};

function RelativeList({
  title,
  items,
}: {
  title: string;
  items: KinshipRelative[];
}) {
  const router = useRouter();
  if (items.length === 0) return null;
  return (
    <View style={styles.block}>
      <AppText variant="titleSmall">{title}</AppText>
      {items.map((r) => (
        <Button
          key={r.id}
          variant="ghost"
          className="justify-start"
          onPress={() =>
            router.push({
              pathname: "/member/[personId]",
              params: { personId: r.id, code: r.familyCode },
            })
          }
        >
          <ButtonText className="text-left">
            {r.kinshipLabel}: {r.firstName} {r.lastName}
          </ButtonText>
        </Button>
      ))}
    </View>
  );
}

export function KinshipSections({ parents, computed }: KinshipSectionsProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <AppText variant="titleMedium">Parents</AppText>
      {parents.length === 0 ? (
        <AppText variant="bodyMedium" className="text-muted-foreground">
          No parents recorded yet.
        </AppText>
      ) : (
        parents.map((p) => (
          <Card key={p.id} className="p-3 border border-border">
            <Button
              variant="ghost"
              onPress={() =>
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: p.id, code: p.familyCode },
                })
              }
            >
              <ButtonText>
                {p.firstName} {p.lastName}
              </ButtonText>
            </Button>
          </Card>
        ))
      )}

      {computed ? (
        <>
          <RelativeList title="Full siblings" items={computed.fullSiblings} />
          <RelativeList title="Half siblings" items={computed.halfSiblings} />
          <RelativeList title="Step siblings" items={computed.stepSiblings} />
          <RelativeList title="Paternal uncles" items={computed.paternalUncles} />
          <RelativeList title="Paternal aunts" items={computed.paternalAunts} />
          <RelativeList title="Maternal uncles" items={computed.maternalUncles} />
          <RelativeList title="Maternal aunts" items={computed.maternalAunts} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 16 },
  block: { marginTop: 8 },
});
