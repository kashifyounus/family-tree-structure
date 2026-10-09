import { layoutKinshipPathTimeline } from "./pathTimelineLayout";

describe("pathTimelineLayout", () => {
  it("places parent above child on the timeline", () => {
    const { positions } = layoutKinshipPathTimeline(
      "child",
      [{ fromId: "child", toId: "parent", relation: "parent" }],
      "child",
      "parent",
    );
    expect(positions.get("parent")!.y).toBeLessThan(positions.get("child")!.y);
  });

  it("places spouses on the same row", () => {
    const { positions } = layoutKinshipPathTimeline(
      "a",
      [{ fromId: "a", toId: "b", relation: "spouse" }],
      "a",
      "b",
    );
    expect(positions.get("a")!.y).toBe(positions.get("b")!.y);
  });
});
