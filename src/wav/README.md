# wav

Chunk-aware RIFF/WAVE parser. Pure decoding of PCM (8/16/24/32-bit) and 32-bit float WAV data into normalized `Float32Array` channels in the range `[-1, 1]`. The only side effect in this submodule is `readWavFile`, which performs the single `readFile` call at the edge.

## Public exports

- `parseWav(input, options?)` — parse a `Buffer`, `ArrayBuffer`, or `Uint8Array` into `WavAudio`.
- `readWavFile(path, options?)` — read a file from disk, then `parseWav`.
- Types: `WavAudio`, `WavFormat`, `WavAudioFormat`, `ParseWavOptions`, `ReadWavFileOptions`.

## Internal modules

- `types.ts` — public types.
- `header.ts` — `parseRiffHeader` validates the RIFF/WAVE magic bytes.
- `chunks.ts` — `scanChunks` walks chunks and collects `fmt` fields plus the `data` offset/length.
- `fmt.ts` — `parseFmtChunk`, `readFmtFields`, `validateFmtFields`.
- `validate.ts` — `validateFormat` and `isSupportedBitsPerSample`.
- `decode.ts` — `decodeChannels`, `readSample`, `readInt24`, `normalizeSigned`.
- `parse.ts` — `parseWav` orchestration and `buildFormat`.
- `read.ts` — `readWavFile` (the filesystem edge).

## Supported input

- RIFF/WAVE PCM and 32-bit float files with chunk-aware parsing.
- Mono and stereo.
- 8-bit unsigned PCM, 16/24/32-bit signed PCM, 32-bit float WAV.
- Unknown chunks are skipped safely; the `data` chunk may appear after metadata chunks.
