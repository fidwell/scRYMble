export default class rymUi {
  private albumTitleClass = ".album_title";
  private byArtistProperty = "byArtist";
  private creditedNameClass = "credited_name";
  private trackElementId = "tracks";
  private tracklistDurationClass = ".tracklist_duration";
  private tracklistLineClass = "tracklist_line";
  private tracklistNumClass = ".tracklist_num";
  private tracklistTitleClass = ".tracklist_title";
  private tracklistSongClass = ".song ";
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
    const songTags = tracklistLine?.querySelectorAll(this.tracklistSongClass);
    const lastSongTag = songTags[songTags.length - 1];
    const songTitle = lastSongTag?.innerHTML ?? "";
    if (this.trackArtist(tracklistLine).length > 0 &&
      (songTitle.indexOf(" - ") === 0 || songTitle.indexOf("\n- ") === 0)) {
      // Artist-credited track list
      return songTitle.substring(3);
    } else {
      return songTitle;
    }
  }

  trackArtist(tracklistLine: HTMLDivElement) {
    const artistTags = tracklistLine?.querySelectorAll(this.tracklistArtistClass);

    if (artistTags.length === 0)
      return "";

    if (artistTags.length === 1) {
      return (artistTags[0] as HTMLDivElement).innerText;
    }

    // Multiple artists
    const entireSpan = tracklistLine.querySelector(this.tracklistTitleClass) as HTMLDivElement;
    const entireText = entireSpan.innerText;
    const dashIndex = entireText.indexOf("\n- ");
    return entireText.substring(0, dashIndex).replace(/\n/g, " ");
  }

  trackDuration(tracklistLine: HTMLDivElement) {
    return (tracklistLine?.querySelector(this.tracklistDurationClass) as HTMLDivElement).innerText.trim();
  }
  //#endregion
}
