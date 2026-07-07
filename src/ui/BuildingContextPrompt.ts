import type { DemolishCandidate, UpgradeCandidate } from '../systems/BuildSystem';
import type { BuildableId } from '../game/buildables';

export class BuildingContextPrompt {
  private readonly root = document.createElement('div');
  private readonly icon = document.createElement('span');
  private readonly title = document.createElement('span');
  private readonly loss = document.createElement('span');
  private readonly upgradeButton = document.createElement('button');
  private readonly demolishButton = document.createElement('button');

  constructor(parent: HTMLElement, onUpgrade: () => void, onDemolish: () => void) {
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
    this.demolishButton.className = 'building-context-prompt__button building-context-prompt__button--demolish';
    this.demolishButton.type = 'button';
    this.demolishButton.dataset.testid = 'demolish-confirm';
    this.demolishButton.addEventListener('click', () => {
      onDemolish();
      this.demolishButton.blur();
    });
    this.root.append(this.icon, this.title, this.upgradeButton, this.demolishButton, this.loss);
    parent.append(this.root);
  }

  update(demolish: DemolishCandidate | null, upgrade: UpgradeCandidate | null, enterEnabled: boolean): void {
    this.root.hidden = demolish === null;
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
