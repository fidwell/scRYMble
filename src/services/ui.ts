export default class scRYMbleUi {
  private enabled = false;
  private eleTrackTable: JQuery<HTMLElement>;

  constructor() {
    this.eleTrackTable = $("#tracks");
    if (this.eleTrackTable.children().length === 0) {
      console.log("scRYMble: No track list found.");
    } else {
      this.enabled = true;
      this.createCheckboxes();
      this.createControls();
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  createCheckboxes(): void {
    let n = 0;
    const chkbox = "<span style=\"float:left;\"><input type=\"checkbox\" class=\"scrymblechk\" id=\"chktrackNUM\" checked=\"checked\"></span>";
    $.each($("#tracks > .track > .tracklist_line"), function () {
      if ($(this).find(".tracklist_num:eq(0)").text() !== "\n                     \n                  ") {
        n++;
        $(this).prepend(chkbox.replace("NUM", `${n}`));
      }
    });
  }

  createControls(): void {
    const eleButtonDiv = document.createElement("div");
    eleButtonDiv.innerHTML = "<table border='0' cellpadding='0' cellspacing='2'><tr><td  width='105' ><input type='checkbox' name='allornone' id='allornone' style='vertical-align:middle' checked='checked'>&nbsp;<label for='allornone' style='font-size:60%'>select&nbsp;all/none</label><br/><table border='2' cellpadding='0' cellspacing='0'><tr><td style='height:50px;width:103px;background:url(http://cdn.last.fm/flatness/logo_black.3.png) no-repeat;color:#fff'><marquee scrollamount='3' scrolldelay='200' behavior='alternate' style='font-size:80%;font-family:sans-serif;position:relative;top:17px' id='scrymblemarquee'>&nbsp;</marquee></td></tr><tr><td style='background-color:#000033'><div style='position:relative;background-color:#ff0000;width:0%;max-height:5px;left:0px;top:0px;' id='progbar'>&nbsp;</div></td></tr></table></td><td>user: <input type='text' size='16' id='scrobbleusername' value = '" + GM_getValue("user", "") + "' /><br />pass: <input type='password' size='16' id='scrobblepassword' value = '" + GM_getValue("pass", "") + "'></input><br /><input type='button' id='scrobblenow' value = 'Scrobble in real-time' /> <input type='button' id='scrobblethen' value = 'Scrobble a previous play' /></td></tr></table>";
    eleButtonDiv.style.textAlign = "right";

    this.eleTrackTable.after(eleButtonDiv);

    const eleAllOrNone = document.getElementById("allornone");
    eleAllOrNone?.addEventListener("click", () => this.allOrNoneClick(), true);
  }

  hookUpScrobbleNow(startScrobble: () => void): void {
    const eleScrobbleNow = document.getElementById("scrobblenow");
    eleScrobbleNow?.addEventListener("click", startScrobble, true);
  }

  hookUpScrobbleThen(handshakeBatch: () => void): void {
    document.getElementById("scrobblethen")?.addEventListener("click", handshakeBatch, true);
  }

  setMarquee(value: string): void {
    const marquee = document.getElementById("scrymblemarquee");
    if (marquee !== null) {
      marquee.innerHTML = value;
    }
  }

  setProgressBar(percentage: number): void {
    const progbar = document.getElementById("progbar");
    if (progbar !== null && percentage >= 0 && percentage <= 100) {
      progbar.style.width = `${percentage}%`;
    }
  }

  allOrNoneClick(): void {
    window.setTimeout(() => this.allOrNoneAction(), 10);
  }

  allOrNoneAction(): void {
    $.each($(".scrymblechk"), function () {
      $(this).prop("checked", $("#allornone").is(":checked"));
    });
  }

  elementsOnAndOff(state: boolean): void {
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

  elementsOff(): void {
    this.elementsOnAndOff(false);
  }

  elementsOn(): void {
    this.elementsOnAndOff(true);
  }
}
