import ScrobbleRecord from "../models/ScrobbleRecord";
import rymUi from "./rymUi";
import scRYMbleUi from "./scrymbleUi";

export abstract class uiParser {
  public static buildListOfSongsToScrobble(
    _rymUi: rymUi,
    _scRYMbleUi: scRYMbleUi
  ): ScrobbleRecord[] {
    const toScrobble: ScrobbleRecord[] = [];
    Array.from(_scRYMbleUi.checkboxes).forEach(checkbox => {
      if (checkbox.checked) {
        toScrobble[toScrobble.length] = uiParser.parseTracklistLine(
          // TODO: refactor this vvvv
          _rymUi, _rymUi.tracklistLine(checkbox));
      }
    });
    return toScrobble;
  }

  public static parseTracklistLine(
    rymUi: rymUi,
    tracklistLine: HTMLDivElement): ScrobbleRecord {
    const pageArtist = rymUi.pageArtist;

    let songTitle = rymUi.trackName(tracklistLine);
    let artist: string = pageArtist;
    const duration = rymUi.trackDuration(tracklistLine);

    if (rymUi.isVariousArtists) {
      artist = rymUi.trackArtist(tracklistLine);
      if (artist.length === 0) {
        console.log(`Couldn't determine artist for track "${songTitle}".`);
        artist = pageArtist.indexOf("Various Artists") > -1
          ? rymUi.pageAlbum
          : pageArtist;
      }
    } else {
      const trackArtist = rymUi.trackArtist(tracklistLine);
      if (trackArtist.length > 0) {
        artist = trackArtist;
      }
    }

    if (songTitle.toLowerCase() === "untitled" ||
      songTitle.toLowerCase() === "untitled track" ||
      songTitle === "") {
      songTitle = "[untitled]";
    }

    while (songTitle.indexOf("  ") > 0) {
      songTitle = songTitle.replace("  ", " ");
    }

    return new ScrobbleRecord(songTitle, artist, duration);
  }
}
