import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Read a value from AsyncStorage, migrating from a legacy key on first hit (U1 prep).
 */
export async function readWithLegacyKey(
  primaryKey: string,
  legacyKey: string,
): Promise<string | null> {
  const primary = await AsyncStorage.getItem(primaryKey);
  if (primary != null) return primary;

  const legacy = await AsyncStorage.getItem(legacyKey);
  if (legacy == null) return null;

  await AsyncStorage.setItem(primaryKey, legacy);
  await AsyncStorage.removeItem(legacyKey);
  return legacy;
}

export async function writePrimaryKey(
  primaryKey: string,
  value: string,
): Promise<void> {
  await AsyncStorage.setItem(primaryKey, value);
}
