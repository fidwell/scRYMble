import * as fs from "fs";
import { JSDOM } from "jsdom";
import rymUi from "../services/rymUi";
import scRYMbleUi from "../services/scrymbleUi";
import { uiParser } from "../services/uiParser";

describe("DOM tests", () => {
  beforeAll(() => {
    const html = fs.readFileSync("./src/tests/data/noSongLinks.html", "utf-8");
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
  });

  test("should manipulate the DOM correctly", () => {
    const element = document.querySelector("#tracks");
    expect(element).not.toBeNull();

    const _rymUi = new rymUi();
    const _scRYMbleUi = new scRYMbleUi(_rymUi);
    const songList = uiParser.buildListOfSongsToScrobble(_rymUi, _scRYMbleUi);
    console.log(songList.length);
    // TODO: Add assertions here
  });
});
