const now = new Date();

function pad(value) {
  return `00${value}`.slice(-2);
}

export function getVersion() {
  return `2.${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
}
