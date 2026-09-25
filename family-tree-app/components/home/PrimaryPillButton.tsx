import { Button, ButtonText } from "@/components/ui/button";

type PrimaryPillButtonProps = {
  label: string;
  onPress: () => void;
  testID?: string;
};

export function PrimaryPillButton({ label, onPress, testID }: PrimaryPillButtonProps) {
  return (
    <Button
      testID={testID}
      onPress={onPress}
      className="rounded-full min-h-12 shadow-md w-full"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <ButtonText className="font-semibold">{label}</ButtonText>
    </Button>
  );
}
