import { HttpResponse, HttpResponseRaw } from "../models/HttpResponse";

export function httpGet(url: string, onload: (response: HttpResponse) => void) {
  GM_xmlhttpRequest({
    method: "GET",
    url,
    headers: {
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey"
    },
    onload: (responseRaw: HttpResponseRaw) => onload(new HttpResponse(responseRaw))
  });
}

export function httpPost(url: string, data: string, onload: (response: HttpResponse) => void): void {
  GM_xmlhttpRequest({
    method: "POST",
    url,
    data,
    headers: {
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey",
      "Content-type": "application/x-www-form-urlencoded"
    },
    onload: (responseRaw: HttpResponseRaw) => onload(new HttpResponse(responseRaw))
  });
}
