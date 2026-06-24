# aiff

Chunk-aware AIFF / AIFF-C parser. Pure decoding of big-endian PCM (8/16/24/32-bit) and AIFC IEEE float (32/64-bit) audio into normalized `Float32Array` channels in the range `[-1, 1]`. Reuses the `WavAudio` / `WavFormat` shapes from `../wav` so all downstream waveform and spectrogram renderers work on AIFF input unchanged. The only side effect in this submodule is `readAiffFile`, which performs the single `readFile` call at the edge.

## Public exports

- `parseAiff(input)` — parse a `Buffer`, `ArrayBuffer`, or `Uint8Array` into a `WavAudio`.
- `readAiffFile(path)` — read a file from disk, then `parseAiff`.
- Types: `AiffComm`, `AiffEncoding`, `AiffFlavor`.

## Internal modules

- `header.ts` — `parseFormHeader` validates the `FORM`/`AIFF`|`AIFC` magic bytes.
- `chunks.ts` — `scanAiffChunks` walks big-endian IFF chunks and collects `COMM` fields plus the `SSND` sound offset/length.
- `comm.ts` — `parseCommChunk`, `resolveEncoding` (maps `NONE`/`twos`/`sowt` to PCM, `fl32`/`fl64` to float).
- `extended.ts` — `readExtended` decodes the 10-byte IEEE 754 80-bit extended sample rate.
- `decode.ts` — `decodeAiffChannels`, `readAiffSample` (big-endian; note AIFF 8-bit is signed, unlike WAV's unsigned 8-bit), `readInt24Be`.
- `parse.ts` — `parseAiff` orchestration and `buildAiffFormat`.
- `read.ts` — `readAiffFile` (the filesystem edge).

## Supported input

- AIFF (uncompressed) big-endian signed PCM, 8/16/24/32-bit.
- AIFF-C with compression types `NONE`, `twos`, `sowt` (PCM), `fl32` (32-bit float), `fl64` (64-bit float).
- Mono and multi-channel.
- Unknown chunks are skipped safely; the `SSND` chunk may appear after metadata chunks.

## Notes

- The `loadAudio` / `parseAudio` dispatcher in `../draw/load.ts` sniffs the first 4 bytes (`RIFF` vs `FORM`) and routes to `parseWav` or `parseAiff`, so `drawWave` and `drawMelSpectrogram` accept either container transparently.
- AIFF 8-bit PCM is **signed** two's-complement (centered at 0), whereas WAV 8-bit PCM is **unsigned** (centered at 128). Both normalize to `[-1, 1]`.
