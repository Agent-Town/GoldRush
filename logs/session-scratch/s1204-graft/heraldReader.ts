import './heraldReader.css';
import { readHeraldItems, type HeraldClass, type HeraldItem } from './herald';
import { activeProfile, markHintSeen, type ProfileStorage } from '../game/ProfileStorage';

const heraldEngravingUrls = import.meta.glob<string>('../../assets/raw/herald-engraving-*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});
const HERALD_ENGRAVINGS: Record<HeraldClass, string | undefined> = {
  board: heraldEngravingUrls['../../assets/raw/herald-engraving-board.png'],
  trail: heraldEngravingUrls['../../assets/raw/herald-engraving-trail.png'],
  river: heraldEngravingUrls['../../assets/raw/herald-engraving-river.png'],
  schoolhouse: heraldEngravingUrls['../../assets/raw/herald-engraving-schoolhouse.png'],
  ledger: heraldEngravingUrls['../../assets/raw/herald-engraving-ledger.png'],
  boss: heraldEngravingUrls['../../assets/raw/herald-engraving-boss.png'],
  'town-growth': heraldEngravingUrls['../../assets/raw/herald-engraving-town-growth.png'],
};
const FIRST_ISSUE_SEEN_KEY = 'story:greenhorn-gazette-issue-1';
const FIRST_ISSUE_PANELS = [
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
      'The tavern board posts claims; the schoolhouse charts science; the tailor dresses both partners.',
      'The complaints desk pays bounties for trouble reported.',
    ],
  },
] as const;

let currentRoot: HTMLElement | null = null;
let currentOnClose: (() => void) | undefined;

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
  root.innerHTML = renderHerald(readHeraldItems());
  root.addEventListener('click', onHeraldClick);
  root.addEventListener('keydown', onHeraldKeyDown);
  (document.querySelector<HTMLElement>('#app') ?? document.body).append(root);
  root.querySelector<HTMLButtonElement>('[data-herald-close]')?.focus({ preventScroll: true });
}

export function closeClaimHerald(): void {
  const root = currentRoot;
  if (!root) return;
  const onClose = currentOnClose;
  currentRoot = null;
  currentOnClose = undefined;
  root.removeEventListener('click', onHeraldClick);
  root.removeEventListener('keydown', onHeraldKeyDown);
  root.remove();
  onClose?.();
}

export function claimHeraldTownStatus(storage = browserStorage()): {
  showBadge: boolean;
  unread: boolean;
  openOnTownEntry: boolean;
} {
  if (!storage) return { showBadge: false, unread: false, openOnTownEntry: false };
  const profile = activeProfile(storage);
  const showBadge = profile.trailGuide === true;
  const unread = showBadge && !profile.hintsSeen.includes(FIRST_ISSUE_SEEN_KEY);
  return { showBadge, unread, openOnTownEntry: unread && profile.difficultyPreset === 'greenhorn' };
}

export function markClaimHeraldFirstIssueRead(storage = browserStorage()): void {
  if (storage) markHintSeen(storage, FIRST_ISSUE_SEEN_KEY);
}

function renderHerald(items: readonly HeraldItem[]): string {
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
      <section class="claim-herald__first-issue" data-testid="gazette-first-issue" aria-labelledby="gazette-first-issue-title">
        <header class="claim-herald__issue-header">
          <p>Issue No. 1 · Pinned greenhorn edition</p>
          <h3 id="gazette-first-issue-title">SIX THINGS EVERY CLAIM-HOLDER SHOULD KNOW</h3>
        </header>
        <div class="claim-herald__guide-panels">
          ${FIRST_ISSUE_PANELS.map(renderFirstIssuePanel).join('')}
        </div>
      </section>
      ${
        items.length > 0
          ? `<section class="claim-herald__latest"><h3>Latest from the plaza</h3><div class="claim-herald__items" data-testid="claim-herald-items">${items.map(renderItem).join('')}</div></section>`
          : '<p class="claim-herald__empty" data-testid="claim-herald-empty">No fresh ink today.</p>'
      }
    </article>
  `;
}

function renderFirstIssuePanel(panel: (typeof FIRST_ISSUE_PANELS)[number]): string {
  return `
    <article class="claim-herald__guide-panel" data-panel-id="${panel.id}" data-testid="gazette-panel">
      <div class="claim-herald__art-slot" aria-hidden="true">Engraving reserved</div>
      <h4>${panel.headline}</h4>
      ${panel.lines.map((line) => `<p>${line}</p>`).join('')}
    </article>
  `;
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
  if (target?.closest('[data-herald-close]')) closeClaimHerald();
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
