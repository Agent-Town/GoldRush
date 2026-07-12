import type { DemolishCandidate, UpgradeCandidate } from '../systems/BuildSystem';
import type { BuildableId } from '../game/buildables';

export type MegaprojectFundCandidate = {
  title: string;
  stage: number;
  cost: number;
  line: string;
};

export class BuildingContextPrompt {
  private contentKey = '';
  private readonly root = document.createElement('div');
  private readonly icon = document.createElement('span');
  private readonly title = document.createElement('span');
  private readonly loss = document.createElement('span');
  private readonly upgradeButton = document.createElement('button');
  private readonly fundButton = document.createElement('button');
  private readonly demolishButton = document.createElement('button');

  constructor(parent: HTMLElement, onUpgrade: () => void, onDemolish: () => void, onFund: () => void) {
    this.root.className = 'building-context-prompt';
    this.root.dataset.testid = 'building-context-prompt';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-live', 'polite');
    this.root.hidden = true;
    this.icon.className = 'building-context-prompt__icon';
    this.icon.setAttribute('aria-hidden', 'true');
    this.title.className = 'building-context-prompt__title';
    this.loss.className = 'building-context-prompt__loss';
    this.upgradeButton.className = 'building-context-prompt__button building-context-prompt__button--upgrade';
    this.upgradeButton.type = 'button';
    this.upgradeButton.dataset.testid = 'upgrade-confirm';
    this.upgradeButton.addEventListener('click', () => {
      onUpgrade();
      this.upgradeButton.blur();
    });
    this.fundButton.className = 'building-context-prompt__button building-context-prompt__button--fund';
    this.fundButton.type = 'button';
    this.fundButton.dataset.testid = 'stamp-site-fund';
    this.fundButton.hidden = true;
    this.fundButton.addEventListener('click', () => {
      onFund();
      this.fundButton.blur();
    });
    this.demolishButton.className = 'building-context-prompt__button building-context-prompt__button--demolish';
    this.demolishButton.type = 'button';
    this.demolishButton.dataset.testid = 'demolish-confirm';
    this.demolishButton.addEventListener('click', () => {
      onDemolish();
      this.demolishButton.blur();
    });
    this.root.append(this.icon, this.title, this.upgradeButton, this.fundButton, this.demolishButton, this.loss);
    parent.append(this.root);
  }

  update(
    demolish: DemolishCandidate | null,
    upgrade: UpgradeCandidate | null,
    enterEnabled: boolean,
    fund: MegaprojectFundCandidate | null = null,
  ): void {
    const contentKey = fund
      ? `fund:${fund.title}:${fund.stage}:${fund.cost}:${fund.line}:${enterEnabled}`
      : demolish
        ? `building:${demolish.id}:${demolish.index}:${demolish.invested}:${demolish.refund}:${upgrade?.tier ?? 0}:${upgrade?.cost ?? 0}:${upgrade?.canUpgrade ?? false}:${upgrade?.reason ?? 'none'}:${enterEnabled}`
        : 'hidden';
    if (contentKey === this.contentKey) return;
    this.contentKey = contentKey;
    this.root.hidden = demolish === null && fund === null;
    if (fund) {
      this.icon.textContent = 'M';
      this.title.textContent = fund.title;
      this.loss.textContent = fund.line;
      this.upgradeButton.hidden = true;
      this.demolishButton.hidden = true;
      this.fundButton.hidden = false;
      this.fundButton.disabled = false;
      this.fundButton.textContent = `Fund stage ${fund.stage} — ${fund.cost}g${enterEnabled ? ' Enter' : ''}`;
      return;
    }
    this.fundButton.hidden = true;
    this.upgradeButton.hidden = false;
    this.demolishButton.hidden = false;
    if (!demolish) return;
    this.icon.textContent = buildingGlyph(demolish.id);
    this.title.textContent = `${demolish.displayName}${upgrade ? ` · Tier ${upgrade.tier}` : ''}`;
    this.loss.textContent = `invested ${demolish.invested}g → returns ${demolish.refund}g. The timber comes back, the labor doesn't.`;
    this.upgradeButton.disabled = !upgrade?.canUpgrade;
    this.upgradeButton.textContent = upgradeLabel(upgrade);
    this.demolishButton.textContent = `Tear down (+${demolish.refund}g)${enterEnabled ? ' Enter' : ''}`;
  }

  dispose(): void {
    this.root.remove();
  }
}

function upgradeLabel(candidate: UpgradeCandidate | null): string {
  if (!candidate) return 'No tier';
  if (candidate.reason === 'max') return `Tier ${candidate.maxTier} max`;
  if (candidate.reason === 'gated') return `needs science`;
  if (candidate.reason === 'insufficient_gold') return `need ${candidate.cost}g`;
  return `Upgrade to T${candidate.nextTier} (${candidate.cost}g) U`;
}

function buildingGlyph(id: BuildableId): string {
  if (id === 'sluice') return 'S';
  if (id === 'palisade') return 'P';
  if (id === 'turret') return 'T';
  if (id === 'assay_office') return 'A';
  if (id === 'stockpile') return 'Y';
  return 'B';
}
