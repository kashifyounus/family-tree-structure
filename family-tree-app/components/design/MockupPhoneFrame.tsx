import type { ReactNode } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type MockupPhoneFrameProps = {
  title: string;
  caption?: string;
  children: ReactNode;
  testID?: string;
};

/** Frames a screen mockup for the design gallery (marketing / QA). */
export function MockupPhoneFrame({ title, caption, children, testID }: MockupPhoneFrameProps) {
  return (
    <View className="mb-8" testID={testID}>
      <AppText variant="titleMedium" className="mb-2">{title}</AppText>
      {caption ? (
        <AppText variant="bodySmall" className="text-muted-foreground mb-3 leading-5">
          {caption}
        </AppText>
      ) : null}
      <View
        className="rounded-[28px] border-4 border-foreground/90 bg-foreground p-2 self-center w-full max-w-[340px]"
        style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 }}
      >
        <View className="rounded-[22px] overflow-hidden bg-background min-h-[520px]">
          {children}
        </View>
      </View>
    </View>
  );
}
