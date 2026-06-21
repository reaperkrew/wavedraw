import { readAscii } from "../internal/ascii.js";
import { parseFmtChunk } from "./fmt.js";
const FMT = "fmt ";
const DATA = "data";
export function scanChunks(bytes, view) {
    const state = { fmt: undefined, dataOffset: -1, dataLength: 0 };
    let offset = 12;
    while (offset + 8 <= bytes.byteLength) {
        const header = readChunkHeader(bytes, view, offset);
        processChunk(state, header, view, bytes);
        offset = header.nextOffset;
    }
    return state;
}
export function readChunkHeader(bytes, view, offset) {
    const id = readAscii(bytes, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const payloadOffset = offset + 8;
    return { id, size, payloadOffset, nextOffset: payloadOffset + size + (size % 2) };
}
export function processChunk(state, header, view, bytes) {
    if (header.payloadOffset + header.size > bytes.byteLength) {
        throw new Error(`Invalid WAV: chunk ${header.id.trim() || "(empty)"} exceeds file length`);
    }
    if (header.id === FMT) {
        state.fmt = parseFmtChunk(view, header.payloadOffset, header.size);
    }
    else if (header.id === DATA) {
        state.dataOffset = header.payloadOffset;
        state.dataLength = header.size;
    }
}
