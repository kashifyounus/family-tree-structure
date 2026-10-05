import {
  formatPakistanPlace,
  parsePakistanPlace,
  searchPakistanCities,
} from "../../shared/geo/pakistanPlaces";

describe("pakistanPlaces", () => {
  it("formats and parses city + province", () => {
    const s = formatPakistanPlace("Lahore", "Punjab");
    expect(s).toBe("Lahore, Punjab");
    expect(parsePakistanPlace(s)).toEqual({ city: "Lahore", province: "Punjab" });
  });

  it("searches cities within a province", () => {
    const hits = searchPakistanCities("Sindh", "kar");
    expect(hits).toContain("Karachi");
  });
});
