import type { Gender } from "@/lib/data/types";

export type PersonFieldsValue = {
  firstName: string;
  lastName: string;
  maidenName: string;
  suffix: string;
  nickname: string;
  gender: Gender;
  isLiving: boolean;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
};

export const emptyPersonFieldsValue = (gender: Gender = "MALE"): PersonFieldsValue => ({
  firstName: "",
  lastName: "",
  maidenName: "",
  suffix: "",
  nickname: "",
  gender,
  isLiving: true,
  birthDate: "",
  birthPlace: "",
  deathDate: "",
  deathPlace: "",
});
