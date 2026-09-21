import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  APP_NAME,
  APP_OWNER,
  APP_VERSION,
  DEFAULT_FAMILY_CODE,
} from "@/constants/appMeta";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.meta}>v{APP_VERSION} · {APP_OWNER}</Text>
      <Text style={styles.body}>
        Use local SQLite on this phone for private offline records, or switch
        to Online in Account to sync with the shared PostgreSQL database via
        API. Browse members, view the tree, and manage local data without an
        internet connection.
      </Text>
      <Link href="/(tabs)/tree" asChild>
        <Pressable style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Open family tree</Text>
        </Pressable>
      </Link>
      <Link href={`/(tabs)/tree?familyCode=${DEFAULT_FAMILY_CODE}`} asChild>
        <Pressable style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Demo ({DEFAULT_FAMILY_CODE})</Text>
        </Pressable>
      </Link>
      <Link href="/(tabs)/members" asChild>
        <Pressable style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Member directory</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#18181b",
  },
  meta: {
    fontSize: 13,
    color: "#71717a",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "#3f3f46",
    marginTop: 8,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: {
    color: "#4338ca",
    fontWeight: "600",
  },
});
