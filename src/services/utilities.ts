export function fetch_unix_timestamp(): number {
  return Math.floor(Date.now() / 1000);
}

function decodeHtmlEntities(value: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

export function stripAndClean(input: string): string {
  let result = decodeHtmlEntities(input)
    .replace(/\n/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();

  while (result.startsWith("& - ")) {
    result = result.substring(4);
  }

  while (result.startsWith(" - ")) {
    result = result.substring(3);
  }

  while (result.startsWith("- ")) {
    result = result.substring(2);
  }

  return result;
}
