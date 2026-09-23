import { copy } from "@/content/businessCopy";
import type { Gender } from "@/lib/data/types";

export function formatGender(gender: Gender): string {
  return copy.gender[gender];
}
