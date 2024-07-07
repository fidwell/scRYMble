export class HttpResponseRaw {
  status = 0;
  statusText = "";
  responseText = "";
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

  get isOkStatus(): boolean {
    return this.lines[0] === "OK";
  }

  get sessionId(): string {
    return this.lines[1];
  }

  get nowPlayingUrl(): string {
    return this.lines[2];
  }

  get submitUrl(): string {
    return this.lines[3];
  }
}
