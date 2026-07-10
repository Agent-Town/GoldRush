import { Balance } from './Balance';

export const PERFORMANCE_TIER_STORAGE_KEY = 'gr.performance.tier.v1';

export const PERFORMANCE_TIERS = ['full', 'balanced', 'lite'] as const;
export type PerformanceTier = (typeof PERFORMANCE_TIERS)[number];
export type PerformanceTierOverride = PerformanceTier | 'auto';

export type PerformanceTierConfig = {
  maxDpr: number;
  shadowsQuality: 'soft' | 'blob';
  shadowMapSize: number;
  fogNear: number;
  fogFar: number;
  postEnabled: boolean;
  postPaperGrainOpacity: number;
  detailDensity: number;
  detailMobileDensity: number;
  terrainSegments: number;
  terrainMobileSegments: number;
  vistaSegments: number;
  vistaMobileSegments: number;
  waterQuality: number;
  waterMobileQuality: number;
  terrainMesh: boolean;
  terrainSplat: boolean;
  terrainMeshVertexStep: number;
  floatTextPool: number;
  combatVfxPuffs: number;
  combatVfxTicks: number;
  combatVfxRings: number;
  enemyBarCap: number;
};

export type PerformanceTierDiagnostics = {
  tier: PerformanceTier;
  override: PerformanceTierOverride;
  source: 'auto' | 'override';
  reason: string;
  gpuRenderer: string;
  deviceMemory: number | null;
  userAgent: string;
  config: PerformanceTierConfig;
};

export const PERFORMANCE_TIER_CONFIGS: Record<PerformanceTier, PerformanceTierConfig> = {
  full: {
    maxDpr: 2,
    shadowsQuality: 'soft',
    shadowMapSize: 1536,
    fogNear: 42,
    fogFar: 88,
    postEnabled: true,
    postPaperGrainOpacity: 0.008,
    detailDensity: 1,
    detailMobileDensity: 0.42,
    terrainSegments: 64,
    terrainMobileSegments: 40,
    vistaSegments: 12,
    vistaMobileSegments: 7,
    waterQuality: 1,
    waterMobileQuality: 0.55,
    terrainMesh: false,
    terrainSplat: false,
    terrainMeshVertexStep: 1,
    floatTextPool: 12,
    combatVfxPuffs: 32,
    combatVfxTicks: 48,
    combatVfxRings: 8,
    enemyBarCap: 60,
  },
  balanced: {
    maxDpr: 1.5,
    shadowsQuality: 'soft',
    shadowMapSize: 1024,
    fogNear: 46,
    fogFar: 82,
    postEnabled: true,
    postPaperGrainOpacity: 0.004,
    detailDensity: 0.62,
    detailMobileDensity: 0.28,
    terrainSegments: 52,
    terrainMobileSegments: 32,
    vistaSegments: 10,
    vistaMobileSegments: 6,
    waterQuality: 0.72,
    waterMobileQuality: 0.45,
    terrainMesh: false,
    terrainSplat: false,
    terrainMeshVertexStep: 1.5,
    floatTextPool: 10,
    combatVfxPuffs: 24,
    combatVfxTicks: 32,
    combatVfxRings: 6,
    enemyBarCap: 36,
  },
  lite: {
    maxDpr: 1,
    shadowsQuality: 'blob',
    shadowMapSize: 0,
    fogNear: 50,
    fogFar: 76,
    postEnabled: false,
    postPaperGrainOpacity: 0,
    detailDensity: 0.18,
    detailMobileDensity: 0,
    terrainSegments: 40,
    terrainMobileSegments: 24,
    vistaSegments: 7,
    vistaMobileSegments: 4,
    waterQuality: 0.48,
    waterMobileQuality: 0.3,
    terrainMesh: false,
    terrainSplat: false,
    terrainMeshVertexStep: 2,
    floatTextPool: 8,
    combatVfxPuffs: 16,
    combatVfxTicks: 20,
    combatVfxRings: 4,
    enemyBarCap: 16,
  },
};

const listeners = new Set<() => void>();
let lastDiagnostics: PerformanceTierDiagnostics | null = null;

export function applyStoredPerformanceTier(): PerformanceTierDiagnostics {
  const override = readPerformanceTierOverride();
  const detected = detectPerformanceTier();
  const tier = override === 'auto' ? detected.tier : override;
  const diagnostics: PerformanceTierDiagnostics = {
    tier,
    override,
    source: override === 'auto' ? 'auto' : 'override',
    reason: override === 'auto' ? detected.reason : 'settings override',
    gpuRenderer: detected.gpuRenderer,
    deviceMemory: detected.deviceMemory,
    userAgent: detected.userAgent,
    config: PERFORMANCE_TIER_CONFIGS[tier],
  };
  applyPerformanceTierConfig(diagnostics.config);
  lastDiagnostics = diagnostics;
  console.info('[gold-rush] performance tier', diagnostics);
  return diagnostics;
}

export function performanceTierDiagnostics(): PerformanceTierDiagnostics {
  return lastDiagnostics ?? applyStoredPerformanceTier();
}

export function readPerformanceTierOverride(): PerformanceTierOverride {
  const params = new URLSearchParams(getSearch());
  const raw = params.get('tier') ?? params.get('performance') ?? params.get('quality');
  const fromSearch = normalizePerformanceTierOverride(raw);
  if (fromSearch) {
    savePerformanceTierOverride(fromSearch);
    return fromSearch;
  }
  return normalizePerformanceTierOverride(readStoredOverride()) ?? 'auto';
}

export function savePerformanceTierOverride(value: PerformanceTierOverride): PerformanceTierOverride {
  if (readStoredOverride() === value) return value;
  try {
    globalThis.localStorage?.setItem(PERFORMANCE_TIER_STORAGE_KEY, value);
  } catch {}
  notify();
  return value;
}

export function renderPerformanceTierControl(id: string): string {
  const value = readPerformanceTierOverride();
  return `
    <label>
      <span>Performance</span>
      <select data-testid="${id}" aria-label="Performance">
        ${renderOption('auto', 'Auto', value)}
        ${renderOption('full', 'Full', value)}
        ${renderOption('balanced', 'Balanced', value)}
        ${renderOption('lite', 'Lite', value)}
      </select>
    </label>
  `;
}

export function bindPerformanceTierControl(root: ParentNode, id: string): () => void {
  const select = root.querySelector<HTMLSelectElement>(`[data-testid="${id}"]`);
  if (!select) return () => undefined;

  const sync = () => {
    select.value = readPerformanceTierOverride();
  };
  const onChange = () => savePerformanceTierOverride(normalizePerformanceTierOverride(select.value) ?? 'auto');
  select.addEventListener('change', onChange);
  listeners.add(sync);
  sync();

  return () => {
    select.removeEventListener('change', onChange);
    listeners.delete(sync);
  };
}

function detectPerformanceTier(): Omit<PerformanceTierDiagnostics, 'override' | 'source' | 'config'> {
  const userAgent = getUserAgent();
  const deviceMemory = getDeviceMemory();
  const gpuRenderer = readGpuRenderer();
  const iosFamily = /iPad|iPhone|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && getMaxTouchPoints() > 1);

  if (iosFamily) return { tier: 'lite', reason: 'iPad/iOS user agent', gpuRenderer, deviceMemory, userAgent };
  if (deviceMemory !== null && deviceMemory <= 3) return { tier: 'lite', reason: `deviceMemory ${deviceMemory}GB`, gpuRenderer, deviceMemory, userAgent };
  if (/apple a\d|adreno [0-5]\d{2}|mali-|powervr/i.test(gpuRenderer)) {
    return { tier: 'lite', reason: `mobile-class GPU: ${gpuRenderer}`, gpuRenderer, deviceMemory, userAgent };
  }
  if (deviceMemory !== null && deviceMemory <= 6) return { tier: 'balanced', reason: `deviceMemory ${deviceMemory}GB`, gpuRenderer, deviceMemory, userAgent };
  if (/swiftshader|llvmpipe|software|intel\(r\).*uhd|intel\(r\).*hd/i.test(gpuRenderer)) {
    return { tier: 'balanced', reason: `modest GPU: ${gpuRenderer}`, gpuRenderer, deviceMemory, userAgent };
  }
  return { tier: 'full', reason: 'desktop-class defaults', gpuRenderer, deviceMemory, userAgent };
}

function applyPerformanceTierConfig(config: PerformanceTierConfig): void {
  const render = Balance.render as {
    maxDpr: number;
    floatTextPool: number;
    combatVfxPuffs: number;
    combatVfxTicks: number;
    combatVfxRings: number;
    enemyBarCap: number;
  };
  render.maxDpr = config.maxDpr;
  render.floatTextPool = config.floatTextPool;
  render.combatVfxPuffs = config.combatVfxPuffs;
  render.combatVfxTicks = config.combatVfxTicks;
  render.combatVfxRings = config.combatVfxRings;
  render.enemyBarCap = config.enemyBarCap;

  const world = Balance.world as {
    shadowsQuality: 'soft' | 'blob';
    shadowMapSize: number;
    fogNear: number;
    fogFar: number;
    postEnabled: boolean;
    postPaperGrainOpacity: number;
    detailDensity: number;
    detailMobileDensity: number;
    terrainSegments: number;
    terrainMobileSegments: number;
    vistaSegments: number;
    vistaMobileSegments: number;
    waterQuality: number;
    waterMobileQuality: number;
    terrainMesh: boolean;
    terrainSplat: boolean;
    terrainMeshVertexStep: number;
  };
  world.shadowsQuality = config.shadowsQuality;
  world.shadowMapSize = config.shadowMapSize;
  world.fogNear = config.fogNear;
  world.fogFar = config.fogFar;
  world.postEnabled = config.postEnabled;
  world.postPaperGrainOpacity = config.postPaperGrainOpacity;
  world.detailDensity = config.detailDensity;
  world.detailMobileDensity = config.detailMobileDensity;
  world.terrainSegments = config.terrainSegments;
  world.terrainMobileSegments = config.terrainMobileSegments;
  world.vistaSegments = config.vistaSegments;
  world.vistaMobileSegments = config.vistaMobileSegments;
  world.waterQuality = config.waterQuality;
  world.waterMobileQuality = config.waterMobileQuality;
  world.terrainMesh = config.terrainMesh;
  world.terrainSplat = config.terrainSplat;
  world.terrainMeshVertexStep = config.terrainMeshVertexStep;
}

function normalizePerformanceTierOverride(value: unknown): PerformanceTierOverride | null {
  if (value === 'auto') return 'auto';
  if (value === 'full') return 'full';
  if (value === 'balanced') return 'balanced';
  if (value === 'lite') return 'lite';
  return null;
}

function readStoredOverride(): string | null {
  try {
    return globalThis.localStorage?.getItem(PERFORMANCE_TIER_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function renderOption(value: PerformanceTierOverride, label: string, selected: PerformanceTierOverride): string {
  return `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function getSearch(): string {
  try {
    return globalThis.location?.search ?? '';
  } catch {
    return '';
  }
}

function getUserAgent(): string {
  try {
    return globalThis.navigator?.userAgent ?? '';
  } catch {
    return '';
  }
}

function getDeviceMemory(): number | null {
  try {
    const value = (globalThis.navigator as (Navigator & { deviceMemory?: number }) | undefined)?.deviceMemory;
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function getMaxTouchPoints(): number {
  try {
    return globalThis.navigator?.maxTouchPoints ?? 0;
  } catch {
    return 0;
  }
}

function readGpuRenderer(): string {
  try {
    const canvas = globalThis.document?.createElement('canvas');
    const gl = (canvas?.getContext('webgl') ?? canvas?.getContext('experimental-webgl')) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (!gl) return 'unknown';
    const debug = gl.getExtension('WEBGL_debug_renderer_info') as { UNMASKED_RENDERER_WEBGL: number } | null;
    const renderer = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return typeof renderer === 'string' ? renderer : 'unknown';
  } catch {
    return 'unknown';
  }
}
