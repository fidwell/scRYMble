import * as fs from "fs";
import { JSDOM } from "jsdom";
import rymUi from "../services/rymUi";
import scRYMbleUi from "../services/scrymbleUi";
import * as uiParser from "../services/uiParser";
import { braidWithLinks, braidWithoutLinks, dieMenschMaschine, headOnTheDoor, split } from "./data/expected";
import TestModel from "./models/TestModel";

describe("Tracklist parsing tests", () => {
  function setup(filename: string) {
    const html = fs.readFileSync(`./src/tests/data/${filename}.htm`, "utf-8");
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
  }

  function testCase(
    filename: string,
    expected: TestModel) {
    setup(filename);

    const element = document.querySelector("#tracks");
    expect(element).not.toBeNull();

    const _rymUi = new rymUi();
    const _scRYMbleUi = new scRYMbleUi(_rymUi);
    const songList = uiParser.buildListOfSongsToScrobble(_rymUi, _scRYMbleUi);

    expect(_rymUi.pageArtist).toBe(expected.artist);
    expect(_rymUi.pageAlbum).toBe(expected.album);
    expect(songList.length).toBe(expected.tracks.length);

    for (let i = 0; i < songList.length; i++) {
      expect(songList[i].artist).toBe(expected.tracks[i].artist);
      expect(songList[i].trackName).toBe(expected.tracks[i].trackName);
      expect(songList[i].duration).toBe(expected.tracks[i].duration);
    }
  }

  test("should parse a release with a single artist", () => {
    testCase("singleArtist", dieMenschMaschine);
  });

  test("should parse a tracklist with no song links", () => {
    testCase("noSongLinks", headOnTheDoor);
  });

  test("should parse a split release", () => {
    testCase("split", split);
  });

  test("should parse a release with compound track artists", () => {
    testCase("compoundArtists", braidWithLinks);
  });

  test("should parse a release with compound track artists but no song links", () => {
    testCase("compoundArtistsNoLinks", braidWithoutLinks);
  });
});
