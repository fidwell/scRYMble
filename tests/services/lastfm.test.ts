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

function makeHandshakeResponse(text: string, dateHeader?: string): HttpResponseRaw {
  const raw = new HttpResponseRaw();
  raw.status = 200;
  raw.statusText = "OK";
  raw.responseText = text;
  if (dateHeader !== undefined) {
    raw.responseHeaders = `content-type: text/plain\r\ndate: ${dateHeader}\r\n`;
  }
  return raw;
}

describe("lastfm handshake", () => {
  let captured: CapturedRequestDetails | undefined;
  const setValueMock = jest.fn();
  const deleteValueMock = jest.fn();
  const storage = new Map<string, string>();

  beforeEach(() => {
    captured = undefined;
    setValueMock.mockClear();
    deleteValueMock.mockClear();
    storage.clear();

    jest.useFakeTimers();
    jest.setSystemTime(new Date(FIXED_NOW_MS));

    const dom = new JSDOM(
      "<body><div id=\"tracks\"></div><input type=\"text\" id=\"scrobbleusername\" /><input type=\"password\" id=\"scrobblepassword\" /></body>"
    );
    global.document = dom.window.document;
    (document.getElementById("scrobbleusername") as HTMLInputElement).value = USERNAME;
    (document.getElementById("scrobblepassword") as HTMLInputElement).value = PASSWORD;

    global.GM_getValue = ((key: string, defaultValue?: string) => {
      const stored = storage.get(key);
      return stored !== undefined ? stored : defaultValue ?? "";
    }) as typeof GM_getValue;
    global.GM_setValue = (key: string, value: string) => {
      setValueMock(key, value);
      storage.set(key, value);
    };
    global.GM_deleteValue = (key: string) => {
      deleteValueMock(key);
      storage.delete(key);
    };
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

  test("persists only the password hash, never the password", () => {
    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    expect(setValueMock).toHaveBeenCalledWith("pwhash", hex_md5(PASSWORD));
    expect(setValueMock).not.toHaveBeenCalledWith("pass", expect.anything());
    expect(storage.has("pass")).toBe(false);
    expect(deleteValueMock).toHaveBeenCalledWith("pass");
  });

  test("reuses the stored hash when the password field is left blank", () => {
    storage.set("pwhash", "storedhash");
    (document.getElementById("scrobblepassword") as HTMLInputElement).value = "";

    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    const timestamp = 1724000000;
    expect(captured?.url).toContain(`a=${hex_md5(`storedhash${timestamp}`)}`);
    expect(setValueMock).not.toHaveBeenCalledWith("pwhash", expect.anything());
  });

  test("migrates legacy plaintext credentials and deletes them", () => {
    const legacyPassword = "old-plaintext-pw";
    storage.set("pass", legacyPassword);
    (document.getElementById("scrobblepassword") as HTMLInputElement).value = "";

    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    const timestamp = 1724000000;
    expect(captured?.url).toContain(`a=${hex_md5(`${hex_md5(legacyPassword)}${timestamp}`)}`);
    expect(setValueMock).toHaveBeenCalledWith("pwhash", hex_md5(legacyPassword));
    expect(deleteValueMock).toHaveBeenCalledWith("pass");
  });

  test("retries with corrected time when the server reports BADTIME", () => {
    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    const skewMs = 90 * 1000;
    captured?.onload?.(makeHandshakeResponse(
      "BADTIME",
      new Date(FIXED_NOW_MS + skewMs).toUTCString()
    ));

    const secondUrl = captured?.url ?? "";
    expect(secondUrl).toContain(`t=${1724000000 + 90}`);
    expect(setValueMock).toHaveBeenCalledWith("clockOffsetSeconds", "90");
  });

  test("retries only once before giving the response to the caller", () => {
    let handedOver: HttpResponse | undefined;
    handshake(new scRYMbleUi(new rymUi()), response => {
      handedOver = response;
    }, () => undefined);

    const badTimeRaw = makeHandshakeResponse(
      "BADTIME",
      new Date(FIXED_NOW_MS + 60000).toUTCString()
    );
    captured?.onload?.(badTimeRaw);
    captured?.onload?.(makeHandshakeResponse(
      "BADTIME",
      new Date(FIXED_NOW_MS + 60000).toUTCString()
    ));

    expect(handedOver?.responseText).toBe("BADTIME");
  });

  test("applies a previously learned clock offset immediately", () => {
    storage.set("clockOffsetSeconds", "90");

    handshake(new scRYMbleUi(new rymUi()), () => undefined, () => undefined);

    expect(captured?.url).toContain("t=1724000090");
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
