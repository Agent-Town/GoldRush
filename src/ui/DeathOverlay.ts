import type { ResearchNode } from '../meta/ResearchTree';
import { upgradeDefById } from '../game/Upgrades';

export type DeathLedger = {
  timeAlive: number;
  kills: number;
  goldPanned: number;
  spent: number;
  beaconsBuilt: number;
  wavesSurvived: number;
  weaponToggles: number;
  blastTime: number;
};

export type BestClaimRow = {
  waves: number;
  kills: number;
  gold: number;
  timeAlive: number;
  at: number;
  baseValue?: number;
  weaponSplit?: { spark: number; blast: number };
  secured?: boolean;
  profileName?: string;
  legacy?: boolean;
};

export type DeathRunStatsSnapshot = {
  sluiced: number;
  stolen: number;
  reclaimed: number;
  pannedByProspector: number;
  sluicedByProspector: number;
  reclaimedByProspector: number;
  buildingsBuilt: number;
  buildingsLost: number;
  buildingsRepaired: number;
  damageByOwner: Readonly<Record<string, number>>;
  upgradeStacks: Record<string, number>;
};

export type ScienceMeterView = {
  steps: number;
  remaining: number;
  threshold: number;
  overflow: number;
  complete: boolean;
  text: string;
  bankedText?: string;
};

export type DeathResearchState = {
  totalRounds: number;
  roundsRemaining: number;
  science: ScienceMeterView;
  proposals: readonly ResearchNode[];
  pinnedPath?: readonly string[];
};

export type DeathOverlayOptions = {
  outcome?: 'death' | 'secured';
  actionLabel?: string;
  runStats?: DeathRunStatsSnapshot;
  research?: DeathResearchState;
  onResearchPick?: (id: string) => DeathResearchState;
  onResearchSkip?: () => DeathResearchState;
  onDone?: () => void;
};

export class DeathOverlay {
  private readonly root: HTMLElement;
  private visible = false;
  private options: DeathOverlayOptions = {};
  private lastPicked?: ResearchNode;

  constructor(parent: HTMLElement, private readonly onStakeAgain: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'death-overlay';
    this.root.dataset.testid = 'death-overlay';
    this.root.setAttribute('aria-label', 'Run ledger');
    this.root.setAttribute('aria-hidden', 'true');
    this.root.addEventListener('click', this.handleClick);
    window.addEventListener('keydown', this.handleKeyDown);
    parent.append(this.root);
  }

  show(ledger: DeathLedger, scores: readonly BestClaimRow[] = [], currentAt = 0, options: DeathOverlayOptions = {}): void {
    this.visible = true;
    this.options = options;
    this.lastPicked = undefined;
    this.root.innerHTML = this.render(ledger, scores, currentAt);
    this.root.classList.add('death-overlay--visible');
    this.root.setAttribute('aria-hidden', 'false');
    this.root.querySelector<HTMLButtonElement>('[data-research-id], [data-testid="stake-again"]')?.focus({ preventScroll: true });
  }

  hide(): void {
    this.visible = false;
    this.options = {};
    this.root.classList.remove('death-overlay--visible');
    this.root.setAttribute('aria-hidden', 'true');
  }

  dispose(): void {
    this.root.removeEventListener('click', this.handleClick);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.root.remove();
  }

  private render(ledger: DeathLedger, scores: readonly BestClaimRow[], currentAt: number): string {
    const secured = this.options.outcome === 'secured';
    const runStats = this.runStats();
    const flavor = secured
      ? 'The assay is sealed. The town kept thinking.'
      : 'The claim was overrun. The gold remembers.';
    return `
      <div class="death-overlay__panel">
        <p class="death-overlay__eyebrow">${secured ? 'Claim Secured' : 'The claim went quiet.'}</p>
        <h1>Run Ledger</h1>
        <p class="death-overlay__flavor">${flavor}</p>
        <dl class="death-overlay__ledger">
          <div>
            <dt>Time Held</dt>
            <dd data-death-time>${this.formatTime(ledger.timeAlive)}</dd>
          </div>
          <div>
            <dt>Claim Jumpers Turned Back</dt>
            <dd data-death-kills>${ledger.kills}</dd>
          </div>
          <div>
            <dt>Waves Survived</dt>
            <dd data-death-waves>${ledger.wavesSurvived}</dd>
          </div>
          <div>
            <dt>Gold Panned</dt>
            <dd data-death-gold>${this.formatActorSplit(ledger.goldPanned, runStats.pannedByProspector, 'summary-gold-panned-split')}</dd>
          </div>
          <div>
            <dt>Gold Sluiced</dt>
            <dd data-death-sluiced>${this.formatActorSplit(runStats.sluiced, runStats.sluicedByProspector, 'summary-gold-sluiced-split')}</dd>
          </div>
          <div>
            <dt>Stolen / Reclaimed</dt>
            <dd data-death-stolen>${runStats.stolen} / ${this.formatActorSplit(
              runStats.reclaimed,
              runStats.reclaimedByProspector,
              'summary-gold-reclaimed-split',
            )}</dd>
          </div>
          <div>
            <dt>Spent</dt>
            <dd data-death-spent>${ledger.spent}</dd>
          </div>
          <div>
            <dt>Beacons Built</dt>
            <dd data-death-beacons-built>${ledger.beaconsBuilt}</dd>
          </div>
          <div>
            <dt>Buildings Built / Lost / Repaired</dt>
            <dd data-death-buildings>${runStats.buildingsBuilt} / ${runStats.buildingsLost} / ${runStats.buildingsRepaired}</dd>
          </div>
          <div>
            <dt>Spark / Blast Damage</dt>
            <dd data-death-damage>${runStats.sparkDamage} / ${runStats.blastDamage}</dd>
          </div>
          <div>
            <dt>Blast Toggles</dt>
            <dd data-death-weapon-toggles>${ledger.weaponToggles}</dd>
          </div>
          <div>
            <dt>Blast Charge Time</dt>
            <dd data-death-blast-time>${this.formatTime(ledger.blastTime)}</dd>
          </div>
          <div>
            <dt>Upgrades Taken</dt>
            <dd data-death-upgrades>${this.escape(runStats.upgradeFamilies)}</dd>
          </div>
        </dl>
        ${this.renderScienceFooter()}
        ${this.renderResearch()}
        <section class="death-overlay__scores" aria-label="Best Claims">
          <h2>Best Claims</h2>
          <ol data-best-claims>${this.renderScores(scores, currentAt)}</ol>
        </section>
        <button class="death-overlay__button" type="button" data-testid="stake-again" data-action="finish">${
          this.options.actionLabel ?? 'Try Again'
        }</button>
      </div>
    `;
  }

  private renderScienceFooter(): string {
    const meter = this.options.research?.science;
    if (!meter) return '';
    return `<p class="death-overlay__science" data-testid="science-meter">${this.escape(meter.text)}${
      meter.bankedText ? ` <span data-testid="science-banked">${this.escape(meter.bankedText)}</span>` : ''
    }</p>`;
  }

  private renderResearch(): string {
    const research = this.options.research;
    if (!research) return '';
    const round = Math.max(1, research.totalRounds - research.roundsRemaining + 1);
    const proposals = research.proposals.slice(0, 2);
    const done = research.roundsRemaining <= 0 || proposals.length === 0;
    const receipt = this.lastPicked
      ? `<p data-testid="research-receipt">The Elder logs it: ${this.escape(this.lastPicked.effect)}</p>`
      : '';
    if (done) {
      return `
        <section class="research-ledger" data-testid="research-overlay" aria-label="Research proposal">
          <p class="research-ledger__eyebrow">Schoolhouse Notes</p>
          <h2>Science Banked</h2>
          ${receipt || '<p>The Elder folds the note into the town ledger.</p>'}
        </section>
      `;
    }

    return `
      <section class="research-ledger" data-testid="research-overlay" aria-label="Research proposal">
        <p class="research-ledger__eyebrow">Research pick ${round} of ${research.totalRounds}</p>
        <h2>The Elder proposes...</h2>
        ${receipt}
        <div class="research-ledger__cards">
          ${proposals
            .map(
              (node, index) => `
                <button class="research-card" type="button" data-testid="research-card-${index}" data-research-id="${this.escape(
                  node.id,
                )}">
                  <span class="research-card__key">${index + 1}</span>
                  <span class="research-card__branch" data-testid="research-branch-${index}">Advances ${this.escape(
                    this.researchBranchLabel(node.branch),
                  )}</span>
                  <strong>${this.escape(node.name)}</strong>
                  <span>${this.escape(node.description)}</span>
                  <span data-testid="research-effect-${index}">Effect: ${this.escape(node.effect)}</span>
                  ${
                    research.pinnedPath?.includes(node.id)
                      ? `<span class="research-card__pin-hint" data-testid="research-pin-hint-${index}">on your surveyed route</span>`
                      : ''
                  }
                </button>
              `,
            )
            .join('')}
        </div>
        <p class="research-ledger__skip">Skip banks nothing.</p>
      </section>
    `;
  }

  private renderScores(scores: readonly BestClaimRow[], currentAt: number): string {
    if (scores.length === 0) return '<li class="death-overlay__score death-overlay__score--empty">No claims logged yet.</li>';

    return scores
      .map((score) => {
        const current = score.at === currentAt;
        return `
          <li class="death-overlay__score ${current ? 'death-overlay__score--current' : ''}" data-testid="best-claim-row"${
            current ? ' data-current-run="true"' : ''
          }>
            <span class="death-overlay__score-summary">wave ${score.waves} · ${this.formatBase(score.baseValue)}</span>
            <strong class="death-overlay__score-stamp">${score.secured ? 'SECURED' : 'OVERRUN'}</strong>
            <span class="death-overlay__score-detail">${this.escape(score.profileName ?? 'Robin')} · ${
              score.waves
            } waves · ${this.formatTime(score.timeAlive)} · ${score.kills} turned back · ${score.gold} gold · spark ${
              Math.round(score.weaponSplit?.spark ?? 0)
            } / blast ${Math.round(score.weaponSplit?.blast ?? 0)}${score.legacy ? ' · legacy' : ''}</span>
          </li>
        `;
      })
      .join('');
  }

  private runStats(): {
    sluiced: number;
    stolen: number;
    reclaimed: number;
    pannedByProspector: number;
    sluicedByProspector: number;
    reclaimedByProspector: number;
    buildingsBuilt: number;
    buildingsLost: number;
    buildingsRepaired: number;
    sparkDamage: number;
    blastDamage: number;
    upgradeFamilies: string;
  } {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const summary = diagnostics?.economy.summary;
    const snapshot = this.options.runStats;
    const damage = snapshot?.damageByOwner ?? diagnostics?.build.damageByOwner ?? {};
    return {
      sluiced: Math.round(snapshot?.sluiced ?? summary?.sluiced ?? 0),
      stolen: Math.round(snapshot?.stolen ?? summary?.stolen ?? diagnostics?.steal.stolenTotal ?? 0),
      reclaimed: Math.round(snapshot?.reclaimed ?? summary?.reclaimed ?? diagnostics?.steal.reclaimedTotal ?? 0),
      pannedByProspector: Math.round(snapshot?.pannedByProspector ?? summary?.pannedByProspector ?? 0),
      sluicedByProspector: Math.round(snapshot?.sluicedByProspector ?? summary?.sluicedByProspector ?? 0),
      reclaimedByProspector: Math.round(snapshot?.reclaimedByProspector ?? summary?.reclaimedByProspector ?? 0),
      buildingsBuilt: Math.round(snapshot?.buildingsBuilt ?? summary?.buildingsBuilt ?? 0),
      buildingsLost: Math.round(snapshot?.buildingsLost ?? diagnostics?.wreck.wrecked ?? 0),
      buildingsRepaired: Math.round(snapshot?.buildingsRepaired ?? summary?.repairs ?? diagnostics?.wreck.repairs ?? 0),
      sparkDamage: Math.round(damage.hero ?? 0),
      blastDamage: Math.round(damage.hero_blast ?? 0),
      upgradeFamilies: this.upgradeFamilies(snapshot?.upgradeStacks ?? diagnostics?.progression.stacks ?? {}),
    };
  }

  private upgradeFamilies(stacks: Record<string, number>): string {
    const families = new Map<string, number>();
    for (const [id, count] of Object.entries(stacks)) {
      if (count <= 0) continue;
      const family = upgradeDefById[id]?.iconFamily ?? 'other';
      families.set(family, (families.get(family) ?? 0) + count);
    }
    if (families.size === 0) return 'none';
    return [...families.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([family, count]) => `${family} ${count}`)
      .join(' · ');
  }

  private formatBase(value: number | undefined): string {
    const baseValue = Math.round(value ?? 0);
    return baseValue > 0 ? `${baseValue}g base` : 'baseless';
  }

  private formatActorSplit(total: number, prospector: number, testId: string): string {
    if (prospector <= 0) return `${total}`;
    return `<span data-testid="${testId}">you ${total - prospector} / the Prospector ${prospector}</span>`;
  }

  private readonly handleClick = (event: MouseEvent) => {
    if (!this.visible) return;
    const target = event.target as HTMLElement;
    const researchButton = target.closest<HTMLElement>('[data-research-id]');
    if (researchButton?.dataset.researchId && this.options.onResearchPick) {
      const picked = this.options.research?.proposals.find((node) => node.id === researchButton.dataset.researchId);
      this.pickResearch(researchButton.dataset.researchId, picked);
      return;
    }

    if (target.closest('[data-action="finish"]')) this.finish();
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.visible) return;
    const index = event.code === 'Digit1' ? 0 : event.code === 'Digit2' ? 1 : -1;
    const proposal = index >= 0 ? this.options.research?.proposals[index] : undefined;
    if (proposal && this.options.onResearchPick) {
      event.preventDefault();
      this.pickResearch(proposal.id, proposal);
      return;
    }
    if (event.code !== 'KeyR') return;
    event.preventDefault();
    this.finish();
  };

  private rerenderResearch(): void {
    const research = this.root.querySelector<HTMLElement>('[data-testid="research-overlay"]');
    if (research) research.outerHTML = this.renderResearch();
    const meter = this.root.querySelector<HTMLElement>('[data-testid="science-meter"]');
    if (meter && this.options.research) meter.textContent = this.options.research.science.text;
    this.root.querySelector<HTMLButtonElement>('[data-research-id], [data-testid="stake-again"]')?.focus({ preventScroll: true });
  }

  private pickResearch(id: string, picked?: ResearchNode): void {
    if (picked) this.lastPicked = picked;
    this.options.research = this.options.onResearchPick?.(id) ?? this.options.research;
    this.rerenderResearch();
  }

  private researchBranchLabel(branch: ResearchNode['branch']): string {
    if (branch === 'Prospecting Works') return 'economy';
    if (branch === 'Arsenal Works') return 'arsenal';
    return 'crafting-agent';
  }

  private finish(): void {
    if ((this.options.research?.roundsRemaining ?? 0) > 0) {
      this.options.research = this.options.onResearchSkip?.() ?? this.options.research;
    }
    if (this.options.onDone) {
      this.options.onDone();
      return;
    }
    this.onStakeAgain();
  }

  private formatTime(secondsAlive: number): string {
    const minutes = Math.floor(secondsAlive / 60).toString().padStart(2, '0');
    const seconds = Math.floor(secondsAlive % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
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
