import { HttpResponse } from "../models/HttpResponse";
import { httpGet } from "./httpRequestHelper";
import { fetch_unix_timestamp } from "./utilities";

export function handshake(callback: (response: HttpResponse) => void) {
  const user = $("#scrobbleusername").val()?.toString() ?? "";
  const password = $("#scrobblepassword").val()?.toString() ?? "";
  GM_setValue("user", user);
  GM_setValue("pass", password);

  const timestamp = fetch_unix_timestamp();
  const auth = hex_md5(`${hex_md5(password)}${timestamp}`);

  const handshakeURL = `http://post.audioscrobbler.com/?hs=true&p=1.2&c=scr&v=1.0&u=${user}&t=${timestamp}&a=${auth}`;
  httpGet(handshakeURL, callback);
}
