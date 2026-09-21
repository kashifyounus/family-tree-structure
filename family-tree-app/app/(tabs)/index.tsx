import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

import { BrandLogo } from "@/components/BrandLogo";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { buildLocalReports } from "@/lib/db/localReports";

import {
  APP_OWNER,
  APP_VERSION,
  DEFAULT_FAMILY_CODE,
} from "@/constants/appMeta";

export default function HomeScreen() {
  const theme = useTheme();
  const { mode, localMemberCount } = useStorage();
  const localAccount = useLocalAccount();
  const [living, setLiving] = useState(0);

  useEffect(() => {
    if (mode === "local") {
      setLiving(buildLocalReports().livingCount);
    }
  }, [mode, localMemberCount]);

  const branchReference =
    mode === "local" && localAccount.session
      ? localAccount.session.focalFamilyCode
      : DEFAULT_FAMILY_CODE;

  return (
    <Screen testID="home-screen">
      <BrandLogo size={72} />
      <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant }}>
        v{APP_VERSION} · {APP_OWNER}
      </Text>
      <Text variant="bodyMedium" style={{ textAlign: "center", lineHeight: 22, color: theme.colors.onSurface, marginVertical: 12 }}>
        {copy.app.tagline}
      </Text>
      {localAccount.session && mode === "local" && (
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">
              {copy.home.greeting(localAccount.session.displayName)}
            </Text>
            <Text variant="bodySmall">
              {copy.home.yourReference(localAccount.session.focalFamilyCode)}
            </Text>
          </Card.Content>
        </Card>
      )}
      <View style={styles.actions}>
        <Link href="/(tabs)/tree" asChild>
          <Button mode="contained" icon="family-tree">
            {copy.home.openTree}
          </Button>
        </Link>
        <Link href={`/(tabs)/tree?familyCode=${branchReference}`} asChild>
          <Button mode="outlined" icon="account-group">
            {copy.home.yourBranch}
          </Button>
        </Link>
        <Link href="/(tabs)/members" asChild>
          <Button mode="outlined" icon="account-multiple">
            {copy.home.directory}
          </Button>
        </Link>
        <Link href="/(tabs)/reports" asChild>
          <Button mode="outlined" icon="chart-bar">
            {copy.home.insights}
          </Button>
        </Link>
      </View>
      {mode === "local" && (
        <Text variant="bodySmall" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          {copy.home.statsPrivate(localMemberCount, living)}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16 },
  actions: { gap: 10, marginTop: 8 },
});
