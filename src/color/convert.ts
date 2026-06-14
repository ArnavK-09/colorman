import Gdk from "gi://Gdk?version=4.0";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * value ** (1 / 2.4) - 0.055;
}

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function oklabToLinearRgb(
  l: number,
  a: number,
  b: number,
): [number, number, number] {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

function linearRgbToOklab(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

export function rgbaFromChannels(
  r: number,
  g: number,
  b: number,
  a = 1,
): Gdk.RGBA {
  const rgba = new Gdk.RGBA();
  rgba.red = clamp01(r);
  rgba.green = clamp01(g);
  rgba.blue = clamp01(b);
  rgba.alpha = clamp01(a);
  return rgba;
}

export function parseOklch(value: string): Gdk.RGBA | null {
  const match = value
    .trim()
    .match(/^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)\s*\)$/i);
  if (!match) return null;

  let l = Number.parseFloat(match[1]);
  if (match[1].includes("%")) l /= 100;

  const c = Number.parseFloat(match[2]);
  const h = Number.parseFloat(match[3]);
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const [lr, lg, lb] = oklabToLinearRgb(l, a, b);
  return rgbaFromChannels(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb));
}

export function parseHex(value: string): Gdk.RGBA | null {
  const rgba = new Gdk.RGBA();
  const normalized = value.trim().startsWith("#")
    ? value.trim()
    : `#${value.trim()}`;
  if (!rgba.parse(normalized)) return null;
  return rgba;
}

export function parseRgb(value: string): Gdk.RGBA | null {
  const parts = value
    .trim()
    .replace(/^rgb\(/i, "")
    .replace(/\)$/, "")
    .split(/[\s,/]+/)
    .filter(Boolean);

  if (parts.length < 3) return null;

  const channels = parts.slice(0, 3).map((part) => Number.parseFloat(part));
  if (channels.some((channel) => Number.isNaN(channel))) return null;

  return rgbaFromChannels(
    channels[0] / 255,
    channels[1] / 255,
    channels[2] / 255,
  );
}

export function parseHsl(value: string): Gdk.RGBA | null {
  const parts = value
    .trim()
    .replace(/^hsl\(/i, "")
    .replace(/\)$/, "")
    .split(/[\s,/]+/)
    .filter(Boolean);

  if (parts.length < 3) return null;

  const h = Number.parseFloat(parts[0]);
  let s = Number.parseFloat(parts[1].replace("%", ""));
  let l = Number.parseFloat(parts[2].replace("%", ""));
  if ([h, s, l].some((part) => Number.isNaN(part))) return null;

  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return rgbaFromChannels(r + m, g + m, b + m);
}

export function rgbaToHex(rgba: Gdk.RGBA): string {
  const toByte = (channel: number) =>
    Math.round(clamp01(channel) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toByte(rgba.red)}${toByte(rgba.green)}${toByte(rgba.blue)}`;
}

export function rgbaToRgbString(rgba: Gdk.RGBA): string {
  const toByte = (channel: number) => Math.round(clamp01(channel) * 255);
  return `${toByte(rgba.red)}, ${toByte(rgba.green)}, ${toByte(rgba.blue)}`;
}

export function rgbaToHslString(rgba: Gdk.RGBA): string {
  const r = rgba.red;
  const g = rgba.green;
  const b = rgba.blue;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return `0, 0%, ${Math.round(l * 100)}%`;
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;

  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return `${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

export function rgbaToOklchString(rgba: Gdk.RGBA): string {
  const [l, a, b] = linearRgbToOklab(rgba.red, rgba.green, rgba.blue);
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
}

export function cssColor(rgba: Gdk.RGBA): string {
  return rgbaToHex(rgba);
}
