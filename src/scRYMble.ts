import { HttpResponse } from "./models/HttpResponse";
import { IDictionary } from "./models/IDictionary";
import ScrobbleRecord from "./models/ScrobbleRecord";
import * as httpRequestHelper from "./services/httpRequestHelper";
import { handshake } from "./services/lastfm";
import rymUi from "./services/rymUi";
import scRYMbleUi from "./services/scrymbleUi";
import { fetch_unix_timestamp } from "./services/utilities";

const _rymUi = new rymUi();
const _scRYMbleUi = new scRYMbleUi(_rymUi);

let toScrobble: ScrobbleRecord[] = [];
let currentlyScrobbling = -1;
let sessID = "";
let submitURL = "";
let npURL = "";
let currTrackDuration = 0;
let currTrackPlayTime = 0;

function confirmBrowseAway(oEvent: BeforeUnloadEvent): string {
  if (currentlyScrobbling !== -1) {
    oEvent.preventDefault();
    return "You are currently scrobbling a record. Leaving the page now will prevent future tracks from this release from scrobbling.";
  }
  return "";
}

function isVariousArtists(): boolean {
  const artist: string = _rymUi.pageArtist;
  return artist.indexOf("Various Artists") > -1 ||
    artist.indexOf(" / ") > -1;
}

function acceptSubmitResponse(responseDetails: HttpResponse, isBatch: boolean) {
  if (responseDetails.status === 200) {
    if (!responseDetails.isOkStatus) {
      alertSubmitFailed(responseDetails);
    }
  } else {
    alertSubmitFailed(responseDetails);
  }

  if (isBatch) {
    _scRYMbleUi.setMarquee("Scrobbled OK!");
  } else {
    scrobbleNextSong();
  }
}

function alertSubmitFailed(responseDetails: HttpResponse) {
  alert(`Track submit failed: ${responseDetails.status} ${responseDetails.statusText}\n\nData:\n${responseDetails.responseText}`);
}

function acceptSubmitResponseSingle(responseDetails: HttpResponse) {
  acceptSubmitResponse(responseDetails, false);
}

function acceptSubmitResponseBatch(responseDetails: HttpResponse) {
  acceptSubmitResponse(responseDetails, true);
}

function acceptNPResponse(responseDetails: HttpResponse) {
  if (responseDetails.status === 200) {
    if (!responseDetails.isOkStatus) {
      alertSubmitFailed(responseDetails);
    }
  } else {
    alertSubmitFailed(responseDetails);
  }
}

function buildListOfSongsToScrobble() {
  toScrobble = [];

  // TODO - Remove jQuery
  $.each($(".scrymblechk"), function () {
    if ($(this).is(":checked")) {
      const song = $(this).parent().parent();
      let songTitle = $(song).find("span[itemprop=\"name\"]").text();
      let artist: string = _rymUi.pageArtist;
      const length = $(song).find(".tracklist_duration").text();

      if (isVariousArtists()) {
        const firstDash = songTitle.indexOf(" - ");
        if (firstDash === -1) {
          // no dash exists! must be a single artist with " / " in the name or v/a with unscrobbleable list
          if (artist.indexOf("Various Artists") > -1) {
            artist = $(".album_title:eq(0)").text();
          }
        } else {
          artist = songTitle.substring(0, firstDash);
          songTitle = songTitle.substring(firstDash + 3);
        }
      } else {
        const title = $(song).find("span[itemprop=\"name\"]");
        if ($(title).html().indexOf("<a title=\"[Artist") === 0 && $(title).text().indexOf(" - ") > 0) {
          const firstDash = songTitle.indexOf(" - ");
          artist = songTitle.substring(0, firstDash);
          songTitle = songTitle.substring(firstDash + 3);
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
      toScrobble[toScrobble.length] = new ScrobbleRecord(songTitle, artist, length);
    }
  });
}

function submitTracksBatch(sessID: string, submitURL: string) {
  buildListOfSongsToScrobble();

  if (toScrobble === null)
    return;

  let currTime = fetch_unix_timestamp();
  const hoursFudgeStr = prompt("How many hours ago did you listen to this?");
  if (hoursFudgeStr !== null) {
    const album = _rymUi.pageAlbum;
    const hoursFudge = parseFloat(hoursFudgeStr);

    if (!isNaN(hoursFudge)) {
      currTime = currTime - hoursFudge * 60 * 60;
    }

    for (let i = toScrobble.length - 1; i >= 0; i--) {
      currTime = currTime * 1 - toScrobble[i].duration * 1;
      toScrobble[i].time = currTime;
    }

    let outstr = `Artist: ${_rymUi.pageArtist}\nAlbum: ${album}\n`;

    for (const song of toScrobble) {
      outstr = `${outstr}${song.trackName} (${song.duration})\n`;
    }

    const postdata = {} as IDictionary;

    for (let i = 0; i < toScrobble.length; i++) {
      postdata[`a[${i}]`] = toScrobble[i].artist;
      postdata[`t[${i}]`] = toScrobble[i].trackName;
      postdata[`b[${i}]`] = album;
      postdata[`n[${i}]`] = `${i + 1}`;
      postdata[`l[${i}]`] = `${toScrobble[i].duration}`;
      postdata[`i[${i}]`] = `${toScrobble[i].time}`;
      postdata[`o[${i}]`] = "P";
      postdata[`r[${i}]`] = "";
      postdata[`m[${i}]`] = "";
    }

    postdata["s"] = sessID;

    const postdataStr = Object.entries(postdata)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    httpRequestHelper.httpPost(submitURL, postdataStr, acceptSubmitResponseBatch);
  }
}

function startScrobble(): void {
  currentlyScrobbling = -1;
  currTrackDuration = 0;
  currTrackPlayTime = 0;

  _scRYMbleUi.elementsOff();
  buildListOfSongsToScrobble();
  scrobbleNextSong();
}

function resetScrobbler(): void {
  currentlyScrobbling = -1;
  currTrackDuration = 0;
  currTrackPlayTime = 0;
  _scRYMbleUi.setMarquee("&nbsp;");
  _scRYMbleUi.setProgressBar(0);
  toScrobble = [];
  _scRYMbleUi.elementsOn();
}

function scrobbleNextSong(): void {
  currentlyScrobbling++;

  if (currentlyScrobbling === toScrobble.length) {
    resetScrobbler();
  } else {
    window.setTimeout(timertick, 10);
    handshake(_scRYMbleUi, acceptHandshakeSingle);
  }
}

function submitThisTrack(): void {
  const postdata = {} as IDictionary;
  const i = 0;
  const currTime = fetch_unix_timestamp();

  postdata[`a${i}`] = toScrobble[currentlyScrobbling].artist;
  postdata[`t${i}`] = toScrobble[currentlyScrobbling].trackName;
  postdata[`b${i}`] = _rymUi.pageAlbum;
  postdata[`n${i}`] = `${currentlyScrobbling + 1}`;
  postdata[`l${i}`] = `${toScrobble[currentlyScrobbling].duration}`;
  postdata[`i${i}`] = `${currTime - toScrobble[currentlyScrobbling].duration}`;
  postdata[`o${i}`] = "P";
  postdata[`r${i}`] = "";
  postdata[`m${i}`] = "";

  postdata["s"] = sessID;

  // TODO - Refactor string generation
  let postdataStr = "";
  let firstTime = true;
  for (const currKey in postdata) {
    if (firstTime) {
      firstTime = false;
    } else {
      postdataStr = `${postdataStr}&`;
    }
    postdataStr = `${postdataStr}${encodeURIComponent(currKey)}=${encodeURIComponent(postdata[currKey])}`;
  }

  httpRequestHelper.httpPost(submitURL, postdataStr, acceptSubmitResponseSingle);
}

function npNextTrack() {
  const postdata = {} as IDictionary;
  postdata["a"] = toScrobble[currentlyScrobbling].artist;
  postdata["t"] = toScrobble[currentlyScrobbling].trackName;
  postdata["b"] = _rymUi.pageAlbum;
  postdata["n"] = `${currentlyScrobbling + 1}`;
  postdata["l"] = `${toScrobble[currentlyScrobbling].duration}`;
  postdata["m"] = "";
  postdata["s"] = sessID;

  currTrackDuration = toScrobble[currentlyScrobbling].duration;
  currTrackPlayTime = 0;

  _scRYMbleUi.setMarquee(toScrobble[currentlyScrobbling].trackName);

  // TODO - Refactor string generation
  let postdataStr = "";
  let firstTime = true;
  for (const currKey in postdata) {
    if (firstTime) {
      firstTime = false;
    } else {
      postdataStr = `${postdataStr}&`;
    }
    postdataStr = postdataStr + encodeURIComponent(currKey) + "=" + encodeURIComponent(postdata[currKey]);
  }

  httpRequestHelper.httpPost(npURL, postdataStr, acceptNPResponse);
}

function timertick() {
  let again = true;
  if (currentlyScrobbling !== -1) {
    if (currTrackDuration !== 0) {
      _scRYMbleUi.setProgressBar(100 * currTrackPlayTime / currTrackDuration);
    }

    currTrackPlayTime++;

    if (currTrackPlayTime === currTrackDuration) {
      submitThisTrack();
      again = false;
    }

  }

  if (again) {
    window.setTimeout(timertick, 1000);
  }
}

function acceptHandshakeSingle(responseDetails: HttpResponse) {
  acceptHandshake(responseDetails, false);
}

function acceptHandshakeBatch(responseDetails: HttpResponse) {
  acceptHandshake(responseDetails, true);
}

function acceptHandshake(responseDetails: HttpResponse, isBatch: boolean) {
  if (responseDetails.status === 200) {
    if (!responseDetails.isOkStatus) {
      alertHandshakeFailed(responseDetails);
    } else {
      sessID = responseDetails.sessionId;
      npURL = responseDetails.nowPlayingUrl;
      submitURL = responseDetails.submitUrl;

      if (isBatch) {
        submitTracksBatch(sessID, submitURL);
      } else {
        npNextTrack();
      }
    }
  } else {
    alertHandshakeFailed(responseDetails);
  }
}

function alertHandshakeFailed(responseDetails: HttpResponse) {
  alert(`Handshake failed: ${responseDetails.status} ${responseDetails.statusText}\n\nData:\n${responseDetails.responseText}`);
}

function handshakeBatch(): void {
  handshake(_scRYMbleUi, acceptHandshakeBatch);
}

(function () {
  if (!_scRYMbleUi.isEnabled) {
    return;
  }

  _scRYMbleUi.hookUpScrobbleNow(startScrobble);
  _scRYMbleUi.hookUpScrobbleThen(handshakeBatch);
  window.addEventListener("beforeunload", confirmBrowseAway, true);
})();
