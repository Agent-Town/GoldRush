import './reader.css';
import { activeEpochId, listEpochs, loadEpoch } from '../meta/ContractFamilies';
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
};

let currentRoot: HTMLElement | null = null;
let currentClose: (() => void) | undefined;
let currentLiveReads: (() => void)[] = [];
let currentEntryId: LedgerEntryId | undefined;
let currentEpochId: LedgerEpochId = 'epoch-1-frontier';

export function openClaimLedger(options: OpenClaimLedgerOptions = {}): void {
  backfillReachedWorldOutsideEntries();
  closeClaimLedger(false);
  const root = document.createElement('section');
  currentRoot = root;
  currentClose = options.onClose;
  currentEntryId = options.entryId;
  currentEpochId = initialEpochId(options.entryId);
  root.className = 'claim-ledger';
  root.dataset.testid = 'claim-ledger';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Claim Ledger');
  root.addEventListener('click', onLedgerClick);
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
  currentClose = undefined;
  currentEntryId = undefined;
  currentLiveReads = [];
  for (const dispose of liveReads) dispose();
  root.removeEventListener('click', onLedgerClick);
  root.removeEventListener('keydown', onLedgerKeyDown);
  root.remove();
  if (notify) onClose?.();
}

function renderCurrentLedger(): void {
  const root = currentRoot;
  if (!root) return;
  for (const dispose of currentLiveReads) dispose();
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
      <header class="claim-ledger__header">
        <div>
          <p class="claim-ledger__eyebrow">Schoolhouse Ledger</p>
          <h2>Claim Ledger</h2>
        </div>
        <button class="claim-ledger__close" type="button" data-ledger-close data-testid="claim-ledger-close" aria-label="Close Claim Ledger">Back</button>
      </header>
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
  const eraButton = target?.closest<HTMLButtonElement>('[data-ledger-era-state="open"]');
  const epochId = eraButton?.dataset.ledgerEra as LedgerEpochId | undefined;
  if (!epochId || epochId === currentEpochId) return;
  currentEpochId = epochId;
  currentEntryId = undefined;
  renderCurrentLedger();
  currentRoot?.querySelector<HTMLElement>(`[data-ledger-era="${epochId}"]`)?.focus();
}

function onLedgerKeyDown(event: KeyboardEvent): void {
  // The modal owns keyboard input while open. In multiplayer the simulation
  // intentionally continues, so allowing these events to reach the global
  // InputController would move the hero or turn Escape into a shared pause.
  event.stopPropagation();
  if (event.key !== 'Escape') return;
  event.preventDefault();
  closeClaimLedger();
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
