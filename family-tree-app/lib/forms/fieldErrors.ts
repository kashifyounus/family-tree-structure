export type FieldErrors = Partial<Record<string, string>>;

export function required(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `${label} is required`;
}

export function firstFieldError(errors: FieldErrors): string | undefined {
  return Object.values(errors).find(Boolean);
}
