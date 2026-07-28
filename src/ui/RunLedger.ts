import type { RunEndReason } from '../core/EventBus';
import { META_TRACKS, type MetaTrack } from '../game/MetaProgress';
import { RUN_HISTORY_KEY } from '../game/ProfileStorage';

export const RUN_HISTORY_LIMIT = 50;

export type RunHistoryEntry = {
  at: number;
  contractId: string;
  contract: string;
  outcome: RunEndReason;
  waves: number;
  gold: number;
  goldByProspector: number;
  metaEarned?: Partial<Record<MetaTrack, number>>;
  duration: number;
  [key: string]: unknown;
};

type RunHistoryStorage = Pick<Storage, 'getItem' | 'setItem'>;

let currentRoot: HTMLElement | null = null;

export function readRunHistory(storage: Pick<Storage, 'getItem'>): RunHistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(RUN_HISTORY_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.map(normalizeEntry).filter((entry): entry is RunHistoryEntry => entry !== null).slice(0, RUN_HISTORY_LIMIT)
      : [];
  } catch {
    return [];
  }
}

export function appendRunHistory(storage: RunHistoryStorage, entry: RunHistoryEntry): void {
  const next = normalizeEntry(entry);
  if (!next) return;
  try {
    storage.setItem(RUN_HISTORY_KEY, JSON.stringify([next, ...readRunHistory(storage)].slice(0, RUN_HISTORY_LIMIT)));
  } catch {
    // A finished run must not fail because persistence is unavailable.
  }
}

export function openRunLedger(storage: Pick<Storage, 'getItem'>): void {
  currentRoot?.remove();
  const restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const root = document.createElement('section');
  currentRoot = root;
  root.className = 'death-overlay death-overlay--visible gr-profile-title';
  root.dataset.testid = 'run-ledger';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Run Ledger');
  root.innerHTML = renderRunLedger(readRunHistory(storage));

  const close = () => {
    if (currentRoot !== root) return;
    currentRoot = null;
    root.remove();
    if (restoreFocus?.isConnected) restoreFocus.focus({ preventScroll: true });
  };
  root.querySelector('[data-run-ledger-close]')?.addEventListener('click', close);
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      root.querySelector<HTMLButtonElement>('[data-run-ledger-close]')?.focus({ preventScroll: true });
    }
  });
  (document.querySelector<HTMLElement>('#app') ?? document.body).append(root);
  root.querySelector<HTMLButtonElement>('[data-run-ledger-close]')?.focus({ preventScroll: true });
}

function normalizeEntry(value: unknown): RunHistoryEntry | null {
  if (!isRecord(value)) return null;
  const outcome = value.outcome;
  if (outcome !== 'death' && outcome !== 'secured' && outcome !== 'rush') return null;
  const at = finiteNonnegative(value.at);
  const waves = finiteNonnegative(value.waves);
  const gold = finiteNonnegative(value.gold);
  const duration = finiteNonnegative(value.duration);
  const contractId = cleanText(value.contractId);
  const contract = cleanText(value.contract);
  if (at === null || at > 8.64e15 || waves === null || gold === null || duration === null || !contractId || !contract) return null;
  const metaSource = value.metaEarned;
  const metaEarned = Object.fromEntries(
    isRecord(metaSource)
      ? META_TRACKS.flatMap((track) => {
          const amount = finiteNonnegative(metaSource[track]);
          return amount ? [[track, amount]] : [];
        })
      : [],
  ) as Partial<Record<MetaTrack, number>>;
  const entry: RunHistoryEntry = {
    ...value,
    at,
    contractId,
    contract,
    outcome,
    waves,
    gold,
    goldByProspector: Math.min(gold, finiteNonnegative(value.goldByProspector) ?? 0),
    duration,
  };
  if (Object.keys(metaEarned).length) entry.metaEarned = metaEarned;
  else delete entry.metaEarned;
  return entry;
}

function renderRunLedger(entries: readonly RunHistoryEntry[]): string {
  return `
    <div class="death-overlay__panel" style="width:min(1080px,100%)">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <p class="death-overlay__eyebrow">Claim Office Records</p>
          <h2>Run Ledger</h2>
        </div>
        <button class="death-overlay__button" style="width:auto;padding:8px 20px" type="button" data-run-ledger-close data-testid="run-ledger-close" aria-label="Close Run Ledger">Back</button>
      </header>
      <div style="margin-top:18px">
        ${
          entries.length
            ? `<ol data-testid="run-ledger-entries" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:12px;margin:0;padding:0;list-style:none">
                ${entries.map(renderEntry).join('')}
              </ol>`
            : '<p class="death-overlay__flavor" data-testid="run-ledger-empty">No claims stamped yet. The first trail is waiting.</p>'
        }
      </div>
    </div>
  `;
}

function renderEntry(entry: RunHistoryEntry): string {
  return `
    <li data-testid="run-ledger-row" data-run-outcome="${entry.outcome}" style="padding:12px;border:1px solid rgba(46,27,14,.28);border-radius:8px;background:rgba(255,248,232,.54)">
      <p class="death-overlay__eyebrow" data-testid="run-ledger-date">${escapeHtml(formatDate(entry.at))}</p>
      <h4 data-testid="run-ledger-contract">${escapeHtml(entry.contract)}</h4>
      <dl class="death-overlay__ledger" style="margin:0">
        <div><dt>Outcome</dt><dd data-testid="run-ledger-outcome">${outcomeLabel(entry.outcome)}</dd></div>
        <div><dt>Waves</dt><dd data-testid="run-ledger-waves">${Math.floor(entry.waves)}</dd></div>
        <div><dt>Gold</dt><dd data-testid="run-ledger-gold-split">you ${Math.floor(entry.gold - entry.goldByProspector)} / the Prospector ${Math.floor(entry.goldByProspector)}</dd></div>
        ${entry.metaEarned ? `<div><dt>Meta earned</dt><dd data-testid="run-ledger-meta">${META_TRACKS.filter((track) => entry.metaEarned?.[track]).map((track) => `${track[0].toUpperCase()}${track.slice(1)} +${entry.metaEarned![track]}`).join(' / ')}</dd></div>` : ''}
        <div><dt>Duration</dt><dd data-testid="run-ledger-duration">${formatDuration(entry.duration)}</dd></div>
      </dl>
    </li>
  `;
}

function outcomeLabel(outcome: RunEndReason): string {
  if (outcome === 'secured') return 'Claim secured';
  if (outcome === 'rush') return 'Rush ended';
  return 'Overrun';
}

function formatDate(at: number): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(at));
}

function formatDuration(seconds: number): string {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 120) : '';
}

function finiteNonnegative(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
