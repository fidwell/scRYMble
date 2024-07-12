export default class rymUi {
  private albumTitleClass = "album_title";
  private byArtistProperty = "byArtist";
  private creditedNameClass = "credited_name";
  private trackElementId = "tracks";
  private tracklistLineClass = "tracklist_line";
  private tracklistNumClass = "tracklist_num";

  get pageArtist(): string {
    return this.multipleByArtists ?? this.singleByArtist;
  }

  get pageAlbum(): string {
    return (document.getElementsByClassName(this.albumTitleClass)[0] as HTMLElement).innerText.trim() ?? "";
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
    return tracklistLine.getElementsByClassName(this.tracklistNumClass)[0].innerHTML.trim().length > 0;
  }

  //#region Element getters
  get trackListDiv(): HTMLDivElement {
    return document.getElementById(this.trackElementId) as HTMLDivElement;
  }

  get tracklistLines(): HTMLDivElement[] {
    return Array.from(this.trackListDiv.getElementsByClassName(this.tracklistLineClass) ?? [])
      .map(l => l as HTMLDivElement);
  }
  //#endregion
}
