import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_KINSHIP_LABEL_LOCALE,
  type KinshipLabelLocale,
} from "../../../shared/humanKinshipLabel";

const STORAGE_KEY = "@kuriosity/kinship-label-locale/v1";

let cached: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE;

export function getKinshipLabelLocale(): KinshipLabelLocale {
  return cached;
}

export async function loadKinshipLabelLocale(): Promise<KinshipLabelLocale> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cached = raw === "en" ? "en" : DEFAULT_KINSHIP_LABEL_LOCALE;
  } catch {
    cached = DEFAULT_KINSHIP_LABEL_LOCALE;
  }
  return cached;
}

export async function saveKinshipLabelLocale(
  locale: KinshipLabelLocale,
): Promise<void> {
  cached = locale;
  await AsyncStorage.setItem(STORAGE_KEY, locale);
}
