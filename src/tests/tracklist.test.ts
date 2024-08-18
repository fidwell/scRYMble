import * as fs from "fs";
import { JSDOM } from "jsdom";
import ScrobbleRecord from "../models/ScrobbleRecord";
import rymUi from "../services/rymUi";
import scRYMbleUi from "../services/scrymbleUi";
import { uiParser } from "../services/uiParser";
import { compoundArtists, headOnTheDoor, singleArtist, split } from "./data/expected";

describe("Tracklist parsing tests", () => {
  function setup(filename: string) {
    const html = fs.readFileSync(`./src/tests/data/${filename}.htm`, "utf-8");
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
  }

  function testCase(
    filename: string,
    artistOverride: string,
    expected: ScrobbleRecord[]) {
    setup(filename);

    const element = document.querySelector("#tracks");
    expect(element).not.toBeNull();

    const _rymUi = new rymUi(artistOverride);
    const _scRYMbleUi = new scRYMbleUi(_rymUi);
    const songList = uiParser.buildListOfSongsToScrobble(_rymUi, _scRYMbleUi);

    expect(songList.length).toBe(expected.length);

    for (let i = 0; i < songList.length; i++) {
      expect(songList[i].artist).toBe(expected[i].artist);
      expect(songList[i].trackName).toBe(expected[i].trackName);
      expect(songList[i].duration).toBe(expected[i].duration);
    }
  }

  test("should parse a release with a single artist", () => {
    testCase("singleArtist", "Kraftwerk", singleArtist);
  });

  test("should parse a tracklist with no song links", () => {
    testCase("noSongLinks", "The Cure", headOnTheDoor);
  });

  test("should parse a split release", () => {
    testCase("split", "Prosanctus Inferi / Witch Tomb", split);
  });

  test("should parse a release with compound track artists", () => {
    testCase("compoundArtists", "Jami Sieber", compoundArtists);
  });
});
