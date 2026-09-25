import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";
import type { Gender } from "@/lib/data/types";

type PedigreePersonCardProps = {
  firstName: string;
  lastName: string;
  years?: string;
  gender: Gender;
  isFocal?: boolean;
  isPrivate?: boolean;
  scale?: number;
};

function accentFor(gender: Gender): string {
  if (gender === "FEMALE") return kuriosityDesign.pedigree.femaleAccent;
  if (gender === "MALE") return kuriosityDesign.pedigree.maleAccent;
  return kuriosityDesign.pedigree.neutralAccent;
}

function initials(first: string, last: string, isPrivate?: boolean): string {
  if (isPrivate) return "?";
  return `${first.trim()[0] ?? ""}${last.trim()[0] ?? ""}`.toUpperCase() || "?";
}

/** FamilySearch-style person card (used in tree canvas mockups and gallery). */
export function PedigreePersonCard({
  firstName,
  lastName,
  years,
  gender,
  isFocal,
  isPrivate,
  scale = 1,
}: PedigreePersonCardProps) {
  const w = kuriosityDesign.pedigree.cardWidth * scale;
  const accent = accentFor(gender);
  const label = isPrivate ? firstName : `${firstName} ${lastName}`;
  const init = initials(firstName, lastName, isPrivate);

  return (
    <View
      className="bg-card overflow-hidden"
      style={{
        width: w,
        borderRadius: 12 * scale,
        borderWidth: isFocal ? 2 : 1,
        borderColor: isFocal ? kuriosityDesign.brand.primary : "#e5e7eb",
        shadowColor: "#0f172a",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View style={{ height: 5 * scale, backgroundColor: accent }} />
      <View className="items-center px-2 pb-2 pt-2">
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 44 * scale,
            height: 44 * scale,
            borderWidth: 2,
            borderColor: accent,
            backgroundColor: gender === "FEMALE" ? "#fde8f0" : "#e3f0fb",
          }}
        >
          <AppText variant="labelLarge" style={{ fontSize: 13 * scale }}>{init}</AppText>
        </View>
        <AppText
          variant="labelSmall"
          numberOfLines={2}
          className="text-center font-semibold mt-1"
          style={{ fontSize: 11 * scale }}
        >
          {label}
        </AppText>
        {years ? (
          <AppText variant="labelSmall" className="text-muted-foreground" style={{ fontSize: 10 * scale }}>
            {years}
          </AppText>
        ) : null}
      </View>
      {isFocal ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-xl border-2"
          style={{ borderColor: `${kuriosityDesign.brand.primary}55`, margin: -3 }}
        />
      ) : null}
    </View>
  );
}
