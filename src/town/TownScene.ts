import './town.css';
import * as THREE from 'three';
import { OrientationResolver, type RotationDirection } from '../assets/OrientationResolver';
import { SpriteAnimator } from '../assets/SpriteAnimator';
import { tagPlaceholder } from '../assets/slots';
import { CameraRig } from '../systems/CameraRig';
import { Hero } from '../entities/Hero';
import { InputController } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { RenderLayers } from '../core/RenderLayers';
import { palette } from '../assets/palette';
import { Balance } from '../game/Balance';
import { BARON_MEDAL_BLURB, hasBaronMedal } from '../game/Medals';
import { META_PROGRESS_KEY, loadMetaProgress, migrateMetaProgress, type MetaProgress } from '../game/MetaProgress';
import { loadScores, type ScoreRecord } from '../game/Scoreboard';
import { DEFAULT_CONTRACT_ID, listBoardContracts, loadEpoch, type ContractManifest } from '../meta/ContractFamilies';
import {
  ensureMegaprojectProject,
  isMegaprojectUnlocked,
  loadMegaprojectState,
  megaprojectComplete,
  type MegaprojectManifest,
  type MegaprojectProjectState,
} from '../meta/Megaproject';
import { browserResearchStorage, loadResearchState, scienceMeter } from '../meta/ResearchTree';
import { emitStorySignal } from '../story';
import { WorldInfoNotePrompt, type WorldInfoObjectClass } from '../ui/WorldInfoNotes';
import { disposeObject3D } from '../utils/dispose';
import { earnedTownBuildings, townBuildings, type TownBuilding, type TownBuildingId } from './townLayout';
import { readTownName, saveTownName, validateTownName } from './TownNaming';
import { TOWN_ACTORS, townActorBark, visibleTownActors, type TownActorDefinition, type TownActorId } from './townsfolk';

const loadTavernBackdropUrl = () =>
  import('../../assets/processed/tavern-interior-backdrop.png?url').then((module) => module.default);
const TOWN_HALF = 15;
const TOWN_BOUNDS = { minX: -TOWN_HALF, maxX: TOWN_HALF, minZ: -TOWN_HALF, maxZ: TOWN_HALF };
const HERO_START = new THREE.Vector3(0, 0.06, 0);
const APPROACH_RADIUS = 5.2;
const STAMP_MILL_ID = 'stamp-mill';
const STAMP_MILL_TOWN_SITE = { x: 0, z: 13.45, w: 6.2, d: 1.65 };
const STAMP_MILL_COMPLETE_LINE = 'awaits the whistle';
const STAMP_MILL_PROGRESS_LINES = [
  'The Stamp Mill rises: the rail spur is staked.',
  'The Stamp Mill rises: the boilers are seated.',
  'The Stamp Mill rises: the stamps are set.',
] as const;

export type TownDiagnostics = {
  frame: number;
  elapsed: number;
  player: { x: number; z: number };
  activePrompt: TownBuildingId | null;
  activeBark: { actorId: TownActorId; speaker: string; text: string } | null;
  townName: string | null;
  namingPrompt: boolean;
  boardOpen: boolean;
  buildings: Array<{
    id: TownBuildingId;
    name: string;
    visible: boolean;
    territoryRequired: number | null;
    barkSlot: string | null;
  }>;
  actors: Array<{
    id: TownActorId;
    name: string;
    post: string;
    visible: boolean;
    anchor: TownBuildingId;
    position: { x: number; z: number };
    bark: string | null;
    loaded: boolean;
    loop: boolean;
    assetSlot: string;
  }>;
  stampMill: {
    visible: boolean;
    stage: number;
    totalStages: number;
    funded: boolean;
    complete: boolean;
    plaque: string;
    visibleStages: string[];
    constructionProps: number;
    surveyVisible: boolean;
  };
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

type TownStampMill = {
  manifest: MegaprojectManifest | null;
  project: MegaprojectProjectState | null;
  visible: boolean;
};

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
  private infoNote?: WorldInfoNotePrompt;
  private readonly nameCard = document.createElement('form');
  private readonly board = document.createElement('section');
  private readonly hiddenButtons: HiddenButtonState[];
  private readonly metaProgress = readTownMetaProgress();
  private readonly visibleBuildings = earnedTownBuildings(this.metaProgress.tracks.territory);
  private readonly visibleActors = visibleTownActors(this.visibleBuildings);
  private readonly stampMill = readTownStampMill(this.metaProgress);
  private readonly stampMillGroup = new THREE.Group();
  private readonly stampMillStageVisuals: THREE.Object3D[] = [];
  private readonly stampMillSurveyVisuals: THREE.Object3D[] = [];
  private readonly stampMillConstructionProps: THREE.Object3D[] = [];
  private readonly townActors: TownActorRuntime[] = [];
  private readonly actorBarkVisits = new Map<TownActorId, number>();
  private readonly barkCard = document.createElement('div');
  private townTitle?: HTMLElement;
  private townSubtitle?: HTMLElement;
  private nameInput?: HTMLInputElement;
  private nameMessage?: HTMLElement;
  private nameBeat?: HTMLElement;
  private frame = 0;
  private elapsed = 0;
  private activePrompt: TownBuilding | null = null;
  private activeBark: { actorId: TownActorId; speaker: string; text: string } | null = null;
  private activeBarkActor: TownActorRuntime | null = null;
  private promptKey = '';
  private townName = readTownName();
  private nameMode: TownNameMode = 'founding';
  private nameCardOpen = false;
  private boardOpen = false;
  private nameBeatTimer = 0;
  private lastExitIntent = false;
  private tavernBackdropUrl: string | undefined;
  private tavernBackdropRequest: Promise<string> | undefined;
  private stampMillPlaqueText = '';

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
    this.infoNote?.dispose();
    for (const actor of this.townActors) actor.dispose();
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
      for (const actor of this.townActors) actor.update(delta, this.elapsed);
      if (rawExitIntent && !this.lastExitIntent) this.closeBoard();
      this.lastExitIntent = rawExitIntent;
      this.syncPrompt();
      this.syncBark();
      this.publishDiagnostics();
      return;
    }
    const exitIntent = !this.nameCardOpen && rawExitIntent;
    if (exitIntent && !this.lastExitIntent) {
      this.onExit();
      return;
    }
    this.lastExitIntent = rawExitIntent;

    this.hero.update(delta, intents, { bounds: TOWN_BOUNDS, sample: this.sampleTown });
    for (const actor of this.townActors) actor.update(delta, this.elapsed);
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.syncPrompt();
    this.syncBark();
    this.publishDiagnostics();
  }

  private render(): void {
    this.renderer.info.reset();
    this.renderer.render(this.scene, this.camera);
  }

  private readonly sampleTown = (x: number, z: number) => {
    if (x < TOWN_BOUNDS.minX || x > TOWN_BOUNDS.maxX || z < TOWN_BOUNDS.minZ || z > TOWN_BOUNDS.maxZ) {
      return { walkable: false, speedMul: 0, zone: 'out' as const };
    }
    return {
      walkable: !shellAt(this.visibleBuildings, x, z) && !stampMillAt(this.stampMill.visible, x, z),
      speedMul: 1,
      zone: 'bank' as const,
    };
  };

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

    for (const building of this.visibleBuildings) {
      this.scene.add(createShell(building));
    }
    this.createStampMillVignette();
    for (const actor of this.visibleActors) {
      const runtime = new TownActorRuntime(actor);
      this.townActors.push(runtime);
      this.scene.add(runtime.group);
    }

    this.hero.group.position.copy(HERO_START);
    this.scene.add(this.hero.group);
  }

  private createStampMillVignette(): void {
    const { manifest, project, visible } = this.stampMill;
    if (!manifest || !project || !visible) return;

    const complete = megaprojectComplete(manifest, project);
    const total = Math.max(1, manifest.stages.length);
    const visibleStages = Math.max(1, Math.min(total, project.stage + (project.funded ? 1 : 0)));
    const surveyVisible = project.stage === 0 && !project.funded && !complete;
    const site = STAMP_MILL_TOWN_SITE;
    const halfX = site.w * 0.5;
    const halfZ = site.d * 0.5;
    const baseMaterial = new THREE.MeshStandardMaterial({ color: '#8b6c3f', roughness: 0.86, metalness: 0.02 });
    const stageMaterial = new THREE.MeshStandardMaterial({ color: '#5b8a8a', roughness: 0.7, metalness: 0.18 });
    const ghostMaterial = new THREE.MeshStandardMaterial({ color: '#8b7d3c', roughness: 0.78, metalness: 0.08, transparent: true, opacity: 0.46 });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.84, metalness: 0.02 });
    const brassMaterial = new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.58, metalness: 0.16 });

    this.stampMillGroup.name = 'TownStampMillSite';
    this.stampMillGroup.position.set(site.x, 0, site.z);

    const addBox = (
      name: string,
      material: THREE.Material,
      position: [number, number, number],
      scale: [number, number, number],
      target?: THREE.Object3D[],
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
      mesh.name = name;
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.stampMillGroup.add(mesh);
      target?.push(mesh);
      return mesh;
    };

    addBox('TownStampMillPackedEarth', baseMaterial, [0, 0.04, 0], [site.w, 0.08, site.d]);

    for (const [x, z] of [
      [-halfX, -halfZ],
      [halfX, -halfZ],
      [halfX, halfZ],
      [-halfX, halfZ],
    ] as const) {
      const stake = addBox('TownStampMillSurveyStake', woodMaterial, [x, 0.4, z], [0.09, 0.72, 0.09], this.stampMillSurveyVisuals);
      stake.visible = surveyVisible;
    }
    for (const line of [
      { x: 0, z: -halfZ, sx: site.w, sz: 0.035 },
      { x: 0, z: halfZ, sx: site.w, sz: 0.035 },
      { x: -halfX, z: 0, sx: 0.035, sz: site.d },
      { x: halfX, z: 0, sx: 0.035, sz: site.d },
    ]) {
      const stringLine = addBox(
        'TownStampMillSurveyStringLine',
        brassMaterial,
        [line.x, 0.32, line.z],
        [line.sx, 0.035, line.sz],
        this.stampMillSurveyVisuals,
      );
      stringLine.visible = surveyVisible;
    }

    const stages = [
      { name: 'TownStampMillScaffold', x: -site.w * 0.28, y: 0.54, z: 0, sx: 0.34, sy: 0.9, sz: site.d * 0.82 },
      { name: 'TownStampMillBoilers', x: 0, y: 0.42, z: -site.d * 0.08, sx: site.w * 0.36, sy: 0.64, sz: site.d * 0.58 },
      { name: 'TownStampMillReadyMill', x: site.w * 0.26, y: 0.72, z: site.d * 0.05, sx: site.w * 0.26, sy: 1.2, sz: site.d * 0.52 },
    ] as const;
    stages.forEach((stage, index) => {
      const built = complete || index + 1 <= project.stage;
      const mesh = addBox(
        stage.name,
        built ? stageMaterial : ghostMaterial,
        [stage.x, stage.y, stage.z],
        [stage.sx, stage.sy, stage.sz],
        this.stampMillStageVisuals,
      );
      mesh.visible = index < visibleStages || complete;
    });

    for (const [x, z] of [
      [-halfX + 0.45, halfZ - 0.25],
      [halfX - 0.48, halfZ - 0.22],
      [0.1, -halfZ + 0.35],
    ] as const) {
      const crate = addBox('TownStampMillConstructionProp', woodMaterial, [x, 0.25, z], [0.38, 0.38, 0.38], this.stampMillConstructionProps);
      crate.visible = !surveyVisible && !complete;
    }

    const plaqueLines = stampMillPlaqueLines(manifest, project);
    this.stampMillPlaqueText = plaqueLines.join(' / ');
    const plaque = createPlaqueSprite(plaqueLines);
    plaque.name = 'TownStampMillLedgerPlaque';
    plaque.position.set(0, 1.55, -halfZ - 0.25);
    this.stampMillGroup.add(plaque);
    this.scene.add(this.stampMillGroup);
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
    this.barkCard.className = 'town-ui__bark';
    this.barkCard.dataset.testid = 'town-bark-card';
    this.barkCard.setAttribute('role', 'status');
    this.barkCard.setAttribute('aria-live', 'polite');
    this.barkCard.hidden = true;
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
    const promptStack = this.ui.querySelector<HTMLElement>('[data-testid="town-prompt-stack"]');
    promptStack?.append(this.prompt);
    if (promptStack) this.infoNote = new WorldInfoNotePrompt(promptStack);
    promptStack?.append(this.barkCard);
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
    this.emitGrowthSightBeats();
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
    emitStorySignal({ type: 'town-named', townName: this.townName });
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

  private emitGrowthSightBeats(): void {
    for (const building of this.visibleBuildings) {
      if (building.id !== 'general_store' && building.id !== 'chapel') continue;
      emitStorySignal({ type: 'town-growth-seen', buildingId: building.id, buildingName: building.name });
    }
  }

  private syncPrompt(): void {
    if (this.boardOpen) {
      this.prompt.hidden = true;
      this.infoNote?.update(null);
      return;
    }
    const position = this.hero.group.position;
    let nearest: TownBuilding | null = null;
    let nearestDistanceSq = APPROACH_RADIUS * APPROACH_RADIUS;
    for (const building of this.visibleBuildings) {
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
      this.infoNote?.update(null);
      return;
    }
    const infoClass = townInfoClass(nearest.id);
    this.infoNote?.update(infoClass ? { objectClass: infoClass } : null);
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

  private syncBark(): void {
    if (this.boardOpen || this.nameCardOpen) {
      this.hideBark();
      return;
    }

    const position = this.hero.group.position;
    let nearest: TownActorRuntime | null = null;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;
    for (const actor of this.townActors) {
      const dx = position.x - actor.position.x;
      const dz = position.z - actor.position.z;
      const distanceSq = dx * dx + dz * dz;
      const radiusSq = actor.definition.barkRadius * actor.definition.barkRadius;
      if (distanceSq <= radiusSq && distanceSq < nearestDistanceSq) {
        nearest = actor;
        nearestDistanceSq = distanceSq;
      }
    }

    if (!nearest) {
      this.hideBark();
      return;
    }
    if (nearest === this.activeBarkActor) return;

    const count = this.actorBarkVisits.get(nearest.definition.id) ?? 0;
    this.actorBarkVisits.set(nearest.definition.id, count + 1);
    const text = townActorBark(nearest.definition, this.townName, count);
    this.activeBarkActor = nearest;
    this.activeBark = { actorId: nearest.definition.id, speaker: nearest.definition.name, text };
    this.barkCard.innerHTML = `
      <img class="town-ui__bark-portrait" src="${escapeHtml(nearest.definition.portraitUrl)}" alt="" />
      <div class="town-ui__bark-copy">
        <strong data-testid="town-bark-speaker">${escapeHtml(nearest.definition.name)}</strong>
        <span>${escapeHtml(nearest.definition.post)}</span>
        <p data-testid="town-bark-text">${escapeHtml(text)}</p>
      </div>
    `;
    this.barkCard.dataset.actorId = nearest.definition.id;
    this.barkCard.hidden = false;
  }

  private hideBark(): void {
    this.activeBarkActor = null;
    this.activeBark = null;
    this.barkCard.hidden = true;
    this.barkCard.textContent = '';
    delete this.barkCard.dataset.actorId;
  }

  private openBoard(): void {
    this.renderBoard();
    this.emitBoardStorySignals();
    this.boardOpen = true;
    this.board.hidden = false;
    this.loadTavernBackdrop();
    this.board.querySelector<HTMLButtonElement>('[data-contract-launch]:not(:disabled), [data-contract-close]')?.focus({ preventScroll: true });
    this.publishDiagnostics();
  }

  private closeBoard(): void {
    this.board.hidden = true;
    this.boardOpen = false;
    this.syncPrompt();
    this.publishDiagnostics();
  }

  private renderBoard(): void {
    const rows = listBoardContracts();
    const scores = loadScores();
    const backdropStyle = this.tavernBackdropUrl ? ` style="background-image:url('${this.tavernBackdropUrl}')"` : '';
    const host = this.visibleActors.find((actor) => actor.id === 'tavernkeeper');
    this.board.innerHTML = `
      <div class="town-ui__board-backdrop"${backdropStyle} aria-hidden="true"></div>
      <div class="town-ui__board-shell">
        <header class="town-ui__board-header">
          ${
            host
              ? `<img class="town-ui__board-host" src="${escapeHtml(host.portraitUrl)}" alt="" data-testid="contract-board-host" />`
              : ''
          }
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

  private emitBoardStorySignals(): void {
    emitStorySignal({ type: 'board-first-open' });
    for (const contract of listBoardContracts()) {
      if (contract.id === DEFAULT_CONTRACT_ID || !contractUnlock(contract).unlocked) continue;
      emitStorySignal({
        type: 'contract-unlocked',
        contractId: contract.id,
        contractName: contract.boardRow.name,
        ledgerBlurb: contract.boardRow.ledgerBlurb,
      });
    }
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
        <p class="town-ui__contract-geography" data-testid="contract-board-geography-${escapeHtml(contract.id)}">${escapeHtml(
          contract.briefing.geographyLine,
        )}</p>
        ${renderContractBriefing(contract)}
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
      activeBark: this.activeBark,
      townName: this.townName,
      namingPrompt: this.nameCardOpen,
      boardOpen: this.boardOpen,
      buildings: townBuildings.map((building) => ({
        id: building.id,
        name: building.name,
        visible: this.visibleBuildings.includes(building),
        territoryRequired: building.requires?.territory ?? null,
        barkSlot: building.barkSlot ?? null,
      })),
      actors: TOWN_ACTORS.map((actor) => {
        const runtime = this.townActors.find((item) => item.definition.id === actor.id);
        return {
          id: actor.id,
          name: actor.name,
          post: actor.post,
          visible: !!runtime,
          anchor: actor.anchor,
          position: {
            x: round2(runtime?.position.x ?? actor.position.x),
            z: round2(runtime?.position.z ?? actor.position.z),
          },
          bark: this.activeBark?.actorId === actor.id ? this.activeBark.text : null,
          loaded: runtime?.loaded ?? false,
          loop: !!actor.loop,
          assetSlot: actor.assetSlot,
        };
      }),
      stampMill: this.stampMillDiagnostics(),
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

  private stampMillDiagnostics(): TownDiagnostics['stampMill'] {
    const { manifest, project, visible } = this.stampMill;
    return {
      visible,
      stage: project?.stage ?? 0,
      totalStages: manifest?.stages.length ?? 0,
      funded: project?.funded ?? false,
      complete: !!manifest && !!project && megaprojectComplete(manifest, project),
      plaque: this.stampMillPlaqueText,
      visibleStages: this.stampMillStageVisuals.filter((visual) => visual.visible).map((visual) => visual.name),
      constructionProps: this.stampMillConstructionProps.filter((visual) => visual.visible).length,
      surveyVisible: this.stampMillSurveyVisuals.some((visual) => visual.visible),
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

class TownActorRuntime {
  readonly group = new THREE.Group();
  private readonly material = new THREE.SpriteMaterial({
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
  });
  private readonly sprite = new THREE.Sprite(this.material);
  private readonly animator: SpriteAnimator;
  private readonly orientationResolver = new OrientationResolver();
  private currentDirection: RotationDirection;

  constructor(readonly definition: TownActorDefinition) {
    this.group.name = `TownActor:${definition.id}`;
    this.group.position.set(definition.position.x, 0, definition.position.z);
    this.sprite.name = `TownActorSprite:${definition.id}`;
    this.sprite.scale.setScalar(definition.scale);
    this.sprite.position.y = definition.scale * 0.55 + 0.08;
    this.sprite.renderOrder = RenderLayers.companion;
    this.sprite.visible = true;
    this.group.add(this.sprite);
    this.currentDirection = definition.facing;
    this.orientationResolver.reset(definition.facing);
    this.animator = new SpriteAnimator(definition.assetSlot, this.material, this.sprite);
    tagPlaceholder(this.group, definition.assetSlot);
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get loaded(): boolean {
    return !!this.material.map;
  }

  update(delta: number, elapsed: number): void {
    const previousX = this.group.position.x;
    const previousZ = this.group.position.z;
    const point = this.definition.loop ? loopPoint(this.definition.loop, elapsed) : this.definition.position;
    this.group.position.x = point.x;
    this.group.position.z = point.z;
    const dx = point.x - previousX;
    const dz = point.z - previousZ;
    if (dx * dx + dz * dz > 0.0004) this.currentDirection = this.orientationResolver.resolve(dx, dz);

    const phase = actorPhase(this.definition);
    const breathe = Math.sin((elapsed * 0.58 + phase) * Math.PI * 2);
    const sway = Math.sin((elapsed * 0.31 + phase) * Math.PI * 2);
    this.group.position.y = breathe * 0.035;
    this.material.rotation = THREE.MathUtils.degToRad(sway * 1.7);
    this.animator.update(delta, 'idle', this.currentDirection);
  }

  dispose(): void {
    this.animator.dispose();
    this.material.dispose();
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
  if (unlock === 'epoch-2-steamworks') return { unlocked: false, condition: 'Awaits the Steamworks era' };
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

function renderContractBriefing(contract: ContractManifest): string {
  return `
    <div class="town-ui__contract-briefing" data-testid="contract-board-briefing-${escapeHtml(contract.id)}">
      <p class="town-ui__contract-briefing-label">Goals</p>
      <ul>${contract.briefing.goals.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
      <p class="town-ui__contract-briefing-label">Rules</p>
      <ul>${contract.briefing.rules.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
    </div>
  `;
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

function readTownMetaProgress(): MetaProgress {
  const storage = browserStorage();
  let raw: unknown = null;
  try {
    const saved = storage?.getItem(META_PROGRESS_KEY);
    raw = saved ? JSON.parse(saved) : null;
  } catch {
    raw = null;
  }
  return migrateMetaProgress(raw);
}

function readTownStampMill(meta: MetaProgress): TownStampMill {
  const manifest = loadEpoch('epoch-1-frontier').megaprojects.find((entry) => entry.id === STAMP_MILL_ID) ?? null;
  if (!manifest) return { manifest: null, project: null, visible: false };
  const state = loadMegaprojectState(browserStorage());
  const project = ensureMegaprojectProject(state, manifest);
  const visible = isMegaprojectUnlocked(manifest, meta.tracks.science) || project.stage > 0 || project.funded;
  return { manifest, project, visible };
}

function shellAt(buildings: readonly TownBuilding[], x: number, z: number): boolean {
  const pad = Balance.hero.radius + 0.08;
  return buildings.some((building) => {
    const halfX = building.footprint.w / 2 + pad;
    const halfZ = building.footprint.d / 2 + pad;
    return Math.abs(x - building.position.x) <= halfX && Math.abs(z - building.position.z) <= halfZ;
  });
}

function stampMillAt(visible: boolean, x: number, z: number): boolean {
  if (!visible) return false;
  const pad = Balance.hero.radius + 0.08;
  return (
    Math.abs(x - STAMP_MILL_TOWN_SITE.x) <= STAMP_MILL_TOWN_SITE.w / 2 + pad &&
    Math.abs(z - STAMP_MILL_TOWN_SITE.z) <= STAMP_MILL_TOWN_SITE.d / 2 + pad
  );
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

function createPlaqueSprite(lines: readonly string[]): THREE.Sprite {
  const width = 640;
  const height = 220;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(245, 230, 200, 0.97)';
    roundRect(ctx, 18, 24, width - 36, height - 48, 16);
    ctx.fill();
    ctx.strokeStyle = '#2e1b0e';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#2e1b0e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.slice(0, 3).forEach((line, index) => {
      ctx.font = fitCanvasFont(ctx, line, index === 0 ? 42 : 28, index === 0 ? 540 : 580);
      ctx.fillText(line, width / 2, 62 + index * 52);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4.4, 1.5, 1);
  sprite.renderOrder = RenderLayers.worldUi;
  return sprite;
}

function fitCanvasFont(ctx: CanvasRenderingContext2D, line: string, baseSize: number, maxWidth: number): string {
  for (let size = baseSize; size >= 18; size -= 2) {
    const font = `700 ${size}px Georgia, serif`;
    ctx.font = font;
    if (ctx.measureText(line).width <= maxWidth) return font;
  }
  return '700 18px Georgia, serif';
}

function stampMillPlaqueLines(manifest: MegaprojectManifest, project: MegaprojectProjectState): readonly string[] {
  if (megaprojectComplete(manifest, project)) return ['STAMP MILL & RAIL SPUR', 'ready mill', STAMP_MILL_COMPLETE_LINE];
  if (project.stage === 0 && !project.funded) return ['STAMP MILL & RAIL SPUR', 'surveyed for the town', 'Claim Office takes pledges'];
  return [
    'STAMP MILL & RAIL SPUR',
    `stage ${Math.min(project.stage + 1, manifest.stages.length)} of ${manifest.stages.length}`,
    STAMP_MILL_PROGRESS_LINES[project.stage] ?? STAMP_MILL_PROGRESS_LINES[0],
  ];
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

function townInfoClass(id: TownBuildingId): WorldInfoObjectClass | null {
  if (id === 'claim_office') return 'town_claim_office';
  if (id === 'schoolhouse') return 'town_schoolhouse';
  if (id === 'assay_office') return 'town_assay_office';
  if (id === 'general_store' || id === 'chapel') return null;
  return 'town_tavern';
}

function loopPoint(loop: NonNullable<TownActorDefinition['loop']>, elapsed: number): { x: number; z: number } {
  const points = loop.points;
  if (points.length === 0) return { x: 0, z: 0 };
  if (points.length === 1) return points[0]!;

  let total = 0;
  const lengths: number[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const from = points[index]!;
    const to = points[(index + 1) % points.length]!;
    const length = Math.hypot(to.x - from.x, to.z - from.z);
    lengths.push(length);
    total += length;
  }
  if (total <= 0) return points[0]!;

  let distance = ((((elapsed / Math.max(0.001, loop.seconds) + loop.phase) % 1) + 1) % 1) * total;
  for (let index = 0; index < points.length; index += 1) {
    const length = lengths[index] ?? 0;
    if (distance > length) {
      distance -= length;
      continue;
    }
    const from = points[index]!;
    const to = points[(index + 1) % points.length]!;
    const t = length > 0 ? distance / length : 0;
    return { x: THREE.MathUtils.lerp(from.x, to.x, t), z: THREE.MathUtils.lerp(from.z, to.z, t) };
  }
  return points[0]!;
}

function actorPhase(actor: TownActorDefinition): number {
  let hash = 0;
  for (const char of actor.id) hash += char.charCodeAt(0);
  return ((actor.loop?.phase ?? 0) + (hash % 17) / 17) % 1;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
