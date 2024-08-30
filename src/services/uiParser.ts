import ScrobbleRecord from "../models/ScrobbleRecord";
import rymUi from "./rymUi";
import scRYMbleUi from "./scrymbleUi";

export function buildListOfSongsToScrobble(
  _rymUi: rymUi,
  _scRYMbleUi: scRYMbleUi
): ScrobbleRecord[] {
  const toScrobble: ScrobbleRecord[] = [];
  Array.from(_scRYMbleUi.checkboxes).forEach(checkbox => {
    if (checkbox.checked) {
      toScrobble[toScrobble.length] = parseTracklistLine(_rymUi, checkbox);
    }
  });
  return toScrobble;
}

function parseTracklistLine(rymUi: rymUi, checkbox: HTMLInputElement): ScrobbleRecord {
  const tracklistLine = rymUi.tracklistLine(checkbox);
  const pageArtist = rymUi.pageArtist;

  let songTitle = rymUi.trackName(tracklistLine);
  let artist: string = pageArtist;
  const duration = rymUi.trackDuration(tracklistLine);

  if (rymUi.isVariousArtists) {
    artist = rymUi.trackArtist(tracklistLine);
    if (artist.length === 0) {
      artist = pageArtist.indexOf("Various Artists") > -1
        ? rymUi.pageAlbum
        : pageArtist; // Probably a collaboration release, like a classical work.
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

  return new ScrobbleRecord(songTitle, artist, duration);
}
