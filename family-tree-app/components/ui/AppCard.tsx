import { Card, type CardProps } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";

type AppCardProps = CardProps & {
  delay?: number;
};

export function AppCard({ delay = 0, style, ...rest }: AppCardProps) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(280)}>
      <Card style={[{ borderRadius: 16 }, style]} {...rest} />
    </Animated.View>
  );
}
