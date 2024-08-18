export function fetch_unix_timestamp(): number {
  return parseInt(new Date().getTime().toString().substring(0, 10));
}

export function stripAndClean(input: string): string {
  input = input
    .replace("&amp;", "")
    .replace("\n", " ");

  while (input.indexOf("  ") >= 0) {
    input = input.replace("  ", " ");
  }

  while (input.startsWith(" - ")) {
    input = input.substring(3);
  }

  while (input.startsWith("- ")) {
    input = input.substring(2);
  }

  return input.trim();
}
