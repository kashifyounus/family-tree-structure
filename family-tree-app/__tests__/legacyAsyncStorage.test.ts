import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  readWithLegacyKey,
  removePrimaryAndLegacy,
} from "@/lib/storage/legacyAsyncStorage";

describe("legacyAsyncStorage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("readWithLegacyKey migrates legacy value to primary", async () => {
    await AsyncStorage.setItem("legacy", "value");
    expect(await readWithLegacyKey("primary", "legacy")).toBe("value");
    expect(await AsyncStorage.getItem("primary")).toBe("value");
    expect(await AsyncStorage.getItem("legacy")).toBeNull();
  });

  it("readWithLegacyKey prefers primary", async () => {
    await AsyncStorage.setItem("primary", "new");
    await AsyncStorage.setItem("legacy", "old");
    expect(await readWithLegacyKey("primary", "legacy")).toBe("new");
    expect(await AsyncStorage.getItem("legacy")).toBe("old");
  });

  it("removePrimaryAndLegacy clears both keys", async () => {
    await AsyncStorage.setItem("primary", "1");
    await AsyncStorage.setItem("legacy", "2");
    await removePrimaryAndLegacy("primary", "legacy");
    expect(await AsyncStorage.getItem("primary")).toBeNull();
    expect(await AsyncStorage.getItem("legacy")).toBeNull();
  });
});
