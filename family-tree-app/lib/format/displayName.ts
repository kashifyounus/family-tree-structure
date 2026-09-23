import type { GraphPersonSummary } from "@/lib/graph/types";

type NameFields = {
  firstName: string;
  lastName: string;
  urduFirstName?: string | null;
  urduLastName?: string | null;
};

export function formatBilingualName(person: NameFields): string {
  const en = `${person.firstName} ${person.lastName}`.trim();
  const urduParts = [person.urduFirstName, person.urduLastName].filter(Boolean);
  const urdu = urduParts.join(" ").trim();
  if (en && urdu) return `${en} · ${urdu}`;
  return en || urdu || "";
}

export function formatGraphPersonName(person: GraphPersonSummary): string {
  return formatBilingualName(person);
}
