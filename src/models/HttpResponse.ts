export class HttpResponseRaw {
  status = 0;
  statusText = "";
  responseText = "";
}

function secureUrl(url: string): string {
  return url
    .replace(/^http:\/\//i, "https://")
    .replace(/^(https:\/\/[^/:]+):80(?=\/|$)/i, "$1");
}

export class HttpResponse {
  status: number;
  statusText: string;
  responseText: string;
  lines: string[];

  constructor(raw: HttpResponseRaw) {
    this.status = raw.status;
    this.statusText = raw.statusText;
    this.responseText = raw.responseText;
    this.lines = raw.responseText.split("\n");
  }

  private line(index: number): string {
    return this.lines[index] ?? "";
  }

  get isOkStatus(): boolean {
    return this.lines[0] === "OK";
  }

  get sessionId(): string {
    return this.line(1);
  }

  get nowPlayingUrl(): string {
    return secureUrl(this.line(2));
  }

  get submitUrl(): string {
    return secureUrl(this.line(3));
  }
}
