import { HttpResponse, HttpResponseRaw } from "../../src/models/HttpResponse";
import { httpGet, httpPost } from "../../src/services/httpRequestHelper";

interface CapturedRequestDetails {
  method?: string;
  url?: string;
  data?: string;
  headers?: Record<string, string>;
  timeout?: number;
  onload?: (responseRaw: HttpResponseRaw) => void;
  onerror?: (responseRaw: HttpResponseRaw) => void;
  ontimeout?: () => void;
}

describe("httpRequestHelper", () => {
  let captured: CapturedRequestDetails | undefined;

  beforeEach(() => {
    captured = undefined;
    global.GM_xmlhttpRequest = (details: CapturedRequestDetails) => {
      captured = details;
    };
  });

  test("httpGet sends a GET request with the expected headers and timeout", () => {
    httpGet("https://example.com/handshake", () => undefined, () => undefined);

    expect(captured?.method).toBe("GET");
    expect(captured?.url).toBe("https://example.com/handshake");
    expect(captured?.headers).toEqual({
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey"
    });
    expect(captured?.timeout).toBe(30000);
  });

  test("httpGet converts successful responses to HttpResponse", () => {
    let loaded: HttpResponse | undefined;
    httpGet(
      "https://example.com",
      response => {
        loaded = response;
      },
      () => undefined
    );

    const rawResponse = new HttpResponseRaw();
    rawResponse.status = 200;
    rawResponse.statusText = "OK";
    rawResponse.responseText = "OK\nsess\nnp\nsub";
    captured?.onload?.(rawResponse);

    expect(loaded).toBeInstanceOf(HttpResponse);
    expect(loaded?.isOkStatus).toBe(true);
    expect(loaded?.sessionId).toBe("sess");
  });

  test("httpGet passes transport errors through to the onerror handler", () => {
    let errored: HttpResponseRaw | undefined;
    httpGet(
      "https://example.com",
      () => undefined,
      responseRaw => {
        errored = responseRaw;
      }
    );

    const errPayload = new HttpResponseRaw();
    captured?.onerror?.(errPayload);

    expect(errored).toBe(errPayload);
  });

  test("httpGet reports timeouts as empty error responses", () => {
    let errored: HttpResponseRaw | undefined;
    httpGet(
      "https://example.com",
      () => undefined,
      responseRaw => {
        errored = responseRaw;
      }
    );

    captured?.ontimeout?.();

    expect(errored).toBeInstanceOf(HttpResponseRaw);
    expect(errored?.status).toBe(0);
  });

  test("httpPost sends a POST request with form content type and payload", () => {
    httpPost("https://example.com/submit", "s=abc&x=1", () => undefined, () => undefined);

    expect(captured?.method).toBe("POST");
    expect(captured?.url).toBe("https://example.com/submit");
    expect(captured?.data).toBe("s=abc&x=1");
    expect(captured?.headers).toEqual({
      "User-agent": "Mozilla/4.0 (compatible) Greasemonkey",
      "Content-type": "application/x-www-form-urlencoded"
    });
    expect(captured?.timeout).toBe(30000);
  });
});
