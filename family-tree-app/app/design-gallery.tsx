import { View } from "react-native";

import {
  MockupAccountScreen,
  MockupComponentPrimitives,
  MockupFormSheetScreen,
  MockupHomeScreen,
  MockupMemberProfileScreen,
  MockupMembersScreen,
  MockupOnboardingScreen,
  MockupTreeScreen,
} from "@/components/design/DesignGalleryMockups";
import { MockupPhoneFrame } from "@/components/design/MockupPhoneFrame";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";

/**
 * In-app Gluestack UI gallery — all major flows use shared primitives.
 * Open via Account → UI gallery (dev) or route /design-gallery.
 */
export default function DesignGalleryScreen() {
  return (
    <Screen scroll padded testID="design-gallery">
      <PageHeader
        title="UI / UX gallery"
        subtitle="Kuriosity + Gluestack v5 — one design system for tabs, pedigree, and bottom-sheet forms."
        meta={kuriosityDesign.brand.name}
      />

      <MockupPhoneFrame
        testID="mockup-onboarding"
        title="Onboarding"
        caption="Brand logo, primary + outline buttons (Gluestack Button)."
      >
        <MockupOnboardingScreen />
      </MockupPhoneFrame>

      <MockupPhoneFrame
        testID="mockup-home"
        title="Home"
        caption="InfoBanner, MembersSearchField, ActionTile, Badge."
      >
        <MockupHomeScreen />
      </MockupPhoneFrame>

      <MockupPhoneFrame
        testID="mockup-tree"
        title="Tree (pedigree)"
        caption="PedigreePersonCard — gender stripe, initials, focal ring; matches canvas tree."
      >
        <MockupTreeScreen />
      </MockupPhoneFrame>

      <MockupPhoneFrame
        testID="mockup-members"
        title="Members"
        caption="SegmentedControl, search, ListRow."
      >
        <MockupMembersScreen />
      </MockupPhoneFrame>

      <MockupPhoneFrame
        testID="mockup-member-profile"
        title="Family member"
        caption="Profile actions — same buttons as live member screen."
      >
        <MockupMemberProfileScreen />
      </MockupPhoneFrame>

      <MockupPhoneFrame
        testID="mockup-form-sheet"
        title="Bottom sheet form"
        caption="FormBottomSheet pattern: Actionsheet, FormTextInput, GenderField radio list."
      >
        <MockupFormSheetScreen />
      </MockupPhoneFrame>

      <MockupPhoneFrame
        testID="mockup-account"
        title="Account & demo data"
        caption="Storage mode + huge demo fixture controls."
      >
        <MockupAccountScreen />
      </MockupPhoneFrame>

      <View className="mb-6">
        <MockupComponentPrimitives />
      </View>
    </Screen>
  );
}
