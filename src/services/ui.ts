export default class scRYMbleUi {
  private enabled = false;

  // RYM elements
  private trackElementId = "tracks";
  private trackClass = "track";
  private tracklistLineClass = "tracklist_line";
  private tracklistNumClass = "tracklist_num";

  // scRYMble elements
  private marqueeId = "scrymblemarquee";
  private progBarId = "progbar";
  private scrobbleNowId = "scrobblenow";
  private scrobbleThenId = "scrobblethen";
  private checkboxClass = "scrymblechk";
  private selectAllOrNoneId = "allornone";
  private usernameId = "scrobbleusername";
  private passwordId = "scrobblepassword";

  constructor() {
    const trackListElement = document.getElementById(this.trackElementId);
    if (trackListElement === null || trackListElement.children.length === 0) {
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
    const chkbox = `<span style="float: left;"><input type="checkbox" class="${this.checkboxClass}" id="chktrack__NUM__" checked="checked"></span>`;
    const tracklistNumClass = this.tracklistNumClass; // todo - refactor after getting rid of jQuery
    $.each($(`#${this.trackElementId} > .${this.trackClass} > .${this.tracklistLineClass}`), function () {
      if ($(this).find(`.${tracklistNumClass}:eq(0)`).text() !== "\n                     \n                  ") {
        n++;
        $(this).prepend(chkbox.replace("__NUM__", `${n}`));
      }
    });
  }

  createControls(): void {
    const eleButtonDiv = document.createElement("div");
    eleButtonDiv.innerHTML = `
<table style="border: 0;" cellpadding="0" cellspacing="2px">
  <tr>
    <td style="width: 112px;">
      <input type="checkbox" name="${this.selectAllOrNoneId}" id="${this.selectAllOrNoneId}" style="vertical-align: middle;" checked="checked">&nbsp;
      <label for="${this.selectAllOrNoneId}" style="font-size: 60%;">select&nbsp;all/none</label>
      <br/>
      <table border="2" cellpadding="0" cellspacing="0">
        <tr>
          <td style="height: 50px; width: 103px; background: url(http://cdn.last.fm/flatness/logo_black.3.png) no-repeat; color: #fff;">
            <marquee scrollamount="3" scrolldelay="200" behavior="alternate" style="font-size: 80%; position: relative; top: 17px;" id="${this.marqueeId}">&nbsp;</marquee>
          </td>
        </tr>
        <tr>
          <td style="background-color: #003;">
            <div style="position: relative; background-color: #f00; width: 0; max-height: 5px; left: 0; top: 0;" id="${this.progBarId}">&nbsp;</div>
          </td>
        </tr>
      </table>
    </td>
    <td>user: <input type="text" size="16" id="${this.usernameId}" value="${GM_getValue("user", "")}" /><br />
        pass: <input type="password" size="16" id="${this.passwordId}" value="${GM_getValue("pass", "")}"></input><br />
        <input type="button" id="${this.scrobbleNowId}" value="Scrobble in real-time" />
        <input type="button" id="${this.scrobbleThenId}" value="Scrobble a previous play" />
      </td>
    </tr>
  </table>`;
    eleButtonDiv.style.textAlign = "right";

    document.getElementById(this.trackElementId)?.after(eleButtonDiv);

    const eleAllOrNone = document.getElementById(this.selectAllOrNoneId);
    eleAllOrNone?.addEventListener("click", () => this.allOrNoneClick(), true);
  }

  hookUpScrobbleNow(startScrobble: () => void): void {
    const eleScrobbleNow = document.getElementById(this.scrobbleNowId);
    eleScrobbleNow?.addEventListener("click", startScrobble, true);
  }

  hookUpScrobbleThen(handshakeBatch: () => void): void {
    document.getElementById(this.scrobbleThenId)?.addEventListener("click", handshakeBatch, true);
  }

  setMarquee(value: string): void {
    const marquee = document.getElementById(this.marqueeId);
    if (marquee !== null) {
      marquee.innerHTML = value;
    }
  }

  setProgressBar(percentage: number): void {
    const progbar = document.getElementById(this.progBarId);
    if (progbar !== null && percentage >= 0 && percentage <= 100) {
      progbar.style.width = `${percentage}%`;
    }
  }

  allOrNoneClick(): void {
    window.setTimeout(() => this.allOrNoneAction(), 10);
  }

  allOrNoneAction(): void {
    const selectAllOrNoneId = this.selectAllOrNoneId; // todo - refactor after getting rid of jQuery
    $.each($(`.${this.checkboxClass}`), function () {
      $(this).prop("checked", $(`#${selectAllOrNoneId}`).is(":checked"));
    });
  }

  elementsOnAndOff(state: boolean): void {
    $(`#${this.scrobbleNowId}`).prop("disabled", !state);
    $(`#${this.usernameId}`).prop("disabled", !state);
    $(`#${this.passwordId}`).prop("disabled", !state);

    $.each($(`.${this.checkboxClass}`), function () {
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
