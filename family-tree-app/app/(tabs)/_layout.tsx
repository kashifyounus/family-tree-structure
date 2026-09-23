import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";

import { APP_NAME } from "@/constants/appMeta";
import { useAppPreferences } from "@/context/AppPreferencesContext";

export default function TabLayout() {
  const theme = useTheme();
  const { impactLight } = useAppPreferences();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: true,
        headerTitle: APP_NAME,
        headerTitleStyle: {
          color: theme.colors.onSurface,
          fontWeight: "600",
          fontSize: 17,
        },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarStyle: Platform.select({
          android: {
            paddingBottom: 6,
            height: 64,
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
          },
          default: { backgroundColor: theme.colors.surface },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
        listeners={{ tabPress: () => impactLight() }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: "Tree",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="family-tree" color={color} size={size} />
          ),
        }}
        listeners={{ tabPress: () => impactLight() }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
        listeners={{ tabPress: () => impactLight() }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          href: null,
          title: "Reports",
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          href: null,
          title: "Tools",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
        }}
        listeners={{ tabPress: () => impactLight() }}
      />
    </Tabs>
  );
}
