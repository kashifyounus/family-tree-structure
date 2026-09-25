import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { PedigreePersonCard } from "@/components/tree/PedigreePersonCard";
import { AppText } from "@/components/ui/AppText";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";
import {
  SHOWCASE_MARGARET_ID,
  showcasePedigree,
  type ShowcasePedigreePerson,
} from "@/lib/mock/kuriosityShowcase";

type ShowcasePedigreeTreeProps = {
  zoomScale?: number;
};

function PersonSlot({
  person,
  scale,
  onPress,
}: {
  person: ShowcasePedigreePerson;
  scale: number;
  onPress: () => void;
}) {
  const label = person.subtitle ? `${person.subtitle} · ${person.years}` : person.years;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={person.firstName}>
      <PedigreePersonCard
        firstName={person.firstName}
        lastName={person.lastName}
        gender={person.gender}
        years={label}
        isFocal={person.isFocal}
        scale={scale}
      />
    </Pressable>
  );
}

export function ShowcasePedigreeTree({ zoomScale = 1 }: ShowcasePedigreeTreeProps) {
  const router = useRouter();
  const scale = Math.min(1.15, Math.max(0.75, zoomScale));

  const openPerson = (person: ShowcasePedigreePerson) => {
    if (person.id === SHOWCASE_MARGARET_ID) {
      router.push({
        pathname: "/member/[personId]",
        params: { personId: SHOWCASE_MARGARET_ID },
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 24,
        paddingHorizontal: 8,
        backgroundColor: kuriosityDesign.brand.pedigreeCanvas,
      }}
      maximumZoomScale={2.5}
      minimumZoomScale={0.8}
      showsVerticalScrollIndicator={false}
      testID="tree-showcase-pedigree"
    >
      <View className="flex-row gap-2 mb-2" style={{ transform: [{ scale }] }}>
        {showcasePedigree.generation1.map((p) => (
          <PersonSlot key={p.id} person={p} scale={1} onPress={() => openPerson(p)} />
        ))}
      </View>
      <View className="h-6 w-px bg-[#b8bcc4] mb-1" />
      <View className="flex-row flex-wrap justify-center gap-2 mb-2" style={{ transform: [{ scale }] }}>
        {showcasePedigree.generation2.map((p) => (
          <PersonSlot key={p.id} person={p} scale={1} onPress={() => openPerson(p)} />
        ))}
      </View>
      <View className="h-6 w-px bg-[#b8bcc4] mb-1" />
      <View className="flex-row flex-wrap justify-center gap-2 mb-3" style={{ transform: [{ scale }] }}>
        {showcasePedigree.generation3.map((p) => (
          <PersonSlot key={p.id} person={p} scale={1} onPress={() => openPerson(p)} />
        ))}
      </View>
      <AppText variant="labelSmall" className="text-muted-foreground">
        3 generations · pinch to zoom
      </AppText>
    </ScrollView>
  );
}
