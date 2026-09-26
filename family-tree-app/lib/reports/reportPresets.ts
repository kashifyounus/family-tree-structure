import type { ArchiveQuery } from "../../../shared/archiveQuery";

export type ReportPreset = {
  id: string;
  title: string;
  description: string;
  query: ArchiveQuery;
};

export const REPORT_PRESETS: ReportPreset[] = [
  {
    id: "living",
    title: "Living members",
    description: "Everyone recorded without a death date",
    query: { and: [{ field: "living", value: "true" }] },
  },
  {
    id: "deceased",
    title: "Deceased",
    description: "Members with a recorded death date",
    query: { and: [{ field: "living", value: "false" }] },
  },
  {
    id: "women",
    title: "Women in archive",
    description: "Female members across your tree",
    query: { and: [{ field: "gender", value: "FEMALE" }] },
  },
  {
    id: "men",
    title: "Men in archive",
    description: "Male members across your tree",
    query: { and: [{ field: "gender", value: "MALE" }] },
  },
  {
    id: "nicknames",
    title: "With nicknames",
    description: "Members who have a nickname on file",
    query: { and: [{ field: "hasNickname", value: "true" }] },
  },
];
