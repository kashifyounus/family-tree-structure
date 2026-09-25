import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { APP_NAME } from "@/constants/appMeta";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useAppTheme } from "@/theme/useAppTheme";

export default function TabLayout() {
  const theme = useAppTheme();
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
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              outlineName="home-outline"
              filledName="home"
            />
          ),
        }}
        listeners={{ tabPress: () => impactLight() }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: "Tree",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              outlineName="family-tree"
              filledName="family-tree"
            />
          ),
        }}
        listeners={{ tabPress: () => impactLight() }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              outlineName="account-group-outline"
              filledName="account-group"
            />
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
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              outlineName="account-circle-outline"
              filledName="account-circle"
            />
          ),
        }}
        listeners={{ tabPress: () => impactLight() }}
      />
    </Tabs>
  );
}
