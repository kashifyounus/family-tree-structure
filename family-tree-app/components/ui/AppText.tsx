import { Text, type TextProps } from "react-native";

export type AppTextVariant =
  | "headlineSmall"
  | "titleLarge"
  | "titleMedium"
  | "titleSmall"
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall"
  | "labelLarge"
  | "labelMedium"
  | "labelSmall";

const variantClass: Record<AppTextVariant, string> = {
  headlineSmall: "text-2xl font-bold text-foreground",
  titleLarge: "text-xl font-bold text-foreground",
  titleMedium: "text-lg font-semibold text-foreground",
  titleSmall: "text-base font-semibold text-foreground",
  bodyLarge: "text-base text-foreground",
  bodyMedium: "text-sm text-foreground",
  bodySmall: "text-xs text-muted-foreground",
  labelLarge: "text-sm font-medium text-foreground",
  labelMedium: "text-xs font-medium text-foreground",
  labelSmall: "text-xs text-muted-foreground",
};

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  className?: string;
};

export function AppText({
  variant = "bodyMedium",
  className = "",
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text className={`${variantClass[variant]} ${className}`.trim()} style={style} {...props}>
      {children}
    </Text>
  );
}
