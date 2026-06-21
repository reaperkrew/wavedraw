export function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += String.fromCharCode(bytes[offset + i] ?? 0);
  }
  return result;
}
