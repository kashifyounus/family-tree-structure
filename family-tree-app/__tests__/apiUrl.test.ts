import {
  normalizeApiBaseUrl,
  validateApiBaseUrl,
} from "@/lib/apiUrl";

describe("apiUrl", () => {
  it("normalizes bare hostnames to https and trims slashes", () => {
    expect(normalizeApiBaseUrl("family.example.com/")).toBe(
      "https://family.example.com",
    );
    expect(normalizeApiBaseUrl("http://10.0.2.2:3000")).toBe(
      "http://10.0.2.2:3000",
    );
  });

  it("rejects empty and invalid addresses", () => {
    expect(validateApiBaseUrl("")).toMatch(/Enter/);
    expect(validateApiBaseUrl("not a url!!!")).toMatch(/valid/);
  });

  it("accepts http and https bases", () => {
    expect(validateApiBaseUrl("https://kinship.example.org")).toBeNull();
    expect(validateApiBaseUrl("http://192.168.1.10:3000")).toBeNull();
  });
});
