import { View } from "react-native";

import { BrandLogo } from "@/components/BrandLogo";
import { MembersSearchField } from "@/components/members/MembersSearchField";
import { ActionTile } from "@/components/ui/ActionTile";
import { AppText } from "@/components/ui/AppText";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { ListRow } from "@/components/ui/ListRow";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PedigreePersonCard } from "@/components/tree/PedigreePersonCard";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";
import { space } from "@/theme/tokens";

function MockStatusBar() {
  return (
    <View className="flex-row justify-between px-4 py-1 bg-card">
      <AppText variant="labelSmall">7:41</AppText>
      <AppText variant="labelSmall">62%</AppText>
    </View>
  );
}

function MockTabBar({ active = "Tree" }: { active?: string }) {
  const tabs = ["Home", "Tree", "Members", "Account"];
  return (
    <View className="flex-row border-t border-border bg-card py-2 pb-3">
      {tabs.map((tab) => (
        <View key={tab} className="flex-1 items-center">
          <AppText
            variant="labelSmall"
            className={tab === active ? "text-primary font-semibold" : "text-muted-foreground"}
          >
            {tab}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export function MockupHomeScreen() {
  return (
    <View className="flex-1">
      <MockStatusBar />
      <View className="px-5 pt-3 pb-2 gap-3 flex-1">
        <View className="flex-row items-center gap-3">
          <BrandLogo size={40} showTitle={false} />
          <View className="flex-1">
            <AppText variant="titleMedium">Home</AppText>
            <AppText variant="labelSmall" className="text-muted-foreground">Private archive</AppText>
          </View>
        </View>
        <InfoBanner message="For your eyes on this device — not shared online." />
        <MembersSearchField value="" onChangeText={() => {}} placeholder="Search members" />
        <ActionTile icon="account-tree" title="Open family tree" subtitle="Pedigree view" />
        <ActionTile icon="account-multiple" title="Browse members" subtitle="2,514 in demo data" />
        <View className="flex-row gap-2 flex-wrap">
          <Badge><BadgeText>Living 1,842</BadgeText></Badge>
          <Badge variant="outline"><BadgeText>Cities 78</BadgeText></Badge>
        </View>
      </View>
      <MockTabBar active="Home" />
    </View>
  );
}

export function MockupTreeScreen() {
  return (
    <View className="flex-1">
      <MockStatusBar />
      <View className="px-4 py-2 border-b border-border bg-card">
        <AppText variant="titleSmall">Tree · Hassan Khan</AppText>
      </View>
      <View
        className="flex-1 items-center justify-end pb-6 px-2"
        style={{ backgroundColor: kuriosityDesign.brand.pedigreeCanvas }}
      >
        <View className="flex-row gap-3 mb-2">
          <PedigreePersonCard firstName="Hassan" lastName="Khan" gender="MALE" years="1955–" />
          <PedigreePersonCard firstName="Ayesha" lastName="Khan" gender="FEMALE" years="1960–2020" />
        </View>
        <View className="h-8 w-px bg-[#b8bcc4] mb-1" />
        <View className="flex-row gap-4 mb-2">
          <PedigreePersonCard firstName="Ali" lastName="Khan" gender="MALE" years="1982–" />
          <PedigreePersonCard
            firstName="Zain"
            lastName="Khan"
            gender="MALE"
            years="2010–"
            isFocal
          />
          <PedigreePersonCard firstName="Fatima" lastName="Khan" gender="FEMALE" years="1988–" />
        </View>
        <AppText variant="labelSmall" className="text-muted-foreground mt-2">
          Pinch · pan · tap a person
        </AppText>
      </View>
      <MockTabBar active="Tree" />
    </View>
  );
}

export function MockupMembersScreen() {
  return (
    <View className="flex-1">
      <MockStatusBar />
      <View className="px-5 pt-3 flex-1 gap-2">
        <AppText variant="headlineSmall">Members</AppText>
        <SegmentedControl
          value="local"
          onChange={() => {}}
          options={[
            { value: "local", label: "Private" },
            { value: "online", label: "Cloud" },
          ]}
        />
        <MembersSearchField value="Khan" onChangeText={() => {}} />
        <ListRow title="Hassan Khan" description="FAM-10004 · Karachi" onPress={() => {}} />
        <ListRow title="Ayesha Khan" description="FAM-10005 · Lahore" onPress={() => {}} />
        <ListRow title="Zain Khan" description="FAM-10012 · Dubai" onPress={() => {}} />
      </View>
      <MockTabBar active="Members" />
    </View>
  );
}

export function MockupMemberProfileScreen() {
  return (
    <View className="flex-1">
      <MockStatusBar />
      <View className="px-5 pt-3 flex-1 gap-3">
        <AppText variant="headlineSmall">Hassan Khan</AppText>
        <AppText variant="labelLarge" className="text-primary">FAM-10004</AppText>
        <Badge><BadgeText>Current marriage</BadgeText></Badge>
        <View className="flex-row flex-wrap gap-2">
          <Button size="sm"><ButtonText>Add spouse</ButtonText></Button>
          <Button size="sm" variant="outline"><ButtonText>Add child</ButtonText></Button>
          <Button size="sm" variant="outline"><ButtonText>Parents</ButtonText></Button>
        </View>
        <AppText variant="titleSmall" className="mt-2">Kinship</AppText>
        <AppText variant="bodySmall" className="text-muted-foreground">Father · Mother · Children</AppText>
      </View>
    </View>
  );
}

export function MockupFormSheetScreen() {
  return (
    <View className="flex-1">
      <MockStatusBar />
      <View className="flex-1 bg-muted/30 px-5 pt-6 opacity-60">
        <AppText variant="headlineSmall">Family member</AppText>
      </View>
      <View className="absolute inset-0 bg-black/40" />
      <View className="absolute left-0 right-0 bottom-0 bg-card rounded-t-3xl px-0 pt-2 pb-6 border-t border-border">
        <View className="w-12 h-1 rounded-full bg-muted-foreground/30 self-center mb-3" />
        <AppText variant="titleMedium" className="px-5 mb-3">Add child</AppText>
        <View className="px-5 gap-1">
          <FormTextInput label="Given name" value="" placeholder="Given name" onChangeText={() => {}} />
          <FormTextInput label="Family name" value="Khan" onChangeText={() => {}} />
          <GenderField value="MALE" onChange={() => {}} label="Gender" />
        </View>
        <View className="flex-row justify-end gap-2 px-5 pt-4 mt-2 border-t border-border">
          <Button variant="ghost"><ButtonText>Cancel</ButtonText></Button>
          <Button><ButtonText>Save changes</ButtonText></Button>
        </View>
      </View>
    </View>
  );
}

export function MockupOnboardingScreen() {
  return (
    <View className="flex-1 px-6 pt-10 pb-8 justify-between">
      <View className="items-center gap-4">
        <BrandLogo size={72} />
        <AppText variant="headlineSmall" className="text-center">Welcome to your family story</AppText>
        <AppText variant="bodyMedium" className="text-center text-muted-foreground leading-6">
          Document relatives, marriages, and children — privately or on your family cloud.
        </AppText>
      </View>
      <View className="gap-3">
        <Button><ButtonText>Begin setup</ButtonText></Button>
        <Button variant="outline"><ButtonText>Load demo family</ButtonText></Button>
      </View>
    </View>
  );
}

export function MockupAccountScreen() {
  return (
    <View className="flex-1">
      <MockStatusBar />
      <View className="px-5 pt-3 flex-1 gap-3">
        <AppText variant="headlineSmall">Account</AppText>
        <SegmentedControl
          value="local"
          onChange={() => {}}
          options={[
            { value: "local", label: "Private archive" },
            { value: "online", label: "Family cloud" },
          ]}
        />
        <AppText variant="bodySmall" className="text-muted-foreground">
          2,514 sample members loaded
        </AppText>
        <Button variant="outline"><ButtonText>Load huge demo family</ButtonText></Button>
        <Button variant="ghost"><ButtonText>Remove sample data only</ButtonText></Button>
      </View>
      <MockTabBar active="Account" />
    </View>
  );
}

export function MockupComponentPrimitives() {
  return (
    <View className="gap-4 px-1 py-2">
      <AppText variant="titleSmall">Gluestack primitives</AppText>
      <View className="flex-row flex-wrap gap-2">
        <Button size="sm"><ButtonText>Primary</ButtonText></Button>
        <Button size="sm" variant="outline"><ButtonText>Outline</ButtonText></Button>
        <Button size="sm" variant="ghost"><ButtonText>Ghost</ButtonText></Button>
      </View>
      <FormTextInput label="Sample field" value="Khan" onChangeText={() => {}} />
      <GenderField value="FEMALE" onChange={() => {}} label="Gender" />
      <View style={{ gap: space.sm }}>
        <PedigreePersonCard firstName="Sample" lastName="Card" gender="FEMALE" years="1990–" />
      </View>
    </View>
  );
}
