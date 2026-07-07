const HEX = "0123456789abcdef";

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += HEX[(bytes[i] >> 4) & 0xf];
    hex += HEX[bytes[i] & 0xf];
  }
  return hex;
}

export function uuidv7(): string {
  const ms = BigInt(Date.now());

  const ts0 = Number((ms >> 40n) & 0xffffffffn);
  const ts1 = Number((ms >> 28n) & 0xfffn);
  const ts2 = Number(ms & 0xfffffffn);

  const rand = randomBytes(10);

  const bytes = new Uint8Array(16);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, ts0, false);
  view.setUint16(4, (ts1 << 4) | 0x7, false);
  view.setUint16(6, (ts2 << 4) | (rand[0] & 0x0f), false);

  bytes[8] = (rand[1] & 0x3f) | 0x80;
  bytes[9] = rand[2];
  bytes[10] = rand[3];
  bytes[11] = rand[4];
  bytes[12] = rand[5];
  bytes[13] = rand[6];
  bytes[14] = rand[7];
  bytes[15] = rand[8];

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
