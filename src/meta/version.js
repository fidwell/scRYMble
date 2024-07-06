const now = new Date(new Date().toUTCString().slice(0, -4));

function pad(value) {
  return `00${value}`.slice(-2);
}

export function getVersion() {
  return `2.${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
