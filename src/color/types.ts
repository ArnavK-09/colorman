import type { TailwindFamily, TailwindShade } from "../data/tailwind-colors.js";

export interface ColorSelection {
  family: TailwindFamily;
  shade: TailwindShade;
  token: string;
  oklch: string;
}

export interface ColorMeta {
  family: string;
  shade: string;
  token: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
  tailwindFill: string;
  tailwindStroke: string;
}
