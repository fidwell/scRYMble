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

  test("an empty body is not OK and yields undefined session data", () => {
    const response = new HttpResponse(makeRaw(""));
    expect(response.isOkStatus).toBe(false);
    expect(response.sessionId).toBeUndefined();
    expect(response.nowPlayingUrl).toBeUndefined();
    expect(response.submitUrl).toBeUndefined();
  });
});
