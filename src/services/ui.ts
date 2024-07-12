export default class scRYMbleUi {
  private enabled = false;

  // RYM elements
  private trackElementId = "tracks";
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
    if ((this.trackListDiv?.children.length ?? 0) === 0) {
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

  get username(): string {
    return this.usernameInput.value;
  }

  get password(): string {
    return this.passwordInput.value;
  }

  createCheckboxes(): void {
    const checkboxTemplate = `<input type="checkbox" class="${this.checkboxClass}" checked="checked">`;
    const tracklistLines = document.getElementById(this.trackElementId)?.getElementsByClassName(this.tracklistLineClass) ?? [];
    for (const tracklistLine of tracklistLines) {
      if (tracklistLine.getElementsByClassName(this.tracklistNumClass)[0].innerHTML.trim().length > 0) {
        const thisCheckboxElement = document.createElement("span");
        thisCheckboxElement.style.float = "left";
        thisCheckboxElement.innerHTML = checkboxTemplate;
        tracklistLine.prepend(thisCheckboxElement);
      }
    }
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

    this.trackListDiv?.after(eleButtonDiv);
    this.allOrNoneCheckbox.addEventListener("click", () => this.allOrNoneClick(), true);
  }

  hookUpScrobbleNow(startScrobble: () => void): void {
    this.scrobbleNowButton.addEventListener("click", startScrobble, true);
  }

  hookUpScrobbleThen(handshakeBatch: () => void): void {
    this.scrobbleThenButton.addEventListener("click", handshakeBatch, true);
  }

  setMarquee(value: string): void {
    this.marquee.innerHTML = value;
  }

  setProgressBar(percentage: number): void {
    if (percentage >= 0 && percentage <= 100) {
      this.progressBar.style.width = `${percentage}%`;
    }
  }

  allOrNoneClick(): void {
    window.setTimeout(() => this.allOrNoneAction(), 10);
  }

  allOrNoneAction(): void {
    for (const checkbox of this.checkboxes) {
      (checkbox as HTMLInputElement).checked = this.allOrNoneCheckbox.checked;
    }
  }

  elementsOnAndOff(state: boolean): void {
    if (state) {
      this.scrobbleNowButton.removeAttribute("disabled");
      this.usernameInput.removeAttribute("disabled");
      this.passwordInput.removeAttribute("disabled");
    } else {
      this.scrobbleNowButton.setAttribute("disabled", "disabled");
      this.usernameInput.setAttribute("disabled", "disabled");
      this.passwordInput.setAttribute("disabled", "disabled");
    }

    for (const checkbox of this.checkboxes) {
      if (state) {
        checkbox.removeAttribute("disabled");
      } else {
        checkbox.setAttribute("disabled", "disabled");
      }
    }
  }

  elementsOff(): void {
    this.elementsOnAndOff(false);
  }

  elementsOn(): void {
    this.elementsOnAndOff(true);
  }

  //#region Element getters
  private get trackListDiv(): HTMLDivElement {
    return document.getElementById(this.trackElementId) as HTMLDivElement;
  }

  private get allOrNoneCheckbox(): HTMLInputElement {
    return document.getElementById(this.selectAllOrNoneId) as HTMLInputElement;
  }

  private get scrobbleNowButton(): HTMLButtonElement {
    return document.getElementById(this.scrobbleNowId) as HTMLButtonElement;
  }

  private get scrobbleThenButton(): HTMLButtonElement {
    return document.getElementById(this.scrobbleThenId) as HTMLButtonElement;
  }

  private get marquee(): HTMLMarqueeElement {
    return document.getElementById(this.marqueeId) as HTMLMarqueeElement;
  }

  private get progressBar(): HTMLDivElement {
    return document.getElementById(this.progBarId) as HTMLDivElement;
  }

  private get usernameInput(): HTMLInputElement {
    return document.getElementById(this.usernameId) as HTMLInputElement;
  }

  private get passwordInput(): HTMLInputElement {
    return document.getElementById(this.passwordId) as HTMLInputElement;
  }

  private get checkboxes(): HTMLCollectionOf<Element> {
    return document.getElementsByClassName(this.checkboxClass);
  }
  //#endregion
}
