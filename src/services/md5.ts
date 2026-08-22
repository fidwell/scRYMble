// Vendored MD5 implementation (RFC 1321), written directly from the
// algorithm description. Replaces the third-party script previously pulled
// at install time via @require ("Portable MD5 Function" on greasyfork.org),
// so the userscript no longer loads remote code.
const SHIFTS = [
  7, 12, 17, 22,
  5, 9, 14, 20,
  4, 11, 16, 23,
  6, 10, 15, 21
];

const SINE_CONSTANTS = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)
);

export function hex_md5(input: string): string {
  return md5Words(new TextEncoder().encode(input)).map(hexWord).join("");
}

function md5Words(bytes: Uint8Array): number[] {
  const padded = padMessage(bytes);
  let a0 = 0x67452301;
  let b0 = 0xEFCDAB89;
  let c0 = 0x98BADCFE;
  let d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = littleEndianWords(padded, offset);
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let messageIndex: number;

      if (i < 16) {
        f = b & c | ~b & d;
        messageIndex = i;
      } else if (i < 32) {
        f = d & b | ~d & c;
        messageIndex = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        messageIndex = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        messageIndex = 7 * i % 16;
      }

      f = f + a + SINE_CONSTANTS[i] + words[messageIndex] | 0;
      a = d;
      d = c;
      c = b;
      b = b + rotateLeft(f, SHIFTS[i % 4 + Math.floor(i / 16) * 4]) | 0;
    }

    a0 = a0 + a | 0;
    b0 = b0 + b | 0;
    c0 = c0 + c | 0;
    d0 = d0 + d | 0;
  }

  return [a0, b0, c0, d0];
}

function padMessage(bytes: Uint8Array): Uint8Array {
  const bitLength = bytes.length * 8;
  const paddedLength = (bytes.length + 8 >> 6) + 1 << 6;
  const padded = new Uint8Array(paddedLength);

  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const lowBits = bitLength % 4294967296;
  const highBits = Math.floor(bitLength / 4294967296);
  for (let i = 0; i < 4; i++) {
    padded[paddedLength - 8 + i] = lowBits >>> i * 8 & 0xFF;
    padded[paddedLength - 4 + i] = highBits >>> i * 8 & 0xFF;
  }

  return padded;
}

function littleEndianWords(bytes: Uint8Array, offset: number): number[] {
  const words: number[] = [];
  for (let j = 0; j < 16; j++) {
    const base = offset + j * 4;
    words[j] =
      bytes[base] |
      bytes[base + 1] << 8 |
      bytes[base + 2] << 16 |
      bytes[base + 3] << 24;
  }
  return words;
}

function rotateLeft(value: number, shift: number): number {
  return value << shift | value >>> 32 - shift;
}

function hexWord(word: number): string {
  let result = "";
  for (let byteIndex = 0; byteIndex < 4; byteIndex++) {
    result += (word >>> byteIndex * 8 & 0xFF).toString(16).padStart(2, "0");
  }
  return result;
}
