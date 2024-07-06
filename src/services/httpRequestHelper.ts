import { ResponseDetails } from "../models/ResponseDetails";

export function get(url: string, onload: (responseDetails: ResponseDetails) => void) {
  GM_xmlhttpRequest({
    method: "GET",
    url,
    headers: {
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey"
    },
    onload
  });
}

export function post(url: string, data: string, onload: (responseDetails: ResponseDetails) => void): void {
  GM_xmlhttpRequest({
    method: "POST",
    url,
    data,
    headers: {
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey",
      "Content-type": "application/x-www-form-urlencoded"
    },
    onload
  });
}
