import type { Gender } from "@/lib/data/types";

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

export const SHOWCASE_MARGARET_ID = "showcase-margaret-khan";

export type ShowcaseMemberRow = {
  id: string;
  initials: string;
  name: string;
  subtitle: string;
  living: boolean;
  generation: number;
};

export const showcaseMemberRows: ShowcaseMemberRow[] = [
  {
    id: "showcase-kay-hassan",
    initials: "KH",
    name: "Kay Hassan",
    subtitle: "You · Archive owner",
    living: true,
    generation: 3,
  },
  {
    id: "showcase-emma-khan",
    initials: "EK",
    name: "Emma Khan",
    subtitle: "Daughter · Gen 3",
    living: true,
    generation: 3,
  },
  {
    id: "showcase-ali-khan",
    initials: "AK",
    name: "Ali Khan",
    subtitle: "Son · Gen 3",
    living: true,
    generation: 3,
  },
  {
    id: "showcase-sara-khan",
    initials: "SK",
    name: "Sara Khan",
    subtitle: "Daughter · Gen 3",
    living: true,
    generation: 3,
  },
  {
    id: SHOWCASE_MARGARET_ID,
    initials: "MK",
    name: "Margaret Khan",
    subtitle: "Aunt · Gen 2",
    living: true,
    generation: 2,
  },
  {
    id: "showcase-omar-hassan",
    initials: "OH",
    name: "Omar Hassan",
    subtitle: "Grandfather · Gen 1",
    living: false,
    generation: 1,
  },
  {
    id: "showcase-fatima-khan",
    initials: "FK",
    name: "Fatima Khan",
    subtitle: "Grandmother · Gen 1",
    living: false,
    generation: 1,
  },
  {
    id: "showcase-rashid-hassan",
    initials: "RH",
    name: "Rashid Hassan",
    subtitle: "Father · Gen 2",
    living: false,
    generation: 2,
  },
];

export type PersonDetailSegment = "about" | "photos" | "stories";

export type ShowcasePersonProfile = {
  id: string;
  initials: string;
  displayName: string;
  lifeLine: string;
  relationBadge: string;
  born: string;
  parents: { label: string; name: string }[];
  sibling: string;
  generation: string;
  bio: string;
  photos: { id: string; caption: string }[];
  stories: { id: string; title: string; author: string }[];
};

export const margaretKhanProfile: ShowcasePersonProfile = {
  id: SHOWCASE_MARGARET_ID,
  initials: "MK",
  displayName: "Margaret Khan",
  lifeLine: "1962 — · Living",
  relationBadge: "Aunt",
  born: "12 March 1962 · Lahore, Pakistan",
  parents: [
    { label: "Father", name: "Omar Hassan" },
    { label: "Mother", name: "Fatima Khan" },
  ],
  sibling: "Rashid Hassan (brother)",
  generation: "2nd generation · Hassan–Khan line",
  bio:
    "Margaret kept the family letters when she moved to Manchester in 1989. She visits Lahore every few years and helps Kay verify names, dates, and wedding photos before they are added to the private archive.",
  photos: [
    { id: "p1", caption: "Mehndi night, Lahore 1988" },
    { id: "p2", caption: "With Rashid and Nadia, 1995" },
  ],
  stories: [
    {
      id: "lahore-wedding",
      title: "The wedding in Lahore",
      author: "Sara Khan",
    },
  ],
};

export function filterShowcaseMembers(
  rows: ShowcaseMemberRow[],
  query: string,
  chip: "all" | "living" | "generations",
): ShowcaseMemberRow[] {
  const q = query.trim().toLowerCase();
  let list = rows;
  if (q) {
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.initials.toLowerCase().includes(q),
    );
  }
  if (chip === "living") {
    list = list.filter((r) => r.living);
  }
  if (chip === "generations") {
    list = [...list].sort((a, b) => a.generation - b.generation);
  }
  return list;
}

export function showcaseMembersCount(localCount: number): number {
  if (localCount <= 0) return showcaseStatsDefault.members;
  return Math.max(localCount, showcaseStatsDefault.members);
}

export type ShowcasePedigreePerson = {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  years: string;
  subtitle?: string;
  isFocal?: boolean;
};

/** Three-generation Hassan–Khan pedigree for empty-archive Tree tab. */
export const showcasePedigree: {
  generation1: ShowcasePedigreePerson[];
  generation2: ShowcasePedigreePerson[];
  generation3: ShowcasePedigreePerson[];
} = {
  generation1: [
    {
      id: "showcase-omar-hassan",
      firstName: "Omar",
      lastName: "Hassan",
      gender: "MALE",
      years: "1934–2010",
      subtitle: "Grandfather",
    },
    {
      id: "showcase-fatima-khan",
      firstName: "Fatima",
      lastName: "Khan",
      gender: "FEMALE",
      years: "1938–2018",
      subtitle: "Grandmother",
    },
  ],
  generation2: [
    {
      id: "showcase-rashid-hassan",
      firstName: "Rashid",
      lastName: "Hassan",
      gender: "MALE",
      years: "1960–2019",
      subtitle: "Father",
    },
    {
      id: "showcase-nadia-hassan",
      firstName: "Nadia",
      lastName: "Hassan",
      gender: "FEMALE",
      years: "1964 —",
      subtitle: "Mother",
    },
    {
      id: SHOWCASE_MARGARET_ID,
      firstName: "Margaret",
      lastName: "Khan",
      gender: "FEMALE",
      years: "1962 —",
      subtitle: "Aunt",
    },
  ],
  generation3: [
    {
      id: "showcase-kay-hassan",
      firstName: "Kay",
      lastName: "Hassan",
      gender: "MALE",
      years: "1990 —",
      subtitle: "You",
      isFocal: true,
    },
    {
      id: "showcase-emma-khan",
      firstName: "Emma",
      lastName: "Khan",
      gender: "FEMALE",
      years: "1992 —",
      subtitle: "Sister",
    },
    {
      id: "showcase-ali-khan",
      firstName: "Ali",
      lastName: "Khan",
      gender: "MALE",
      years: "1994 —",
      subtitle: "Brother",
    },
    {
      id: "showcase-sara-khan",
      firstName: "Sara",
      lastName: "Khan",
      gender: "FEMALE",
      years: "1996 —",
      subtitle: "Sister",
    },
  ],
};

export function shouldShowShowcasePedigree(localMemberCount: number, mode: string): boolean {
  return mode === "local" && localMemberCount <= 1;
}

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
