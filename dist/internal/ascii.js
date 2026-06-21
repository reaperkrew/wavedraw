export function readAscii(bytes, offset, length) {
    let result = "";
    for (let i = 0; i < length; i += 1) {
        result += String.fromCharCode(bytes[offset + i] ?? 0);
    }
    return result;
}
