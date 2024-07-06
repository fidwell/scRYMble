export function fetch_unix_timestamp(): number {
  return parseInt(new Date().getTime().toString().substring(0, 10));
}
