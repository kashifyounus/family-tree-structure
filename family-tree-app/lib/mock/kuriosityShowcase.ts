/** Showcase copy + stats for Figma-aligned Home (Kay Hassan archive). */

export type HomeActivity = {
  id: string;
  initials: string;
  title: string;
  subtitle: string;
  timeAgo: string;
};

export const showcaseUser = {
  firstName: "Kay",
  displayName: "Kay Hassan",
  initials: "KH",
  email: "kay.hassan@kuriosity.engineering",
};

export const showcaseStatsDefault = {
  members: 48,
  generations: 12,
  stories: 6,
};

export const showcaseActivities: HomeActivity[] = [
  {
    id: "a1",
    initials: "EK",
    title: "Emma added a photo",
    subtitle: "Wedding album · 1962",
    timeAgo: "2h ago",
  },
  {
    id: "a2",
    initials: "AK",
    title: "Ali linked a parent",
    subtitle: "Margaret Khan → Rashid Hassan",
    timeAgo: "Yesterday",
  },
  {
    id: "a3",
    initials: "SK",
    title: "Sara shared a story",
    subtitle: "The wedding in Lahore",
    timeAgo: "3d ago",
  },
];

export function mergeShowcaseStats(memberCount: number): typeof showcaseStatsDefault {
  if (memberCount <= 0) return showcaseStatsDefault;
  return {
    members: memberCount,
    generations: Math.min(12, Math.max(3, Math.round(memberCount / 8))),
    stories: Math.max(1, Math.round(memberCount / 10)),
  };
}

export function greetingForKay(): string {
  const hour = new Date().getHours();
  const period =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${period}, ${showcaseUser.firstName}`;
}

export type ShowcaseNotification = {
  id: string;
  section: "Today" | "Earlier";
  initials: string;
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
};

export const showcaseNotifications: ShowcaseNotification[] = [
  {
    id: "n1",
    section: "Today",
    initials: "EK",
    title: "Emma added photos",
    subtitle: "Wedding album · 4 new images",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n2",
    section: "Today",
    initials: "AK",
    title: "Ali linked Margaret Khan",
    subtitle: "Parent relationship confirmed",
    time: "5h ago",
    unread: true,
  },
  {
    id: "n3",
    section: "Earlier",
    initials: "SK",
    title: "Sara shared a story",
    subtitle: "The wedding in Lahore",
    time: "Mon",
    unread: false,
  },
];

export const showcaseStoryLahore = {
  id: "lahore-wedding",
  title: "The wedding in Lahore",
  author: "Sara Khan",
  caption: "Omar and Fatima at the courtyard entrance, spring 1988.",
  paragraphs: [
    "The courtyard was already full when we arrived—cousins from Karachi, uncles from London, and neighbors who had known our grandparents for decades. The mehndi drums echoed off the old brick walls while Fatima adjusted Omar’s sherwani collar one last time.",
    "Margaret sent a letter she could not deliver in person; we read it aloud after dinner. She wrote about how proud she was to see the Hassan name carried forward with such warmth. That night, three generations posed under the string lights, and Kay promised to keep every name in the archive.",
  ],
  relatedPeople: ["Omar Hassan", "Fatima Khan", "Margaret Khan"],
};
