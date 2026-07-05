import type { UiSnapshot } from '../systems/UiBridge';
import type { UiIntent } from './Hud';

const buildPortraitUrls = import.meta.glob<string>(
  [
    '../../assets/processed/bld-sentry-beacon.png',
    '../../assets/processed/bld-palisade.png',
    '../../assets/processed/bld-sluice-works.png',
    '../../assets/processed/bld-stockpile-yard.png',
    '../../assets/processed/bld-signal-turret.png',
  ],
  {
    query: '?url',
    import: 'default',
  },
);
const buildPortraitUrlBySlug = new Map(
  Object.entries(buildPortraitUrls).map(([path, urlLoader]) => [
    (path.split('/').pop() ?? '').replace(/^bld-/, '').replace(/\.png$/, ''),
    urlLoader,
  ]),
);

export class BuildButton {
  readonly element: HTMLDivElement;

  private readonly menu: HTMLDivElement;
  private readonly trigger: HTMLButtonElement;
  private menuOpen = false;
  private menuSignature = '';

  constructor(private readonly onIntent: (intent: UiIntent) => void) {
    this.element = document.createElement('div');
    this.element.className = 'hud-build-control';
    this.element.innerHTML = `
      <div class="hud-build-menu" data-testid="hud-build-menu" hidden></div>
      <button class="hud-build-button" type="button" data-testid="hud-build" aria-haspopup="menu">
        Build
      </button>
    `;
    this.menu = this.get<HTMLDivElement>('[data-testid="hud-build-menu"]');
    this.trigger = this.get<HTMLButtonElement>('[data-testid="hud-build"]');
    this.trigger.addEventListener('click', this.onClick);
    this.menu.addEventListener('click', this.onMenuClick);
    document.addEventListener('pointerdown', this.onDocumentPointerDown);
  }

  update(snapshot: UiSnapshot): void {
    this.menuOpen = snapshot.buildMenuOpen;
    const allBlocked = snapshot.buildables.every((item) => !item.canAfford && item.count >= item.maxCount);
    this.trigger.textContent = snapshot.buildMode || snapshot.buildMenuOpen ? 'Build - Close' : 'Build';
    this.trigger.disabled = allBlocked;
    this.trigger.setAttribute('aria-expanded', String(snapshot.buildMenuOpen));
    this.trigger.setAttribute('aria-pressed', String(snapshot.buildMode));
    this.trigger.dataset.active = String(snapshot.buildMode || snapshot.buildMenuOpen);
    this.menu.hidden = !snapshot.buildMenuOpen;
    const menuSignature = snapshot.buildables
      .map(
        (item) =>
          `${item.id}:${item.cost}:${item.count}:${item.maxCount}:${item.canAfford}:${item.selected}:${item.iconSlot}:${item.portraitSlug ?? ''}:${item.blurb ?? ''}`,
      )
      .join('|');
    if (menuSignature !== this.menuSignature) {
      this.menuSignature = menuSignature;
      this.menu.innerHTML = snapshot.buildables
        .map(
          (item, index) => `
          <button
            class="hud-build-tile"
            type="button"
            role="menuitem"
            data-buildable-id="${item.id}"
            data-slot="${item.iconSlot}"
            data-icon-slug="${item.portraitSlug ?? ''}"
            data-testid="hud-build-tile-${item.id}"
            data-selected="${item.selected}"
            title="${this.escape(item.blurb ?? item.displayName)}"
            ${item.canAfford ? '' : 'disabled'}
          >
            <span class="hud-build-tile__icon" aria-hidden="true"></span>
            <span class="hud-build-tile__copy">
              <span class="hud-build-tile__key">${index + 1}</span>
              <span class="hud-build-tile__name">${this.escape(item.displayName)}</span>
              <span class="hud-build-tile__meta">${item.count}/${item.maxCount} - ${item.cost}g</span>
            </span>
          </button>
        `,
        )
        .join('');
      this.applyPortraits();
    }
  }

  dispose(): void {
    this.trigger.removeEventListener('click', this.onClick);
    this.menu.removeEventListener('click', this.onMenuClick);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown);
  }

  private readonly onClick = (): void => {
    this.onIntent({ type: 'toggle_build_menu' });
  };

  private readonly onMenuClick = (event: MouseEvent): void => {
    const tile = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-buildable-id]');
    if (!tile || tile.disabled) return;
    this.onIntent({ type: 'select_buildable', id: tile.dataset.buildableId ?? '' });
  };

  private readonly onDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.menuOpen) return;
    if (event.target instanceof Node && this.element.contains(event.target)) return;
    this.onIntent({ type: 'close_build_menu' });
  };

  private get<T extends HTMLElement>(selector: string): T {
    const element = this.element.querySelector<T>(selector);
    if (!element) throw new Error(`Missing build control element: ${selector}`);
    return element;
  }

  private applyPortraits(): void {
    this.menu.querySelectorAll<HTMLButtonElement>('[data-icon-slug]').forEach((tile) => {
      const slug = tile.dataset.iconSlug;
      const icon = tile.querySelector<HTMLElement>('.hud-build-tile__icon');
      if (!slug || !icon) return;
      const urlLoader = buildPortraitUrlBySlug.get(slug);
      if (!urlLoader) return;
      void urlLoader().then((url) => {
        if (tile.dataset.iconSlug !== slug) return;
        icon.style.backgroundImage = `url("${url}")`;
        tile.classList.add('hud-build-tile--icon');
      });
    });
  }

  private escape(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '"') return '&quot;';
      return '&#39;';
    });
  }
}
