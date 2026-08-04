import './heraldReader.css';
import { readHeraldItems, type HeraldClass, type HeraldItem } from './herald';
import { activeProfile, markHintSeen, type ProfileStorage } from '../game/ProfileStorage';
import {
  currentEdition,
  editionLadder,
  markEditionRead,
  readLadderFacts,
  readLastReadEdition,
  type Edition,
} from './editionLadder';
import {
  greenhornGazetteControlCopy,
  PROSPECTORS_HANDS_PANEL_ID,
  type GazetteInputMode,
} from './greenhornGazette';

const heraldEngravingUrls = import.meta.glob<string>('../../assets/processed/herald-engraving-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
const gazettePanelUrls = import.meta.glob<string>('../../assets/processed/gazette-panel-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
const HERALD_ENGRAVINGS: Record<HeraldClass, string | undefined> = {
  board: heraldEngravingUrls['../../assets/processed/herald-engraving-board.webp'],
  trail: heraldEngravingUrls['../../assets/processed/herald-engraving-trail.webp'],
  river: heraldEngravingUrls['../../assets/processed/herald-engraving-river.webp'],
  schoolhouse: heraldEngravingUrls['../../assets/processed/herald-engraving-schoolhouse.webp'],
  ledger: heraldEngravingUrls['../../assets/processed/herald-engraving-ledger.webp'],
  boss: heraldEngravingUrls['../../assets/processed/herald-engraving-boss.webp'],
  'town-growth': heraldEngravingUrls['../../assets/processed/herald-engraving-town-growth.webp'],
  ceremony: heraldEngravingUrls['../../assets/processed/herald-engraving-ceremony.webp'],
};
const FIRST_ISSUE_SEEN_KEY = 'story:greenhorn-gazette-issue-1';

function firstIssuePanels(mode: GazetteInputMode) {
  const controls = greenhornGazetteControlCopy(mode);
  return [
    {
      id: 'claim-goal',
      headline: 'THE CLAIM AND THE GOAL',
      lines: [
        'Hold the claim through every posted wave.',
        'Secure it and the win is banked; each claim carries the town forward.',
      ],
    },
    {
      id: 'seams-gold',
      headline: 'SEAMS GIVE GOLD',
      lines: [
        'Pan the glittering seams to put gold in your pouch.',
        'Raise a sluice beside running water and it keeps washing while you fight.',
      ],
    },
    // Owner ruling 2026-08-04 ("duplicate items... Please keep only one of them"): key
    // instructions live ONLY in THE PROSPECTOR'S HANDS; topic panels teach the concept.
    {
      id: 'the-works',
      headline: 'THE WORKS',
      lines: [
        'Gold raises the works: palisades slow trouble; turrets and beacons watch the night.',
        'Build where the trouble walks.',
      ],
    },
    {
      id: 'the-arms',
      headline: 'THE ARMS',
      lines: [
        'Your brass-and-teal frontier rig fires when trouble comes in range.',
        'When the trail pauses for a fitting, choose the upgrade your claim needs.',
      ],
    },
    {
      id: 'freeing-fevered',
      headline: 'FREEING THE FEVERED',
      lines: [
        "The bandits are neighbors caught in the Baron's Gold Fever.",
        'Turn them back and break the hunger; they are victims, never villains.',
      ],
    },
    {
      id: 'town-serves',
      headline: 'THE TOWN SERVES YOU',
      lines: [
        'The tavern board posts claims; the separate Drill Yard is practice with nothing at stake.',
        'The complaints desk pays bounties for trouble reported.',
      ],
    },
    {
      id: PROSPECTORS_HANDS_PANEL_ID,
      engravingId: 'the-arms',
      headline: "THE PROSPECTOR'S HANDS",
      lines: controls.hands,
    },
  ];
}

let currentRoot: HTMLElement | null = null;
let currentOnClose: (() => void) | undefined;
let currentLadder: readonly Edition[] = [];

export function openClaimHerald(onClose?: () => void): void {
  closeClaimHerald();
  const root = document.createElement('section');
  currentRoot = root;
  currentOnClose = onClose;
  root.className = 'claim-herald';
  root.dataset.testid = 'claim-herald';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'The Claim Herald');
  // Law 1: the ladder is derived here, once, from profile facts. The current edition opens
  // first (law 4); the archive strip keeps every earlier one one click away.
  currentLadder = claimHeraldLadder();
  root.innerHTML = renderHerald(readHeraldItems(), currentLadder, currentLadder.length - 1);
  root.addEventListener('click', onHeraldClick);
  root.addEventListener('keydown', onHeraldKeyDown);
  (document.querySelector<HTMLElement>('#app') ?? document.body).append(root);
  root.querySelector<HTMLButtonElement>('[data-herald-close]')?.focus({ preventScroll: true });
}

/** The ladder as this profile would read it today. Exported for the reader's own e2e. */
export function claimHeraldLadder(storage = browserStorage()): Edition[] {
  return editionLadder(readLadderFacts(storage));
}

export function closeClaimHerald(): void {
  const root = currentRoot;
  if (!root) return;
  const onClose = currentOnClose;
  currentRoot = null;
  currentOnClose = undefined;
  currentLadder = [];
  root.removeEventListener('click', onHeraldClick);
  root.removeEventListener('keydown', onHeraldKeyDown);
  root.remove();
  onClose?.();
}

export type ClaimHeraldTownStatus = {
  showBadge: boolean;
  unread: boolean;
  openOnTownEntry: boolean;
  editionNumber: number;
  editionLabel: string;
};

export function claimHeraldTownStatus(storage = browserStorage()): ClaimHeraldTownStatus {
  if (!storage) return { showBadge: false, unread: false, openOnTownEntry: false, editionNumber: 1, editionLabel: 'Issue No. 1' };
  const profile = activeProfile(storage);
  const showBadge = profile.trailGuide === true;
  const firstIssueUnread = !profile.hintsSeen.includes(FIRST_ISSUE_SEEN_KEY);
  const editionNumber = currentEdition(claimHeraldLadder(storage))?.number ?? 1;
  // A profile that read Issue No. 1 before this marker existed counts as having read edition 1,
  // or every returning player would be nagged by a badge for news they have already seen.
  const lastRead = Math.max(readLastReadEdition(storage), firstIssueUnread ? 0 : 1);
  return {
    showBadge,
    unread: showBadge && (firstIssueUnread || lastRead < editionNumber),
    // The auto-open stays bound to the FIRST issue alone: a later edition earns a pulsing badge,
    // never a modal the player did not ask for.
    openOnTownEntry: showBadge && firstIssueUnread && profile.difficultyPreset === 'greenhorn',
    editionNumber,
    editionLabel: `Issue No. ${editionNumber}`,
  };
}

export function markClaimHeraldFirstIssueRead(storage = browserStorage()): void {
  if (!storage) return;
  markHintSeen(storage, FIRST_ISSUE_SEEN_KEY);
  markEditionRead(storage, currentEdition(claimHeraldLadder(storage))?.number ?? 1);
}

function renderHerald(items: readonly HeraldItem[], ladder: readonly Edition[], index: number): string {
  const inputMode = prefersTouchControls() ? 'touch' : 'keyboard';
  const edition = ladder[index] ?? ladder[0];
  return `
    <article class="claim-herald__paper">
      <header class="claim-herald__masthead">
        <div class="claim-herald__mark" aria-hidden="true">!</div>
        <div>
          <p class="claim-herald__eyebrow">Fresh from the plaza</p>
          <h2>THE CLAIM HERALD</h2>
        </div>
        <button class="claim-herald__close" type="button" data-herald-close data-testid="claim-herald-close">Back</button>
      </header>
      ${renderArchiveStrip(ladder, edition)}
      ${edition ? renderEdition(edition) : ''}
      ${edition?.kind === 'arrival' ? renderFirstIssue(inputMode) : ''}
      ${
        items.length > 0
          ? `<section class="claim-herald__latest"><h3>Around town</h3><div class="claim-herald__items" data-testid="claim-herald-items">${items.map(renderItem).join('')}</div></section>`
          : '<p class="claim-herald__empty" data-testid="claim-herald-empty">No fresh ink today.</p>'
      }
    </article>
  `;
}

// Law 3: Issue No. 1 keeps BOTH duties. The arrival lead prints above; this block is the
// greenhorn tutorial exactly as it was, and e2e/gazette-first-issue.spec.ts gates it unmodified.
function renderFirstIssue(inputMode: GazetteInputMode): string {
  const panels = firstIssuePanels(inputMode);
  return `
      <section class="claim-herald__first-issue" data-testid="gazette-first-issue" aria-labelledby="gazette-first-issue-title">
        <header class="claim-herald__issue-header">
          <p>Issue No. 1 · Pinned greenhorn edition</p>
          <h3 id="gazette-first-issue-title">SEVEN THINGS EVERY CLAIM-HOLDER SHOULD KNOW</h3>
        </header>
        <div class="claim-herald__guide-panels" data-input-mode="${inputMode}">
          ${panels.map(renderFirstIssuePanel).join('')}
        </div>
      </section>`;
}

function renderEdition(edition: Edition): string {
  const plateUrl = edition.engraving ? HERALD_ENGRAVINGS[edition.engraving] : undefined;
  const contractAttribute = edition.contractId ? ` data-contract-id="${escapeHtml(edition.contractId)}"` : '';
  return `
      <section class="claim-herald__edition" data-testid="claim-herald-edition" data-edition-id="${escapeHtml(edition.id)}" data-edition-number="${edition.number}" data-edition-kind="${edition.kind}"${contractAttribute} aria-labelledby="claim-herald-edition-title">
        <p class="claim-herald__eyebrow" data-testid="claim-herald-edition-eyebrow">${escapeHtml(edition.eyebrow)}</p>
        <h3 id="claim-herald-edition-title" data-testid="claim-herald-edition-headline">${escapeHtml(edition.headline)}</h3>
        <p class="claim-herald__standfirst">${escapeHtml(edition.standfirst)}</p>
        ${
          plateUrl
            ? `<img class="claim-herald__plate" src="${plateUrl}" alt="" aria-hidden="true" data-testid="claim-herald-edition-plate">`
            : '<div class="claim-herald__plate claim-herald__art-slot" aria-hidden="true" data-testid="claim-herald-edition-plate-reserved">Engraving reserved</div>'
        }
        <div class="claim-herald__lead" data-testid="claim-herald-lead">${edition.lead.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>
        ${edition.deed ? `<p class="claim-herald__deed" data-testid="claim-herald-deed">${escapeHtml(edition.deed)}</p>` : ''}
      </section>`;
}

// Law 4: editions never retire. One click to any of them, and no persistence in the strip —
// which edition you are looking at is this reader's business and dies with it.
function renderArchiveStrip(ladder: readonly Edition[], current: Edition | undefined): string {
  if (ladder.length < 2) return '';
  return `
      <nav class="claim-herald__archive" data-testid="claim-herald-archive" aria-label="Back issues of The Claim Herald">
        ${ladder
          .map((edition) => {
            const showing = edition.id === current?.id;
            return `<button class="claim-herald__back-issue" type="button" data-herald-edition="${escapeHtml(edition.id)}" data-testid="claim-herald-back-issue" data-showing="${showing}"${showing ? ' aria-current="true"' : ''}><span>No. ${edition.number}</span>${escapeHtml(edition.headline)}</button>`;
          })
          .join('')}
      </nav>`;
}

function showEdition(editionId: string): void {
  const root = currentRoot;
  const index = currentLadder.findIndex((edition) => edition.id === editionId);
  if (!root || index < 0) return;
  root.innerHTML = renderHerald(readHeraldItems(), currentLadder, index);
  root.querySelector<HTMLElement>('.claim-herald__paper')?.scrollTo({ top: 0 });
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-herald-edition]')) {
    if (button.dataset.heraldEdition === editionId) {
      button.focus({ preventScroll: true });
      return;
    }
  }
}

function renderFirstIssuePanel(panel: ReturnType<typeof firstIssuePanels>[number]): string {
  const engravingUrl = gazettePanelUrls[`../../assets/processed/gazette-panel-${panel.engravingId ?? panel.id}.webp`];
  return `
    <article class="claim-herald__guide-panel" data-panel-id="${panel.id}" data-testid="gazette-panel">
      ${engravingUrl ? `<img class="claim-herald__art-slot" src="${engravingUrl}" alt="" aria-hidden="true" data-testid="gazette-panel-engraving">` : '<div class="claim-herald__art-slot" aria-hidden="true">Engraving reserved</div>'}
      <h4>${panel.headline}</h4>
      ${panel.lines.map((line) => `<p>${line}</p>`).join('')}
    </article>
  `;
}

function prefersTouchControls(): boolean {
  return globalThis.matchMedia?.('(pointer: coarse), (max-width: 760px)').matches === true;
}

function renderItem(item: HeraldItem): string {
  const engravingUrl = item.class && Object.hasOwn(HERALD_ENGRAVINGS, item.class) ? HERALD_ENGRAVINGS[item.class] : undefined;
  return `
    <section class="claim-herald__item" data-testid="claim-herald-item">
      ${engravingUrl ? `<img class="claim-herald__engraving" src="${engravingUrl}" alt="" aria-hidden="true" data-testid="claim-herald-engraving">\n      ` : ''}<p class="claim-herald__date">${escapeHtml(formatDate(item.date))}</p>
      <h3>${escapeHtml(item.headline)}</h3>
      ${item.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
    </section>
  `;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Today';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
}

function onHeraldClick(event: MouseEvent): void {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('[data-herald-close]')) {
    closeClaimHerald();
    return;
  }
  const backIssue = target?.closest<HTMLElement>('[data-herald-edition]');
  if (backIssue?.dataset.heraldEdition) showEdition(backIssue.dataset.heraldEdition);
}

function onHeraldKeyDown(event: KeyboardEvent): void {
  event.stopPropagation();
  if (event.key !== 'Escape') return;
  event.preventDefault();
  closeClaimHerald();
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

function browserStorage(): ProfileStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
