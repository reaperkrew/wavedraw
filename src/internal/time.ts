export type TimeOption = "START" | "END" | number | string;

export function normalizeTimeOption(value: TimeOption | undefined, fallback: number): number {
  if (value === undefined || value === "START" || value === "END") {
    return fallback;
  }

  if (typeof value === "number") {
    return value;
  }

  return parseTimecode(value);
}

export function parseTimecode(value: string): number {
  const parts = value.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error("time strings must use HH:MM:SS format");
  }
  return parts[0]! * 60 * 60 + parts[1]! * 60 + parts[2]!;
}

export function normalizeTimeRange(
  durationSeconds: number,
  startSecondsOption: number | undefined,
  endSecondsOption: number | undefined
): { startSeconds: number; endSeconds: number } {
  const startSeconds = startSecondsOption ?? 0;
  const endSeconds = endSecondsOption ?? durationSeconds;
  validateTimeRange(durationSeconds, startSeconds, endSeconds);
  return { startSeconds, endSeconds };
}

export function validateTimeRange(durationSeconds: number, startSeconds: number, endSeconds: number): void {
  if (!Number.isFinite(startSeconds) || startSeconds < 0) {
    throw new Error("startSeconds must be a finite number greater than or equal to 0");
  }
  if (!Number.isFinite(endSeconds) || endSeconds <= startSeconds) {
    throw new Error("endSeconds must be greater than startSeconds");
  }
  if (endSeconds > durationSeconds) {
    throw new Error("endSeconds exceeds audio duration");
  }
}
