import { IDictionary } from "./models/IDictionary";
import { ResponseDetails } from "./models/ResponseDetails";
import ScrobbleRecord from "./models/ScrobbleRecord";
import * as httpRequestHelper from "./services/httpRequestHelper";

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

function getPageArtist(): string {
  const byartist = $("span[itemprop=\"byArtist\"]");
  const art_cred = $(byartist).find(".credited_name:eq(0) > span[itemprop=\"name\"]");
  if ($(art_cred).length > 0) {
    return $(art_cred).text();
  } else {
    return $(byartist).text();
  }
}

function getAlbum(): string {
  return $(".release_page meta[itemprop=\"name\"]").attr("content")?.trim() ?? "";
}

function isVariousArtists(): boolean {
  const artist = getPageArtist();
  return artist.indexOf("Various Artists") > -1 ||
    artist.indexOf(" / ") > -1;
}

function fetch_unix_timestamp(): number {
  return parseInt(new Date().getTime().toString().substring(0, 10));
}

function acceptSubmitResponse(responseDetails: ResponseDetails, isBatch: boolean) {
  if (responseDetails.status === 200) {
    if (responseDetails.responseText.indexOf("OK") === -1) {
      alertSubmitFailed(responseDetails);
    }
  } else {
    alertSubmitFailed(responseDetails);
  }

  if (isBatch) {
    const marquee = document.getElementById("scrymblemarquee");
    if (marquee !== null) {
      marquee.innerHTML = "Scrobbled OK!";
    }
  } else {
    scrobbleNextSong();
  }
}

function alertSubmitFailed(responseDetails: ResponseDetails) {
  alert(`Track submit failed: ${responseDetails.status} ${responseDetails.statusText}\n\nData:\n${responseDetails.responseText}`);
}

function acceptSubmitResponseSingle(responseDetails: ResponseDetails) {
  acceptSubmitResponse(responseDetails, false);
}

function acceptSubmitResponseBatch(responseDetails: ResponseDetails) {
  acceptSubmitResponse(responseDetails, true);
}

function acceptNPResponse(responseDetails: ResponseDetails) {
  if (responseDetails.status === 200) {
    if (responseDetails.responseText.indexOf("OK") == -1) {
      alertSubmitFailed(responseDetails);
    }
  } else {
    alertSubmitFailed(responseDetails);
  }
}

function buildListOfSongsToScrobble() {
  toScrobble = [];

  $.each($(".scrymblechk"), function () {
    if ($(this).is(":checked")) {
      const song = $(this).parent().parent();
      let songTitle = $(song).find("span[itemprop=\"name\"]").text();
      let artist = getPageArtist();
      const length = $(song).find(".tracklist_duration").text();

      if (isVariousArtists()) {
        const firstDash = songTitle.indexOf(" - ");
        if (firstDash == -1) // no dash exists! must be a single artist with " / " in the name or v/a with unscrobbleable list
        {
          artist = getPageArtist();
          if (artist.indexOf("Various Artists") > -1) {
            artist = $(".album_title:eq(0)").text()
            //canscrobble = 0;
          }
        }
        else {
          artist = songTitle.substring(0, firstDash);
          songTitle = songTitle.substring(firstDash + 3);
        }
      }
      else {
        artist = getPageArtist()
        const title = $(song).find("span[itemprop=\"name\"]");
        if ($(title).html().indexOf("<a title=\"[Artist") == 0 && $(title).text().indexOf(" - ") > 0) {
          const firstDash = songTitle.indexOf(" - ");
          artist = songTitle.substring(0, firstDash);
          songTitle = songTitle.substring(firstDash + 3);
        }
      }

      if ((songTitle.toLowerCase() == "untitled") || (songTitle.toLowerCase() == "untitled track") || (songTitle == "")) {
        songTitle = "[untitled]";
      }

      while (songTitle.indexOf("  ") > 0) { songTitle = songTitle.replace("  ", " ") }
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
  if (hoursFudgeStr != null) {
    const album = getAlbum();
    const hoursFudge = parseFloat(hoursFudgeStr);

    if (!isNaN(hoursFudge)) {
      currTime = currTime - (hoursFudge * 60 * 60);
    }

    for (let i = toScrobble.length - 1; i >= 0; i--) {
      currTime = currTime * 1 - toScrobble[i].duration * 1;
      toScrobble[i].time = currTime;
    }

    let outstr = `Artist: ${getPageArtist()}\nAlbum: ${album}\n`;

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

    GM_xmlhttpRequest({
      method: "POST",
      url: submitURL,
      data: postdataStr,
      headers: {
        "User-agent": "Mozilla/4.0 (compatible) Greasemonkey",
        "Content-type": "application/x-www-form-urlencoded",
      },
      onload: acceptSubmitResponseBatch
    });
  }
}

function elementsOnAndOff(state: boolean) {
  $("#scrobblenow").prop("disabled", !state);
  $("#scrobblepassword").prop("disabled", !state);
  $("#scrobbleusername").prop("disabled", !state);
  $("#scrobblepassword").prop("disabled", !state);

  $.each($(".scrymblechk"), function () {
    try {
      $(this).prop("disabled", !state);
    } catch (e) {
      console.log(e);
    }
  });
}

function elementsOff() {
  elementsOnAndOff(false);
}

function elementsOn() {
  elementsOnAndOff(true);
}

function startScrobble(): void {
  currentlyScrobbling = -1;
  currTrackDuration = 0;
  currTrackPlayTime = 0;

  elementsOff();
  buildListOfSongsToScrobble();
  scrobbleNextSong();
}

function resetScrobbler(): void {
  currentlyScrobbling = -1;
  currTrackDuration = 0;
  currTrackPlayTime = 0;
  setMarquee("&nbsp;");

  const progbar = document.getElementById("progbar");
  if (progbar !== null) {
    progbar.style.width = "0%";
  }

  toScrobble = [];
  elementsOn();
}

function scrobbleNextSong(): void {
  currentlyScrobbling++;

  if (currentlyScrobbling === toScrobble.length) {
    resetScrobbler();
  } else {
    window.setTimeout(timertick, 10);
    handshake(false);
  }
}

function submitThisTrack(): void {
  const postdata = {} as IDictionary;
  const i = 0;
  const currTime = fetch_unix_timestamp();

  postdata[`a${i}`] = toScrobble[currentlyScrobbling].artist;
  postdata[`t${i}`] = toScrobble[currentlyScrobbling].trackName;
  postdata[`b${i}`] = getAlbum();
  postdata[`n${i}`] = `${currentlyScrobbling + 1}`;
  postdata[`l${i}`] = `${toScrobble[currentlyScrobbling].duration}`;
  postdata[`i${i}`] = `${currTime - toScrobble[currentlyScrobbling].duration}`;
  postdata[`o${i}`] = "P";
  postdata[`r${i}`] = "";
  postdata[`m${i}`] = "";

  postdata["s"] = sessID;

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

  httpRequestHelper.post(submitURL, postdataStr, acceptSubmitResponseSingle);
}

function npNextTrack() {
  const postdata = {} as IDictionary;
  postdata["a"] = toScrobble[currentlyScrobbling].artist;
  postdata["t"] = toScrobble[currentlyScrobbling].trackName;
  postdata["b"] = getAlbum();
  postdata["n"] = `${currentlyScrobbling + 1}`;
  postdata["l"] = `${toScrobble[currentlyScrobbling].duration}`;
  postdata["m"] = "";
  postdata["s"] = sessID;

  currTrackDuration = toScrobble[currentlyScrobbling].duration;
  currTrackPlayTime = 0;

  setMarquee("toScrobble[currentlyScrobbling].trackName");

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

  httpRequestHelper.post(npURL, postdataStr, acceptNPResponse);
}

function timertick() {
  let again = true;
  if (currentlyScrobbling !== -1) {
    const progbar = document.getElementById("progbar");
    if (progbar !== null && currTrackDuration !== 0) {
      progbar.style.width = `${100 * currTrackPlayTime / currTrackDuration}%`;
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

function acceptHandshakeSingle(responseDetails: ResponseDetails) {
  acceptHandshake(responseDetails, false);
}

function acceptHandshakeBatch(responseDetails: ResponseDetails) {
  acceptHandshake(responseDetails, true);
}

function acceptHandshake(responseDetails: ResponseDetails, isBatch: boolean) {
  if (responseDetails.status === 200) {
    const lines = responseDetails.responseText.split("\n");
    if (lines[0].indexOf("OK") === -1) {
      alertHandshakeFailed(responseDetails);
    } else {
      sessID = lines[1];
      npURL = lines[2];
      submitURL = lines[3];

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

function alertHandshakeFailed(responseDetails: ResponseDetails) {
  alert(`Handshake failed: ${responseDetails.status} ${responseDetails.statusText}\n\nData:\n${responseDetails.responseText}`);
}

function handshake(isBatch: boolean) {
  const user = $("#scrobbleusername").val()?.toString() ?? "";
  const password = $("#scrobblepassword").val()?.toString() ?? "";
  GM_setValue("user", user);
  GM_setValue("pass", password);

  const timestamp = fetch_unix_timestamp();
  const auth = hex_md5(`${hex_md5(password)}${timestamp}`);

  const handshakeURL = `http://post.audioscrobbler.com/?hs=true&p=1.2&c=scr&v=1.0&u=${user}&t=${timestamp}&a=${auth}`;
  httpRequestHelper.get(handshakeURL, isBatch ? acceptHandshakeBatch : acceptHandshakeSingle);
}

function handshakeBatch(): void {
  handshake(true);
}

(function () {
  const eleTrackTable = $("#tracks");
  if (eleTrackTable !== undefined) {
    let n = 0;
    const chkbox = "<span style=\"float:left;\"><input type=\"checkbox\" class=\"scrymblechk\" id=\"chktrackNUM\" checked=\"checked\"></span>";
    $.each($("#tracks > .track > .tracklist_line"), function () {
      if ($(this).find(".tracklist_num:eq(0)").text() !== "\n                     \n                  ") {
        n++;
        $(this).prepend(chkbox.replace("NUM", `${n}`));
      }
    });
  }

  const eleButtonDiv = document.createElement("DIV");
  eleButtonDiv.innerHTML = "<table border='0' cellpadding='0' cellspacing='2'><tr><td  width='105' ><input type='checkbox' name='allornone' id='allornone' style='vertical-align:middle' checked='checked'>&nbsp;<label for='allornone' style='font-size:60%'>select&nbsp;all/none</label><br/><table border='2' cellpadding='0' cellspacing='0'><tr><td style='height:50px;width:103px;background:url(http://cdn.last.fm/flatness/logo_black.3.png) no-repeat;color:#fff'><marquee scrollamount='3' scrolldelay='200' behavior='alternate' style='font-size:80%;font-family:sans-serif;position:relative;top:17px' id='scrymblemarquee'>&nbsp;</marquee></td></tr><tr><td style='background-color:#000033'><div style='position:relative;background-color:#ff0000;width:0%;max-height:5px;left:0px;top:0px;' id='progbar'>&nbsp;</div></td></tr></table></td><td>user: <input type='text' size='16' id='scrobbleusername' value = '" + GM_getValue("user", "") + "' /><br />pass: <input type='password' size='16' id='scrobblepassword' value = '" + GM_getValue("pass", "") + "'></input><br /><input type='button' id='scrobblenow' value = 'Scrobble in real-time' /> <input type='button' id='scrobblethen' value = 'Scrobble a previous play' /></td></tr></table>";
  eleButtonDiv.style.textAlign = "right";

  $(eleTrackTable).after(eleButtonDiv);

  const eleScrobbleNow = document.getElementById("scrobblenow");
  eleScrobbleNow?.addEventListener("click", startScrobble, true);

  const eleAllOrNone = document.getElementById("allornone");
  eleAllOrNone?.addEventListener("click", allOrNoneClick, true);

  document.getElementById("scrobblethen")?.addEventListener("click", handshakeBatch, true);

  window.addEventListener("beforeunload", confirmBrowseAway, true);
})();

function allOrNoneClick(): void {
  window.setTimeout(allOrNoneAction, 10);
}

function allOrNoneAction() {
  $.each($(".scrymblechk"), function () {
    $(this).prop("checked", $("#allornone").is(":checked"));
  });
}

function setMarquee(value: string) {
  const marquee = document.getElementById("scrymblemarquee");
  if (marquee !== null) {
    marquee.innerHTML = value;
  }
}
