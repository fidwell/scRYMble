export default class rymUi {
  private albumTitleClass = ".album_title";
  private byArtistProperty = "byArtist";
  private creditedNameClass = "credited_name";
  private trackElementId = "tracks";
  private tracklistDurationClass = ".tracklist_duration";
  private tracklistLineClass = "tracklist_line";
  private tracklistNumClass = ".tracklist_num";
  private tracklistSongClass = ".song";
  private tracklistArtistClass = ".artist";

  get pageArtist(): string {
    return this.multipleByArtists ?? this.singleByArtist;
  }

  get pageAlbum(): string {
    return (document.querySelector(this.albumTitleClass) as HTMLElement).innerText.trim() ?? "";
  }

  private get multipleByArtists(): string {
    return Array.from(document.getElementsByClassName(this.creditedNameClass))
      .map(x => x as HTMLElement)
      .map(x => x.innerText)[1];
  }

  private get singleByArtist(): string {
    return Array.from(document.getElementsByTagName("span"))
      .filter(x => !!x.hasAttribute("itemprop") && x.getAttribute("itemprop") === this.byArtistProperty)[0].innerText;
  }

  hasTrackNumber(tracklistLine: HTMLDivElement): boolean {
    return (tracklistLine.querySelector(this.tracklistNumClass)?.innerHTML ?? "").trim().length > 0;
  }

  //#region Element getters
  get trackListDiv(): HTMLDivElement {
    return document.getElementById(this.trackElementId) as HTMLDivElement;
  }

  get tracklistLines(): HTMLDivElement[] {
    return Array.from(this.trackListDiv.getElementsByClassName(this.tracklistLineClass) ?? [])
      .map(l => l as HTMLDivElement);
  }

  tracklistLine(checkbox: HTMLInputElement): HTMLDivElement {
    return checkbox.parentElement?.parentElement as HTMLDivElement;
  }

  trackName(tracklistLine: HTMLDivElement) {
    const songTag = tracklistLine?.querySelector(this.tracklistSongClass) as HTMLDivElement;
    const songTitle = songTag?.innerHTML ?? "";
    if (this.trackArtist(tracklistLine).length > 0 && songTitle.indexOf(" - ") === 0) {
      // Artist-credited track list
      return songTitle.substring(3);
    } else {
      return songTitle;
    }
  }

  trackArtist(tracklistLine: HTMLDivElement) {
    const artistTag = tracklistLine?.querySelector(this.tracklistArtistClass) as HTMLDivElement;
    return artistTag?.innerText ?? "";
  }

  trackDuration(tracklistLine: HTMLDivElement) {
    return (tracklistLine?.querySelector(this.tracklistDurationClass) as HTMLDivElement).innerText.trim();
  }
  //#endregion
}
