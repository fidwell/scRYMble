// ==UserScript==
// @name         scRYMble
// @version      2.0
// @description  Visit a release page on rateyourmusic.com and scrobble the songs you see!
// @author       bluetshirt
// @author       fidwell
// @namespace    https://github.com/fidwell/scRYMble
// @include      https://rateyourmusic.com/release/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// ==/UserScript==

// To do:
// - Add linter
// - Modularize code
// - Upgrade (or omit) jQuery (https://code.jquery.com/jquery-3.7.1.min.js)

function startScrobble(): void {
  console.log("startScrobble");
}

function handshakeBatch(): void {
  console.log("handshakeBatch");
}

let toScrobble = new Array();
let currentlyScrobbling = -1;
let sessID = false;
let submitURL = false;
let npURL = false;
let currTrackDuration = false;
let currTrackPlaytime = false;
let numChecks = 0;

function confirmBrowseAway(oEvent: BeforeUnloadEvent) {
  // Todo: Update use of deprecated property
  // https://developer.mozilla.org/en-US/docs/Web/API/BeforeUnloadEvent/returnValue
  if (currentlyScrobbling !== -1)
    oEvent.returnValue = "You are currently scrobbling a record. Leaving the page now will prevent future tracks from this release from scrobbling.";
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

  const buttonDivParent = document.getElementById("h_album");
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
  var allnone = $("#allornone").is(":checked");
  $.each($(".scrymblechk"), function () {
    $(this).prop("checked", allnone);
  });
}
