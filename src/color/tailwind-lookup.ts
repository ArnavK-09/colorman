import Gdk from "gi://Gdk?version=4.0";

import { parseOklch, rgbaToHex } from "./convert.js";
import type { ColorMeta } from "./types.js";
import {
  TAILWIND_COLORS,
  TAILWIND_FAMILIES,
  TAILWIND_SHADES,
  type TailwindFamily,
  type TailwindShade,
} from "../data/tailwind-colors.js";

function metaFromToken(
  family: TailwindFamily,
  shade: TailwindShade,
): ColorMeta {
  const token = `${family}-${shade}`;
  return {
    family,
    shade: String(shade),
    token,
    tailwindBg: `bg-${token}`,
    tailwindText: `text-${token}`,
    tailwindBorder: `border-${token}`,
    tailwindFill: `fill-${token}`,
    tailwindStroke: `stroke-${token}`,
  };
}

function normalizeOklch(value: string): string {
  const match = value
    .trim()
    .match(/^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)\s*\)$/i);
  if (!match) return value.trim().toLowerCase();

  let l = Number.parseFloat(match[1]);
  if (match[1].includes("%")) l /= 100;

  const c = Number.parseFloat(match[2]);
  const h = Number.parseFloat(match[3]);

  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
}

const rgbaLookup = new Map<string, ColorMeta>();
const oklchLookup = new Map<string, ColorMeta>();

for (const family of TAILWIND_FAMILIES) {
  for (const shade of TAILWIND_SHADES) {
    const oklch = TAILWIND_COLORS[family][shade];
    const meta = metaFromToken(family, shade);
    oklchLookup.set(normalizeOklch(oklch), meta);

    const rgba = parseOklch(oklch);
    if (!rgba) continue;
    rgbaLookup.set(rgbaToHex(rgba).toLowerCase(), meta);
  }
}

export function lookupTailwindByRgba(rgba: Gdk.RGBA): ColorMeta | null {
  return rgbaLookup.get(rgbaToHex(rgba).toLowerCase()) ?? null;
}

export function lookupTailwindByOklch(value: string): ColorMeta | null {
  const exact = oklchLookup.get(normalizeOklch(value));
  if (exact) return exact;

  const rgba = parseOklch(value);
  if (!rgba) return null;
  return lookupTailwindByRgba(rgba);
}

export { metaFromToken };
