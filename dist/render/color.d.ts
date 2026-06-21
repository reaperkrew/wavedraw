export interface RgbColor {
    red: number;
    green: number;
    blue: number;
}
export declare function normalizeColorStops(colors: string[]): RgbColor[];
export declare function parseHexColor(color: string): RgbColor;
export declare function interpolateColorStops(colors: RgbColor[], value: number): string;
export declare function rgbToHex(color: RgbColor): string;
export declare function toHexByte(value: number): string;
//# sourceMappingURL=color.d.ts.map