export function generateFamilyCode(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `FAM-${digits}`;
}
