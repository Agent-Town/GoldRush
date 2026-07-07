import type { AgentAbility } from '../agent/AgentConsent';
import { AGENT_ABILITIES } from '../agent/AgentConsent';
import type { AgentPermissionLevel } from '../agent/PermissionLadder';
import type { UiIntent } from './Hud';
import type { UiSnapshot } from '../systems/UiBridge';

const RUNGS: readonly {
  level: AgentPermissionLevel;
  title: string;
  work: string;
}[] = [
  { level: 0, title: 'suggest-only', work: 'watches, comments' },
  { level: 1, title: 'collect & carry', work: 'XP motes, dropped gold' },
  { level: 2, title: 'tend & repair', work: 'walls, buildings' },
  { level: 3, title: 'work the claim', work: 'pan, haul to stockpile' },
];

export class ProspectorPanel {
  readonly element = document.createElement('div');
  private snapshot: UiSnapshot | null = null;
  private renderKey = '';

  constructor(
    private readonly portraitUrl: string,
    private readonly onIntent: (intent: UiIntent) => void,
    private readonly onClose: () => void,
  ) {
    this.element.className = 'prospector-panel-shell';
    this.element.hidden = true;
    this.element.addEventListener('click', this.onClick);
    this.element.addEventListener('change', this.onChange);
  }

  update(snapshot: UiSnapshot): void {
    this.snapshot = snapshot;
    if (!this.element.hidden) this.render();
  }

  setOpen(open: boolean): void {
    this.element.hidden = !open;
    if (open) this.render(true);
  }

  dispose(): void {
    this.element.removeEventListener('click', this.onClick);
    this.element.removeEventListener('change', this.onChange);
    this.element.remove();
  }

  private render(force = false): void {
    const agent = this.snapshot?.agent;
    const key = JSON.stringify({
      level: agent?.permissionLevel ?? 0,
      label: agent?.permissionLabel ?? 'suggest-only',
      receipts: agent?.receiptFeed ?? [],
      consent: agent?.consent ?? null,
    });
    if (!force && key === this.renderKey) return;
    this.renderKey = key;

    const level = agent?.permissionLevel ?? 0;
    const receipts = agent?.receiptFeed ?? [];
    this.element.innerHTML = `
      <section class="prospector-panel" data-testid="prospector-panel" aria-label="Prospector ledger">
        <header class="prospector-panel__header">
          <img class="prospector-panel__portrait" src="${this.portraitUrl}" alt="" />
          <div>
            <p class="prospector-panel__eyebrow">Claim partner</p>
            <h2>${agent?.name ?? 'the Prospector'}</h2>
            <p>Agent level ${level}: ${agent?.permissionLabel ?? 'suggest-only'}</p>
          </div>
          <button class="prospector-panel__close" type="button" data-prospector-close aria-label="Close Prospector ledger">X</button>
        </header>
        <div class="prospector-panel__section" data-testid="prospector-ladder">
          <h3>Trust ladder</h3>
          <div class="prospector-ladder">${RUNGS.map((rung) => this.rung(rung)).join('')}</div>
        </div>
        <div class="prospector-panel__section" data-testid="prospector-abilities">
          <h3>At this level</h3>
          <div class="prospector-abilities">${this.abilities()}</div>
        </div>
        <div class="prospector-panel__section">
          <h3>Receipts</h3>
          <ol class="prospector-receipts" data-testid="prospector-receipts">
            ${receipts.length ? receipts.map((line) => `<li>${escapeHtml(line)}</li>`).join('') : '<li>No chores logged yet.</li>'}
          </ol>
        </div>
      </section>
    `;
  }

  private rung(rung: (typeof RUNGS)[number]): string {
    const state = this.snapshot?.agent?.consent.rungs[rung.level];
    const earned = state?.earned ?? rung.level === 0;
    const granted = state?.granted ?? true;
    const control = earned
      ? `<label class="prospector-switch">
          <input type="checkbox" role="switch" data-prospector-rung="${rung.level}" data-testid="prospector-rung-toggle-${rung.level}" ${granted ? 'checked' : ''} />
          <span>${granted ? 'Granted' : 'Revoked'}</span>
        </label>`
      : `<p class="prospector-panel__hint">Earned at agent level ${rung.level}. Claim victories grow the trust track.</p>`;
    return `
      <div class="prospector-rung" data-testid="prospector-rung-${rung.level}" data-earned="${earned}">
        <div>
          <strong>L${rung.level} ${rung.title}</strong>
          <span>${rung.work}</span>
        </div>
        ${control}
      </div>
    `;
  }

  private abilities(): string {
    const consent = this.snapshot?.agent?.consent;
    const earned = AGENT_ABILITIES.filter((ability) => consent?.abilities[ability.id].earned);
    if (earned.length === 0) return '<p class="prospector-panel__hint">Claim victories open the first chore trust.</p>';
    return earned
      .map((ability) => {
        const state = consent?.abilities[ability.id];
        const granted = state?.granted ?? true;
        const allowed = state?.allowed ?? false;
        return `
          <label class="prospector-check" data-allowed="${allowed}">
            <input type="checkbox" data-prospector-ability="${ability.id}" data-testid="prospector-ability-${ability.id}" ${granted ? 'checked' : ''} />
            <span>${ability.label}</span>
          </label>
        `;
      })
      .join('');
  }

  private readonly onClick = (event: MouseEvent) => {
    const target = event.target;
    if (target === this.element || (target instanceof Element && target.matches('[data-prospector-close]'))) this.onClose();
  };

  private readonly onChange = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const rung = target.dataset.prospectorRung;
    if (rung !== undefined) {
      this.onIntent({ type: 'set_agent_rung', level: Number(rung) as AgentPermissionLevel, granted: target.checked });
      return;
    }
    const ability = target.dataset.prospectorAbility as AgentAbility | undefined;
    if (ability) {
      this.onIntent({ type: 'set_agent_ability', ability, granted: target.checked });
    }
  };
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
