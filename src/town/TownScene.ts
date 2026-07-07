import './town.css';
import * as THREE from 'three';
import { CameraRig } from '../systems/CameraRig';
import { Hero } from '../entities/Hero';
import { InputController } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { RenderLayers } from '../core/RenderLayers';
import { palette } from '../assets/palette';
import { Balance } from '../game/Balance';
import { BARON_MEDAL_BLURB, hasBaronMedal } from '../game/Medals';
import { loadMetaProgress } from '../game/MetaProgress';
import { loadScores, type ScoreRecord } from '../game/Scoreboard';
import { DEFAULT_CONTRACT_ID, listContracts, type ContractManifest } from '../meta/ContractFamilies';
import { browserResearchStorage, loadResearchState, scienceMeter } from '../meta/ResearchTree';
import { disposeObject3D } from '../utils/dispose';
import { townBuildings, type TownBuilding, type TownBuildingId } from './townLayout';
import { readTownName, saveTownName, validateTownName } from './TownNaming';

const loadTavernBackdropUrl = () =>
  import('../../assets/processed/tavern-interior-backdrop.png?url').then((module) => module.default);
const TOWN_HALF = 15;
const TOWN_BOUNDS = { minX: -TOWN_HALF, maxX: TOWN_HALF, minZ: -TOWN_HALF, maxZ: TOWN_HALF };
const HERO_START = new THREE.Vector3(0, 0.06, 0);
const APPROACH_RADIUS = 5.2;

export type TownDiagnostics = {
  frame: number;
  elapsed: number;
  player: { x: number; z: number };
  activePrompt: TownBuildingId | null;
  townName: string | null;
  namingPrompt: boolean;
  boardOpen: boolean;
  renderer: { calls: number; geometries: number; textures: number };
  canvas: { width: number; height: number; dpr: number };
};

type TownSceneOptions = {
  openBoard?: boolean;
  onLaunchContract?: (id: string) => void;
};

type HiddenButtonState = {
  element: HTMLElement;
  hidden: HTMLElement['hidden'];
};

type TownNameMode = 'founding' | 'rename';

export class TownScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly hero = new Hero();
  private readonly input: InputController;
  private readonly loop = new Loop((delta) => this.update(delta), () => this.render());
  private readonly ui = document.createElement('section');
  private readonly prompt = document.createElement('div');
  private readonly nameCard = document.createElement('form');
  private readonly board = document.createElement('section');
  private readonly hiddenButtons: HiddenButtonState[];
  private townTitle?: HTMLElement;
  private townSubtitle?: HTMLElement;
  private nameInput?: HTMLInputElement;
  private nameMessage?: HTMLElement;
  private nameBeat?: HTMLElement;
  private frame = 0;
  private elapsed = 0;
  private activePrompt: TownBuilding | null = null;
  private promptKey = '';
  private townName = readTownName();
  private nameMode: TownNameMode = 'founding';
  private nameCardOpen = false;
  private boardOpen = false;
  private nameBeatTimer = 0;
  private lastExitIntent = false;
  private tavernBackdropUrl: string | undefined;
  private tavernBackdropRequest: Promise<string> | undefined;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onExit: () => void,
    private readonly options: TownSceneOptions = {},
  ) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = 1.02;
    this.input = new InputController(this.getElement('#touch-stick'), this.getElement('#touch-knob'), this.getElement('#confirm-button'));
    this.hiddenButtons = this.hideTownActionButtons();
    this.createScene();
    this.createUi();
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    this.cameraRig.snapTo(this.hero.group.position);
    this.publishDiagnostics();
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
    this.loop.stop();
    this.input.dispose();
    for (const state of this.hiddenButtons) state.element.hidden = state.hidden;
    window.clearTimeout(this.nameBeatTimer);
    this.prompt.removeEventListener('click', this.onPromptClick);
    this.board.removeEventListener('click', this.onBoardClick);
    this.nameCard.removeEventListener('submit', this.onNameSubmit);
    this.nameInput?.removeEventListener('keydown', stopKeyPropagation);
    this.ui.remove();
    this.hero.dispose();
    disposeObject3D(this.scene);
    this.scene.clear();
    this.renderer.dispose();
    window.__GR_TOWN_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number): void {
    this.frame += 1;
    this.elapsed += delta;
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    const intents = this.input.readIntents();
    const rawExitIntent = intents.cancel || intents.pause;
    if (this.boardOpen) {
      if (rawExitIntent && !this.lastExitIntent) this.closeBoard();
      this.lastExitIntent = rawExitIntent;
      this.syncPrompt();
      this.publishDiagnostics();
      return;
    }
    const exitIntent = !this.nameCardOpen && rawExitIntent;
    if (exitIntent && !this.lastExitIntent) {
      this.onExit();
      return;
    }
    this.lastExitIntent = rawExitIntent;

    this.hero.update(delta, intents, { bounds: TOWN_BOUNDS, sample: townSample });
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.syncPrompt();
    this.publishDiagnostics();
  }

  private render(): void {
    this.renderer.info.reset();
    this.renderer.render(this.scene, this.camera);
  }

  private createScene(): void {
    this.scene.name = 'TownScene';
    this.scene.background = new THREE.Color('#e9c98d');
    this.scene.fog = new THREE.Fog('#e9c98d', 34, 76);
    this.scene.add(new THREE.HemisphereLight('#fff2cc', '#8b6c3f', 1.15));

    const sun = new THREE.DirectionalLight('#ffd28a', 2.2);
    sun.position.set(-22, 18, -18);
    sun.castShadow = true;
    this.scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(TOWN_HALF * 2, TOWN_HALF * 2),
      new THREE.MeshStandardMaterial({
        color: palette.sand,
        map: createGroundTexture(),
        roughness: 0.9,
        metalness: 0.02,
      }),
    );
    ground.name = 'TownSquareGround';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.renderOrder = RenderLayers.terrain;
    this.scene.add(ground, createSquareEdge());

    for (const building of townBuildings) {
      this.scene.add(createShell(building));
    }

    this.hero.group.position.copy(HERO_START);
    this.scene.add(this.hero.group);
  }

  private createUi(): void {
    this.ui.className = 'town-ui';
    this.ui.dataset.testid = 'town-ui';
    this.ui.setAttribute('aria-label', 'Town square');
    this.ui.innerHTML = `
      <div class="town-ui__bar">
        <div class="town-ui__title">
          <strong data-testid="town-name">Town Square</strong>
          <span data-testid="town-subtitle">Four doors stand ready.</span>
        </div>
        <button class="town-ui__exit" type="button" data-testid="town-exit">Exit</button>
      </div>
      <div class="town-ui__prompt-stack" data-testid="town-prompt-stack"></div>
    `;
    this.townTitle = this.ui.querySelector<HTMLElement>('[data-testid="town-name"]') ?? undefined;
    this.townSubtitle = this.ui.querySelector<HTMLElement>('[data-testid="town-subtitle"]') ?? undefined;
    this.prompt.className = 'town-ui__prompt';
    this.prompt.dataset.testid = 'town-approach-prompt';
    this.prompt.setAttribute('role', 'status');
    this.prompt.setAttribute('aria-live', 'polite');
    this.prompt.hidden = true;
    this.board.className = 'town-ui__board';
    this.board.dataset.testid = 'contract-board';
    this.board.setAttribute('aria-label', 'Tavern contract board');
    this.board.hidden = true;
    this.nameCard.className = 'town-ui__name-card';
    this.nameCard.dataset.testid = 'town-name-card';
    this.nameCard.hidden = true;
    this.nameCard.innerHTML = `
      <div class="town-ui__name-panel">
        <p class="town-ui__name-eyebrow">Founding Ledger</p>
        <h2>What will you call this place?</h2>
        <input class="town-ui__name-input" data-testid="town-name-input" name="townName" maxlength="18" autocomplete="off" inputmode="text" />
        <p class="town-ui__name-rule">2-18 letters, numbers, spaces, apostrophes, or hyphens.</p>
        <p class="town-ui__name-error" data-testid="town-name-error" aria-live="polite"></p>
        <p class="town-ui__name-beat" data-testid="town-name-beat" hidden></p>
        <button class="town-ui__name-submit" type="submit" data-testid="town-name-submit">Confirm</button>
      </div>
    `;
    this.nameInput = this.nameCard.querySelector<HTMLInputElement>('[data-testid="town-name-input"]') ?? undefined;
    this.nameMessage = this.nameCard.querySelector<HTMLElement>('[data-testid="town-name-error"]') ?? undefined;
    this.nameBeat = this.nameCard.querySelector<HTMLElement>('[data-testid="town-name-beat"]') ?? undefined;
    this.nameInput?.addEventListener('keydown', stopKeyPropagation);
    this.ui.querySelector('[data-testid="town-prompt-stack"]')?.append(this.prompt);
    this.ui.append(this.nameCard);
    this.ui.querySelector('[data-testid="town-exit"]')?.addEventListener('click', this.onExitClick);
    this.prompt.addEventListener('click', this.onPromptClick);
    this.board.addEventListener('click', this.onBoardClick);
    this.nameCard.addEventListener('submit', this.onNameSubmit);
    this.ui.append(this.board);
    this.getElement('#app').append(this.ui);
    this.syncTownTitle();
    if (!this.townName) this.openNameCard('founding');
    if (this.options.openBoard) this.openBoard();
  }

  private readonly onExitClick = () => {
    this.onExit();
  };

  private readonly onPromptClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-town-board]')) this.openBoard();
    if (target?.closest('[data-town-rename]')) this.openNameCard('rename');
  };

  private readonly onBoardClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-contract-close]')) {
      this.closeBoard();
      return;
    }
    const launch = target?.closest<HTMLButtonElement>('[data-contract-launch]');
    const id = launch?.dataset.contractLaunch;
    if (id && !launch.disabled) this.options.onLaunchContract?.(id);
  };

  private readonly onNameSubmit = (event: Event) => {
    event.preventDefault();
    if (!this.nameInput || !this.nameMessage || !this.nameBeat) return;

    const result = validateTownName(this.nameInput.value);
    if (!result.ok) {
      this.nameMessage.textContent = result.message;
      this.nameBeat.hidden = true;
      return;
    }

    this.townName = saveTownName(result.value) ?? result.value;
    this.syncTownTitle();
    this.nameMessage.textContent = '';
    this.nameInput.disabled = true;
    this.nameBeat.textContent = `${this.nameMode === 'founding' ? 'Founded' : 'Renamed'}: ${this.townName}, 2026`;
    this.nameBeat.hidden = false;
    window.clearTimeout(this.nameBeatTimer);
    this.nameBeatTimer = window.setTimeout(() => this.closeNameCard(), 900);
  };

  private openNameCard(mode: TownNameMode): void {
    if (!this.nameInput || !this.nameMessage || !this.nameBeat) return;
    this.nameMode = mode;
    this.nameCardOpen = true;
    this.nameCard.hidden = false;
    this.nameInput.disabled = false;
    this.nameInput.value = mode === 'rename' ? (this.townName ?? '') : '';
    this.nameMessage.textContent = '';
    this.nameBeat.hidden = true;
  }

  private closeNameCard(): void {
    if (!this.nameInput) return;
    this.nameInput.disabled = false;
    this.nameCard.hidden = true;
    this.nameCardOpen = false;
    this.syncPrompt();
  }

  private syncTownTitle(): void {
    if (this.townTitle) this.townTitle.textContent = this.townName ?? 'Town Square';
    if (this.townSubtitle) this.townSubtitle.textContent = this.townName ? 'Town Square' : 'Four doors stand ready.';
  }

  private syncPrompt(): void {
    const position = this.hero.group.position;
    let nearest: TownBuilding | null = null;
    let nearestDistanceSq = APPROACH_RADIUS * APPROACH_RADIUS;
    for (const building of townBuildings) {
      const dx = position.x - building.position.x;
      const dz = position.z - building.position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < nearestDistanceSq) {
        nearest = building;
        nearestDistanceSq = distanceSq;
      }
    }
    this.activePrompt = nearest;
    this.prompt.hidden = nearest === null;
    if (!nearest) {
      this.promptKey = '';
      this.prompt.textContent = '';
      return;
    }
    const promptKey = `${nearest.id}:${this.townName ?? ''}`;
    if (promptKey === this.promptKey) return;
    this.promptKey = promptKey;
    if (nearest.id === 'claim_office' && this.townName) {
      this.prompt.innerHTML = `
        <span>${nearest.name} ... opens soon</span>
        <button class="town-ui__prompt-button" type="button" data-town-rename data-testid="town-rename">Rename</button>
      `;
    } else if (nearest.id === 'tavern') {
      this.prompt.innerHTML = `
        <span>${nearest.name} ... opens soon</span>
        <button class="town-ui__prompt-button" type="button" data-town-board data-testid="town-open-board">Board</button>
      `;
    } else {
      this.prompt.textContent = `${nearest.name} ... opens soon`;
    }
  }

  private openBoard(): void {
    this.renderBoard();
    this.boardOpen = true;
    this.board.hidden = false;
    this.loadTavernBackdrop();
    this.board.querySelector<HTMLButtonElement>('[data-contract-launch]:not(:disabled), [data-contract-close]')?.focus({ preventScroll: true });
    this.publishDiagnostics();
  }

  private closeBoard(): void {
    this.board.hidden = true;
    this.boardOpen = false;
    this.publishDiagnostics();
  }

  private renderBoard(): void {
    const rows = listContracts();
    const scores = loadScores();
    const backdropStyle = this.tavernBackdropUrl ? ` style="background-image:url('${this.tavernBackdropUrl}')"` : '';
    this.board.innerHTML = `
      <div class="town-ui__board-backdrop"${backdropStyle} aria-hidden="true"></div>
      <div class="town-ui__board-shell">
        <header class="town-ui__board-header">
          <div>
            <p class="town-ui__board-eyebrow">Tavern Ledger</p>
            <h2>Contract Board</h2>
          </div>
          <button class="town-ui__board-close" type="button" data-contract-close data-testid="contract-board-close">Back</button>
        </header>
        <div class="town-ui__contracts" data-testid="contract-card-list">
          ${rows.map((contract) => this.renderContractCard(contract, scores)).join('')}
        </div>
      </div>
    `;
  }

  private loadTavernBackdrop(): void {
    this.tavernBackdropRequest ??= loadTavernBackdropUrl();
    void this.tavernBackdropRequest.then((url) => {
      this.tavernBackdropUrl = url;
      const backdrop = this.board.querySelector<HTMLElement>('.town-ui__board-backdrop');
      if (backdrop) backdrop.style.backgroundImage = `url("${url}")`;
    });
  }

  private renderContractCard(contract: ContractManifest, scores: readonly ScoreRecord[]): string {
    const unlock = contractUnlock(contract);
    const best = bestContractScore(contract.id, scores);
    const tags = contract.boardRow.tags.length > 0 ? contract.boardRow.tags : ['trail'];
    const medal = contract.id === 'e1-baron' && hasBaronMedal();
    const baronStakes =
      contract.id === 'e1-baron'
        ? `<p class="town-ui__contract-stakes" data-testid="contract-stakes-e1-baron">The Baron's outfit rides at 20 — cadence runs hot (+15%).</p>`
        : '';
    return `
      <article class="town-ui__contract ${unlock.unlocked ? '' : 'town-ui__contract--locked'}" data-testid="contract-card-${escapeHtml(
        contract.id,
      )}" data-contract-id="${escapeHtml(contract.id)}" data-contract-locked="${unlock.unlocked ? 'false' : 'true'}">
        <div class="town-ui__contract-topline">
          <span class="town-ui__contract-tag">${escapeHtml(formatTag(tags[0] ?? 'trail'))}</span>
          <span class="town-ui__contract-state">${unlock.unlocked ? 'Open' : 'Locked'}</span>
        </div>
        <h3>${escapeHtml(contract.boardRow.name)}</h3>
        <p>${escapeHtml(contract.boardRow.ledgerBlurb)}</p>
        ${baronStakes}
        ${medal ? '' : `<p class="town-ui__contract-best" data-testid="contract-best-${escapeHtml(contract.id)}">${escapeHtml(formatBest(best))}</p>`}
        ${
          medal
            ? `<p class="town-ui__contract-best town-ui__contract-medal" data-testid="contract-medal-e1-baron">Baron beaten. ${escapeHtml(BARON_MEDAL_BLURB)}</p>`
            : ''
        }
        <button class="town-ui__contract-action" type="button" data-contract-launch="${escapeHtml(contract.id)}" data-testid="contract-launch-${escapeHtml(
          contract.id,
        )}" ${unlock.unlocked ? '' : 'disabled'}>
          ${escapeHtml(unlock.unlocked ? 'Launch' : unlock.condition)}
        </button>
      </article>
    `;
  }

  private publishDiagnostics(): void {
    const dpr = this.renderer.getPixelRatio();
    window.__GR_TOWN_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.elapsed,
      player: {
        x: round2(this.hero.group.position.x),
        z: round2(this.hero.group.position.z),
      },
      activePrompt: this.activePrompt?.id ?? null,
      townName: this.townName,
      namingPrompt: this.nameCardOpen,
      boardOpen: this.boardOpen,
      renderer: {
        calls: this.renderer.info.render.calls,
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures,
      },
      canvas: {
        width: this.canvas.width,
        height: this.canvas.height,
        dpr,
      },
    };
  }

  private hideTownActionButtons(): HiddenButtonState[] {
    const states: HiddenButtonState[] = [];
    for (const id of ['#confirm-button', '#rotate-button', '#weapon-toggle-button']) {
      const element = document.querySelector<HTMLElement>(id);
      if (!element) continue;
      states.push({ element, hidden: element.hidden });
      element.hidden = true;
    }
    return states;
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Missing ${selector}`);
    return element;
  }
}

function stopKeyPropagation(event: KeyboardEvent): void {
  event.stopPropagation();
}

function contractUnlock(contract: ContractManifest): { unlocked: boolean; condition: string } {
  const unlock = contract.boardRow.unlock;
  if (unlock === 'default') return { unlocked: true, condition: '' };

  const scores = loadScores();
  if (unlock === 'wave10OnClaim') {
    return {
      unlocked: scores.some((score) => contractIdOf(score) === DEFAULT_CONTRACT_ID && score.waves >= 10),
      condition: 'Reach wave 10 on The Claim',
    };
  }
  if (unlock === 'firstSecuredClaim') {
    return { unlocked: scores.some((score) => score.secured === true), condition: 'Secure a claim first' };
  }
  if (unlock === 'science-complete') {
    return { unlocked: scienceMeter(loadResearchState(browserResearchStorage())).complete, condition: 'Complete Frontier science first' };
  }
  if (unlock.startsWith('science')) {
    const required = Number.parseInt(unlock.match(/\d+/)?.[0] ?? '0', 10);
    const storage = browserStorage();
    const science = storage ? loadMetaProgress(storage).tracks.science : 0;
    return { unlocked: science >= required, condition: `Bank ${required} science first` };
  }
  return { unlocked: false, condition: 'Progress farther first' };
}

function bestContractScore(id: string, scores: readonly ScoreRecord[]): ScoreRecord | null {
  return scores.find((score) => contractIdOf(score) === id) ?? null;
}

function contractIdOf(score: ScoreRecord): string {
  return score.contractId?.trim() || DEFAULT_CONTRACT_ID;
}

function formatBest(score: ScoreRecord | null): string {
  if (!score) return 'No result yet';
  return `${score.secured ? 'Secured' : 'Overrun'} - wave ${score.waves} - ${score.gold} gold`;
}

function formatTag(tag: string): string {
  return tag
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join('-');
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

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

function townSample(x: number, z: number) {
  if (x < TOWN_BOUNDS.minX || x > TOWN_BOUNDS.maxX || z < TOWN_BOUNDS.minZ || z > TOWN_BOUNDS.maxZ) {
    return { walkable: false, speedMul: 0, zone: 'out' as const };
  }
  return {
    walkable: !shellAt(x, z),
    speedMul: 1,
    zone: 'bank' as const,
  };
}

function shellAt(x: number, z: number): boolean {
  const pad = Balance.hero.radius + 0.08;
  return townBuildings.some((building) => {
    const halfX = building.footprint.w / 2 + pad;
    const halfZ = building.footprint.d / 2 + pad;
    return Math.abs(x - building.position.x) <= halfX && Math.abs(z - building.position.z) <= halfZ;
  });
}

function createShell(building: TownBuilding): THREE.Group {
  const group = new THREE.Group();
  group.name = `TownShell:${building.id}`;
  group.position.set(building.position.x, 0, building.position.z);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w, 1.38, building.footprint.d),
    new THREE.MeshStandardMaterial({ color: building.color, roughness: 0.82, metalness: 0.03 }),
  );
  base.position.y = 0.69;
  base.castShadow = true;
  base.receiveShadow = true;

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w + 0.5, 0.34, building.footprint.d + 0.42),
    new THREE.MeshStandardMaterial({ color: building.roof, roughness: 0.72, metalness: 0.1 }),
  );
  roof.position.y = 1.52;
  roof.rotation.z = -0.035;
  roof.castShadow = true;

  const porch = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w * 0.72, 0.12, 0.78),
    new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.8, metalness: 0.02 }),
  );
  porch.position.set(0, 0.1, building.footprint.d / 2 + 0.36);

  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(Math.min(2.2, building.footprint.w * 0.5), 0.24, 0.05),
    new THREE.MeshStandardMaterial({ color: building.accent, roughness: 0.64, metalness: 0.08 }),
  );
  plaque.position.set(0, 0.88, building.footprint.d / 2 + 0.04);

  const label = createLabel(building.name);
  label.position.set(0, 2.28, building.footprint.d / 2 + 0.26);

  group.add(base, roof, porch, plaque, label);
  return group;
}

function createLabel(text: string): THREE.Sprite {
  const width = 512;
  const height = 160;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(245, 230, 200, 0.96)';
    roundRect(ctx, 18, 28, width - 36, 92, 18);
    ctx.fill();
    ctx.strokeStyle = '#2e1b0e';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#2e1b0e';
    ctx.font = '700 46px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, 74);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.name = `TownPlaque:${text}`;
  sprite.scale.set(3.5, 1.1, 1);
  sprite.renderOrder = RenderLayers.worldUi;
  return sprite;
}

function createGroundTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = palette.sand;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(139, 125, 60, 0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= size; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - size * 0.3, size);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 248, 232, 0.34)';
    for (let i = 0; i <= size; i += 64) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i + size * 0.18);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function createSquareEdge(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TownSquareEdge';
  const material = new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.82, metalness: 0.02 });
  const long = new THREE.BoxGeometry(TOWN_HALF * 2, 0.12, 0.18);
  const short = new THREE.BoxGeometry(0.18, 0.12, TOWN_HALF * 2);
  for (const z of [-TOWN_HALF, TOWN_HALF]) {
    const rail = new THREE.Mesh(long, material);
    rail.position.set(0, 0.08, z);
    group.add(rail);
  }
  for (const x of [-TOWN_HALF, TOWN_HALF]) {
    const rail = new THREE.Mesh(short, material);
    rail.position.set(x, 0.08, 0);
    group.add(rail);
  }
  return group;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
