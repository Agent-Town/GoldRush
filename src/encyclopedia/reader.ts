import './reader.css';
import { LEDGER_CATEGORIES, ledgerEntries, type LedgerDiscoveryId, type LedgerEntry, type LedgerEntryId } from './registry';
import { readLedgerDiscovered } from './state';

export const LEDGER_FACT_LINE_CAP = 4;

type OpenClaimLedgerOptions = {
  entryId?: LedgerEntryId;
  onClose?: () => void;
};

let currentRoot: HTMLElement | null = null;
let currentClose: (() => void) | undefined;

export function openClaimLedger(options: OpenClaimLedgerOptions = {}): void {
  closeClaimLedger(false);
  const root = document.createElement('section');
  currentRoot = root;
  currentClose = options.onClose;
  root.className = 'claim-ledger';
  root.dataset.testid = 'claim-ledger';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Claim Ledger');
  root.innerHTML = renderLedger(options.entryId);
  root.addEventListener('click', onLedgerClick);
  root.addEventListener('keydown', onLedgerKeyDown);
  (document.querySelector<HTMLElement>('#app') ?? document.body).append(root);
  root.querySelector<HTMLElement>(options.entryId ? `[data-ledger-entry="${options.entryId}"]` : '[data-ledger-close]')?.focus({
    preventScroll: true,
  });
}

export function closeClaimLedger(notify = true): void {
  const root = currentRoot;
  if (!root) return;
  currentRoot = null;
  const onClose = currentClose;
  currentClose = undefined;
  root.removeEventListener('click', onLedgerClick);
  root.removeEventListener('keydown', onLedgerKeyDown);
  root.remove();
  if (notify) onClose?.();
}

function renderLedger(selectedId?: LedgerEntryId): string {
  const discovered = readLedgerDiscovered();
  return `
    <div class="claim-ledger__shell">
      <header class="claim-ledger__header">
        <div>
          <p class="claim-ledger__eyebrow">Schoolhouse Ledger</p>
          <h2>Claim Ledger</h2>
        </div>
        <button class="claim-ledger__close" type="button" data-ledger-close data-testid="claim-ledger-close" aria-label="Close Claim Ledger">Back</button>
      </header>
      <div class="claim-ledger__shelves" data-testid="claim-ledger-shelves">
        ${LEDGER_CATEGORIES.map((category) => renderShelf(category, discovered, selectedId)).join('')}
      </div>
    </div>
  `;
}

function renderShelf(category: string, discovered: Set<LedgerDiscoveryId>, selectedId?: LedgerEntryId): string {
  const entries = ledgerEntries.filter((entry) => entry.category === category);
  return `
    <section class="claim-ledger__shelf" data-testid="claim-ledger-shelf-${slug(category)}">
      <h3>${escapeHtml(category)}</h3>
      <div class="claim-ledger__cards">
        ${entries.map((entry) => renderCard(entry, discovered.has(entry.id), selectedId === entry.id)).join('')}
      </div>
    </section>
  `;
}

function renderCard(entry: LedgerEntry, discovered: boolean, selected: boolean): string {
  const facts = discovered ? entry.factLines().map((line) => line.trim()).filter(Boolean).slice(0, LEDGER_FACT_LINE_CAP) : [];
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
            ? `<ul class="claim-ledger-card__facts" data-testid="claim-ledger-facts-${entry.id}">
                ${facts.map((line) => `<li data-testid="claim-ledger-fact-line">${escapeHtml(line)}</li>`).join('')}
              </ul>
              <p class="claim-ledger-card__lore" data-testid="claim-ledger-lore-${entry.id}">${escapeHtml(entry.loreLine)}</p>`
            : '<p class="claim-ledger-card__locked-copy" data-testid="claim-ledger-locked-copy">Not yet met</p>'
        }
      </div>
    </article>
  `;
}

function onLedgerClick(event: MouseEvent): void {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('[data-ledger-close]')) closeClaimLedger();
}

function onLedgerKeyDown(event: KeyboardEvent): void {
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
