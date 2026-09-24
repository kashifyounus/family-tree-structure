import { formatParentLine } from "@/lib/db/parentDisplay";

describe("formatParentLine", () => {
  it("formats father and mother names", () => {
    expect(
      formatParentLine({ fatherName: "Hassan Khan", motherName: "Ayesha Khan" }),
    ).toBe("Father: Hassan Khan · Mother: Ayesha Khan");
  });

  it("uses placeholders when missing", () => {
    expect(formatParentLine({ fatherName: null, motherName: "Ayesha Khan" })).toBe(
      "Father: — · Mother: Ayesha Khan",
    );
  });
});
