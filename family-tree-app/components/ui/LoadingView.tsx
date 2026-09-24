import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Spinner } from "@/components/ui/spinner";

type LoadingViewProps = {
  message?: string;
};

export function LoadingView({ message }: LoadingViewProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-6">
      <Spinner size="large" />
      {message ? <AppText variant="bodyMedium">{message}</AppText> : null}
    </View>
  );
}
