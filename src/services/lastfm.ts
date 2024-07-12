import { HttpResponse } from "../models/HttpResponse";
import { httpGet } from "./httpRequestHelper";
import scRYMbleUi from "./scrymbleUi";
import { fetch_unix_timestamp } from "./utilities";

export function handshake(ui: scRYMbleUi, callback: (response: HttpResponse) => void) {
  const username = ui.username;
  const password = ui.password;
  GM_setValue("user", username);
  GM_setValue("pass", password);

  const timestamp = fetch_unix_timestamp();
  const auth = hex_md5(`${hex_md5(password)}${timestamp}`);

  const handshakeURL = `http://post.audioscrobbler.com/?hs=true&p=1.2&c=scr&v=1.0&u=${username}&t=${timestamp}&a=${auth}`;
  httpGet(handshakeURL, callback);
}
