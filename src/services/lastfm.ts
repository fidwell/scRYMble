import { HttpResponse, HttpResponseRaw } from "../models/HttpResponse";
import { IDictionary } from "../models/IDictionary";
import ScrobbleRecord from "../models/ScrobbleRecord";
import { httpGet } from "./httpRequestHelper";
import scRYMbleUi from "./scrymbleUi";
import { fetch_unix_timestamp } from "./utilities";

export function buildScrobbleParams(
  song: ScrobbleRecord,
  index: number,
  album: string,
  time: number
): IDictionary {
  return {
    [`a[${index}]`]: song.artist,
    [`t[${index}]`]: song.trackName,
    [`b[${index}]`]: album,
    [`n[${index}]`]: `${index + 1}`,
    [`l[${index}]`]: `${song.duration}`,
    [`i[${index}]`]: `${time}`,
    [`o[${index}]`]: "P",
    [`r[${index}]`]: "",
    [`m[${index}]`]: ""
  };
}

export function handshake(
  ui: scRYMbleUi,
  callback: (response: HttpResponse) => void,
  onError: (responseRaw: HttpResponseRaw) => void
) {
  const username = ui.username;
  const password = ui.password;
  GM_setValue("user", username);
  GM_setValue("pass", password);

  const timestamp = fetch_unix_timestamp();
  const auth = hex_md5(`${hex_md5(password)}${timestamp}`);

  const handshakeURL = `http://post.audioscrobbler.com/?hs=true&p=1.2&c=scr&v=1.0&u=${encodeURIComponent(username)}&t=${timestamp}&a=${auth}`;
  httpGet(handshakeURL, callback, onError);
}
