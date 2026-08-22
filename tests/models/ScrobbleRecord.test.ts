import ScrobbleRecord from "../../src/models/ScrobbleRecord";

function recordWithDuration(duration: string): ScrobbleRecord {
  return new ScrobbleRecord("The Track", "The Artist", duration);
}

describe("ScrobbleRecord duration parsing", () => {
  test("parses m:ss into seconds", () => {
    expect(recordWithDuration("3:47").duration).toBe(227);
  });

  test("parses zero-padded minutes", () => {
    expect(recordWithDuration("0:58").duration).toBe(58);
  });

  test("parses double-digit minutes", () => {
    expect(recordWithDuration("12:34").duration).toBe(754);
  });

  test("parses h:mm:ss into seconds", () => {
    expect(recordWithDuration("1:02:03").duration).toBe(3723);
  });

  test("parses large m:ss values as minutes rather than hours", () => {
    expect(recordWithDuration("200:00").duration).toBe(12000);
    expect(recordWithDuration("95:30").duration).toBe(5730);
  });

  test("trims surrounding whitespace before parsing", () => {
    expect(recordWithDuration("  4:20  ").duration).toBe(260);
  });

  test("falls back to 180 seconds when no colon is present", () => {
    expect(recordWithDuration("").duration).toBe(180);
    expect(recordWithDuration("garbage").duration).toBe(180);
    expect(recordWithDuration("180").duration).toBe(180);
  });

  test("starts with a zero timestamp", () => {
    expect(recordWithDuration("3:47").time).toBe(0);
  });
});
