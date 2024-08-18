import { stripAndClean } from "./utilities";

export default class rymUi {
  private albumTitleClass = ".album_title";
  private byArtistProperty = "byArtist";
  private creditedNameClass = "credited_name";
  private trackElementId = "tracks";
  private tracklistDurationClass = ".tracklist_duration";
  private tracklistLineClass = "tracklist_line";
  private tracklistNumClass = ".tracklist_num";
  private tracklistTitleClass = ".tracklist_title";
  private tracklistArtistClass = ".artist";
  private tracklistRenderedTextClass = ".rendered_text";

  constructor(readonly overridePageArtist: string | undefined) { }

  get isVariousArtists(): boolean {
    const artist: string = this.pageArtist;
    return artist.indexOf("Various Artists") > -1 ||
      artist.indexOf(" / ") > -1;
  }

  get pageArtist(): string {
    if ((this.overridePageArtist ?? "").length > 0)
      return this.overridePageArtist ?? "";

    return this.multipleByArtists ?? this.singleByArtist;
  }

  get pageAlbum(): string {
    return ((document.querySelector(this.albumTitleClass) as HTMLElement).textContent ?? "").trim();
  }

  private get multipleByArtists(): string {
    return Array.from(document.getElementsByClassName(this.creditedNameClass))
      .map(x => x as HTMLElement)
      .map(x => x.textContent ?? "")[1];
  }

  private get singleByArtist(): string {
    const byArtistSpans = Array.from(document.getElementsByTagName("span"))
      .filter(x => !!x.hasAttribute("itemprop") && x.getAttribute("itemprop") === this.byArtistProperty);
    return byArtistSpans.length === 1
      ? byArtistSpans[0].textContent ?? ""
      : "";
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
    const songTags = tracklistLine?.querySelectorAll("[itemprop=name]");
    const lastSongTag = songTags[songTags.length - 1] as HTMLSpanElement;
    let songTitle = (lastSongTag?.textContent ?? "").replace(/\n/g, " ");

    // Check if the tag is hiding any artist links; if so, strip them out
    const artistLinks = lastSongTag.querySelectorAll(this.tracklistArtistClass);
    if (artistLinks.length > 0) {
      const renderedTextSpan = lastSongTag.querySelector(this.tracklistRenderedTextClass) as HTMLSpanElement;
      songTitle = renderedTextSpan.innerHTML.replace(/<a[^>]*>.*?<\/a>/g, " ").trim();
    }

    return stripAndClean(songTitle);
  }

  trackArtist(tracklistLine: HTMLDivElement) {
    const artistTags = tracklistLine?.querySelectorAll(this.tracklistArtistClass);

    if (artistTags.length === 0)
      return "";

    if (artistTags.length === 1) {
      return (artistTags[0] as HTMLDivElement).textContent ?? "";
    }

    // Multiple artists
    const entireSpan = tracklistLine.querySelector(this.tracklistTitleClass) as HTMLDivElement;
    const entireText = (entireSpan.textContent ?? "").replace(/\n/g, " ");
    const dashIndex = entireText.indexOf(" - ");
    return entireText.substring(0, dashIndex);
  }

  trackDuration(tracklistLine: HTMLDivElement) {
    const durationElement = tracklistLine?.querySelector(this.tracklistDurationClass) as HTMLDivElement;
    return (durationElement.textContent ?? "").trim();
  }
  //#endregion
}
