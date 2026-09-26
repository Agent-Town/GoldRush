/**
 * Pixel math for the test-truth-2 probes. Three readings of the same screenshot pixel:
 *   luma   Rec. 709 weights on the sRGB-ENCODED channels (display brightness, what the old helper read)
 *   linear relative luminance after the sRGB decode (display light)
 *   scene  luminance in SCENE-LINEAR light: the ledger post overlay undone, the sRGB decode, then
 *          three.js's ACESFilmicToneMapping inverted (exposure, the two ACES matrices, the RRT/ODT
 *          fit), i.e. the space `setWorldSpriteTint` multiplies sprite colour in.
 * The ACES constants are copied from node_modules/three/src/renderers/shaders/ShaderChunk/
 * tonemapping_pars_fragment.glsl.js; GLSL `mat3(vec3, vec3, vec3)` takes COLUMNS.
 */
import { PNG } from 'pngjs';

export const W709 = [0.2126, 0.7152, 0.0722] as const;
const ACES_IN = [[0.59719, 0.076, 0.0284], [0.35458, 0.90834, 0.13383], [0.04823, 0.01566, 0.83777]];
const ACES_OUT = [[1.60475, -0.10208, -0.00327], [-0.53108, 1.10813, -0.07276], [-0.07367, -0.00605, 1.07602]];

type Cols = number[][];
const mulCols = (cols: Cols, v: number[]): number[] => [0, 1, 2].map((r) => cols[0]![r]! * v[0]! + cols[1]![r]! * v[1]! + cols[2]![r]! * v[2]!);
function invCols(cols: Cols): Cols {
  const m = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cols[c]![r]!));
  const [a, b, c] = m[0]!, [d, e, f] = m[1]!, [g, h, i] = m[2]!;
  const A = e! * i! - f! * h!, B = -(d! * i! - f! * g!), C = d! * h! - e! * g!;
  const det = a! * A + b! * B + c! * C;
  const inv = [
    [A / det, -(b! * i! - c! * h!) / det, (b! * f! - c! * e!) / det],
    [B / det, (a! * i! - c! * g!) / det, -(a! * f! - c! * d!) / det],
    [C / det, -(a! * h! - b! * g!) / det, (a! * e! - b! * d!) / det],
  ];
  return [0, 1, 2].map((col) => [0, 1, 2].map((row) => inv[row]![col]!));
}
const ACES_IN_INV = invCols(ACES_IN);
const ACES_OUT_INV = invCols(ACES_OUT);

function rrtInverse(y: number): number {
  const A = 0.983729 * y - 1;
  const B = 0.432951 * y - 0.0245786;
  const C = 0.238081 * y + 0.000090537;
  if (Math.abs(A) < 1e-9) return -C / B;
  return (-B - Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A);
}

export const srgbDecode = (s: number): number => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4);

export function acesInverse(display: number[], exposure: number): number[] {
  const fitted = mulCols(ACES_OUT_INV, display).map(rrtInverse);
  return mulCols(ACES_IN_INV, fitted).map((v) => (v * 0.6) / exposure);
}

export type Overlay = { enabled: boolean; warmth: number; vignette: number };

/** The LedgerPostPass quad (src/world/LightRig.ts), undone at one pixel, paper grain taken as 0. */
function undoOverlay(rgb: number[], u: number, v: number, overlay: Overlay): number[] {
  if (!overlay.enabled) return rgb;
  const len = Math.hypot(u - 0.5, v - 0.5) * 1.42;
  const t = Math.min(1, Math.max(0, (len - 0.28) / (0.74 - 0.28)));
  const edge = t * t * (3 - 2 * t);
  const ink = [1 + (0.22 - 1) * edge, 0.82 + (0.13 - 0.82) * edge, 0.5 + (0.07 - 0.5) * edge];
  const alpha = Math.min(0.24, Math.max(0, (1 - edge) * overlay.warmth + edge * overlay.vignette));
  return rgb.map((channel, index) => Math.min(1, Math.max(0, (channel - alpha * ink[index]!) / (1 - alpha))));
}

export type PatchStats = {
  samples: number;
  luma: { p50: number; p95: number };
  linear: { p50: number; p95: number };
  scene: { p50: number; p95: number };
};

const quantile = (values: number[], q: number): number => {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))]!;
};

export function pixelTriplet(png: PNG, x: number, y: number, overlay: Overlay, exposure: number) {
  const offset = (y * png.width + x) * 4;
  const encoded = [png.data[offset]! / 255, png.data[offset + 1]! / 255, png.data[offset + 2]! / 255];
  const luma = W709[0] * encoded[0]! + W709[1] * encoded[1]! + W709[2] * encoded[2]!;
  const display = encoded.map(srgbDecode);
  const linear = W709[0] * display[0]! + W709[1] * display[1]! + W709[2] * display[2]!;
  const clean = undoOverlay(encoded, (x + 0.5) / png.width, 1 - (y + 0.5) / png.height, overlay).map(srgbDecode);
  const scene = acesInverse(clean, exposure);
  const sceneLum = W709[0] * scene[0]! + W709[1] * scene[1]! + W709[2] * scene[2]!;
  return { luma, linear, scene: sceneLum, alpha: png.data[offset + 3]! };
}

export function patchStats(png: PNG, cx: number, cy: number, halfW: number, halfH: number, overlay: Overlay, exposure: number): PatchStats {
  const luma: number[] = [], linear: number[] = [], scene: number[] = [];
  for (let y = Math.round(cy - halfH); y <= Math.round(cy + halfH); y += 1) {
    if (y < 0 || y >= png.height) continue;
    for (let x = Math.round(cx - halfW); x <= Math.round(cx + halfW); x += 1) {
      if (x < 0 || x >= png.width) continue;
      const p = pixelTriplet(png, x, y, overlay, exposure);
      if (p.alpha < 64) continue;
      luma.push(p.luma);
      linear.push(p.linear);
      scene.push(p.scene);
    }
  }
  return {
    samples: luma.length,
    luma: { p50: quantile(luma, 0.5), p95: quantile(luma, 0.95) },
    linear: { p50: quantile(linear, 0.5), p95: quantile(linear, 0.95) },
    scene: { p50: quantile(scene, 0.5), p95: quantile(scene, 0.95) },
  };
}

/** The old helper's exact number: p95 luma over a FIXED +-6 x +-8 PNG-pixel patch. */
export function oldHelperValue(png: PNG, cx: number, cy: number): number {
  const samples: number[] = [];
  for (let y = cy - 8; y <= cy + 8; y += 1) {
    if (y < 0 || y >= png.height) continue;
    for (let x = cx - 6; x <= cx + 6; x += 1) {
      if (x < 0 || x >= png.width) continue;
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3]! < 64) continue;
      samples.push(W709[0] * png.data[offset]! / 255 + W709[1] * png.data[offset + 1]! / 255 + W709[2] * png.data[offset + 2]! / 255);
    }
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length * 0.95)] ?? 0;
}

export function crop(png: PNG, cx: number, cy: number, halfW: number, halfH: number): Buffer {
  const x0 = Math.max(0, Math.round(cx - halfW)), y0 = Math.max(0, Math.round(cy - halfH));
  const x1 = Math.min(png.width, Math.round(cx + halfW)), y1 = Math.min(png.height, Math.round(cy + halfH));
  const out = new PNG({ width: Math.max(1, x1 - x0), height: Math.max(1, y1 - y0) });
  for (let y = y0; y < y1; y += 1) png.data.copy(out.data, ((y - y0) * out.width) * 4, (y * png.width + x0) * 4, (y * png.width + x1) * 4);
  return PNG.sync.write(out);
}
