import * as SecureStore from "expo-secure-store";

/**
 * Read a value from SecureStore, migrating from a legacy key on first hit.
 */
export async function readSecureWithLegacyKey(
  primaryKey: string,
  legacyKey: string,
): Promise<string | null> {
  const primary = await SecureStore.getItemAsync(primaryKey);
  if (primary != null) return primary;

  const legacy = await SecureStore.getItemAsync(legacyKey);
  if (legacy == null) return null;

  await SecureStore.setItemAsync(primaryKey, legacy);
  await SecureStore.deleteItemAsync(legacyKey);
  return legacy;
}

export async function deleteSecurePrimaryAndLegacy(
  primaryKey: string,
  legacyKey: string,
): Promise<void> {
  await SecureStore.deleteItemAsync(primaryKey);
  await SecureStore.deleteItemAsync(legacyKey);
}
