/** Layout and shape tokens — keep in sync with `paperTheme.roundness`. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

export const layout = {
  screenPaddingX: 20,
  screenPaddingTop: 12,
  listGap: 10,
  fabOffset: 16,
} as const;

export const elevation = {
  card: 2,
  fab: 4,
  search: 1,
} as const;
