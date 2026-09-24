export function clampGraphScale(value: number): number {
  return Math.min(2.5, Math.max(0.55, value));
}
