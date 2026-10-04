import { View } from "react-native";

import { InfoBanner } from "@/components/ui/InfoBanner";
import { copy } from "@/content/businessCopy";

type DemoArchiveBannerProps = {
  testID?: string;
};

/** Shown on main tabs while the demo SQLite lane is active. */
export function DemoArchiveBanner({ testID }: DemoArchiveBannerProps) {
  return (
    <View testID={testID} className="px-3 pt-2">
      <InfoBanner icon="flask-outline">{copy.archive.demoBanner}</InfoBanner>
    </View>
  );
}
