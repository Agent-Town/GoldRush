import type { AgentAbility } from '../agent/AgentConsent';
import { AGENT_PERMISSION_LABELS, type AgentPermissionLevel } from '../agent/PermissionLadder';
import type { UiIntent } from './Hud';
import type { UiSnapshot } from '../systems/UiBridge';
import type { AgentCapability } from '../agent/ToolSurface';

const RUNGS: readonly {
  level: AgentPermissionLevel;
  unlock: string;
}[] = [
  { level: 0, unlock: 'watches the claim and suggests work' },
  { level: 1, unlock: 'acts with your approval &mdash; repairs, pickups' },
  { level: 2, unlock: 'routine work unattended' },
  { level: 3, unlock: 'spends within a budget' },
];

export class ProspectorPanel {
  readonly element = document.createElement('div');
  private snapshot: UiSnapshot | null = null;
  private renderKey = '';

  constructor(
    private readonly portraitUrl: () => string,
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
      autonomyTrack: agent?.autonomyTrack ?? 0,
      policySlotBonus: agent?.policySlotBonus ?? 0,
      receipts: agent?.receiptFeed ?? [],
      consent: agent?.consent ?? null,
      capabilities: agent?.capabilities ?? [],
    });
    if (!force && key === this.renderKey) return;
    this.renderKey = key;
    const portraitUrl = this.portraitUrl();

    const level = agent?.permissionLevel ?? 0;
    const receipts = agent?.receiptFeed ?? [];
    const latestReceipt = receipts[0] ?? 'No chores logged yet.';
    const previousReceipts = this.element.querySelector<HTMLDetailsElement>('[data-testid="prospector-receipts-wrap"]');
    const defaultReceiptsOpen =
      typeof window === 'undefined' || !window.matchMedia('(pointer: coarse), (max-width: 760px)').matches;
    const receiptsOpen = previousReceipts?.open ?? defaultReceiptsOpen;
    this.element.innerHTML = `
      <section class="prospector-panel" data-testid="prospector-panel" aria-label="Prospector ledger">
        <header class="prospector-panel__header">
          <img class="prospector-panel__portrait" ${portraitUrl ? `src="${portraitUrl}"` : ''} alt="" />
          <div>
            <p class="prospector-panel__eyebrow">Claim partner</p>
            <h2>${agent?.name ?? 'the Prospector'}</h2>
            <p>Agent level ${level}: ${agent?.permissionLabel ?? 'suggest-only'}</p>
            <p class="prospector-panel__progress" data-testid="prospector-autonomy">${this.autonomyLine(
              agent?.autonomyTrack ?? 0,
              agent?.policySlotBonus ?? 0,
            )}</p>
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
          <details class="prospector-receipts-wrap" data-testid="prospector-receipts-wrap" ${receiptsOpen ? 'open' : ''}>
            <summary>
              <span>Receipts</span>
              <strong>${escapeHtml(latestReceipt)}</strong>
            </summary>
            <ol class="prospector-receipts" data-testid="prospector-receipts">
              ${receipts.length ? receipts.map((line) => `<li>${escapeHtml(line)}</li>`).join('') : '<li>No chores logged yet.</li>'}
            </ol>
          </details>
        </div>
      </section>
    `;
  }

  private rung(rung: (typeof RUNGS)[number]): string {
    const state = this.snapshot?.agent?.consent.rungs[rung.level];
    const earned = state?.earned ?? rung.level === 0;
    const granted = state?.granted ?? true;
    const current = (this.snapshot?.agent?.permissionLevel ?? 0) === rung.level;
    const control = earned
      ? `<label class="prospector-switch">
          <input type="checkbox" role="switch" data-prospector-rung="${rung.level}" data-testid="prospector-rung-toggle-${rung.level}" ${granted ? 'checked' : ''} />
          <span>${granted ? 'Granted' : 'Revoked'}</span>
        </label>`
      : `<p class="prospector-panel__hint">Earned at agent level ${rung.level}. Claim victories grow the trust track.</p>`;
    return `
      <div class="prospector-rung" data-testid="prospector-rung-${rung.level}" data-earned="${earned}" data-current="${current}">
        <div>
          <strong>L${rung.level} ${AGENT_PERMISSION_LABELS[rung.level]}</strong>
          ${current ? '<span class="prospector-rung__current">Current rung</span>' : ''}
          <span>${rung.unlock}</span>
        </div>
        ${control}
      </div>
    `;
  }

  private abilities(): string {
    const consent = this.snapshot?.agent?.consent;
    const capabilities = this.snapshot?.agent?.capabilities ?? [];
    if (capabilities.length === 0) return '<p class="prospector-panel__hint">No chores are wired yet.</p>';
    if ((this.snapshot?.agent?.permissionLevel ?? 0) === 0) {
      return capabilities.map((ability) => this.lockedAbility(ability)).join('');
    }
    const earned = capabilities.filter((ability) => consent?.abilities[ability.id].earned);
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

  private lockedAbility(ability: AgentCapability): string {
    const level = ability.level;
    const label = AGENT_PERMISSION_LABELS[level];
    return `
      <div class="prospector-check prospector-check--locked" data-testid="prospector-ability-${ability.id}" data-allowed="false">
        <span class="prospector-lock" aria-hidden="true">&#128274;</span>
        <span>${ability.label}<br /><small>needs ${label} (rung ${level})</small></span>
      </div>
    `;
  }

  private autonomyLine(track: number, policySlotBonus: number): string {
    const current = cleanTrack(track);
    const next = current >= 3 ? 3 : Math.floor(current) + 1;
    const bonus = Math.max(0, Math.floor(policySlotBonus));
    const bonusCopy = bonus > 0 ? ` (+${bonus} policy ${bonus === 1 ? 'slot' : 'slots'} this run)` : '';
    return `Autonomy: ${formatTrack(Math.min(current, 3))} / ${formatTrack(
      next,
    )}${bonusCopy} &mdash; secured claims advance the Prospector`;
  }

  private readonly onClick = (event: MouseEvent) => {
    const target = event.target;
    if (target instanceof Element && target.closest('.prospector-check--locked')) {
      void import('../story').then(({ emitStorySignal }) => emitStorySignal({ type: 'rung-denied-toggle' }));
      return;
    }
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

function cleanTrack(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatTrack(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}.0` : String(rounded);
}
