import type { GameEvent } from '../core/EventBus';

export const TELEMETRY_OPT_IN_STORAGE_KEY = 'gr.telemetry.optIn.v1';
export const TELEMETRY_NONCE_STORAGE_KEY = 'gr.telemetry.nonce.v1';
export const TELEMETRY_DEV_SEND_STORAGE_KEY = 'gr.telemetry.devSend.v1';
export const TELEMETRY_TIERS = ['FULL', 'BALANCED', 'LITE'] as const;
export const DEVICE_CLASSES = ['desktop', 'mobile', 'tablet'] as const;

export type RunTelemetryTier = (typeof TELEMETRY_TIERS)[number];
export type RunTelemetryDeviceClass = (typeof DEVICE_CLASSES)[number];
export type RunEndedEvent = Extract<GameEvent, { type: 'run_ended' }>;
export type RunSecuredEvent = Extract<GameEvent, { type: 'run_secured' }>;
export type RunTelemetryEvent = RunEndedEvent | RunSecuredEvent;

export type RunTelemetryPayload = {
  contract: string;
  stage: 'secure' | 'end';
  waves: number;
  secureWave: number;
  deepestWave: number;
  duration: number;
  upgradesTaken: number;
  tier: RunTelemetryTier;
  frameP95: number;
  deviceClass: RunTelemetryDeviceClass;
  buildHash: string;
  nonce: string;
};

type StoredNonce = {
  nonce: string;
  monthStamp: string;
};

let telemetryOptInFallback: boolean | null = null;

export function readTelemetryOptIn(): boolean {
  if (telemetryOptInFallback !== null) return telemetryOptInFallback;
  try {
    return globalThis.localStorage?.getItem(TELEMETRY_OPT_IN_STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function saveTelemetryOptIn(enabled: boolean): boolean {
  telemetryOptInFallback = enabled;
  try {
    globalThis.localStorage?.setItem(TELEMETRY_OPT_IN_STORAGE_KEY, enabled ? '1' : '0');
  } catch {}
  return enabled;
}

export function renderTelemetrySettingsControl(id: string): string {
  return `
    <label>
      <span>Share anonymous run stats</span>
      <input data-testid="${id}" type="checkbox" ${readTelemetryOptIn() ? 'checked' : ''} />
    </label>
    <p class="gr-start-menu__settings-note" data-testid="${id}-disclosure">Anonymous gameplay statistics, no personal data, opt-out in Settings.</p>
  `;
}

export function bindTelemetrySettingsControl(root: ParentNode, id: string): () => void {
  const input = root.querySelector<HTMLInputElement>(`[data-testid="${id}"]`);
  if (!input) return () => undefined;

  const sync = () => {
    input.checked = readTelemetryOptIn();
  };
  const onChange = () => saveTelemetryOptIn(input.checked);
  input.addEventListener('change', onChange);
  sync();

  return () => input.removeEventListener('change', onChange);
}

export function buildRunTelemetryPayload(
  event: RunTelemetryEvent,
  context: { contract: string; upgradeStacks: Record<string, number> },
  stage: RunTelemetryPayload['stage'] = 'end',
): RunTelemetryPayload {
  const diagnostics = globalThis.window?.__THREE_GAME_DIAGNOSTICS__;
  return {
    contract: context.contract,
    stage,
    waves: nonNegativeInt(event.summary.wavesSurvived),
    secureWave: nonNegativeInt(event.summary.secureWaveReached),
    deepestWave: nonNegativeInt(event.summary.deepestWave ?? event.summary.wavesSurvived),
    duration: nonNegativeInt(event.at * 1000),
    upgradesTaken: sumStacks(context.upgradeStacks),
    tier: normalizeTier(diagnostics?.performance.tier),
    frameP95: nonNegativeNumber(diagnostics?.frameMs.p95),
    deviceClass: deviceClass(),
    buildHash: __APP_BUILD__,
    nonce: readMonthlyNonce(),
  };
}

export function deviceClass(): RunTelemetryDeviceClass {
  const ua = userAgent();
  const coarse = coarsePointer();
  const touchPoints = maxTouchPoints();
  const iPadLike = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && touchPoints > 1);
  if (iPadLike) return 'tablet';
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  if (coarse && Math.min(globalThis.screen?.width ?? 9999, globalThis.screen?.height ?? 9999) <= 820) return 'mobile';
  return 'desktop';
}

function readMonthlyNonce(): string {
  const monthStamp = new Date().toISOString().slice(0, 7);
  try {
    const saved = parseStoredNonce(globalThis.localStorage?.getItem(TELEMETRY_NONCE_STORAGE_KEY) ?? null);
    if (saved?.monthStamp === monthStamp) return saved.nonce;
    const next = { nonce: randomHex(16), monthStamp };
    globalThis.localStorage?.setItem(TELEMETRY_NONCE_STORAGE_KEY, JSON.stringify(next));
    return next.nonce;
  } catch {
    return randomHex(16);
  }
}

function parseStoredNonce(raw: string | null): StoredNonce | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredNonce>;
    return typeof value.nonce === 'string' && /^[a-f0-9]{32}$/.test(value.nonce) && typeof value.monthStamp === 'string'
      ? { nonce: value.nonce, monthStamp: value.monthStamp }
      : null;
  } catch {
    return null;
  }
}

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes);
  globalThis.crypto?.getRandomValues(values);
  return [...values].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function normalizeTier(value: unknown): RunTelemetryTier {
  if (value === 'full') return 'FULL';
  if (value === 'lite') return 'LITE';
  return 'BALANCED';
}

function sumStacks(stacks: Record<string, number>): number {
  let total = 0;
  for (const value of Object.values(stacks)) total += nonNegativeInt(value);
  return total;
}

function nonNegativeInt(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function nonNegativeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 10) / 10 : 0;
}

function userAgent(): string {
  try {
    return globalThis.navigator?.userAgent ?? '';
  } catch {
    return '';
  }
}

function maxTouchPoints(): number {
  try {
    return globalThis.navigator?.maxTouchPoints ?? 0;
  } catch {
    return 0;
  }
}

function coarsePointer(): boolean {
  try {
    return globalThis.matchMedia?.('(pointer: coarse)').matches === true;
  } catch {
    return false;
  }
}
