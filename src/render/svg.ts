import { escapeAttribute } from "./format.js";

export function openSvg(width: number, height: number, ariaLabel: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(ariaLabel)}">`;
}

export function renderBackground(background: string): string {
  return `<rect width="100%" height="100%" fill="${escapeAttribute(background)}"/>`;
}

export const closeSvg = "</svg>";
