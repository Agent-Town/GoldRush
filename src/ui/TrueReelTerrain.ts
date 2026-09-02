import { loadContract, type ContractManifest, type ContractWaterMaskRegion } from '../meta/ContractFamilies';

const WIDTH = 80;
const HEIGHT = 56;
const PAD_X = 3;
const PAD_Y = 2;
const COLS = 16;
const ROWS = 12;
const DEFAULT_SEAM_ANCHORS = [
  { x: -22, z: -6.8 }, { x: -9, z: 6.7 }, { x: -1.5, z: -6.4 },
  { x: 7.5, z: 6.5 }, { x: 18, z: -7 }, { x: 25, z: 6.9 },
];
const cache = new Map<string, TrueReelTerrain>();

export type TrueReelTerrain = {
  svg: string;
  project: (x: number, z: number) => { x: number; y: number };
  spriteScale: number;
  phase: string;
};

/** Read-only projection of the same manifest fields consumed by the run. */
export function trueReelTerrain(contractId: string, seed: string, wave: number): TrueReelTerrain {
  const contract = loadContract(contractId);
  const phase = lightPhase(contract, wave);
  const key = `${contractId}\0${seed}\0${phase.key}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const width = contract.tileParams.dimensions?.width ?? contract.tileParams.size ?? 64;
  const height = contract.tileParams.dimensions?.height ?? contract.tileParams.size ?? 64;
  const innerWidth = WIDTH - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_Y * 2;
  const project = (x: number, z: number) => ({
    x: PAD_X + (x + width / 2) / width * innerWidth,
    y: PAD_Y + (height / 2 - z) / height * innerHeight,
  });
  const seedNumber = hash(seed);
  const tint = contract.tileParams.palette?.tint ?? [1, 1, 1];
  const heights: number[] = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLS; column += 1) {
      const x = (column + .5) / COLS * width - width / 2;
      const z = height / 2 - (row + .5) / ROWS * height;
      heights.push(terrainHeight(contract, x, z));
    }
  }

  const ground = `<rect x="${PAD_X}" y="${PAD_Y}" width="${innerWidth}" height="${innerHeight}" fill="${groundColor(tint, 3 + (noise(seedNumber, 0, 0) - .5), phase.darkness)}" data-terrain-shade="seeded" />${heightfieldLayer(contract, project, width, height)}`;
  const water = waterLayer(contract, project, width, height);
  const buildZones = (contract.tileParams.buildZones ?? []).map((zone) => {
    const start = project(zone.minX, zone.maxZ);
    const end = project(zone.maxX, zone.minZ);
    return `<rect x="${n(start.x)}" y="${n(start.y)}" width="${n(end.x - start.x)}" height="${n(end.y - start.y)}" fill="${zone.bank === 'north' ? '#d6ae58' : '#a76a3e'}" fill-opacity=".16" stroke="#e4c470" stroke-width=".24" stroke-dasharray="1 .5" data-terrain-feature="build-pad" />`;
  }).join('');
  const rails = (contract.tileParams.rails ?? []).map((rail) => `<polyline points="${rail.points.map((point) => pointText(project(point.x, point.z))).join(' ')}" fill="none" stroke="#39291f" stroke-width=".45" stroke-dasharray="1.6 .55" opacity=".9" data-terrain-feature="rail" />`).join('');
  const darkness = phase.darkness > 0
    ? `<rect x="${PAD_X}" y="${PAD_Y}" width="${innerWidth}" height="${innerHeight}" fill="#060914" opacity="${n(phase.darkness * .66)}" pointer-events="none" data-terrain-feature="night" />`
    : '';
  const labelWidth = Math.min(28, contract.name.length * .72 + 3);
  const label = `<g data-terrain-feature="identity"><rect x="4" y="3" width="${labelWidth}" height="3.2" rx=".5" fill="#2e1b0e" opacity=".82"/><text x="5.2" y="5.25" fill="#fff8e8" font-size="1.55" font-family="Georgia,serif">${escapeHtml(contract.name)}</text></g>`;

  const result = {
    project,
    spriteScale: Math.min(innerWidth / width, innerHeight / height),
    phase: phase.key,
    svg: `<g data-replay-terrain="${escapeHtml(contract.id)}" data-seed="${escapeHtml(seed)}" data-light-phase="${escapeHtml(phase.key)}">${ground}${contourLines(heights, project, width, height)}${water}${buildZones}${rails}${cliffLayer(contract, project)}${anchorLayer(contract, project)}${spawnEdgeLayer(contract, width, height, project)}${darkness}${lanternLayer(contract, project, phase.darkness)}${label}</g>`,
  };
  cache.set(key, result);
  return result;
}

function terrainHeight(contract: ContractManifest, x: number, z: number): number {
  const analytic = contract.tileParams.elevation?.analytic;
  let height = analytic?.hillMine === 1 ? hillMineHeight(x, z, analytic) : analyticHeight(x, z, analytic);
  const field = contract.tileParams.heightfield;
  if (field?.springBasin) {
    const basin = field.springBasin;
    height -= radial(x, z, basin.x, basin.z, basin.radius, basin.radius * .78) * basin.depth;
  }
  for (const wash of field?.washChannels ?? []) {
    const dx = x - wash.x;
    const dz = z - wash.z;
    const along = dx * Math.cos(wash.angle) + dz * Math.sin(wash.angle);
    const across = -dx * Math.sin(wash.angle) + dz * Math.cos(wash.angle);
    height -= (1 - smoothstep(wash.length * .42, wash.length * .5, Math.abs(along)))
      * (1 - smoothstep(wash.width * .32, wash.width * .5, Math.abs(across))) * wash.depth;
  }
  if (field?.bankRelief) {
    const water = contract.tileParams.water;
    const bankDistance = Math.max(0, Math.abs(z - (water?.centerZ ?? 0)) - (water?.halfWidth ?? 5));
    height += smoothstep(.25, 2.4, bankDistance)
      * (1 - smoothstep(3.2, field.bankRelief.width, bankDistance)) * field.bankRelief.amount;
  }
  return height + authoredHeight(contract, x, z);
}

// Byte-for-byte formula shape used by TileHeight's authoritative Hill Mine analytic terrain.
function hillMineHeight(x: number, z: number, analytic: Record<string, number>): number {
  const creek = analytic.creekHeight ?? -.5;
  const rail = analytic.railHeight ?? 0;
  const t1 = analytic.t1Height ?? 1.5;
  const t2 = analytic.t2Height ?? 3;
  const t3 = analytic.t3Height ?? 4.5;
  let height = rail;
  height += (creek - rail) * (1 - smoothstep(analytic.creekBlendStart ?? -12, analytic.creekBlendEnd ?? -5, z));
  height += (t1 - rail) * smoothstep(analytic.t1RampStart ?? 5, analytic.t1RampEnd ?? 14, z);
  height += (t2 - t1) * smoothstep(analytic.t2RampStart ?? 18, analytic.t2RampEnd ?? 26, z);
  height += (t3 - t2) * smoothstep(analytic.t3RampStart ?? 32, analytic.t3RampEnd ?? 40, z);
  const feather = Math.max(.001, analytic.cliffFeather ?? 1);
  height += (analytic.cliffAmp ?? 0)
    * smoothstep((analytic.cliffMinX ?? -16) - feather, analytic.cliffMinX ?? -16, x)
    * (1 - smoothstep(analytic.cliffMaxX ?? 16, (analytic.cliffMaxX ?? 16) + feather, x))
    * smoothstep((analytic.cliffMinZ ?? 18) - feather, analytic.cliffMinZ ?? 18, z)
    * (1 - smoothstep(analytic.cliffMaxZ ?? 23, (analytic.cliffMaxZ ?? 23) + feather, z));
  const radius = Math.max(.001, analytic.mineMouthRadius ?? 1);
  const mouthX = x - (analytic.mineMouthX ?? 0);
  const mouthZ = z - (analytic.mineMouthZ ?? 40);
  return height + (analytic.mineMouthCrown ?? 0) * Math.exp(-(mouthX * mouthX + mouthZ * mouthZ) / (2 * radius * radius));
}

function analyticHeight(x: number, z: number, analytic?: Record<string, number>): number {
  if (!analytic) return 0;
  const bowlRadius = Math.max(.001, analytic.bowlRadius ?? 1);
  const bowlX = x - (analytic.bowlCenterX ?? 0);
  const bowlZ = z - (analytic.bowlCenterZ ?? 0);
  const bowl = -(analytic.bowlDepth ?? 0) * Math.exp(-(bowlX * bowlX + bowlZ * bowlZ) / (2 * bowlRadius * bowlRadius));
  const ridgeX = x - (analytic.ridgeX ?? 0);
  const ridgeZ = z - (analytic.ridgeZ ?? 0);
  return bowl + (analytic.ridgeAmp ?? 0)
    * Math.exp(-(ridgeX * ridgeX) / (2 * Math.max(.001, analytic.ridgeWidth ?? 1) ** 2))
    * Math.exp(-(ridgeZ * ridgeZ) / (2 * Math.max(.001, analytic.ridgeLength ?? 1) ** 2));
}

function authoredHeight(contract: ContractManifest, x: number, z: number): number {
  const layer = contract.tileParams.authoredTerrain;
  if (!layer) return 0;
  const column = Math.round((x - layer.originX) / layer.cellSize);
  const row = Math.round((z - layer.originZ) / layer.cellSize);
  return layer.heightDeltas[row * layer.columns + column] ?? 0;
}

function heightfieldLayer(contract: ContractManifest, project: TrueReelTerrain['project'], width: number, height: number): string {
  const field = contract.tileParams.heightfield;
  const analytic = contract.tileParams.elevation?.analytic;
  let svg = '';
  if (analytic?.hillMine === 1) {
    const bands = [
      [analytic.t1RampStart ?? 5, '#9d7b4d', .34],
      [analytic.t2RampStart ?? 18, '#b18d58', .42],
      [analytic.t3RampStart ?? 32, '#c4a069', .5],
    ] as const;
    for (const [z, color, opacity] of bands) {
      const start = project(-width / 2, height / 2);
      const end = project(width / 2, z);
      svg += rect(start, end, color, String(opacity), 'terrace');
    }
  }
  if (field?.springBasin) {
    const basin = field.springBasin;
    const at = project(basin.x, basin.z);
    svg += `<ellipse cx="${n(at.x)}" cy="${n(at.y)}" rx="${n(basin.radius / width * 74)}" ry="${n(basin.radius * .78 / height * 52)}" fill="#5e4936" opacity=".48" data-terrain-feature="basin" />`;
  }
  for (const wash of field?.washChannels ?? []) {
    const start = project(wash.x - wash.length / 2, wash.z);
    const end = project(wash.x + wash.length / 2, wash.z);
    const center = project(wash.x, wash.z);
    svg += `<path d="M${pointText(start)}L${pointText(end)}" stroke="#584536" stroke-width="${n(wash.width / height * 52)}" opacity=".5" transform="rotate(${n(-wash.angle * 180 / Math.PI)} ${pointText(center)})" data-terrain-feature="wash" />`;
  }
  if (field?.bankRelief) {
    const half = contract.tileParams.water?.visualHalfWidth ?? contract.tileParams.water?.halfWidth ?? 6.25;
    svg += rect(project(-width / 2, half + field.bankRelief.width), project(width / 2, half), '#d1b06a', '.22', 'bank-relief');
    svg += rect(project(-width / 2, -half), project(width / 2, -half - field.bankRelief.width), '#d1b06a', '.22', 'bank-relief');
  }
  return svg;
}

function waterLayer(contract: ContractManifest, project: TrueReelTerrain['project'], width: number, height: number): string {
  const regions = contract.tileParams.waterMask?.regions ?? [];
  const water = contract.tileParams.water;
  const centerZ = water?.centerZ ?? 0;
  const halfWidth = water?.visualHalfWidth ?? water?.halfWidth ?? 6.25;
  const river = contract.tileParams.river && regions.length === 0
    ? rect(project(-width / 2, centerZ + halfWidth), project(width / 2, centerZ - halfWidth), '#386d74', '.82', 'water')
    : '';
  const masked = regions.map((region) => waterRegion(region, project)).join('');
  const fords = (contract.tileParams.fords ?? (contract.tileParams.ford ? [{ id: 'center-ford', x: 0, halfWidth: 3 }] : [])).map((ford) =>
    rect(project(ford.x - ford.halfWidth, centerZ + halfWidth), project(ford.x + ford.halfWidth, centerZ - halfWidth), '#b9a36c', '.74', 'ford')).join('');
  const gravel = (water?.gravelBars ?? []).map((bar) => {
    const at = project(bar.x, bar.z);
    return `<ellipse cx="${n(at.x)}" cy="${n(at.y)}" rx="${n(bar.length / width * 37)}" ry="${n(bar.width / height * 26)}" fill="#b8a47d" transform="rotate(${n(-bar.rotation * 180 / Math.PI)} ${n(at.x)} ${n(at.y)})" data-terrain-feature="gravel-bar" />`;
  }).join('');
  const ponds = contract.tileParams.waterSources.map((source) => {
    const at = project(source.x, source.z);
    return `<circle cx="${n(at.x)}" cy="${n(at.y)}" r="${n(source.radius / width * 74)}" fill="#386d74" stroke="#78b6b4" stroke-width=".25" data-terrain-feature="water" />`;
  }).join('');
  return `${river}${masked}${fords}${gravel}${ponds}`;
}

function waterRegion(region: ContractWaterMaskRegion, project: TrueReelTerrain['project']): string {
  if (region.kind === 'rect') return rect(project(region.minX, region.maxZ), project(region.maxX, region.minZ), waterColor(region.zone), '.82', 'water');
  return `<polyline points="${region.points.map((point) => pointText(project(point.x, point.z))).join(' ')}" fill="none" stroke="${waterColor(region.zone)}" stroke-width="${n(region.halfWidth * 1.5)}" stroke-linecap="round" stroke-linejoin="round" data-terrain-feature="water" />`;
}

function cliffLayer(contract: ContractManifest, project: TrueReelTerrain['project']): string {
  const a = contract.tileParams.elevation?.analytic;
  if (!a || a.cliffMinX === undefined || a.cliffMaxX === undefined || a.cliffMinZ === undefined || a.cliffMaxZ === undefined) return '';
  const start = project(a.cliffMinX, a.cliffMaxZ);
  const end = project(a.cliffMaxX, a.cliffMinZ);
  return `<rect x="${n(start.x)}" y="${n(start.y)}" width="${n(end.x - start.x)}" height="${n(end.y - start.y)}" fill="url(#reel-cliff-hatch)" stroke="#2e1b0e" stroke-width=".35" data-terrain-feature="impassable-cliff" />`;
}

function anchorLayer(contract: ContractManifest, project: TrueReelTerrain['project']): string {
  const seams = (contract.tileParams.harvestAnchors ?? DEFAULT_SEAM_ANCHORS).map((anchor) => {
    const at = project(anchor.x, anchor.z);
    return `<circle cx="${n(at.x)}" cy="${n(at.y)}" r=".62" fill="none" stroke="#f0bd55" stroke-width=".18" stroke-dasharray=".4 .25" data-terrain-feature="seam-anchor" />`;
  }).join('');
  const stakes = (contract.tileParams.stakeMarkers ?? []).map((stake) => {
    const at = project(stake.x, stake.z);
    return `<path d="M${n(at.x)} ${n(at.y + .8)}V${n(at.y - .7)}l.9 .35-.9 .35" fill="none" stroke="#f5e6c8" stroke-width=".25" data-terrain-feature="stake" />`;
  }).join('');
  return `${seams}${stakes}`;
}

function spawnEdgeLayer(contract: ContractManifest, width: number, height: number, project: TrueReelTerrain['project']): string {
  return contract.tileParams.lanes.spawnEdges.map((edge) => {
    const points = edge === 'north'
      ? [project(-width * .15, height / 2), project(width * .15, height / 2)]
      : edge === 'south'
        ? [project(-width * .15, -height / 2), project(width * .15, -height / 2)]
        : edge === 'east'
          ? [project(width / 2, -height * .15), project(width / 2, height * .15)]
          : [project(-width / 2, -height * .15), project(-width / 2, height * .15)];
    return `<path d="M${n(points[0]!.x)} ${n(points[0]!.y)}L${n(points[1]!.x)} ${n(points[1]!.y)}" stroke="#83ded7" stroke-width=".75" data-terrain-feature="spawn-edge" />`;
  }).join('');
}

function lanternLayer(contract: ContractManifest, project: TrueReelTerrain['project'], darkness: number): string {
  return (contract.tileParams.prePlacedBuildables ?? []).filter(({ id }) => id === 'lantern_post').map((fixture) => {
    const at = project(fixture.x, fixture.z);
    const glow = fixture.wrecked ? '' : `<circle cx="${n(at.x)}" cy="${n(at.y)}" r="3.2" fill="#eeb34f" opacity="${n(darkness * .38)}"/>`;
    return `<g data-terrain-feature="lantern" data-wrecked="${String(Boolean(fixture.wrecked))}">${glow}<circle cx="${n(at.x)}" cy="${n(at.y)}" r=".45" fill="${fixture.wrecked ? '#443d3b' : '#ffe6a3'}" stroke="#7c4a20" stroke-width=".2" /></g>`;
  }).join('');
}

function contourLines(heights: number[], project: TrueReelTerrain['project'], width: number, height: number): string {
  if (Math.max(...heights) - Math.min(...heights) < .35) return '';
  let path = '';
  for (let row = 1; row < ROWS; row += 1) {
    for (let column = 0; column < COLS; column += 1) {
      const north = heights[(row - 1) * COLS + column]!;
      const south = heights[row * COLS + column]!;
      if (Math.floor(north) === Math.floor(south)) continue;
      const z = height / 2 - row / ROWS * height;
      path += `M${pointText(project(column / COLS * width - width / 2, z))}L${pointText(project((column + 1) / COLS * width - width / 2, z))}`;
    }
  }
  return path ? `<path d="${path}" fill="none" stroke="#f1d39a" stroke-width=".18" opacity=".6" data-terrain-feature="contour" />` : '';
}

function lightPhase(contract: ContractManifest, wave: number): { key: string; darkness: number } {
  const ramp = contract.twist.lightRamp;
  const frames = ramp?.keyframes ?? [];
  if (!ramp || frames.length === 0) return { key: 'day:0', darkness: 0 };
  if (wave >= ramp.dawnWave) return { key: 'dawn:0', darkness: 0 };
  const upcoming = frames.findIndex((frame) => frame.wave >= wave);
  if (upcoming < 0) {
    const last = frames.at(-1)!;
    return { key: `${last.phase}:${last.darkness}`, darkness: last.darkness };
  }
  const nextIndex = Math.max(1, upcoming);
  const next = frames[nextIndex]!;
  const previous = frames[nextIndex - 1] ?? frames[0]!;
  const t = clamp((wave - previous.wave) / Math.max(.001, next.wave - previous.wave), 0, 1);
  const darkness = previous.darkness + (next.darkness - previous.darkness) * t;
  return { key: `${wave === next.wave ? next.phase : previous.phase}:${darkness}`, darkness };
}

function groundColor(tint: [number, number, number], shade: number, darkness: number): string {
  const light = .64 + shade * .065;
  const dark = 1 - darkness * .45;
  return `rgb(${Math.round(126 * tint[0] * light * dark)} ${Math.round(101 * tint[1] * light * dark)} ${Math.round(61 * tint[2] * light * dark)})`;
}

function rect(start: { x: number; y: number }, end: { x: number; y: number }, fill: string, opacity: string, feature: string): string {
  return `<rect x="${n(start.x)}" y="${n(start.y)}" width="${n(end.x - start.x)}" height="${n(end.y - start.y)}" fill="${fill}" opacity="${opacity}" data-terrain-feature="${feature}" />`;
}

function waterColor(zone: 'river' | 'ford' | 'shallows'): string { return zone === 'ford' ? '#b9a36c' : zone === 'shallows' ? '#5d9495' : '#386d74'; }
function radial(x: number, z: number, cx: number, cz: number, rx: number, rz: number): number { return 1 - smoothstep(.55, 1, Math.hypot((x - cx) / rx, (z - cz) / rz)); }
function smoothstep(a: number, b: number, value: number): number { const t = clamp((value - a) / (b - a || 1), 0, 1); return t * t * (3 - 2 * t); }
function hash(value: string): number { let result = 2166136261; for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619); return result >>> 0; }
function noise(seed: number, x: number, y: number): number { let value = Math.imul(seed ^ Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263), 1274126177); value ^= value >>> 13; return (value >>> 0) / 4294967295; }
function pointText(point: { x: number; y: number }): string { return `${n(point.x)},${n(point.y)}`; }
function n(value: number): string { return Number(value.toFixed(2)).toString(); }
function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!); }
