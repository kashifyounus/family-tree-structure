/** Pakistan provinces / territories and major cities for structured place pickers. */

export const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
] as const;

export type PakistanProvince = (typeof PAKISTAN_PROVINCES)[number];

export const PAKISTAN_CITIES_BY_PROVINCE: Record<PakistanProvince, readonly string[]> = {
  Punjab: [
    "Lahore",
    "Faisalabad",
    "Rawalpindi",
    "Multan",
    "Gujranwala",
    "Sialkot",
    "Bahawalpur",
    "Sargodha",
    "Sheikhupura",
    "Gujrat",
    "Jhelum",
    "Sahiwal",
    "Okara",
    "Kasur",
    "Mianwali",
    "Attock",
    "Chiniot",
    "Kamoke",
    "Hafizabad",
    "Khanewal",
    "Muzaffargarh",
    "Dera Ghazi Khan",
    "Murree",
  ],
  Sindh: [
    "Karachi",
    "Hyderabad",
    "Sukkur",
    "Larkana",
    "Nawabshah",
    "Mirpur Khas",
    "Jacobabad",
    "Shikarpur",
    "Khairpur",
    "Dadu",
    "Thatta",
    "Badin",
    "Umerkot",
  ],
  "Khyber Pakhtunkhwa": [
    "Peshawar",
    "Mardan",
    "Abbottabad",
    "Swat (Mingora)",
    "Kohat",
    "Bannu",
    "Dera Ismail Khan",
    "Mansehra",
    "Swabi",
    "Charsadda",
    "Nowshera",
    "Haripur",
    "Chitral",
  ],
  Balochistan: [
    "Quetta",
    "Turbat",
    "Khuzdar",
    "Chaman",
    "Gwadar",
    "Hub",
    "Sibi",
    "Loralai",
    "Zhob",
    "Dera Murad Jamali",
  ],
  "Islamabad Capital Territory": ["Islamabad", "Rawalpindi (ICT)"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza", "Ghanche", "Ghizer", "Diamer"],
  "Azad Jammu and Kashmir": [
    "Muzaffarabad",
    "Mirpur",
    "Kotli",
    "Bhimber",
    "Rawalakot",
    "Bagh",
    "Pallandri",
  ],
};

export function citiesForProvince(province: PakistanProvince): readonly string[] {
  return PAKISTAN_CITIES_BY_PROVINCE[province] ?? [];
}

export function formatPakistanPlace(city: string, province: PakistanProvince): string {
  const c = city.trim();
  if (!c) return "";
  return `${c}, ${province}`;
}

export function parsePakistanPlace(value: string | null | undefined): {
  city: string;
  province: PakistanProvince | null;
} {
  const raw = (value ?? "").trim();
  if (!raw) return { city: "", province: null };
  const comma = raw.lastIndexOf(",");
  if (comma < 0) return { city: raw, province: null };
  const city = raw.slice(0, comma).trim();
  const provPart = raw.slice(comma + 1).trim();
  const province = PAKISTAN_PROVINCES.find((p) => p === provPart) ?? null;
  return { city, province };
}

export function searchPakistanCities(
  province: PakistanProvince,
  query: string,
  limit = 40,
): string[] {
  const q = query.trim().toLowerCase();
  const list = [...PAKISTAN_CITIES_BY_PROVINCE[province]];
  if (!q) return list.slice(0, limit);
  return list.filter((c) => c.toLowerCase().includes(q)).slice(0, limit);
}
