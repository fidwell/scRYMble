import { createHash } from "crypto";
import { hex_md5 } from "../../src/services/md5";

function nodeMd5(value: string): string {
  return createHash("md5").update(value, "utf8").digest("hex");
}

describe("vendored hex_md5", () => {
  test.each([
    ["", "d41d8cd98f00b204e9800998ecf8427e"],
    ["a", "0cc175b9c0f1b6a831c399e269772661"],
    ["abc", "900150983cd24fb0d6963f7d28e17f72"],
    ["The quick brown fox jumps over the lazy dog", "9e107d9d372bb6826bd81d3542a419d6"],
    ["12345678901234567890123456789012345678901234567890123456789012345678901234567890", "57edf4a22be3c955ac49da2e2107b67a"]
  ])("matches the published md5 vector for %j", (input, expected) => {
    expect(hex_md5(input)).toBe(expected);
  });

  test.each([
    "secretpw!",
    "ann&bob +1",
    "multi\nline password",
    "unicode éàü 🎵",
    "x".repeat(500)
  ])("agrees with node's crypto md5 for %j", input => {
    expect(hex_md5(input)).toBe(nodeMd5(input));
  });
});
