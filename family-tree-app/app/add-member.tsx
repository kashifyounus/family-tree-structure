import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { AddMemberBottomSheet } from "@/components/members/AddMemberBottomSheet";

export default function AddMemberScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.back();
    }
  }, [open, router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal" }} />
      <View className="flex-1 bg-black/20" testID="add-member-screen">
        <AddMemberBottomSheet visible={open} onDismiss={() => setOpen(false)} />
      </View>
    </>
  );
}
