import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { charterLineageRootId } from '../charter/CharterSchema';
import { stampCharter } from '../charter/CharterStamp';
import { getPostCreditsCharter } from '../charter/TheRiver';
import { Balance } from '../game/Balance';
import { stageCharterLaunch } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';

const ARK_ASSETS = [
  new URL('../../assets/pilots/ark-plaza-e10-3d/ark-plaza-e10.glb', import.meta.url).href,
  new URL('../../assets/pilots/ark-deck-era-dressing-e10-3d/ark-deck-era-dressing-e10.glb', import.meta.url).href,
] as const;

type FinaleState = 'idle' | 'reinking' | 'offered' | 'launched';

export type E10FinaleDiagnostics = {
  enabled: boolean;
  ark: {
    sceneClass: string;
    tileId: string;
    deckCount: number;
    loadState: 'off' | 'loading' | 'ready' | 'failed';
    models: string[];
    renderOnly: true;
    visualY: true;
  };
  reink: { state: FinaleState; progress: number; renderOnly: true };
  riverOffer: { offered: boolean; charterName: 'The River'; launchTemplate: 'the-claim' };
};

/** E10's render-side capstone: the accepted Ark deck, then color returning
 * before the existing Press charter takes over. It never writes sim state. */
export class E10FinaleSystem {
  private readonly group = new THREE.Group();
  private readonly overlay = document.createElement('div');
  private readonly models: THREE.Object3D[] = [];
  private loadState: E10FinaleDiagnostics['ark']['loadState'];
  private state: FinaleState = 'idle';
  private reinkStartedAt = 0;
  private timer = 0;
  private frame = 0;
  private disposed = false;
  private previousFilter = '';
  private previousTransition = '';

  constructor(
    private readonly scene: THREE.Scene,
    private readonly canvas: HTMLCanvasElement,
    private readonly config: { enabled: boolean; sceneClass: string; tileId: string; deckCount: number },
  ) {
    this.group.name = 'E10ArkDeckStage';
    this.group.userData.sceneClass = config.sceneClass;
    this.group.userData.renderOnly = true;
    this.overlay.dataset.testid = 'e10-finale-layer';
    this.overlay.hidden = true;
    this.overlay.style.cssText = 'position:fixed;inset:0;z-index:90;place-items:center;padding:24px;background:radial-gradient(circle,rgba(22,43,48,.18),rgba(12,17,25,.82));color:#fff8e8;text-align:center;font-family:Georgia,serif;pointer-events:none;';
    document.body.append(this.overlay);
    this.loadState = config.enabled ? 'loading' : 'off';
    if (!config.enabled) return;
    this.scene.add(this.group);
    void this.loadArk();
  }

  get enabled(): boolean {
    return this.config.enabled;
  }

  diagnostics(): E10FinaleDiagnostics {
    const durationMs = Math.max(1, Balance.e10Finale.reinkSeconds * 1000);
    const progress = this.state === 'idle' ? 0 : this.state === 'reinking'
      ? Math.min(1, (performance.now() - this.reinkStartedAt) / durationMs)
      : 1;
    return {
      enabled: this.enabled,
      ark: {
        sceneClass: this.config.sceneClass,
        tileId: this.config.tileId,
        deckCount: this.config.deckCount,
        loadState: this.loadState,
        models: this.models.map((model) => model.name),
        renderOnly: true,
        visualY: true,
      },
      reink: { state: this.state, progress, renderOnly: true },
      riverOffer: { offered: this.state === 'offered', charterName: 'The River', launchTemplate: 'the-claim' },
    };
  }

  closeFinale(onTown: () => void): boolean {
    if (!this.enabled || this.state !== 'idle') return false;
    this.state = 'reinking';
    this.reinkStartedAt = performance.now();
    this.overlay.hidden = false;
    this.overlay.style.display = 'grid';
    this.overlay.style.pointerEvents = 'none';
    this.overlay.innerHTML = '<section aria-live="polite"><p style="letter-spacing:.18em">THE RE-INKING</p><h1>Deck by deck. Instrument by instrument.</h1><p>The world remembers its color.</p></section>';
    this.previousFilter = this.canvas.style.filter;
    this.previousTransition = this.canvas.style.transition;
    this.canvas.style.filter = 'grayscale(1)';
    this.frame = requestAnimationFrame(() => {
      this.canvas.style.transition = `filter ${Math.max(0, Balance.e10Finale.reinkSeconds)}s ease-out`;
      this.canvas.style.filter = 'grayscale(0)';
    });
    this.timer = window.setTimeout(
      () => this.offerRiver(onTown),
      Math.max(0, (Balance.e10Finale.reinkSeconds + Balance.e10Finale.offerDelaySeconds) * 1000),
    );
    return true;
  }

  dispose(): void {
    this.disposed = true;
    window.clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
    this.canvas.style.filter = this.previousFilter;
    this.canvas.style.transition = this.previousTransition;
    this.overlay.remove();
    this.scene.remove(this.group);
    for (const model of this.models) disposeObject3D(model);
    this.models.length = 0;
  }

  private async loadArk(): Promise<void> {
    const loader = new GLTFLoader();
    let plaza: THREE.Object3D | undefined;
    try {
      plaza = (await loader.loadAsync(ARK_ASSETS[0])).scene;
      const dressing = (await loader.loadAsync(ARK_ASSETS[1])).scene;
      if (this.disposed) {
        disposeObject3D(plaza);
        disposeObject3D(dressing);
        return;
      }
      plaza.name = 'E10ArkPlaza';
      dressing.name = 'E10ArkDeckDressing';
      for (const model of [plaza, dressing]) {
        model.userData.renderOnly = true;
        model.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (mesh.isMesh) mesh.receiveShadow = true;
        });
        this.group.add(model);
        this.models.push(model);
      }
      this.loadState = 'ready';
    } catch {
      if (plaza) disposeObject3D(plaza);
      this.loadState = 'failed';
    }
  }

  private offerRiver(onTown: () => void): void {
    if (this.disposed) return;
    this.state = 'offered';
    this.overlay.style.pointerEvents = 'auto';
    this.overlay.innerHTML = `
      <section role="dialog" aria-modal="true" aria-labelledby="e10-finale-title" style="max-width:560px;padding:28px;border:2px solid #d6a84c;border-radius:12px;background:rgba(21,29,35,.94);box-shadow:0 14px 50px #000">
        <p style="letter-spacing:.18em">THE CHARTER PRESS</p>
        <h1 id="e10-finale-title">Four hands, one lever.</h1>
        <p>The child chooses a river. The first verb is waiting.</p>
        <button type="button" data-testid="e10-river-lever" style="min-height:54px;padding:12px 20px;font:700 16px Georgia,serif">PRESS THE LEVER — CHARTER THE RIVER</button>
        <button type="button" data-testid="e10-return-town" style="min-height:44px;margin-left:8px;padding:10px 16px">Return to the Ark</button>
        <p data-testid="e10-finale-status" role="status"></p>
      </section>`;
    this.overlay.querySelector<HTMLButtonElement>('[data-testid="e10-river-lever"]')?.addEventListener('click', () => this.launchRiver());
    this.overlay.querySelector<HTMLButtonElement>('[data-testid="e10-return-town"]')?.addEventListener('click', onTown);
    this.overlay.querySelector<HTMLButtonElement>('[data-testid="e10-river-lever"]')?.focus({ preventScroll: true });
  }

  private launchRiver(): void {
    const charter = getPostCreditsCharter();
    const stamped = stampCharter(charter);
    const status = this.overlay.querySelector<HTMLElement>('[data-testid="e10-finale-status"]');
    if (!stamped.ok || !stageCharterLaunch(charterLineageRootId(charter), stamped.document)) {
      if (status) status.textContent = 'The Press could not hold the charter. The Ark remains here.';
      return;
    }
    this.state = 'launched';
    const next = new URLSearchParams({ contract: charterLineageRootId(charter) });
    if (charter.envelope.seedPolicy.mode === 'fixed') next.set('seed', charter.envelope.seedPolicy.seed);
    if (charter.envelope.runPolicy?.waves === 'none') next.set('nowaves', '');
    window.location.assign(`${window.location.pathname}?${next.toString()}`);
  }
}
