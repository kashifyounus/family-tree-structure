/**
 * User-facing language for Mughal's Family Tree.
 * Internal code may still use technical names; only strings from here belong in the UI.
 *
 * Terminology choices (open for your review — see content/TERMINOLOGY.md):
 * - Marriage = recorded partnership between two members (replaces internal "union")
 * - Member reference = public ID shown on profiles (replaces "family code")
 * - Private archive = records kept only on this device
 * - Family cloud = shared records on your organisation's website
 */

export const copy = {
  app: {
    tagline:
      "Preserve your lineage, connect generations, and share your story with those you trust.",
    intro:
      "Mughal's Family Tree helps families document relatives, marriages, and children in one place — privately on your phone or together through your family's online registry.",
  },

  storage: {
    privateArchive: "Private archive (this device)",
    privateArchiveShort: "On this device",
    familyCloud: "Family cloud (shared)",
    familyCloudShort: "Shared online",
    whereRecordsKept: "Where your records are kept",
    privateHelp:
      "Your family information stays on this phone. You can still link to the family cloud later without losing what you have entered here.",
    cloudHelp:
      "Your family information is loaded from your organisation's Mughal's Family Tree website. Everyone you authorise sees the same records.",
    switchToCloudHint:
      "To sign in to the family cloud, choose Shared online under where your records are kept.",
    switchToPrivateInfo:
      "You are now working from your private archive on this device. Sign-in to the family cloud is not required.",
    switchToCloudInfo:
      "You are now connected to the shared family registry online.",
    memberCountLabel: (count: number) =>
      `${count} family member${count === 1 ? "" : "s"} in your private archive`,
  },

  account: {
    householdProfile: "Your household profile",
    memberReference: "Member reference",
    signOutDevice: "Sign out on this device",
    connectionAddress: "Family website address",
    connectionAddressHelp:
      "The web address where your family cloud is hosted (provided by your family administrator).",
    saveConnection: "Save connection",
    familyCloudSignIn: "Family cloud sign-in",
    signedIn: "You are signed in",
    signOut: "Sign out",
    loadSampleFamily: "Load sample family",
    loadSampleSuccess: (reference: string) =>
      `Sample family loaded. Explore member reference ${reference}.`,
  },

  onboarding: {
    welcomeTitle: "Welcome to your family story",
    welcomeBody:
      "Mughal's Family Tree helps families document relatives, marriages, and children in one place — privately on your phone or together through your family's online registry.",
    getStarted: "Begin setup",
    chooseStorageTitle: "How would you like to start?",
    chooseStorageBody:
      "You may keep a private archive on this phone, connect to your family's shared registry, or start privately and link the cloud later.",
    privateChoice: "Private archive on this phone",
    cloudChoice: "Shared family cloud",
    registerTitle: "Create your household profile",
    registerBody:
      "We will add you as the starting member of your tree on this device. You can invite more relatives from the Members area.",
    displayName: "Your name (as shown in the app)",
    email: "Email for this device",
    password: "Password for this device",
    startingMember: "Your details in the tree",
    createProfile: "Create profile and start tree",
    cloudTitle: "Connect to your family cloud",
    cloudBody:
      "Enter the website address your administrator gave you, then sign in with your family account.",
    signInContinue: "Sign in and continue",
    saveAddressOnly: "Save address — sign in later",
    completeTitle: "You are ready",
    completeBody:
      "Browse the tree, add marriages and children, view insights, and save backups from Tools when you need them.",
    enterApp: "Go to home",
    welcomeNamed: (name: string, reference: string) =>
      `Welcome, ${name}. Your member reference is ${reference}.`,
    cloudConnected: "You are connected to your family cloud.",
    addressSaved: "Connection saved. You can sign in from Account when ready.",
  },

  home: {
    greeting: (name: string) => `Welcome back, ${name}`,
    yourReference: (ref: string) => `Your member reference: ${ref}`,
    openTree: "View family tree",
    yourBranch: "View your branch",
    directory: "Family directory",
    insights: "Family insights",
    statsPrivate: (members: number, living: number) =>
      `Private archive: ${members} member${members === 1 ? "" : "s"}, ${living} recorded as living`,
  },

  tree: {
    title: "Family tree",
    options: "Tree options",
    privateView: "Private archive view",
    sharedView: "Interactive family cloud view",
    referenceLabel: "Viewing branch for reference",
    notFound:
      "No member matches that reference in your private archive. Add relatives from the directory or choose another reference.",
    marriagesSection: "Marriages and children",
    noMarriages: "No marriages have been recorded for this person yet.",
    marriageTo: (a: string, b: string) => `Marriage: ${a} and ${b}`,
    noChildrenInMarriage: "No children recorded for this marriage.",
    childLine: (name: string, ref: string) => `${name} · ${ref}`,
    privateFooter:
      "These records are in your private archive. Link the family cloud from Account to work with your shared registry.",
    tapProfile: "Open full profile",
  },

  members: {
    bannerPrivate: "Private archive — for your eyes on this device",
    bannerCloud: "Family cloud — shared with your authorised family",
    searchPlaceholder: "Search by name or member reference",
    addMember: "Add family member",
    emptyPrivate:
      "No relatives in your private archive yet. Add someone or load a sample family from Account.",
    emptyCloud:
      "No members found. Check your connection address and family cloud sign-in in Account.",
    newMemberTitle: "New family member",
    saveMember: "Save member",
    longPressDelete: "Press and hold to remove",
    removeTitle: "Remove family member",
    removeConfirm: (name: string) =>
      `Remove ${name} from your private archive? This cannot be undone if they are linked to marriages or children.`,
  },

  profile: {
    notFound: "We could not find this family member.",
    marriagesSection: "Marriages and children",
    noMarriages: "No marriages recorded yet.",
    addSpouse: "Add spouse",
    addChild: "Add child",
    editProfile: "Edit profile",
    cancelEdit: "Cancel",
    saveChanges: "Save changes",
    openInTree: "Show in family tree",
    needMarriageFirst:
      "Record a marriage (add a spouse) before adding a child to this branch.",
    kinshipOnline: "Relatives (from family cloud)",
    fullSibling: (name: string) => `Full sibling: ${name}`,
    halfSibling: (name: string) => `Half sibling: ${name}`,
  },

  tools: {
    title: "Family tools",
    driveTitle: "Save to Google Drive",
    driveBody:
      "Create a secure copy of your private archive and store it in your Google Drive. You will be asked to sign in with Google on this device.",
    driveButton: "Save copy to Google Drive",
    driveSuccess: (name: string) => `A copy was saved to Google Drive as ${name}.`,
    fileBackupTitle: "Export or restore backup file",
    fileBackupBody: (count: number) =>
      `Download a portable backup of ${count} family member${count === 1 ? "" : "s"}, or restore from a backup you saved earlier. Restoring replaces your private archive on this device.`,
    exportFile: "Export backup file",
    importFile: "Restore from backup file",
    importPlaceholder: "Paste backup file contents here…",
    importSuccess: "Your private archive was restored from the backup.",
    compareTitle: "Compare two members",
    compareHint:
      "Enter member references or names from your private archive to see how they relate.",
    compareButton: "Compare",
    compareNotFound:
      "We could not find both members. Use names or member references from your directory.",
    compareSame: "Please choose two different people.",
    compareResult:
      "Both members are in your private archive. Open each profile to see marriages and children, or use the family cloud for full relationship paths.",
    cloudOnly:
      "Backup and restore are available for your private archive. Switch to Private archive in Account, or use the family website for shared records.",
  },

  reports: {
    bannerPrivate: "Insights from your private archive on this device",
    bannerCloud: "Insights from your family cloud",
    focalReference: "Member reference for this branch",
    loadInsights: "Refresh",
    membersLiving: (members: number, living: number) =>
      `${members} members · ${living} recorded as living`,
    chartCity: "Where members live today",
    chartAge: "Age groups",
  },

  gender: {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  },

  errors: {
    generic: "Something went wrong. Please try again.",
    validation: "Please check what you entered and try again.",
    auth: "We could not verify your sign-in. Check your email and password.",
    authCancelled: "Sign-in was cancelled.",
    network:
      "We could not reach your family cloud. Check your internet connection and website address.",
    storage: "We could not save your family records. Please try again.",
    backup: "We could not complete the backup. Please try again.",
    backupNotConfigured:
      "Cloud backup is not set up for this build yet. Contact your family administrator.",
    notFound: "We could not find what you were looking for.",
    permission: "You do not have permission to do that.",
    deleteLinkedChildren:
      "This member cannot be removed because they are linked to children in a marriage.",
    deleteLinkedAsChild:
      "This member cannot be removed because they appear as a child in a marriage.",
    needMarriageForChild:
      "Choose a marriage or add a spouse before recording a child.",
    duplicateEmail:
      "An account with this email already exists on this device. Try signing in instead.",
    wrongPassword: "The password does not match this email on this device.",
    memberMissing: "We could not find an account with this email on this device.",
    boundaryTitle: "We hit a snag",
    boundaryBody:
      "The app ran into an unexpected problem. You can try again; your saved family records on this device are not affected.",
    tryAgain: "Try again",
  },

  success: {
    saved: "Your changes were saved.",
    signedIn: "You are signed in to the family cloud.",
    signedOut: "You have been signed out.",
  },
} as const;
