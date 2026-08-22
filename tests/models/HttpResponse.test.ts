import { HttpResponse, HttpResponseRaw } from "../../src/models/HttpResponse";

function makeRaw(text: string): HttpResponseRaw {
  const rawResponse = new HttpResponseRaw();
  rawResponse.responseText = text;
  return rawResponse;
}

describe("HttpResponse", () => {
  test("isOkStatus is true when the body starts with OK", () => {
    const response = new HttpResponse(makeRaw("OK\nsession123\nhttps://np.example\nhttps://submit.example"));
    expect(response.isOkStatus).toBe(true);
  });

  test("isOkStatus is false when the body starts with something else", () => {
    const response = new HttpResponse(makeRaw("BADSESSION\nwhatever"));
    expect(response.isOkStatus).toBe(false);
  });

  test("isOkStatus ignores the HTTP status code", () => {
    const rawResponse = makeRaw("BADSESSION\nwhatever");
    rawResponse.status = 500;
    rawResponse.statusText = "Internal Server Error";

    const response = new HttpResponse(rawResponse);

    expect(response.isOkStatus).toBe(false);
    expect(response.status).toBe(500);
    expect(response.statusText).toBe("Internal Server Error");
  });

  test("extracts session id, now playing url, and submit url positionally", () => {
    const response = new HttpResponse(makeRaw("OK\nmysession\nhttps://np.example.com\nhttps://submit.example.com"));
    expect(response.sessionId).toBe("mysession");
    expect(response.nowPlayingUrl).toBe("https://np.example.com");
    expect(response.submitUrl).toBe("https://submit.example.com");
  });

  test("preserves the raw response text", () => {
    const text = "OK\na\nb\nc";
    const response = new HttpResponse(makeRaw(text));
    expect(response.responseText).toBe(text);
  });

  test("an empty body is not OK and yields empty session fields", () => {
    const response = new HttpResponse(makeRaw(""));
    expect(response.isOkStatus).toBe(false);
    expect(response.sessionId).toBe("");
    expect(response.nowPlayingUrl).toBe("");
    expect(response.submitUrl).toBe("");
  });

  test("a truncated body yields empty strings for missing lines", () => {
    const response = new HttpResponse(makeRaw("OK\nsess"));
    expect(response.sessionId).toBe("sess");
    expect(response.nowPlayingUrl).toBe("");
    expect(response.submitUrl).toBe("");
  });

  test("upgrades http urls returned by the server to https", () => {
    const response = new HttpResponse(makeRaw(
      "OK\nsess\nhttp://post2.audioscrobbler.com/np\nhttp://post2.audioscrobbler.com/sub"
    ));
    expect(response.nowPlayingUrl).toBe("https://post2.audioscrobbler.com/np");
    expect(response.submitUrl).toBe("https://post2.audioscrobbler.com/sub");
  });

  test("strips the explicit port 80 the legacy protocol returns", () => {
    const response = new HttpResponse(makeRaw(
      "OK\nsess\nhttp://post2.audioscrobbler.com:80/np_1.2?k=abc\nhttp://post2.audioscrobbler.com:80/sub_1.2?k=abc"
    ));
    expect(response.nowPlayingUrl).toBe("https://post2.audioscrobbler.com/np_1.2?k=abc");
    expect(response.submitUrl).toBe("https://post2.audioscrobbler.com/sub_1.2?k=abc");
  });

  test("leaves non-80 ports alone", () => {
    const response = new HttpResponse(makeRaw(
      "OK\nsess\nhttp://post2.example.com:8080/np\nhttp://post2.example.com:8080/sub"
    ));
    expect(response.nowPlayingUrl).toBe("https://post2.example.com:8080/np");
    expect(response.submitUrl).toBe("https://post2.example.com:8080/sub");
  });

  test("leaves https urls from the server untouched", () => {
    const response = new HttpResponse(makeRaw(
      "OK\nsess\nhttps://post2.audioscrobbler.com/np\nhttps://post2.audioscrobbler.com/sub"
    ));
    expect(response.nowPlayingUrl).toBe("https://post2.audioscrobbler.com/np");
    expect(response.submitUrl).toBe("https://post2.audioscrobbler.com/sub");
  });
});
