import { HttpResponse, HttpResponseRaw } from "./models/HttpResponse";
import ScrobbleRecord from "./models/ScrobbleRecord";
import * as httpRequestHelper from "./services/httpRequestHelper";
import { buildScrobbleParams, handshake } from "./services/lastfm";
import rymUi from "./services/rymUi";
import scRYMbleUi from "./services/scrymbleUi";
import * as uiParser from "./services/uiParser";
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

function acceptSubmitResponse(responseDetails: HttpResponse, isBatch: boolean) {
  if (!responseDetails.isOkStatus) {
    alertRequestFailed(responseDetails);
  }

  if (isBatch) {
    _scRYMbleUi.elementsOn();
    _scRYMbleUi.setMarquee("Scrobbled OK!");
  } else {
    scrobbleNextSong();
  }
}

function alertRequestFailed(responseDetails: HttpResponse) {
  alert(`Track submit failed: ${responseDetails.status} ${responseDetails.statusText}\n\nData:\n${responseDetails.responseText}`);
}

function acceptSubmitResponseSingle(responseDetails: HttpResponse) {
  acceptSubmitResponse(responseDetails, false);
}

function acceptSubmitResponseBatch(responseDetails: HttpResponse) {
  acceptSubmitResponse(responseDetails, true);
}

function acceptNPResponse(responseDetails: HttpResponse) {
  if (!responseDetails.isOkStatus) {
    alertRequestFailed(responseDetails);
  }
}

function submitTracksBatch() {
  toScrobble = uiParser.buildListOfSongsToScrobble(_rymUi, _scRYMbleUi);

  let currTime = fetch_unix_timestamp();
  const hoursFudgeStr = prompt("How many hours ago did you listen to this?");

  if (hoursFudgeStr === null) {
    _scRYMbleUi.elementsOn();
    return;
  }

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

  const postdata: Record<string, string> = {};

  for (let i = 0; i < toScrobble.length; i++) {
    Object.assign(postdata, buildScrobbleParams(toScrobble[i], i, album, toScrobble[i].time));
  }

  postdata["s"] = sessID;

  httpRequestHelper.httpPost(submitURL, httpRequestHelper.encodeParams(postdata), acceptSubmitResponseBatch, handleNetworkError);
}

function startScrobble(): void {
  currentlyScrobbling = -1;
  currTrackDuration = 0;
  currTrackPlayTime = 0;

  _scRYMbleUi.elementsOff();
  toScrobble = uiParser.buildListOfSongsToScrobble(_rymUi, _scRYMbleUi);
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
    handshake(_scRYMbleUi, acceptHandshakeSingle, handleNetworkError);
  }
}

function submitThisTrack(): void {
  const song = toScrobble[currentlyScrobbling];
  const currTime = fetch_unix_timestamp();

  const postdata = buildScrobbleParams(song, currentlyScrobbling, _rymUi.pageAlbum, currTime - song.duration);
  postdata["s"] = sessID;

  httpRequestHelper.httpPost(submitURL, httpRequestHelper.encodeParams(postdata), acceptSubmitResponseSingle, handleNetworkError);
}

function npNextTrack() {
  const postdata: Record<string, string> = {};
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

  httpRequestHelper.httpPost(npURL, httpRequestHelper.encodeParams(postdata), acceptNPResponse, handleNetworkError);
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

  if (again && currentlyScrobbling !== -1) {
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
  if (responseDetails.status !== 200 || !responseDetails.isOkStatus) {
    alertHandshakeFailed(responseDetails);
    resetScrobbler();
    return;
  }

  sessID = responseDetails.sessionId;
  npURL = responseDetails.nowPlayingUrl;
  submitURL = responseDetails.submitUrl;

  if (isBatch) {
    submitTracksBatch();
  } else {
    npNextTrack();
  }
}

function alertHandshakeFailed(responseDetails: HttpResponse) {
  alert(`Handshake failed: ${responseDetails.status} ${responseDetails.statusText}\n\nData:\n${responseDetails.responseText}`);
}

function handleNetworkError(responseDetails: HttpResponseRaw) {
  alert(`Network request failed: ${responseDetails.status} ${responseDetails.statusText}\n\nCheck your internet connection and try again.\n\nData:\n${responseDetails.responseText}`);
  resetScrobbler();
}

function handshakeBatch(): void {
  _scRYMbleUi.elementsOff();
  handshake(_scRYMbleUi, acceptHandshakeBatch, handleNetworkError);
}

function scrobbleTest(): void {
  console.log(_rymUi.pageAlbum);
  toScrobble = uiParser.buildListOfSongsToScrobble(_rymUi, _scRYMbleUi);
  toScrobble.forEach((song, i) => {
    const minutes = Math.floor(song.duration / 60);
    const seconds = song.duration % 60;
    const secondsStr = `00${seconds}`.slice(-2);
    console.log(`${i + 1}. ${song.artist} — ${song.trackName} (${minutes}:${secondsStr})`);
  });
}

(function () {
  if (!_scRYMbleUi.isEnabled) {
    return;
  }

  _scRYMbleUi.hookUpScrobbleNow(startScrobble);
  _scRYMbleUi.hookUpScrobbleThen(handshakeBatch);
  _scRYMbleUi.hookUpScrobbleTest(scrobbleTest);
  window.addEventListener("beforeunload", confirmBrowseAway, true);
})();
