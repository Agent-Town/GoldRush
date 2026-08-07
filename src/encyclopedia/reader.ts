import './reader.css';
import { gameApiUrl } from '../app/GameApi';
import type { DifficultyPresetId } from '../game/Balance';
import type { RunTape } from '../game/RunTape';
import { loadScores, type ScoreRecord } from '../game/Scoreboard';
import { activeEpochId, listContracts, listEpochs, loadEpoch } from '../meta/ContractFamilies';
import { loadEraBackdrop } from '../ui/EraBackdrop';
import { installAssayOfficeRecordsLiveRead } from './liveStats';
import {
  LEDGER_CATEGORIES,
  ledgerEntries,
  ledgerEntryById,
  epochLedgerEntryById,
  type LedgerDiscoveryId,
  type LedgerEntry,
  type LedgerEntryId,
  type LedgerEpochId,
} from './registry';
import { backfillReachedWorldOutsideEntries, readLedgerDiscovered } from './state';

export const LEDGER_FACT_LINE_CAP = 4;

type OpenClaimLedgerOptions = {
  entryId?: LedgerEntryId;
  onClose?: () => void;
  /**
   * TAPE-03: the shipped Lantern Show, handed in rather than rebuilt. Only the out-of-game ledger
   * passes it, so a standing's WATCH THIS RUN cannot appear over a live run and tear it down.
   */
  onWatchTape?: (tape: RunTape) => void;
};

type LedgerView = 'ledger' | 'standings' | 'field-book';
type FieldBookView = 'byStack' | 'byParty';
type StandingsDifficulty = DifficultyPresetId | 'all';
type StandingsParty = 'solo' | '2' | '3' | '4';

type CountyStanding = {
  rank: number;
  profileName: string;
  secured: true;
  waves: number;
  timeAlive: number;
  gold: number;
  baseValue: number;
  difficulty: DifficultyPresetId;
  submittedAt?: number;
  defaulted?: true;
  party?: { riderCount: number; riders: string[] };
  reel?: { id: string; simVersion: number };
};

type FieldBookCell = {
  contractId: string;
  score: Omit<CountyStanding, 'rank' | 'profileName' | 'difficulty' | 'submittedAt' | 'defaulted'>;
  difficulty: DifficultyPresetId;
  submittedAt: number;
  tokensIn?: number;
  tokensOut?: number;
  calls?: number;
  harness?: string;
  harnessVersion?: string;
  config?: string;
};

type FieldBookRow = {
  model: string;
  contracts: FieldBookCell[];
};

type FieldBook = {
  contracts: string[];
  rows: FieldBookRow[];
};

type PartyBookShowing = FieldBookCell & {
  profileName: string;
  riders: string[];
  rigs: string[];
};

type PartyBookRow = {
  composition: string;
  riderCount: number;
  contracts: PartyBookShowing[];
};

type PartyBook = {
  contracts: string[];
  rows: PartyBookRow[];
};

const DIFFICULTY_LABELS: Record<DifficultyPresetId, string> = {
  greenhorn: 'Greenhorn',
  trail: 'Trail',
  'vein-hunter': 'Vein-Hunter',
};

const PARTY_LABELS: Record<StandingsParty, string> = {
  solo: 'Solo',
  '2': 'Posse of 2',
  '3': 'Posse of 3',
  '4': 'Posse of 4',
};

// NOT Object.keys(PARTY_LABELS): JS orders integer-like keys first, so '2','3','4' would jump
// ahead of 'solo' and the default board would render as the LAST chip. Measured, not guessed —
// the first screenshot of this row read "Posse of 2 · Posse of 3 · Posse of 4 · Solo".
const PARTY_ORDER: readonly StandingsParty[] = ['solo', '2', '3', '4'];

const FIELD_BOOK_VIEW_LABELS: Record<FieldBookView, string> = {
  byStack: 'By rig',
  byParty: 'By posse',
};

let currentRoot: HTMLElement | null = null;
let currentClose: (() => void) | undefined;
let currentLiveReads: (() => void)[] = [];
let currentRestoreFocus: HTMLElement | null = null;
let currentEntryId: LedgerEntryId | undefined;
let currentEpochId: LedgerEpochId = 'epoch-1-frontier';
let currentView: LedgerView = 'ledger';
let currentStandingsContractId = '';
let currentStandingsDifficulty: StandingsDifficulty = 'all';
let currentStandingsParty: StandingsParty = 'solo';
let currentStandingsRows: CountyStanding[] = [];
let currentFieldBookView: FieldBookView = 'byStack';
let currentWatchTape: ((tape: RunTape) => void) | undefined;

export function openClaimLedger(options: OpenClaimLedgerOptions = {}): void {
  backfillReachedWorldOutsideEntries();
  closeClaimLedger(false);
  currentRestoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const root = document.createElement('section');
  currentRoot = root;
  currentClose = options.onClose;
  currentEntryId = options.entryId;
  currentEpochId = initialEpochId(options.entryId);
  currentView = 'ledger';
  currentStandingsContractId = '';
  currentStandingsDifficulty = 'all';
  currentStandingsParty = 'solo';
  currentStandingsRows = [];
  currentFieldBookView = 'byStack';
  currentWatchTape = options.onWatchTape;
  root.className = 'claim-ledger';
  root.dataset.testid = 'claim-ledger';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Claim Ledger');
  root.addEventListener('click', onLedgerClick);
  root.addEventListener('change', onLedgerChange);
  root.addEventListener('keydown', onLedgerKeyDown);
  (document.querySelector<HTMLElement>('#app') ?? document.body).append(root);
  renderCurrentLedger();
  const focusTarget = root.querySelector<HTMLElement>(options.entryId ? `[data-ledger-entry="${options.entryId}"]` : '[data-ledger-close]');
  focusTarget?.focus({ preventScroll: true });
  if (options.entryId) focusTarget?.scrollIntoView({ block: 'center', inline: 'nearest' });
}

export function closeClaimLedger(notify = true): void {
  const root = currentRoot;
  if (!root) return;
  currentRoot = null;
  const onClose = currentClose;
  const liveReads = currentLiveReads;
  const restoreFocus = currentRestoreFocus;
  currentClose = undefined;
  currentEntryId = undefined;
  currentLiveReads = [];
  currentRestoreFocus = null;
  currentStandingsRows = [];
  currentWatchTape = undefined;
  for (const dispose of liveReads) dispose();
  root.removeEventListener('click', onLedgerClick);
  root.removeEventListener('change', onLedgerChange);
  root.removeEventListener('keydown', onLedgerKeyDown);
  root.remove();
  if (notify && restoreFocus?.isConnected) restoreFocus.focus({ preventScroll: true });
  if (notify) onClose?.();
}

function renderCurrentLedger(): void {
  const root = currentRoot;
  if (!root) return;
  for (const dispose of currentLiveReads) dispose();
  if (currentView === 'standings') {
    currentLiveReads = [];
    currentStandingsRows = [];
    root.innerHTML = renderStandingsLedger();
    void loadCountyStandings();
    return;
  }
  if (currentView === 'field-book') {
    currentLiveReads = [];
    root.innerHTML = renderFieldBookLedger();
    void loadFieldBook();
    return;
  }
  root.innerHTML = renderLedger(currentEntryId, currentEpochId);
  currentLiveReads = currentEpochId === 'epoch-1-frontier' ? [installAssayOfficeRecordsLiveRead(root)] : [];
  const renderedEpochId = currentEpochId;
  void loadEraBackdrop(renderedEpochId).then((url) => {
    if (!url || currentRoot !== root) return;
    const plate = root.querySelector<HTMLImageElement>(`[data-ledger-era-plate="${renderedEpochId}"]`);
    if (!plate) return;
    plate.src = url;
    plate.hidden = false;
  });
}

function renderLedger(selectedId: LedgerEntryId | undefined, selectedEpochId: LedgerEpochId): string {
  const discovered = readLedgerDiscovered();
  const eras = ledgerEras(discovered);
  const selectedEra = eras.open.find((era) => era.id === selectedEpochId) ?? eras.open.at(-1)!;
  currentEpochId = selectedEra.id;
  return `
    <div class="claim-ledger__shell">
      ${renderHeader()}
      ${renderViewRow()}
      ${renderEraRow(eras.open, eras.locked?.id, selectedEra.id)}
      <div class="claim-ledger__shelves" data-testid="claim-ledger-shelves">
        <section class="claim-ledger__shelf" data-testid="claim-ledger-chapter-${selectedEra.id}" data-ledger-era-state="open">
          <h3>${escapeHtml(eraName(selectedEra.id))}</h3>
          <img hidden data-ledger-era-plate="${selectedEra.id}" alt="" style="width:100%;height:88px;object-fit:cover;object-position:center;border:1px solid rgba(76,48,23,.36);border-radius:8px;margin:0 0 14px" />
        </section>
        ${LEDGER_CATEGORIES.filter((category) => hasVisibleEntries(category, discovered, selectedEra.id))
          .map((category) => renderShelf(category, discovered, selectedId, selectedEra.id))
          .join('')}
        ${eras.locked ? renderLockedChapter(eras.locked.id) : ''}
      </div>
    </div>
  `;
}

function renderHeader(): string {
  return `
    <header class="claim-ledger__header">
      <div>
        <p class="claim-ledger__eyebrow">Schoolhouse Ledger</p>
        <h2>Claim Ledger</h2>
      </div>
      <button class="claim-ledger__close" type="button" data-ledger-close data-testid="claim-ledger-close" aria-label="Close Claim Ledger">Back</button>
    </header>
  `;
}

function renderViewRow(): string {
  return `
    <nav class="claim-ledger__views" aria-label="Claim Ledger pages">
      <button type="button" data-ledger-view="ledger" data-testid="claim-ledger-pages" aria-pressed="${currentView === 'ledger'}">Claim Pages</button>
      <button type="button" data-ledger-view="standings" data-testid="claim-ledger-county-standings" aria-pressed="${currentView === 'standings'}">County Standings</button>
      <button type="button" data-ledger-view="field-book" data-testid="claim-ledger-field-book" aria-pressed="${currentView === 'field-book'}">The Field Book</button>
    </nav>
  `;
}

function renderStandingsLedger(): string {
  const epochId = activeEpochId();
  const contracts = listContracts(epochId);
  if (!contracts.some((contract) => contract.id === currentStandingsContractId)) {
    currentStandingsContractId = contracts[0]?.id ?? '';
  }
  return `
    <div class="claim-ledger__shell">
      ${renderHeader()}
      ${renderViewRow()}
      <section class="county-standings" data-testid="county-standings">
        <p class="claim-ledger__eyebrow">County Record</p>
        <h3>County Standings</h3>
        <p class="county-standings__epoch">${escapeHtml(eraName(epochId as LedgerEpochId))}</p>
        <nav class="county-standings__contracts" aria-label="County standings contracts">
          ${contracts
            .map(
              (contract) =>
                `<button type="button" data-standings-contract="${escapeHtml(contract.id)}" data-testid="county-standings-contract-${escapeHtml(
                  contract.id,
                )}" aria-pressed="${contract.id === currentStandingsContractId}">${escapeHtml(contract.boardRow.name)}</button>`,
            )
            .join('')}
        </nav>
        <p class="county-standings__contracts-hint" aria-hidden="true">Swipe for more contracts &rarr;</p>
        <nav class="county-standings__parties" aria-label="County standings party sizes">
          ${PARTY_ORDER
            .map(
              (party) =>
                `<button type="button" data-standings-party="${party}" data-testid="county-standings-party-${party}" aria-pressed="${
                  party === currentStandingsParty
                }">${PARTY_LABELS[party]}</button>`,
            )
            .join('')}
        </nav>
        <p class="county-standings__parties-hint">A posse is ranked only against posses its own size.</p>
        <label class="county-standings__filter">
          Difficulty
          <select data-standings-difficulty data-testid="county-standings-difficulty-filter">
            <option value="all"${currentStandingsDifficulty === 'all' ? ' selected' : ''}>All presets</option>
            ${Object.entries(DIFFICULTY_LABELS)
              .map(([value, label]) => `<option value="${value}"${currentStandingsDifficulty === value ? ' selected' : ''}>${label}</option>`)
              .join('')}
          </select>
        </label>
        <p class="county-standings__message" data-testid="county-standings-message" role="status" aria-live="polite"></p>
        ${renderLocalClaims(contracts)}
        <p class="county-standings__board-label"><strong>County board</strong><span class="county-standings__difficulty">Global</span></p>
        <p class="county-standings__provenance">Rig and posse declarations stay one tap away in The Field Book — never in the rank.</p>
        <div class="county-standings__board" data-testid="county-standings-board" aria-live="polite">
          <p class="county-standings__empty">The county clerk turns the pages.</p>
        </div>
      </section>
    </div>
  `;
}

function renderFieldBookLedger(): string {
  const epochId = activeEpochId();
  return `
    <div class="claim-ledger__shell">
      ${renderHeader()}
      ${renderViewRow()}
      <section class="county-standings field-book" data-testid="field-book">
        <p class="claim-ledger__eyebrow">County Record</p>
        <h3>The Field Book</h3>
        <p class="county-standings__epoch">${escapeHtml(eraName(epochId as LedgerEpochId))}</p>
        <p class="field-book__intro">${
          currentFieldBookView === 'byParty'
            ? "Who rode with whom, as the riders declared themselves — the field book counts hands, the board never does."
            : "The county's field book of rigs and their showings — cost is recorded, never ranked."
        }</p>
        <nav class="county-standings__contracts field-book__views" aria-label="Field book views">
          ${(Object.keys(FIELD_BOOK_VIEW_LABELS) as FieldBookView[])
            .map(
              (view) =>
                `<button type="button" data-field-book-view="${view}" data-testid="field-book-view-${view}" aria-pressed="${
                  view === currentFieldBookView
                }">${FIELD_BOOK_VIEW_LABELS[view]}</button>`,
            )
            .join('')}
        </nav>
        <div class="county-standings__board field-book__board" data-testid="field-book-board" aria-live="polite">
          <p class="county-standings__empty">The county clerk turns the field book's pages.</p>
        </div>
      </section>
    </div>
  `;
}

async function loadFieldBook(): Promise<void> {
  const root = currentRoot;
  const epochId = activeEpochId();
  const view = currentFieldBookView;
  const render = (payload: unknown): string =>
    view === 'byParty' ? renderPartyBook(readPartyBook(payload)) : renderFieldBook(readFieldBook(payload));
  if (!root) return;
  if (globalThis.navigator?.onLine === false) {
    const board = root.querySelector<HTMLElement>('[data-testid="field-book-board"]');
    if (board) board.innerHTML = render(null);
    return;
  }
  const url = new URL(gameApiUrl('/api/standings'));
  url.searchParams.set('view', view);
  url.searchParams.set('epoch', epochId);
  let payload: unknown = null;
  try {
    const response = await fetch(url);
    if (response.ok) payload = await response.json();
  } catch {
    // The field book stays usable offline.
  }
  if (currentRoot !== root || currentView !== 'field-book' || currentFieldBookView !== view) return;
  const board = root.querySelector<HTMLElement>('[data-testid="field-book-board"]');
  if (board) board.innerHTML = render(payload);
}

function readFieldBook(value: unknown): FieldBook {
  if (!value || typeof value !== 'object') return { contracts: [], rows: [] };
  const payload = value as { contracts?: unknown; byStack?: unknown };
  if (!Array.isArray(payload.contracts) || !Array.isArray(payload.byStack)) return { contracts: [], rows: [] };
  const contracts = payload.contracts.filter((contract): contract is string => typeof contract === 'string').slice(0, 100);
  const rows = payload.byStack.slice(0, 100).flatMap((value): FieldBookRow[] => {
    if (!value || typeof value !== 'object') return [];
    const row = value as { model?: unknown; contracts?: unknown };
    if (typeof row.model !== 'string' || !Array.isArray(row.contracts)) return [];
    return [{ model: row.model, contracts: row.contracts.filter(isFieldBookCell) }];
  });
  return { contracts, rows };
}

function isFieldBookCell(value: unknown): value is FieldBookCell {
  if (!value || typeof value !== 'object') return false;
  const cell = value as Partial<FieldBookCell>;
  const score = cell.score;
  return typeof cell.contractId === 'string' && Boolean(score) && score?.secured === true
    && finiteNonNegative(score.waves) && finiteNonNegative(score.timeAlive) && finiteNonNegative(score.gold)
    && finiteNonNegative(score.baseValue) && isDifficultyPreset(cell.difficulty)
    && Number.isInteger(cell.submittedAt) && (cell.submittedAt ?? -1) >= 0
    && validOptionalCost(cell.tokensIn) && validOptionalCost(cell.tokensOut) && validOptionalCost(cell.calls)
    && validOptionalString(cell.harness) && validOptionalString(cell.harnessVersion) && validOptionalString(cell.config);
}

function renderFieldBook(fieldBook: FieldBook): string {
  if (fieldBook.rows.length === 0) return '<p class="county-standings__empty">No rigs in the field book yet — the door is open.</p>';
  const contractNames = new Map(listContracts(activeEpochId()).map((contract) => [contract.id, contract.boardRow.name]));
  const contracts = fieldBook.contracts.filter((contractId) => fieldBook.rows.some((row) => row.contracts.some((cell) => cell.contractId === contractId)));
  return `
    ${contracts.length > 1 ? '<p class="field-book__swipe">Swipe the book for another contract &rarr;</p>' : ''}
    <table class="field-book__matrix" data-testid="field-book-matrix">
      <caption>${fieldBook.rows.length} ${fieldBook.rows.length === 1 ? 'rig' : 'rigs'} &middot; ${contracts.length} ${contracts.length === 1 ? 'contract' : 'contracts'} with showings</caption>
      <thead><tr><th scope="col">Rig</th>${contracts.map((id) => `<th scope="col">${escapeHtml(contractNames.get(id) ?? id)}</th>`).join('')}</tr></thead>
      <tbody>
        ${fieldBook.rows.map((row, index) => renderFieldBookRow(row, index, contracts, contractNames)).join('')}
      </tbody>
    </table>
  `;
}

function renderFieldBookRow(row: FieldBookRow, index: number, contracts: readonly string[], names: ReadonlyMap<string, string>): string {
  const cells = new Map(row.contracts.map((cell) => [cell.contractId, cell]));
  const rowSlug = slug(row.model) || 'unregistered-rig';
  return `
    <tr class="field-book__row" data-field-book-key="${index}" data-testid="field-book-row-${rowSlug}">
      <th scope="row"><button type="button" data-field-book-toggle aria-expanded="false">${escapeHtml(row.model)}<span aria-hidden="true"> +</span></button></th>
      ${contracts.map((contractId) => renderFieldBookCell(cells.get(contractId), rowSlug, contractId)).join('')}
    </tr>
    <tr class="field-book__details" data-field-book-details="${index}" hidden>
      <td colspan="${contracts.length + 1}">
        <div class="field-book__details-grid">
          ${row.contracts.map((cell) => renderFieldBookDetails(cell, names.get(cell.contractId) ?? cell.contractId, rowSlug)).join('')}
        </div>
      </td>
    </tr>
  `;
}

function renderFieldBookCell(cell: FieldBookCell | undefined, rowSlug: string, contractId: string): string {
  if (!cell) return '<td class="field-book__blank" aria-label="No showing">&mdash;</td>';
  const costs = [
    cell.tokensIn === undefined ? undefined : `${formatCount(cell.tokensIn)} in`,
    cell.tokensOut === undefined ? undefined : `${formatCount(cell.tokensOut)} out`,
    cell.calls === undefined ? undefined : `${formatCount(cell.calls)} calls`,
  ].filter((value): value is string => value !== undefined);
  return `<td data-testid="field-book-cell-${rowSlug}-${escapeHtml(contractId)}">
    <strong>Secured &middot; ${Math.floor(cell.score.waves)} waves</strong>
    <span>${Math.floor(cell.score.baseValue)} works &middot; ${Math.floor(cell.score.gold)} gold</span>
    <span class="county-standings__difficulty" data-difficulty="${cell.difficulty}">${DIFFICULTY_LABELS[cell.difficulty]}</span>
    <span>${costs.length ? costs.join(' &middot; ') : 'Cost not declared'}</span>
    <time datetime="${safeIsoDate(cell.submittedAt)}">${relativeAge(cell.submittedAt)}</time>
  </td>`;
}

function readPartyBook(value: unknown): PartyBook {
  if (!value || typeof value !== 'object') return { contracts: [], rows: [] };
  const payload = value as { contracts?: unknown; byParty?: unknown };
  if (!Array.isArray(payload.contracts) || !Array.isArray(payload.byParty)) return { contracts: [], rows: [] };
  const contracts = payload.contracts.filter((contract): contract is string => typeof contract === 'string').slice(0, 100);
  const rows = payload.byParty.slice(0, 100).flatMap((value): PartyBookRow[] => {
    if (!value || typeof value !== 'object') return [];
    const row = value as { composition?: unknown; riderCount?: unknown; contracts?: unknown };
    if (typeof row.composition !== 'string' || !/^[ha](\+[ha]){1,3}$/.test(row.composition)) return [];
    if (!Number.isInteger(row.riderCount) || !Array.isArray(row.contracts)) return [];
    return [{ composition: row.composition, riderCount: row.riderCount as number, contracts: row.contracts.filter(isPartyBookShowing) }];
  });
  return { contracts, rows };
}

function isPartyBookShowing(value: unknown): value is PartyBookShowing {
  if (!isFieldBookCell(value)) return false;
  const showing = value as Partial<PartyBookShowing>;
  return typeof showing.profileName === 'string' && isNameList(showing.riders) && isNameList(showing.rigs);
}

function isNameList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 4 && value.every((entry) => typeof entry === 'string' && entry.length <= 64);
}

function renderPartyBook(partyBook: PartyBook): string {
  if (partyBook.rows.length === 0) {
    return '<p class="county-standings__empty">No posses in the field book yet — the door is open.</p>';
  }
  const contractNames = new Map(listContracts(activeEpochId()).map((contract) => [contract.id, contract.boardRow.name]));
  const contracts = partyBook.contracts.filter((contractId) => partyBook.rows.some((row) => row.contracts.some((cell) => cell.contractId === contractId)));
  return `
    ${contracts.length > 1 ? '<p class="field-book__swipe">Swipe the book for another contract &rarr;</p>' : ''}
    <table class="field-book__matrix" data-testid="field-book-party-matrix">
      <caption>${partyBook.rows.length} ${partyBook.rows.length === 1 ? 'posse' : 'posses'} &middot; ${contracts.length} ${contracts.length === 1 ? 'contract' : 'contracts'} with showings</caption>
      <thead><tr><th scope="col">Posse</th>${contracts
        .map((id) => `<th scope="col">${escapeHtml(contractNames.get(id) ?? id)}</th>`)
        .join('')}</tr></thead>
      <tbody>
        ${partyBook.rows.map((row) => renderPartyBookRow(row, contracts)).join('')}
      </tbody>
    </table>
  `;
}

function renderPartyBookRow(row: PartyBookRow, contracts: readonly string[]): string {
  const showings = new Map(row.contracts.map((showing) => [showing.contractId, showing]));
  const rowSlug = slug(row.composition);
  return `
    <tr class="field-book__row" data-testid="field-book-party-row-${rowSlug}">
      <th scope="row">${escapeHtml(compositionLabel(row.composition))}<span class="county-standings__difficulty">${row.riderCount} riders</span></th>
      ${contracts.map((contractId) => renderPartyBookCell(showings.get(contractId), rowSlug, contractId)).join('')}
    </tr>
  `;
}

function renderPartyBookCell(showing: PartyBookShowing | undefined, rowSlug: string, contractId: string): string {
  if (!showing) return '<td class="field-book__blank" aria-label="No showing">&mdash;</td>';
  return `<td data-testid="field-book-party-cell-${rowSlug}-${escapeHtml(contractId)}">
    <strong>Secured &middot; ${Math.floor(showing.score.waves)} waves</strong>
    <span>${escapeHtml(showing.riders.join(', ')) || 'Riders not named'}</span>
    <span class="county-standings__difficulty" data-difficulty="${showing.difficulty}">${DIFFICULTY_LABELS[showing.difficulty]}</span>
    <span>${showing.rigs.length ? showing.rigs.map(escapeHtml).join(' &middot; ') : 'No rig declared'}</span>
    <time datetime="${safeIsoDate(showing.submittedAt)}">${relativeAge(showing.submittedAt)}</time>
  </td>`;
}

// 'h+a' reads as "Human + Agent". The letters come from self-declaration alone (a rider who
// declared a stack), which is why this label lives in the field book and never on the board.
function compositionLabel(composition: string): string {
  return composition
    .split('+')
    .map((rider) => (rider === 'a' ? 'Agent' : 'Human'))
    .join(' + ');
}

function renderFieldBookDetails(cell: FieldBookCell, name: string, rowSlug: string): string {
  const harness = [cell.harness, cell.harnessVersion].filter(Boolean).join(' ') || 'Not declared';
  return `<article data-testid="field-book-detail-${rowSlug}-${escapeHtml(cell.contractId)}">
    <h4>${escapeHtml(name)}</h4>
    <dl>
      <dt>Harness</dt><dd>${escapeHtml(harness)}</dd>
      <dt>Configuration</dt><dd>${escapeHtml(cell.config || 'Not declared')}</dd>
      <dt>Result</dt><dd>${Math.floor(cell.score.waves)} waves &middot; ${formatTime(cell.score.timeAlive)} &middot; ${Math.floor(cell.score.gold)} gold</dd>
      <dt>Submitted</dt><dd><time datetime="${safeIsoDate(cell.submittedAt)}">${safeIsoDate(cell.submittedAt)}</time></dd>
    </dl>
  </article>`;
}

async function loadCountyStandings(): Promise<void> {
  const root = currentRoot;
  const epochId = activeEpochId();
  const contractId = currentStandingsContractId;
  const difficulty = currentStandingsDifficulty;
  const party = currentStandingsParty;
  if (!root || !contractId) return;
  if (globalThis.navigator?.onLine === false) {
    currentStandingsRows = [];
    const board = root.querySelector<HTMLElement>('[data-testid="county-standings-board"]');
    if (board) board.innerHTML = renderCountyRows([], party);
    return;
  }
  const url = new URL(gameApiUrl('/api/standings'));
  url.searchParams.set('contract', contractId);
  url.searchParams.set('epoch', epochId);
  if (difficulty !== 'all') url.searchParams.set('difficulty', difficulty);
  // Solo is the endpoint's default, so the solo request stays byte-identical to the one this
  // reader has always sent — the posse boards are the only new traffic.
  if (party !== 'solo') url.searchParams.set('party', party);
  let rows: CountyStanding[] = [];
  try {
    const response = await fetch(url);
    if (response.ok) {
      const payload = (await response.json()) as unknown;
      rows = countyRows(payload);
    }
  } catch {
    // The county book stays usable offline.
  }
  if (
    currentRoot !== root
    || currentView !== 'standings'
    || currentStandingsContractId !== contractId
    || currentStandingsDifficulty !== difficulty
    || currentStandingsParty !== party
  ) {
    return;
  }
  currentStandingsRows = rows;
  const board = root.querySelector<HTMLElement>('[data-testid="county-standings-board"]');
  if (board) board.innerHTML = renderCountyRows(rows, party);
}

async function watchStandingsReel(rank: number): Promise<void> {
  const root = currentRoot;
  const onWatch = currentWatchTape;
  const row = currentStandingsRows.find((entry) => entry.rank === rank);
  const contractId = currentStandingsContractId;
  if (!root || !onWatch || !row?.reel || !contractId) return;
  const url = new URL(gameApiUrl('/api/standings'));
  url.searchParams.set('contract', contractId);
  url.searchParams.set('epoch', activeEpochId());
  url.searchParams.set('reel', row.reel.id);
  let payload: unknown = null;
  try {
    const response = await fetch(url);
    if (response.ok) payload = await response.json();
  } catch {
    // A dark projector is not a broken ledger; the refusal below says so in voice.
  }
  const { LANTERN_REEL_UNAVAILABLE, LANTERN_VERSION_REFUSAL, readStandingsReel } = await import('../ui/LanternShow');
  const verdict = readStandingsReel(payload);
  if (currentRoot !== root || currentView !== 'standings') return;
  if (!verdict.ok) {
    const refused = verdict.reason === 'version';
    setStandingsMessage(root, refused ? LANTERN_VERSION_REFUSAL : LANTERN_REEL_UNAVAILABLE, refused);
    if (refused) root.querySelector<HTMLElement>(`[data-standings-watch="${rank}"]`)?.closest('tr')?.setAttribute('data-refused', 'true');
    return;
  }
  closeClaimLedger();
  onWatch(verdict.tape);
}

function setStandingsMessage(root: HTMLElement, text: string, refused: boolean): void {
  const message = root.querySelector<HTMLElement>('[data-testid="county-standings-message"], [data-testid="tape-version-refusal"]');
  if (!message) return;
  message.textContent = text;
  // The shelf's own refusal marker, reused verbatim: one testid for one law, both surfaces.
  message.dataset.testid = refused ? 'tape-version-refusal' : 'county-standings-message';
}

function countyRows(value: unknown): CountyStanding[] {
  if (!value || typeof value !== 'object') return [];
  const board = (value as { board?: unknown }).board;
  if (!Array.isArray(board)) return [];
  return board.slice(0, 100).filter(isCountyStanding);
}

function isCountyStanding(value: unknown): value is CountyStanding {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<CountyStanding>;
  return (
    Number.isInteger(row.rank) &&
    (row.rank ?? 0) > 0 &&
    typeof row.profileName === 'string' &&
    row.secured === true &&
    finiteNonNegative(row.waves) &&
    finiteNonNegative(row.timeAlive) &&
    finiteNonNegative(row.gold) &&
    finiteNonNegative(row.baseValue) &&
    isDifficultyPreset(row.difficulty) &&
    (row.submittedAt === undefined || (Number.isInteger(row.submittedAt) && row.submittedAt >= 0)) &&
    (row.defaulted === undefined || row.defaulted === true) &&
    isCountyParty(row.party) &&
    isCountyReel(row.reel)
  );
}

function isCountyParty(value: unknown): boolean {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const party = value as Partial<NonNullable<CountyStanding['party']>>;
  return Number.isInteger(party.riderCount) && (party.riderCount ?? 0) >= 2 && (party.riderCount ?? 0) <= 4 && isNameList(party.riders);
}

function isCountyReel(value: unknown): boolean {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const reel = value as Partial<NonNullable<CountyStanding['reel']>>;
  return typeof reel.id === 'string' && reel.id.length > 0 && reel.id.length <= 64 && Number.isInteger(reel.simVersion);
}

function renderCountyRows(rows: readonly CountyStanding[], party: StandingsParty): string {
  if (rows.length === 0) {
    return party === 'solo'
      ? '<p class="county-standings__empty">No standings yet — the door is open.</p>'
      : `<p class="county-standings__empty">No ${PARTY_LABELS[party].toLowerCase()} standings yet — the door is open.</p>`;
  }
  const watchable = currentWatchTape !== undefined && rows.some((row) => row.reel);
  return `
    <table>
      <thead><tr><th scope="col">Rank</th><th scope="col">Name</th><th scope="col">Result</th><th scope="col">When</th>${
        watchable ? '<th scope="col">Reel</th>' : ''
      }</tr></thead>
      <tbody>
        ${rows.map((row) => renderCountyRow(row, watchable)).join('')}
      </tbody>
    </table>
  `;
}

function renderCountyRow(row: CountyStanding, watchable: boolean): string {
  return `<tr data-testid="county-standings-row-${row.rank}">
    <td>${row.rank}</td>
    <th scope="row">${escapeHtml(row.profileName)}<span class="county-standings__difficulty" data-testid="county-standings-difficulty-${row.rank}" data-difficulty="${row.difficulty}"${row.defaulted ? ' title="Trail preset defaulted for an older standing"' : ''}>${DIFFICULTY_LABELS[row.difficulty]}</span>${
      row.party
        ? `<span class="county-standings__riders" data-testid="county-standings-riders-${row.rank}">${row.party.riders
            .map(escapeHtml)
            .join(', ')}</span>`
        : ''
    }</th>
    <td class="county-standings__result">${Math.floor(row.waves)} waves &middot; ${formatTime(row.timeAlive)} &middot; ${Math.floor(row.gold)} gold</td>
    <td>${row.submittedAt === undefined
      ? '<span class="county-standings__when-missing" aria-label="Submission time unavailable">&mdash;</span>'
      : `<time datetime="${safeIsoDate(row.submittedAt)}">${relativeAge(row.submittedAt)}</time>`}</td>
    ${
      watchable
        ? `<td>${
            row.reel
              ? `<button class="county-standings__watch" type="button" data-standings-watch="${row.rank}" data-testid="county-standings-watch-${row.rank}">Watch this run</button>`
              : '<span class="county-standings__no-reel">No reel</span>'
          }</td>`
        : ''
    }
  </tr>`;
}

function renderLocalClaims(contracts: ReturnType<typeof listContracts>): string {
  const names = new Map(contracts.map((contract) => [contract.id, contract.boardRow.name]));
  const bests = new Map<string, ScoreRecord>();
  for (const score of loadScores()) {
    const contractId = score.contractId?.trim() || 'the-claim';
    if (names.has(contractId) && !bests.has(contractId)) bests.set(contractId, score);
  }
  return `
    <section class="county-standings__local" data-testid="county-standings-local" aria-labelledby="county-standings-local-title">
      <div class="county-standings__local-heading">
        <div><p class="claim-ledger__eyebrow">Local ledger</p><h4 id="county-standings-local-title">Your Claims</h4></div>
        <span class="county-standings__difficulty">Only this profile</span>
      </div>
      <div class="county-standings__local-list">
        ${bests.size === 0
          ? '<p class="county-standings__local-empty">No claims in your ledger yet — ride one and make your mark.</p>'
          : [...bests].map(([contractId, score]) => renderLocalClaim(contractId, names.get(contractId)!, score)).join('')}
      </div>
    </section>
  `;
}

function renderLocalClaim(contractId: string, name: string, score: ScoreRecord): string {
  return `<article class="county-standings__local-claim" data-testid="county-standings-local-${escapeHtml(contractId)}">
    <strong>${escapeHtml(name)}</strong>
    <span>${score.secured ? 'Secured' : `Wave ${Math.floor(score.waves)}`} &middot; ${Math.floor(score.baseValue ?? 0)} works</span>
    <time datetime="${safeIsoDate(score.at)}">${relativeAge(score.at)}</time>
  </article>`;
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validOptionalCost(value: unknown): boolean {
  return value === undefined || (Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 1_000_000_000_000);
}

function validOptionalString(value: unknown): boolean {
  return value === undefined || (typeof value === 'string' && value.length <= 256);
}

function isDifficultyPreset(value: unknown): value is DifficultyPresetId {
  return value === 'greenhorn' || value === 'trail' || value === 'vein-hunter';
}

function formatTime(secondsAlive: number): string {
  const minutes = Math.floor(secondsAlive / 60).toString().padStart(2, '0');
  const seconds = Math.floor(secondsAlive % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatCount(value: number): string {
  return Math.floor(value).toLocaleString('en-US');
}

function relativeAge(submittedAt: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - submittedAt) / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3_600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

function safeIsoDate(submittedAt: number): string {
  const date = new Date(submittedAt);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toISOString();
}

function renderShelf(
  category: string,
  discovered: Set<LedgerDiscoveryId>,
  selectedId: LedgerEntryId | undefined,
  epochId: LedgerEpochId,
): string {
  const entries = ledgerEntries.filter(
    (entry) =>
      entry.category === category &&
      entry.epochId === epochId &&
      (!entry.hiddenUntilDiscovered || discovered.has(entry.id)),
  );
  const legacyReferences = ledgerEntries.filter(
    (entry) =>
      entry.category === category &&
      entry.epochId !== epochId &&
      (discovered.has(entry.id) || !entry.hiddenUntilDiscovered),
  );
  return `
    <section class="claim-ledger__shelf" data-testid="claim-ledger-shelf-${slug(category)}">
      <h3>${escapeHtml(category)}</h3>
      <div class="claim-ledger__cards">
        ${entries.map((entry) => renderCard(entry, discovered.has(entry.id), selectedId === entry.id)).join('')}
        ${
          legacyReferences.length === 0
            ? ''
            : `<div hidden aria-hidden="true">${legacyReferences.map((entry) => renderCard(entry, discovered.has(entry.id), false)).join('')}</div>`
        }
      </div>
    </section>
  `;
}

function hasVisibleEntries(category: string, discovered: Set<LedgerDiscoveryId>, epochId: LedgerEpochId): boolean {
  return ledgerEntries.some(
    (entry) =>
      entry.category === category &&
      entry.epochId === epochId &&
      (!entry.hiddenUntilDiscovered || discovered.has(entry.id)),
  );
}

function ledgerEras(discovered: Set<LedgerDiscoveryId>): {
  open: Array<{ id: LedgerEpochId; order: number }>;
  locked?: { id: LedgerEpochId; order: number };
} {
  const eras = listEpochs() as Array<{ id: LedgerEpochId; order: number }>;
  const activeOrder = loadEpoch(activeEpochId()).order;
  const discoveredOrder = Math.max(
    0,
    ...eras.filter((era) => discovered.has(epochOverviewEntryId(era.id))).map((era) => era.order),
  );
  const openOrder = Math.max(activeOrder, discoveredOrder);
  return {
    open: eras.filter((era) => era.order <= openOrder),
    locked: eras.find((era) => era.order === openOrder + 1),
  };
}

function renderEraRow(
  eras: readonly { id: LedgerEpochId; order: number }[],
  lockedId: LedgerEpochId | undefined,
  selectedEpochId: LedgerEpochId,
): string {
  return `
    <nav class="research-chart__eras" data-testid="claim-ledger-era-row" aria-label="Claim Ledger eras" style="display:flex;gap:8px;overflow-x:auto;padding:14px 20px 0">
      ${eras
        .map((era, index) => {
          const selected = era.id === selectedEpochId;
          const label = `${eraName(era.id)}${index === eras.length - 1 ? ' — active' : ' ✓'}`;
          return `<button class="gr-start-menu__small-button" type="button" data-ledger-era="${era.id}" data-ledger-era-state="open" data-testid="claim-ledger-era-${era.id}" aria-pressed="${selected}">${escapeHtml(label)}</button>`;
        })
        .join('')}
      ${
        lockedId
          ? `<button class="gr-start-menu__small-button" type="button" disabled data-ledger-era="${lockedId}" data-ledger-era-state="locked" data-testid="claim-ledger-era-${lockedId}" aria-label="A future era remains locked">Next Era — locked</button>`
          : ''
      }
    </nav>
  `;
}

function renderLockedChapter(epochId: LedgerEpochId): string {
  return `
    <section class="claim-ledger__shelf claim-ledger-card--locked" data-testid="claim-ledger-locked-chapter" data-ledger-era="${epochId}" data-ledger-era-state="locked" style="padding:14px;border:1px solid rgba(76,48,23,.36);border-radius:8px">
      <p class="claim-ledger-card__locked-copy">The ledger has pages yet unwritten</p>
    </section>
  `;
}

function initialEpochId(entryId?: LedgerEntryId): LedgerEpochId {
  if (entryId) return ledgerEntryById[entryId].epochId;
  return activeEpochId() as LedgerEpochId;
}

function epochOverviewEntryId(epochId: LedgerEpochId): LedgerEntryId {
  return epochLedgerEntryById[epochId];
}

function eraName(epochId: LedgerEpochId): string {
  const name = loadEpoch(epochId).displayName;
  return name.startsWith('The ') ? name : `The ${name}`;
}

function renderCard(entry: LedgerEntry, discovered: boolean, selected: boolean): string {
  const facts = discovered
    ? entry
        .factLines()
        .map(playerLedgerLine)
        .filter((line): line is string => Boolean(line))
        .slice(0, LEDGER_FACT_LINE_CAP)
    : [];
  const quote = discovered ? playerLedgerLine(characterQuote(entry.id) ?? '') : undefined;
  const loreLine = discovered && !quote ? playerLedgerLine(entry.loreLine) : undefined;
  const portraitVisible = discovered && entry.portraitLocked?.() !== true;
  return `
    <article class="claim-ledger-card${discovered ? '' : ' claim-ledger-card--locked'}${selected ? ' claim-ledger-card--selected' : ''}"
      tabindex="0"
      data-testid="claim-ledger-card-${entry.id}"
      data-ledger-entry="${entry.id}"
      data-ledger-discovered="${discovered ? 'true' : 'false'}"
      data-unlock-signal="${escapeHtml(entry.unlockSignal)}">
      <div class="claim-ledger-card__portrait" data-asset-slot="${escapeHtml(entry.spriteRef.slot)}">
        ${
          portraitVisible
            ? `<img src="${entry.spriteRef.imageUrl}" alt="" />`
            : '<div class="claim-ledger-card__silhouette" data-testid="claim-ledger-locked-silhouette" aria-hidden="true"></div>'
        }
      </div>
      <div class="claim-ledger-card__body">
        <p class="claim-ledger-card__category">${escapeHtml(entry.category)}</p>
        <h4>${escapeHtml(discovered ? entry.name : 'Not yet met')}</h4>
        ${
          discovered
            ? `${renderFacts(entry, facts)}
              ${
                quote
                  ? `<p class="claim-ledger-card__quote" data-testid="claim-ledger-character-quote">&ldquo;${escapeHtml(quote)}&rdquo;</p>`
                  : loreLine
                    ? `<p class="claim-ledger-card__lore" data-testid="claim-ledger-lore-${entry.id}">${escapeHtml(loreLine)}</p>`
                    : ''
              }`
            : '<p class="claim-ledger-card__locked-copy" data-testid="claim-ledger-locked-copy">Not yet met</p>'
        }
      </div>
    </article>
  `;
}

function renderFacts(entry: LedgerEntry, facts: readonly string[]): string {
  if (facts.length === 0) return '';
  return `<ul class="claim-ledger-card__facts" data-testid="claim-ledger-facts-${entry.id}">
    ${facts.map((line) => `<li data-testid="claim-ledger-fact-line">${escapeHtml(line)}</li>`).join('')}
  </ul>`;
}

function playerLedgerLine(value: string): string | undefined {
  const line = value
    .replace(/\s*\([^)]*(?:lore\/|docs\/|\.md|20\d{2}-\d{2}-\d{2})[^)]*\)\s*$/i, '')
    .trim();
  if (!line) return undefined;
  return INTERNAL_LEDGER_PATTERNS.some((pattern) => pattern.test(line)) ? undefined : line;
}

const INTERNAL_LEDGER_PATTERNS = [
  /\(lore\//i,
  /\.md\b/i,
  /\bbatch-/i,
  /\b20\d{2}-\d{2}-\d{2}\b/,
  /\bOWNER RULING\b/i,
  /\bNEVER\b/,
  /\broster\b/i,
  /\bwiki\b/i,
  /\bbackend\b/i,
  /\bdocs\//i,
  /\bcodex-/i,
  /^Ability:/i,
  /^Bark range:/i,
  /^First survey:/i,
  /^Home post:/i,
  /^Move:/i,
  /^Move speed:/i,
  /^Priority chase mark:/i,
  /^Spawn edges:/i,
] as const;

const CHARACTER_QUOTES: Partial<Record<LedgerEntryId, string>> = {
  hero: 'This claim has room for every honest hand.',
  prospector: 'I will keep the claim books steady.',
  town_tavernkeeper: 'The board is warm; pick your trail.',
  town_storekeeper: 'If you can count it, I can stock it.',
  town_elder: 'Write it plainly; learn it once.',
  town_preacher: 'The bell is for courage, not judgment.',
  town_schoolteacher: 'A good question is a lantern.',
  town_assay_clerk: "Gold in, proof out. That's the bargain.",
  town_youngster_a: 'I found a shiny rock. It is probably science.',
  town_youngster_b: 'If the Baron comes, he has to do sums first.',
  claim_jumper: "That pan looks lonely; I'll carry it off.",
  baron: 'My banner arrives before my bill.',
};

function characterQuote(id: LedgerEntryId): string | undefined {
  return CHARACTER_QUOTES[id];
}

function onLedgerClick(event: MouseEvent): void {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('[data-ledger-close]')) closeClaimLedger();
  const view = target?.closest<HTMLButtonElement>('[data-ledger-view]')?.dataset.ledgerView as LedgerView | undefined;
  if (view && view !== currentView) {
    currentView = view;
    renderCurrentLedger();
    currentRoot?.querySelector<HTMLElement>(`[data-ledger-view="${view}"]`)?.focus();
    return;
  }
  const contractId = target?.closest<HTMLButtonElement>('[data-standings-contract]')?.dataset.standingsContract;
  if (contractId && contractId !== currentStandingsContractId) {
    currentStandingsContractId = contractId;
    renderCurrentLedger();
    currentRoot?.querySelector<HTMLElement>(`[data-standings-contract="${contractId}"]`)?.focus();
    return;
  }
  const watchRank = Number(target?.closest<HTMLButtonElement>('[data-standings-watch]')?.dataset.standingsWatch);
  if (Number.isInteger(watchRank) && watchRank > 0) {
    void watchStandingsReel(watchRank);
    return;
  }
  const party = target?.closest<HTMLButtonElement>('[data-standings-party]')?.dataset.standingsParty as StandingsParty | undefined;
  if (party && party !== currentStandingsParty) {
    currentStandingsParty = party;
    renderCurrentLedger();
    currentRoot?.querySelector<HTMLElement>(`[data-standings-party="${party}"]`)?.focus();
    return;
  }
  const fieldBookView = target?.closest<HTMLButtonElement>('[data-field-book-view]')?.dataset.fieldBookView as FieldBookView | undefined;
  if (fieldBookView && fieldBookView !== currentFieldBookView) {
    currentFieldBookView = fieldBookView;
    renderCurrentLedger();
    currentRoot?.querySelector<HTMLElement>(`[data-field-book-view="${fieldBookView}"]`)?.focus();
    return;
  }
  const fieldBookRow = target?.closest<HTMLElement>('[data-field-book-key]');
  if (fieldBookRow && currentView === 'field-book') {
    const key = fieldBookRow.dataset.fieldBookKey;
    const details = [...(currentRoot?.querySelectorAll<HTMLElement>('[data-field-book-details]') ?? [])]
      .find((row) => row.dataset.fieldBookDetails === key);
    const expanded = details?.hidden === false;
    if (details) details.hidden = expanded;
    fieldBookRow.classList.toggle('field-book__row--expanded', !expanded);
    fieldBookRow.querySelector<HTMLElement>('[data-field-book-toggle]')?.setAttribute('aria-expanded', String(!expanded));
    return;
  }
  const eraButton = target?.closest<HTMLButtonElement>('[data-ledger-era-state="open"]');
  const epochId = eraButton?.dataset.ledgerEra as LedgerEpochId | undefined;
  if (!epochId || epochId === currentEpochId) return;
  currentEpochId = epochId;
  currentEntryId = undefined;
  renderCurrentLedger();
  currentRoot?.querySelector<HTMLElement>(`[data-ledger-era="${epochId}"]`)?.focus();
}

function onLedgerChange(event: Event): void {
  const select = event.target instanceof HTMLSelectElement && event.target.matches('[data-standings-difficulty]') ? event.target : null;
  const difficulty = select?.value;
  if (!difficulty || (difficulty !== 'all' && !isDifficultyPreset(difficulty)) || difficulty === currentStandingsDifficulty) return;
  currentStandingsDifficulty = difficulty;
  renderCurrentLedger();
  currentRoot?.querySelector<HTMLElement>('[data-standings-difficulty]')?.focus();
}

function onLedgerKeyDown(event: KeyboardEvent): void {
  // The modal owns keyboard input while open. In multiplayer the simulation
  // intentionally continues, so allowing these events to reach the global
  // InputController would move the hero or turn Escape into a shared pause.
  event.stopPropagation();
  if (event.key === 'Tab') {
    trapLedgerFocus(event);
    return;
  }
  if (event.key !== 'Escape') return;
  event.preventDefault();
  closeClaimLedger();
}

function trapLedgerFocus(event: KeyboardEvent): void {
  const root = currentRoot;
  if (!root) return;
  const focusable = Array.from(
    root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
  ).filter((element) => !element.hasAttribute('disabled') && !element.hidden);
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
