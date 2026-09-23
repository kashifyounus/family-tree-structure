import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";

import { BrandLogo } from "@/components/BrandLogo";
import { ActionTile } from "@/components/ui/ActionTile";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReferenceText } from "@/components/ui/ReferenceText";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { APP_NAME, APP_OWNER, APP_VERSION, DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { copy } from "@/content/businessCopy";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { buildLocalReports } from "@/lib/db/localReports";
import { motion } from "@/theme/motion";
import { space } from "@/theme/tokens";

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
      <Animated.View entering={FadeIn.duration(motion.slow)} style={styles.hero}>
        <BrandLogo size={80} />
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: space.sm }}>
          v{APP_VERSION} · {APP_OWNER}
        </Text>
      </Animated.View>

      <PageHeader title={APP_NAME} subtitle={copy.app.tagline} />

      {localAccount.session && mode === "local" && (
        <SectionCard delay={motion.staggerStep}>
          <Text variant="titleMedium">{copy.home.greeting(localAccount.session.displayName)}</Text>
          <ReferenceText label={copy.account.memberReference} code={localAccount.session.focalFamilyCode} />
        </SectionCard>
      )}

      <View style={styles.actions}>
        <Link href="/(tabs)/tree" asChild>
          <ActionTile icon="family-tree" mode="contained" delay={motion.staggerStep * 2}>
            {copy.home.openTree}
          </ActionTile>
        </Link>
        <Link href={`/(tabs)/tree?familyCode=${branchReference}`} asChild>
          <ActionTile icon="account-group" delay={motion.staggerStep * 3}>
            {copy.home.yourBranch}
          </ActionTile>
        </Link>
        <Link href="/(tabs)/members" asChild>
          <ActionTile testID="home-directory" icon="account-multiple" delay={motion.staggerStep * 4}>
            {copy.home.directory}
          </ActionTile>
        </Link>
        <Link href="/(tabs)/reports" asChild>
          <ActionTile icon="chart-bar" delay={motion.staggerStep * 5}>
            {copy.home.insights}
          </ActionTile>
        </Link>
      </View>

      {mode === "local" && (
        <Text
          variant="bodySmall"
          style={{ marginTop: space.lg, color: theme.colors.onSurfaceVariant, textAlign: "center" }}
        >
          {copy.home.statsPrivate(localMemberCount, living)}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: space.md },
  actions: { gap: space.md, marginTop: space.sm },
});
