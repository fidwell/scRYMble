import { JSDOM } from "jsdom";
import { HttpResponse, HttpResponseRaw } from "../../src/models/HttpResponse";
import ScrobbleRecord from "../../src/models/ScrobbleRecord";
import { buildScrobbleParams, handshake } from "../../src/services/lastfm";
import { hex_md5 } from "../../src/services/md5";
import rymUi from "../../src/services/rymUi";
import scRYMbleUi from "../../src/services/scrymbleUi";

jest.mock("../../src/services/md5", () => ({
  hex_md5: (value: string) => {
    let hash = 7;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) % 268435455;
    }
    return hash.toString(16);
  }
}));

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
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("builds the handshake url with an encoded username and hashed auth", () => {
    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    const timestamp = 1724000000;
    const expectedAuth = hex_md5(`${hex_md5(PASSWORD)}${timestamp}`);
    const expectedUrl = `https://post.audioscrobbler.com/?hs=true&p=1.2&c=scr&v=1.0&u=${encodeURIComponent(USERNAME)}&t=${timestamp}&a=${expectedAuth}`;

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

describe("buildScrobbleParams", () => {
  const song = new ScrobbleRecord("The Sound of Silence", "Simon & Garfunkel", "3:06");

  test("brackets every key with the track index", () => {
    const params = buildScrobbleParams(song, 2, "Wednesday Morning, 3 A.M.", 1724000000);

    expect(Object.keys(params)).toEqual([
      "a[2]",
      "t[2]",
      "b[2]",
      "n[2]",
      "l[2]",
      "i[2]",
      "o[2]",
      "r[2]",
      "m[2]"
    ]);
  });

  test("fills in the protocol values", () => {
    const params = buildScrobbleParams(song, 0, "Wednesday Morning, 3 A.M.", 1724000000);

    expect(params["a[0]"]).toBe("Simon & Garfunkel");
    expect(params["t[0]"]).toBe("The Sound of Silence");
    expect(params["b[0]"]).toBe("Wednesday Morning, 3 A.M.");
    expect(params["n[0]"]).toBe("1");
    expect(params["l[0]"]).toBe("186");
    expect(params["i[0]"]).toBe("1724000000");
    expect(params["o[0]"]).toBe("P");
    expect(params["r[0]"]).toBe("");
    expect(params["m[0]"]).toBe("");
  });

  test("does not set the session id", () => {
    const params = buildScrobbleParams(song, 0, "Album", 1724000000);

    expect(params["s"]).toBeUndefined();
  });
});
