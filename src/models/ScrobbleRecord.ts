export default class ScrobbleRecord {
  artist: string;
  trackName: string;
  duration: number;
  time: number;

  constructor(trackName: string, artist: string, duration: string) {
    this.artist = artist;
    this.trackName = trackName;

    const durastr = duration.trim();
    const colon = durastr.indexOf(":");
    if (colon !== -1) {
      const minutes = parseInt(durastr.substring(0, colon));
      const seconds = parseInt(durastr.substring(colon + 1));
      this.duration = minutes * 60 + seconds;
    } else {
      this.duration = 180;
    }

    this.time = 0;
  }
}
