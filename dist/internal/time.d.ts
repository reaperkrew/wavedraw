export type TimeOption = "START" | "END" | number | string;
export declare function normalizeTimeOption(value: TimeOption | undefined, fallback: number): number;
export declare function parseTimecode(value: string): number;
export declare function normalizeTimeRange(durationSeconds: number, startSecondsOption: number | undefined, endSecondsOption: number | undefined): {
    startSeconds: number;
    endSeconds: number;
};
export declare function validateTimeRange(durationSeconds: number, startSeconds: number, endSeconds: number): void;
//# sourceMappingURL=time.d.ts.map