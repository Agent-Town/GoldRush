import { getDebugSeed } from '../core/DebugParams';
import { readDifficultyPreset } from '../game/Balance';
import { freshMetaProgress, loadMetaProgress } from '../game/MetaProgress';
import { hasRocketCartCaptured } from '../game/Medals';
import { DEFAULT_CONTRACT_ID } from '../meta/ContractFamilies';
import { browserResearchStorage, loadResearchState } from '../meta/ResearchTree';
import type { LockstepClientOptions, MultiplayerSetup } from './LockstepClient';

export type RideTogetherConfig = Pick<LockstepClientOptions, 'relayBase' | 'code' | 'player'> & {
  phrase: string;
  setup: MultiplayerSetup;
};

const STAGED_RIDE_KEY = 'gr.mp.ride.v1';
const RECONNECT_RIDE_KEY = 'gr.mp.reconnect.v1';
const CODE_WORDS_KEY = 'gr.mp.codeWords.v1';
const RELAY_BASE_KEY = 'gr.mp.relayBase.v1';

const FIRST_WORDS = [
  'COPPER',
  'BRASS',
  'CANYON',
  'RIVER',
  'DUSTY',
  'LANTERN',
  'RAIL',
  'SILVER',
  'PRAIRIE',
  'QUARTZ',
  'STEAM',
  'MESA',
  'GULCH',
  'SPARK',
  'BEACON',
  'TAVERN',
] as const;

const SECOND_WORDS = [
  'MULE',
  'CLAIM',
  'WAGON',
  'PAN',
  'RIDGE',
  'PICK',
  'TRAIL',
  'MILL',
  'LAMP',
  'CART',
  'BRIDGE',
  'HILL',
  'WIRE',
  'DERRICK',
  'BOILER',
  'CAMP',
] as const;

export function relayBaseFromTownSearch(search = window.location.search): string {
  const params = new URLSearchParams(search);
  const debugRelay = params.get('mpRelay') ?? readStorage(RELAY_BASE_KEY);
  return (debugRelay || window.location.origin).replace(/\/$/, '');
}

export async function createRideRoom(
  relayBase: string,
  player: RideTogetherConfig['player'],
  setup = currentMultiplayerSetup(),
): Promise<RideTogetherConfig> {
  const response = await fetch(`${relayBase}/api/multiplayer/create`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ setup }),
  });
  const body = (await response.json().catch(() => ({}))) as { code?: string; error?: string; message?: string };
  if (!response.ok || !body.code) throw new Error(body.message || body.error || 'room_create_failed');
  const code = normalizeRoomCode(body.code);
  if (!code) throw new Error('room_create_failed');
  const phrase = codeToJoinPhrase(code);
  rememberCodeWord(phrase, code);
  const config = { relayBase, code, player, phrase, setup };
  stageRideConfig(config);
  return config;
}

export function stageRideConfig(config: RideTogetherConfig): void {
  try {
    sessionStorage.removeItem(RECONNECT_RIDE_KEY);
    sessionStorage.setItem(STAGED_RIDE_KEY, JSON.stringify(config));
  } catch {
    // Optional storage; dev URL multiplayer still works without this town seam.
  }
}

export function consumeStagedRideConfig(): LockstepClientOptions | null {
  try {
    const raw = sessionStorage.getItem(STAGED_RIDE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STAGED_RIDE_KEY);
    return normalizeStoredRide(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function rememberReconnectRideConfig(config: LockstepClientOptions, reconnectToken: string): void {
  const normalized = normalizeStoredRide({ ...config, reconnectToken });
  if (!normalized?.reconnectToken) return;
  try {
    sessionStorage.setItem(RECONNECT_RIDE_KEY, JSON.stringify(normalized));
  } catch {}
}

export function readReconnectRideConfig(): LockstepClientOptions | null {
  try {
    const raw = sessionStorage.getItem(RECONNECT_RIDE_KEY);
    if (!raw) return null;
    const config = normalizeStoredRide(JSON.parse(raw));
    if (!config?.reconnectToken) sessionStorage.removeItem(RECONNECT_RIDE_KEY);
    return config?.reconnectToken ? config : null;
  } catch {
    return null;
  }
}

export function clearReconnectRideConfig(): void {
  try {
    sessionStorage.removeItem(RECONNECT_RIDE_KEY);
  } catch {}
}

export function resolveJoinPhrase(value: string): string | null {
  const raw = value.trim().toUpperCase();
  const direct = normalizeRoomCode(raw);
  if (direct) return direct;
  const compact = raw.replace(/\s+/g, '-').replace(/[^A-Z0-9_-]/g, '');
  const mapped = readCodeWords()[compact];
  if (mapped) return mapped;
  const suffix = compact.split('-').at(-1) ?? '';
  return codeFromSuffix(suffix);
}

export async function probeRideRoom(
  relayBase: string,
  code: string,
  _player: RideTogetherConfig['player'],
  setup = currentMultiplayerSetup(),
): Promise<boolean> {
  const normalized = normalizeRoomCode(code);
  if (!normalized) return false;
  try {
    const response = await fetch(`${relayBase}/api/multiplayer/inspect?code=${normalized}`);
    const body = (await response.json()) as { setup?: unknown; started?: unknown };
    if (!response.ok || body.started === true) return false;
    const roomSetup = normalizeStagedSetup(body.setup);
    return roomSetup === null || stableStringify(roomSetup) === stableStringify(setup);
  } catch {
    return false;
  }
}

export function currentMultiplayerSetup(contractId = DEFAULT_CONTRACT_ID): MultiplayerSetup {
  const storage = browserResearchStorage();
  const meta = storage ? loadMetaProgress(storage) : freshMetaProgress();
  const research = loadResearchState(storage, storage, { rocketCartCaptured: hasRocketCartCaptured() });
  return {
    contractId,
    seed: getDebugSeed() ?? 'gold-rush',
    difficultyPreset: readDifficultyPreset(),
    meta,
    research,
  };
}

export function codeToJoinPhrase(code: string): string {
  const normalized = normalizeRoomCode(code) ?? code;
  const bytes = hexToBytes(normalized);
  const first = FIRST_WORDS[(bytes[0] ?? 0) % FIRST_WORDS.length];
  const second = SECOND_WORDS[(bytes[1] ?? 0) % SECOND_WORDS.length];
  return `${first}-${second}-${suffixFromCode(normalized)}`;
}

function rememberCodeWord(phrase: string, code: string): void {
  try {
    const words = readCodeWords();
    words[phrase] = code;
    localStorage.setItem(CODE_WORDS_KEY, JSON.stringify(words));
  } catch {}
}

function readCodeWords(): Record<string, string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(CODE_WORDS_KEY) ?? '{}') as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => normalizeRoomCode(entry[1]) !== null));
  } catch {
    return {};
  }
}

function suffixFromCode(code: string): string {
  return BigInt(`0x${code}`).toString(32).toUpperCase().padStart(20, '0');
}

function codeFromSuffix(value: string): string | null {
  if (!/^[0-9A-V]{20}$/.test(value)) return null;
  try {
    let codeValue = 0n;
    for (const char of value) codeValue = codeValue * 32n + BigInt(Number.parseInt(char, 32));
    return normalizeRoomCode(codeValue.toString(16).toUpperCase().padStart(24, '0'));
  } catch {
    return null;
  }
}

function hexToBytes(code: string): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < code.length; index += 2) bytes.push(Number.parseInt(code.slice(index, index + 2), 16));
  return bytes.filter((byte) => Number.isFinite(byte));
}

function normalizeRoomCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.replace(/[^a-f0-9]/gi, '').toUpperCase();
  return /^[A-F0-9]{24}$/.test(code) ? code : null;
}

function normalizeStagedSetup(value: unknown): MultiplayerSetup | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const setup = value as Partial<MultiplayerSetup>;
  if (
    typeof setup.contractId !== 'string' ||
    typeof setup.seed !== 'string' ||
    typeof setup.difficultyPreset !== 'string' ||
    !setup.meta ||
    typeof setup.meta !== 'object' ||
    !setup.research ||
    typeof setup.research !== 'object'
  ) {
    return null;
  }
  return {
    contractId: setup.contractId,
    seed: setup.seed,
    difficultyPreset: setup.difficultyPreset,
    meta: setup.meta,
    research: setup.research,
  };
}

function normalizeStoredRide(value: unknown): LockstepClientOptions | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const parsed = value as Partial<LockstepClientOptions>;
  const code = normalizeRoomCode(parsed.code);
  const relayBase = typeof parsed.relayBase === 'string' ? parsed.relayBase.replace(/\/$/, '') : '';
  const player = parsed.player;
  const setup = normalizeStagedSetup(parsed.setup);
  if (!code || !relayBase || !player || typeof player.name !== 'string' || typeof player.town !== 'string' || !setup) return null;
  const reconnectToken = normalizeReconnectToken(parsed.reconnectToken);
  return {
    relayBase,
    code,
    player: { name: player.name, town: player.town },
    setup,
    ...(reconnectToken ? { reconnectToken } : {}),
  };
}

function normalizeReconnectToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const token = value.toUpperCase();
  return /^[A-F0-9]{32}$/.test(token) ? token : null;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
