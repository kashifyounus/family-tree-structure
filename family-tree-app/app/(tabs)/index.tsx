import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { BrandLogo } from "@/components/BrandLogo";
import { Screen } from "@/components/ui/Screen";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { buildLocalReports } from "@/lib/db/localReports";

import {
  APP_OWNER,
  APP_VERSION,
  DEFAULT_FAMILY_CODE,
} from "@/constants/appMeta";

export default function HomeScreen() {
  const { mode, localMemberCount } = useStorage();
  const localAccount = useLocalAccount();
  const [living, setLiving] = useState(0);

  useEffect(() => {
    if (mode === "local") {
      setLiving(buildLocalReports().livingCount);
    }
  }, [mode, localMemberCount]);

  const focalCode =
    mode === "local" && localAccount.session
      ? localAccount.session.focalFamilyCode
      : DEFAULT_FAMILY_CODE;

  return (
    <Screen testID="home-screen">
      <BrandLogo size={72} />
      <Text variant="bodyMedium" style={styles.meta}>
        v{APP_VERSION} · {APP_OWNER}
      </Text>
      {localAccount.session && mode === "local" && (
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Hello, {localAccount.session.displayName}</Text>
            <Text variant="bodySmall">Your code: {localAccount.session.focalFamilyCode}</Text>
          </Card.Content>
        </Card>
      )}
      <Text variant="bodyLarge" style={styles.body}>
        Explore members, immersive tree view, analytics, and secure backups — designed
        for professional family record keeping.
      </Text>
      <View style={styles.actions}>
        <Link href="/(tabs)/tree" asChild>
          <Button mode="contained" icon="family-tree">
            Open family tree
          </Button>
        </Link>
        <Link href={`/(tabs)/tree?familyCode=${focalCode}`} asChild>
          <Button mode="outlined" icon="account-group">
            My focal branch
          </Button>
        </Link>
        <Link href="/(tabs)/members" asChild>
          <Button mode="outlined" icon="account-multiple">
            Member directory
          </Button>
        </Link>
        <Link href="/(tabs)/reports" asChild>
          <Button mode="outlined" icon="chart-bar">
            Reports
          </Button>
        </Link>
      </View>
      {mode === "local" && (
        <Text variant="bodySmall" style={styles.stats}>
          On this device: {localMemberCount} members · {living} living
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { textAlign: "center", color: "#64748b", marginBottom: 8 },
  card: { borderRadius: 16 },
  body: { lineHeight: 24, color: "#334155", marginVertical: 12 },
  actions: { gap: 10, marginTop: 8 },
  stats: { marginTop: 16, color: "#64748b", textAlign: "center" },
});
