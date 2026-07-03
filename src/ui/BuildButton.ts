import type { UiSnapshot } from '../systems/UiBridge';
import type { UiIntent } from './Hud';

export class BuildButton {
  readonly element: HTMLButtonElement;

  constructor(private readonly onIntent: (intent: UiIntent) => void) {
    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = 'hud-build-button';
    this.element.dataset.testid = 'hud-build';
    this.element.addEventListener('click', this.onClick);
  }

  update(snapshot: UiSnapshot): void {
    const atCap = snapshot.beaconCount >= snapshot.beaconMax;
    this.element.textContent = atCap ? 'Beacon - Max' : `Beacon - ${snapshot.nextBeaconCost}g`;
    this.element.disabled = atCap || !snapshot.canAffordBeacon;
    this.element.setAttribute('aria-pressed', String(snapshot.buildMode));
    this.element.dataset.active = String(snapshot.buildMode);
  }

  dispose(): void {
    this.element.removeEventListener('click', this.onClick);
  }

  private readonly onClick = (): void => {
    this.onIntent({ type: 'toggle_build' });
  };
}
