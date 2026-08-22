import { JSDOM } from "jsdom";
import { HttpResponse, HttpResponseRaw } from "../../src/models/HttpResponse";
import { handshake } from "../../src/services/lastfm";
import rymUi from "../../src/services/rymUi";
import scRYMbleUi from "../../src/services/scrymbleUi";

const USERNAME = "ann&bob +1";
const PASSWORD = "secretpw!";
const FIXED_NOW_MS = 1724000000123;

interface CapturedRequestDetails {
  url?: string;
  onload?: (responseRaw: unknown) => void;
  onerror?: (responseRaw: unknown) => void;
}

describe("lastfm handshake", () => {
  let captured: CapturedRequestDetails | undefined;
  const setValueMock = jest.fn();

  beforeEach(() => {
    captured = undefined;
    setValueMock.mockClear();

    jest.useFakeTimers();
    jest.setSystemTime(new Date(FIXED_NOW_MS));

    const dom = new JSDOM(
      "<body><div id=\"tracks\"></div><input type=\"text\" id=\"scrobbleusername\" /><input type=\"password\" id=\"scrobblepassword\" /></body>"
    );
    global.document = dom.window.document;
    (document.getElementById("scrobbleusername") as HTMLInputElement).value = USERNAME;
    (document.getElementById("scrobblepassword") as HTMLInputElement).value = PASSWORD;

    global.GM_setValue = setValueMock;
    global.GM_xmlhttpRequest = (details: CapturedRequestDetails) => {
      captured = details;
    };
    global.hex_md5 = (value: string) => {
      let hash = 7;
      for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) % 268435455;
      }
      return hash.toString(16);
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("builds the handshake url with an encoded username and hashed auth", () => {
    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    const timestamp = 1724000000;
    const expectedAuth = global.hex_md5(`${global.hex_md5(PASSWORD)}${timestamp}`);
    const expectedUrl = `http://post.audioscrobbler.com/?hs=true&p=1.2&c=scr&v=1.0&u=${encodeURIComponent(USERNAME)}&t=${timestamp}&a=${expectedAuth}`;

    expect(captured?.url).toBe(expectedUrl);
  });

  test("never sends the password or its raw hash in the url", () => {
    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    expect(captured?.url).not.toContain(PASSWORD);
  });

  test("persists the username for next time", () => {
    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    expect(setValueMock).toHaveBeenCalledWith("user", USERNAME);
  });

  test("forwards success and error handlers to the request", () => {
    let loadedResponse: HttpResponse | undefined;
    let forwardedError: HttpResponseRaw | undefined;

    const onResponse = (response: HttpResponse) => {
      loadedResponse = response;
    };
    const onError = (responseRaw: unknown) => {
      forwardedError = responseRaw as HttpResponseRaw;
    };

    handshake(new scRYMbleUi(new rymUi()), onResponse, onError);

    expect(captured?.onload).toBeInstanceOf(Function);
    expect(captured?.onerror).toBeInstanceOf(Function);

    const rawResponse = new HttpResponseRaw();
    rawResponse.responseText = "OK\na\nb\nc";
    captured?.onload?.(rawResponse);
    expect(loadedResponse?.responseText).toBe("OK\na\nb\nc");

    const errPayload = new HttpResponseRaw();
    captured?.onerror?.(errPayload);
    expect(forwardedError).toBe(errPayload);
  });
});
