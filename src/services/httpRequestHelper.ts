import { HttpResponse, HttpResponseRaw } from "../models/HttpResponse";
import { IDictionary } from "../models/IDictionary";

const REQUEST_TIMEOUT_MS = 30000;

export function encodeParams(params: IDictionary): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export function httpGet(
  url: string,
  onload: (response: HttpResponse) => void,
  onerror: (responseRaw: HttpResponseRaw) => void
): void {
  GM_xmlhttpRequest({
    method: "GET",
    url,
    headers: {
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey"
    },
    timeout: REQUEST_TIMEOUT_MS,
    onload: (responseRaw: HttpResponseRaw) => onload(new HttpResponse(responseRaw)),
    onerror: (responseRaw: HttpResponseRaw) => onerror(responseRaw),
    ontimeout: () => onerror(new HttpResponseRaw())
  });
}

export function httpPost(
  url: string,
  data: string,
  onload: (response: HttpResponse) => void,
  onerror: (responseRaw: HttpResponseRaw) => void
): void {
  GM_xmlhttpRequest({
    method: "POST",
    url,
    data,
    headers: {
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey",
      "Content-type": "application/x-www-form-urlencoded"
    },
    timeout: REQUEST_TIMEOUT_MS,
    onload: (responseRaw: HttpResponseRaw) => onload(new HttpResponse(responseRaw)),
    onerror: (responseRaw: HttpResponseRaw) => onerror(responseRaw),
    ontimeout: () => onerror(new HttpResponseRaw())
  });
}
