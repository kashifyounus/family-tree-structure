import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ShowcasePersonDetail } from "@/components/members/ShowcasePersonDetail";
import { MemberProfileHero } from "@/components/members/profile/MemberProfileHero";
import { MemberProfileRelationSheets } from "@/components/members/profile/MemberProfileRelationSheets";
import { MemberProfileSections } from "@/components/members/profile/MemberProfileSections";
import { ProfileMemberChrome } from "@/components/members/profile/ProfileMemberChrome";
import { AppText } from "@/components/ui/AppText";
import { LoadingView } from "@/components/ui/LoadingView";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import {
  SHOWCASE_MARGARET_ID,
  margaretKhanProfile,
} from "@/lib/mock/kuriosityShowcase";
import { useMemberProfileScreen } from "@/lib/members/useMemberProfileScreen";
import { useAppTheme } from "@/theme/useAppTheme";

export default function MemberDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { personId, code } = useLocalSearchParams<{
    personId: string;
    code?: string;
  }>();
  const isShowcaseMargaret = personId === SHOWCASE_MARGARET_ID;

  const profile = useMemberProfileScreen({
    personId: String(personId),
    code: code ? String(code) : undefined,
    skipLoad: isShowcaseMargaret,
  });

  const openMember = (memberPersonId: string, familyCode: string) => {
    router.push({
      pathname: "/member/[personId]",
      params: { personId: memberPersonId, code: familyCode },
    });
  };

  const openMarriage = (unionId: string) => {
    router.push({
      pathname: "/marriage/[unionId]",
      params: { unionId },
    });
  };

  if (isShowcaseMargaret) {
    return <ShowcasePersonDetail profile={margaretKhanProfile} />;
  }

  if (profile.loading) {
    return <LoadingView />;
  }

  if (!profile.bundle || !profile.member || !profile.derived) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <AppText variant="bodyLarge">{copy.profile.notFound}</AppText>
      </View>
    );
  }

  const { member: m, bundle, derived } = profile;

  return (
    <>
      <Screen testID="member-profile-screen" keyboardAvoiding>
        <PageHeader title="Profile" />
        <MemberProfileHero
          member={m}
          statusLabel={derived.lifeStatus}
          suggestNickname={profile.suggestNickname}
        />
        <ProfileMemberChrome
          canEditLocal={profile.canEditLocal}
          editing={profile.editing}
          parentsRecorded={bundle.parents.length > 0}
          cloudReadOnlyMessage={!profile.canEditLocal ? copy.profile.cloudReadOnly : null}
          onShowInTree={() =>
            router.push({
              pathname: "/(tabs)/tree",
              params: { familyCode: m.familyCode },
            })
          }
          onToggleEdit={profile.toggleEdit}
          onAddSpouse={() => profile.setSpouseOpen(true)}
          onAddChild={() => {
            profile.setChUnionId(derived.marriageOptions[0]?.id ?? "");
            profile.setChildOpen(true);
          }}
          onManageParents={profile.openParentSheet}
        />
        <MemberProfileSections
          member={m}
          bundle={bundle}
          editing={profile.editing}
          editFields={profile.editFields}
          fieldErrors={profile.fieldErrors}
          relationToMeText={profile.relationToMeText}
          fatherParent={derived.fatherParent}
          motherParent={derived.motherParent}
          spouseNameFromUnion={derived.spouseNameFromUnion}
          activeUnionId={derived.activeUnion?.id}
          onPatchEditField={profile.patchEditField}
          onSaveEdit={profile.saveEdit}
          onOpenMember={openMember}
          onOpenMarriage={openMarriage}
        />
      </Screen>

      <MemberProfileRelationSheets
        member={m}
        bundle={bundle}
        localPeople={derived.localPeople}
        marriageOptions={derived.marriageOptions}
        childExcludeIds={derived.childExcludeIds}
        parentExcludeIds={derived.parentExcludeIds}
        parentCoupleRows={derived.parentCoupleRows}
        fieldErrors={profile.fieldErrors}
        defaultSpouseGender={derived.defaultSpouseGender}
        spouseOpen={profile.spouseOpen}
        childOpen={profile.childOpen}
        parentsOpen={profile.parentsOpen}
        coupleParentsOpen={profile.coupleParentsOpen}
        chUnionId={profile.chUnionId}
        parentSlot={profile.parentSlot}
        parentStepHint={derived.parentStepHint}
        onDismissSpouse={() => profile.setSpouseOpen(false)}
        onDismissChild={() => profile.setChildOpen(false)}
        onDismissParents={() => profile.setParentsOpen(false)}
        onDismissCoupleParents={profile.dismissCoupleParentsSheet}
        onUnionChange={profile.setChUnionId}
        onParentSlotChange={profile.setParentSlot}
        onLinkParentCouple={profile.openCoupleParentPicker}
        onSubmitCreateSpouse={profile.createSpouseMember}
        onSubmitLinkSpouse={profile.linkSpouseMember}
        onSubmitCreateChild={profile.createChildMember}
        onSubmitLinkChild={profile.linkChildMember}
        onSubmitCreateParent={profile.createParentMember}
        onSubmitLinkParent={profile.linkParentMember}
        onSelectParentCouple={(row) => profile.onSelectParentCouple(row.unionId)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
