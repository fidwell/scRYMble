export default class ScrobbleRecord {
  artist: string;
  trackName: string;
  duration: number;
  time: number;

  constructor(trackName: string, artist: string, duration: string) {
    this.artist = artist;
    this.trackName = trackName;

    const durastr = duration.trim();
    if (durastr.indexOf(":") !== -1) {
      this.duration = durastr
        .split(":")
        .reduce((totalSeconds, part) => totalSeconds * 60 + parseInt(part), 0);
    } else {
      this.duration = 180;
    }

    this.time = 0;
  }
}
