import { HttpResponse, HttpResponseRaw } from "../models/HttpResponse";
import { IDictionary } from "../models/IDictionary";
import ScrobbleRecord from "../models/ScrobbleRecord";
import { httpGet } from "./httpRequestHelper";
import { hex_md5 } from "./md5";
import scRYMbleUi from "./scrymbleUi";
import { fetch_unix_timestamp } from "./utilities";

export const PASSWORD_HASH_KEY = "pwhash";
export const LEGACY_PASSWORD_KEY = "pass";

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
  GM_setValue("user", username);

  const passwordHash = resolveStoredHash(ui.password);
  const timestamp = fetch_unix_timestamp();
  const auth = hex_md5(`${passwordHash}${timestamp}`);

  const handshakeURL = `https://post.audioscrobbler.com/?hs=true&p=1.2&c=scr&v=1.0&u=${encodeURIComponent(username)}&t=${timestamp}&a=${auth}`;
  httpGet(handshakeURL, callback, onError);
}

function resolveStoredHash(typedPassword: string): string {
  let resolvedHash = "";

  if (typedPassword.length > 0) {
    resolvedHash = hex_md5(typedPassword);
    GM_setValue(PASSWORD_HASH_KEY, resolvedHash);
  } else if (GM_getValue(PASSWORD_HASH_KEY, "").length > 0) {
    resolvedHash = GM_getValue(PASSWORD_HASH_KEY, "");
  } else {
    const legacyPassword = GM_getValue(LEGACY_PASSWORD_KEY, "");
    if (legacyPassword.length > 0) {
      resolvedHash = hex_md5(legacyPassword);
      GM_setValue(PASSWORD_HASH_KEY, resolvedHash);
    }
  }

  GM_deleteValue(LEGACY_PASSWORD_KEY);

  return resolvedHash;
}
