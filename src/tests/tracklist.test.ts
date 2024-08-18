import * as fs from "fs";
import { JSDOM } from "jsdom";
import rymUi from "../services/rymUi";
import scRYMbleUi from "../services/scrymbleUi";
import { uiParser } from "../services/uiParser";
import { headOnTheDoor } from "./data/expected";

describe("Tracklist parsing tests", () => {
  beforeAll(() => {
    const html = fs.readFileSync("./src/tests/data/noSongLinks.htm", "utf-8");
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
  });

  test("should parse a tracklist with no song links", () => {
    const element = document.querySelector("#tracks");
    expect(element).not.toBeNull();

    const _rymUi = new rymUi("The Cure");
    const _scRYMbleUi = new scRYMbleUi(_rymUi);
    const songList = uiParser.buildListOfSongsToScrobble(_rymUi, _scRYMbleUi);

    expect(songList.length).toBe(headOnTheDoor.length);

    for (let i = 0; i < songList.length; i++) {
      expect(songList[i].artist).toBe(headOnTheDoor[i].artist);
      expect(songList[i].trackName).toBe(headOnTheDoor[i].trackName);
      expect(songList[i].duration).toBe(headOnTheDoor[i].duration);
    }
  });
});
