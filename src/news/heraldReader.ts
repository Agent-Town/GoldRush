import './heraldReader.css';
import { readHeraldItems, type HeraldItem } from './herald';

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
      ${
        items.length > 0
          ? `<div class="claim-herald__items" data-testid="claim-herald-items">${items.map(renderItem).join('')}</div>`
          : '<p class="claim-herald__empty" data-testid="claim-herald-empty">No fresh ink today.</p>'
      }
    </article>
  `;
}

function renderItem(item: HeraldItem): string {
  return `
    <section class="claim-herald__item" data-testid="claim-herald-item">
      <p class="claim-herald__date">${escapeHtml(formatDate(item.date))}</p>
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
