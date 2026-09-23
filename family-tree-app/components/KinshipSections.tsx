import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

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
  const theme = useTheme();
  const router = useRouter();
  if (items.length === 0) return null;
  return (
    <View style={styles.block}>
      <Text variant="titleSmall" style={{ color: theme.colors.onBackground }}>
        {title}
      </Text>
      {items.map((r) => (
        <Button
          key={r.id}
          mode="text"
          compact
          onPress={() =>
            router.push({
              pathname: "/member/[personId]",
              params: { personId: r.id, code: r.familyCode },
            })
          }
          labelStyle={{ textAlign: "left" }}
        >
          {r.kinshipLabel}: {r.firstName} {r.lastName} ({r.familyCode})
        </Button>
      ))}
    </View>
  );
}

export function KinshipSections({ parents, computed }: KinshipSectionsProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
        Parents
      </Text>
      {parents.length === 0 ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No parents recorded yet.
        </Text>
      ) : (
        parents.map((p) => (
          <Card key={p.id} mode="outlined" style={styles.parentCard}>
            <Card.Content>
              <Button
                mode="text"
                onPress={() =>
                  router.push({
                    pathname: "/member/[personId]",
                    params: { personId: p.id, code: p.familyCode },
                  })
                }
              >
                {p.firstName} {p.lastName} ({p.familyCode})
              </Button>
            </Card.Content>
          </Card>
        ))
      )}

      {computed ? (
        <>
          <RelativeList title="Full siblings" items={computed.fullSiblings} />
          <RelativeList title="Half siblings" items={computed.halfSiblings} />
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
  parentCard: { borderRadius: 12 },
});
