import { JSDOM } from "jsdom";
import { stripAndClean } from "../../src/services/utilities";

describe("stripAndClean", () => {
  beforeEach(() => {
    const dom = new JSDOM("<body></body>");
    global.document = dom.window.document;
  });

  test("collapses runs of spaces into one", () => {
    expect(stripAndClean("The  Beatles")).toBe("The Beatles");
    expect(stripAndClean("A   B    C")).toBe("A B C");
  });

  test("decodes ampersand entities rather than deleting them", () => {
    expect(stripAndClean("Simon &amp; Garfunkel")).toBe("Simon & Garfunkel");
  });

  test("decodes every entity occurrence, not just the first", () => {
    expect(stripAndClean("Friends &amp; Foes &amp; Aliens")).toBe("Friends & Foes & Aliens");
  });

  test("decodes quoted and apostrophe entities", () => {
    expect(stripAndClean("&quot;Weird Al&quot; Yankovic")).toBe("\"Weird Al\" Yankovic");
    expect(stripAndClean("Ben&#39;s Friend")).toBe("Ben's Friend");
  });

  test("converts non-breaking spaces into regular spaces", () => {
    expect(stripAndClean("Foo&nbsp;Bar")).toBe("Foo Bar");
  });

  test("replaces every newline, not just the first", () => {
    expect(stripAndClean("One\nTwo\nThree")).toBe("One Two Three");
  });

  test("strips leading dash artifacts left by track artists", () => {
    expect(stripAndClean(" - Already Gone")).toBe("Already Gone");
    expect(stripAndClean("- Already Gone")).toBe("Already Gone");
  });

  test("strips leading ampersand-dash artifacts left by blanked artist links", () => {
    expect(stripAndClean("& - Lullaby Set")).toBe("Lullaby Set");
  });

  test("handles everything combined", () => {
    expect(stripAndClean("Simon &amp;\n  Garfunkel ")).toBe("Simon & Garfunkel");
  });
});
