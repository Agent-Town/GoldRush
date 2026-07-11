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
import { install as installAssayBench } from '../crafting/AssayBench';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics, type PerformanceTier } from '../game/PerformanceTier';
import { BARON_MEDAL_BLURB, hasBaronMedal, hasRocketCartCaptured } from '../game/Medals';
import { META_PROGRESS_KEY, loadMetaProgress, migrateMetaProgress, type MetaProgress } from '../game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, activeProfileName } from '../game/ProfileStorage';
import { clearRunSuspend, readRunSuspend, type RunSuspendEnvelope } from '../game/RunSuspend';
import { loadScores, type ScoreRecord } from '../game/Scoreboard';
import {
  activateEpoch,
  activeEpochId,
  DEFAULT_CONTRACT_ID,
  DEFAULT_EPOCH_ID,
  epochIsActive,
  listBoardContracts,
  loadContract,
  loadEpoch,
  type ContractManifest,
} from '../meta/ContractFamilies';
import {
  ensureMegaprojectProject,
  isMegaprojectUnlocked,
  loadMegaprojectState,
  megaprojectComplete,
  type MegaprojectManifest,
  type MegaprojectProjectState,
} from '../meta/Megaproject';
import { browserResearchStorage, loadResearchState, saveResearchState, scienceMeter, setPinnedResearchTarget } from '../meta/ResearchTree';
import { emitStorySignal } from '../story';
import { requestOpenClaimLedger } from '../encyclopedia/events';
import { discoverLedgerContract, discoverLedgerEntry, discoverLedgerTownActor } from '../encyclopedia/state';
import { renderResearchChart } from '../ui/ResearchChart';
import { WorldInfoNotePrompt, type WorldInfoObjectClass } from '../ui/WorldInfoNotes';
import { disposeObject3D } from '../utils/dispose';
import { SoundSystem } from '../audio/SoundSystem';
import {
  createRideRoom,
  currentMultiplayerSetup,
  probeRideRoom,
  relayBaseFromTownSearch,
  resolveJoinPhrase,
  stageRideConfig,
} from '../mp/RideTogether';
import {
  earnedTownBuildings,
  townBuildings,
  townPlazaLayout,
  townPlazaSlot,
  townPropRing,
  townTrailLayout,
  type TownBuilding,
  type TownBuildingId,
  type TownPropKind,
} from './townLayout';
import { readTownName, saveTownName, validateTownName } from './TownNaming';
import { TOWN_ACTORS, townActorBark, visibleTownActors, type TownActorDefinition, type TownActorId } from './townsfolk';

const loadTavernBackdropUrl = () =>
  import('../../assets/processed/tavern-interior-backdrop.png?url').then((module) => module.default);
const contractArtUrls = {
  theClaimPlate: new URL('../../assets/raw/plate-contract-the-claim.png', import.meta.url).href,
  dryGulchPlate: new URL('../../assets/raw/plate-contract-dry-gulch.png', import.meta.url).href,
  nightShiftPlate: new URL('../../assets/raw/plate-contract-night-shift.png', import.meta.url).href,
  twinBanksPlate: new URL('../../assets/raw/plate-contract-twin-banks.png', import.meta.url).href,
  baronPlate: new URL('../../assets/raw/plate-contract-baron.png', import.meta.url).href,
  hillMinePlate: new URL('../../assets/raw/plate-contract-hill-mine.png', import.meta.url).href,
} as const;
const contractArtRegistry: Record<string, { key: string; imageUrl?: string; insetUrl?: string }> = {
  [DEFAULT_CONTRACT_ID]: { key: 'contract-the-claim', imageUrl: contractArtUrls.theClaimPlate },
  'e1-dry-gulch': { key: 'contract-dry-gulch', imageUrl: contractArtUrls.dryGulchPlate },
  'e1-night-shift': { key: 'contract-night-shift', imageUrl: contractArtUrls.nightShiftPlate },
  'e1-twin-banks': { key: 'contract-twin-banks', imageUrl: contractArtUrls.twinBanksPlate },
  'e1-baron': { key: 'contract-baron', imageUrl: contractArtUrls.baronPlate },
  'e2-hill-mine': { key: 'contract-hill-mine', imageUrl: contractArtUrls.hillMinePlate },
};
const townFacadeUrls: Partial<Record<TownBuildingId, { key: string; url: string }>> = {
  tavern: { key: 'bld-tavern', url: new URL('../../assets/processed/bld-tavern.png', import.meta.url).href },
  claim_office: { key: 'bld-claim-office', url: new URL('../../assets/processed/bld-claim-office.png', import.meta.url).href },
  schoolhouse: { key: 'bld-schoolhouse', url: new URL('../../assets/processed/bld-schoolhouse.png', import.meta.url).href },
  assay_office: { key: 'bld-claim-office', url: new URL('../../assets/processed/bld-claim-office.png', import.meta.url).href },
  general_store: { key: 'bld-general-store', url: new URL('../../assets/processed/bld-general-store.png', import.meta.url).href },
  chapel: { key: 'bld-chapel', url: new URL('../../assets/processed/bld-chapel.png', import.meta.url).href },
};
const townFacadeLoader = new THREE.TextureLoader();
const townFacadeTextures = new Map<string, Promise<THREE.Texture | null>>();
const TOWN_HALF = 15;
const TOWN_BOUNDS = { minX: -TOWN_HALF, maxX: TOWN_HALF, minZ: -TOWN_HALF, maxZ: TOWN_HALF };
const HERO_START = new THREE.Vector3(0, 0.06, 0);
const TAVERN_DOOR = new THREE.Vector3(townPlazaSlot('tavern').approach.x, 0.08, townPlazaSlot('tavern').approach.z);
const FIRST_CLAIM_GREETING = "The valley's open. The tavern keeps the contracts. Go stake your first claim.";
const FIRST_CLAIM_PENDING = 'pending';
const APPROACH_RADIUS = 5.2;
const STAMP_MILL_ID = 'stamp-mill';
const STEAMWORKS_EPOCH_ID = 'epoch-2-steamworks';
const STAMP_MILL_TOWN_SITE = { ...townPlazaSlot('stamp-mill').position, w: 6.2, d: 1.65 };
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
  schoolhouseOpen: boolean;
  activeEpochId: string;
  assayOpen: boolean;
  buildings: Array<{
    id: TownBuildingId;
    name: string;
    visible: boolean;
    territoryRequired: number | null;
    barkSlot: string | null;
    position: { x: number; z: number };
    approach: { x: number; z: number };
    plotVisible: boolean;
    facadeKey: string;
  }>;
  plaza: { clearRadius: number; gate: { x: number; z: number }; emptyPlots: number; trailCount: number };
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
    trailId: string | null;
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
  propRing: {
    enabled: boolean;
    night: boolean;
    drawCallBudget: number;
    counts: Record<TownPropKind, number>;
    panMonument: { visible: boolean; x: number; z: number; waterState: 'dry' };
    ponyExpressPlot: { visible: boolean; x: number; z: number; pictogram: 'rider-horn' };
    lanterns: number;
  };
  ambientDust: { enabled: boolean; tier: PerformanceTier; count: number; drawCalls: number };
  firstClaimGuide: {
    active: boolean;
    done: boolean;
    greetingVisible: boolean;
    trailVisible: boolean;
    flagKey: typeof FIRST_CLAIM_DONE_KEY;
  };
  renderer: { calls: number; geometries: number; textures: number };
  canvas: { width: number; height: number; dpr: number };
};

type TownSceneOptions = {
  openBoard?: boolean;
  initialBoardContractId?: string;
  returnResult?: 'secured' | 'overrun';
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
  private readonly audio = new SoundSystem();
  private readonly input: InputController;
  private readonly loop = new Loop((delta) => this.update(delta), () => this.render());
  private readonly ui = document.createElement('section');
  private readonly prompt = document.createElement('div');
  private infoNote?: WorldInfoNotePrompt;
  private readonly nameCard = document.createElement('form');
  private readonly board = document.createElement('section');
  private readonly schoolhouse = document.createElement('section');
  private readonly hiddenButtons: HiddenButtonState[];
  private readonly metaProgress = readTownMetaProgress();
  private readonly visibleBuildings = earnedTownBuildings(this.metaProgress.tracks.territory);
  private readonly visibleActors = visibleTownActors(this.visibleBuildings);
  private readonly stampMill = readTownStampMill(this.metaProgress);
  private readonly stampMillGroup = new THREE.Group();
  private readonly stampMillStageVisuals: THREE.Object3D[] = [];
  private readonly stampMillSurveyVisuals: THREE.Object3D[] = [];
  private readonly stampMillConstructionProps: THREE.Object3D[] = [];
  private readonly firstClaimGuideGroup = new THREE.Group();
  private readonly firstClaimTrailDots: THREE.Mesh[] = [];
  private readonly firstClaimTrailMaterial = new THREE.MeshBasicMaterial({
    color: '#ffe4a0',
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  });
  private readonly firstClaimPulseMaterial = new THREE.MeshBasicMaterial({
    color: '#5b8a8a',
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  private readonly propRingEnabled = !new URLSearchParams(window.location.search).has('noTownProps');
  private readonly townNight = new URLSearchParams(window.location.search).has('townNight');
  private readonly performanceTier = performanceTierDiagnostics().tier;
  private readonly ambientDust = createAmbientDust(this.performanceTier, this.townNight);
  private readonly ambientDustObject = new THREE.Object3D();
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
  private assayBench?: ReturnType<typeof installAssayBench>;
  private promptKey = '';
  private townName = readTownName();
  private nameMode: TownNameMode = 'founding';
  private nameCardOpen = false;
  private boardOpen = false;
  private schoolhouseOpen = false;
  private selectedResearchNodeId: string | undefined;
  private nameBeatTimer = 0;
  private lastExitIntent = false;
  private tavernBackdropUrl: string | undefined;
  private tavernBackdropRequest: Promise<string> | undefined;
  private stampMillPlaqueText = '';
  private returnBeatEmitted = false;
  private boardPageIndex = 0;
  private boardSwipeStartX: number | null = null;
  private firstClaimGuideActive = false;
  private firstClaimPulseRing?: THREE.Mesh;
  private firstClaimGreetingVisible = false;
  private firstClaimGreetingDismissed = false;
  private ridePhrase: string | null = null;
  private rideStatus = '';
  private rideBusy = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onExit: () => void,
    private readonly options: TownSceneOptions = {},
  ) {
    this.boardPageIndex = boardPageIndexForContract(options.initialBoardContractId);
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = 1.02;
    this.input = new InputController(this.getElement('#touch-stick'), this.getElement('#touch-knob'), this.getElement('#confirm-button'));
    this.hiddenButtons = this.hideTownActionButtons();
    this.firstClaimGuideActive = shouldStartFirstClaimGuide(this.townName, this.metaProgress);
    if (this.firstClaimGuideActive) markFirstClaimGuidePending();
    this.createScene();
    this.createUi();
    window.addEventListener('keydown', this.onFirstClaimInput, true);
    window.addEventListener('pointerdown', this.onFirstClaimInput, true);
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    this.cameraRig.snapTo(this.hero.group.position);
    this.publishDiagnostics();
  }

  start(): void {
    this.audio.setLoop('title-theme', true);
    this.loop.start();
  }

  dispose(): void {
    this.loop.stop();
    this.input.dispose();
    for (const state of this.hiddenButtons) state.element.hidden = state.hidden;
    window.clearTimeout(this.nameBeatTimer);
    window.removeEventListener('keydown', this.onFirstClaimInput, true);
    window.removeEventListener('pointerdown', this.onFirstClaimInput, true);
    this.prompt.removeEventListener('click', this.onPromptClick);
    this.board.removeEventListener('click', this.onBoardClick);
    this.board.removeEventListener('keydown', this.onBoardKeyDown);
    this.board.removeEventListener('pointerdown', this.onBoardPointerDown);
    this.board.removeEventListener('pointerup', this.onBoardPointerUp);
    this.board.removeEventListener('pointercancel', this.onBoardPointerCancel);
    this.schoolhouse.removeEventListener('click', this.onSchoolhouseClick);
    this.schoolhouse.removeEventListener('keydown', this.onSchoolhouseKeyDown);
    this.nameCard.removeEventListener('submit', this.onNameSubmit);
    this.nameInput?.removeEventListener('keydown', stopKeyPropagation);
    this.infoNote?.dispose();
    this.assayBench?.dispose();
    for (const actor of this.townActors) actor.dispose();
    this.ui.remove();
    this.hero.dispose();
    this.audio.dispose();
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
    if (this.boardOpen || this.schoolhouseOpen || this.assayBenchOpen()) {
      for (const actor of this.townActors) actor.update(delta, this.elapsed);
      this.updateAmbientDust();
      if (rawExitIntent && !this.lastExitIntent) {
        if (this.boardOpen) this.closeBoard();
        else if (this.schoolhouseOpen) this.closeSchoolhouse();
        else this.closeAssayBench();
      }
      this.lastExitIntent = rawExitIntent;
      this.updateFirstClaimGuide();
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
    this.updateAmbientDust();
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.updateFirstClaimGuide();
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
    this.scene.background = new THREE.Color(this.townNight ? '#41365a' : '#e9c98d');
    this.scene.fog = new THREE.Fog(this.townNight ? '#41365a' : '#e9c98d', this.townNight ? 24 : 34, this.townNight ? 58 : 76);
    this.scene.add(
      new THREE.HemisphereLight(this.townNight ? '#ddc6a0' : '#fff2cc', this.townNight ? '#2e2642' : '#8b6c3f', this.townNight ? 0.62 : 1.15),
    );

    const sun = new THREE.DirectionalLight(this.townNight ? '#bfa3ff' : '#ffd28a', this.townNight ? 0.82 : 2.2);
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
    this.scene.add(ground);

    for (const building of this.visibleBuildings) {
      this.scene.add(createShell(building));
    }
    for (const building of townBuildings) {
      if (!this.visibleBuildings.includes(building)) this.scene.add(createSurveyPlot(building));
    }
    if (this.propRingEnabled) this.scene.add(createTownPropRing(this.townNight));
    if (this.ambientDust) this.scene.add(this.ambientDust);
    this.createStampMillVignette();
    this.createFirstClaimGuide();
    for (const actor of this.visibleActors) {
      const runtime = new TownActorRuntime(townActorPlazaPlacement(actor));
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
    this.schoolhouse.className = 'town-ui__surface town-ui__schoolhouse';
    this.schoolhouse.dataset.testid = 'schoolhouse-view';
    this.schoolhouse.setAttribute('aria-label', 'Schoolhouse research chart');
    this.schoolhouse.hidden = true;
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
    this.board.addEventListener('keydown', this.onBoardKeyDown);
    this.board.addEventListener('pointerdown', this.onBoardPointerDown);
    this.board.addEventListener('pointerup', this.onBoardPointerUp);
    this.board.addEventListener('pointercancel', this.onBoardPointerCancel);
    this.schoolhouse.addEventListener('click', this.onSchoolhouseClick);
    this.schoolhouse.addEventListener('keydown', this.onSchoolhouseKeyDown);
    this.nameCard.addEventListener('submit', this.onNameSubmit);
    this.ui.append(this.board);
    this.ui.append(this.schoolhouse);
    this.getElement('#app').append(this.ui);
    this.syncTownTitle();
    if (!this.townName) this.openNameCard('founding');
    if (this.options.openBoard) this.openBoard();
    discoverLedgerEntry('the_claim');
    this.emitGrowthSightBeats();
  }

  private readonly onExitClick = () => {
    this.onExit();
  };

  private readonly onPromptClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-town-board]')) this.openBoard();
    if (target?.closest('[data-town-rename]')) this.openNameCard('rename');
    if (target?.closest('[data-town-schoolhouse]')) this.openSchoolhouse();
    if (target?.closest('[data-town-assay]')) this.openAssayBench();
  };

  private readonly onBoardClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-contract-close]')) {
      this.closeBoard();
      return;
    }
    const pageButton = target?.closest<HTMLButtonElement>('[data-contract-page]');
    if (pageButton?.dataset.contractPage) {
      this.selectBoardPage(Number.parseInt(pageButton.dataset.contractPage, 10));
      return;
    }
    const pageStep = target?.closest<HTMLButtonElement>('[data-contract-page-step]');
    if (pageStep?.dataset.contractPageStep) {
      this.selectBoardPage(this.boardPageIndex + Number.parseInt(pageStep.dataset.contractPageStep, 10));
      return;
    }
    if (target?.closest('[data-ride-open]')) {
      void this.openRideTogetherClaim();
      return;
    }
    if (target?.closest('[data-ride-start]')) {
      this.launchRideTogether();
      return;
    }
    if (target?.closest('[data-ride-join]')) {
      void this.joinRideTogether();
      return;
    }
    const launch = target?.closest<HTMLButtonElement>('[data-contract-launch]');
    const id = launch?.dataset.contractLaunch;
    if (id && !launch.disabled) {
      if (!this.confirmFreshContractLaunch(id)) return;
      clearRunSuspend();
      this.options.onLaunchContract?.(id);
    }
  };

  private readonly onFirstClaimInput = () => {
    if (!this.firstClaimGreetingVisible) return;
    this.firstClaimGreetingDismissed = true;
    this.hideBark();
    this.publishDiagnostics();
  };

  private readonly onBoardKeyDown = (event: KeyboardEvent) => {
    if ((event.target as HTMLElement | null)?.closest('[data-ride-join-input]')) {
      event.stopPropagation();
      if (event.key === 'Enter') {
        event.preventDefault();
        void this.joinRideTogether();
      }
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation();
    this.selectBoardPage(this.boardPageIndex + (event.key === 'ArrowRight' ? 1 : -1));
  };

  private readonly onBoardPointerDown = (event: PointerEvent) => {
    if (!this.boardOpen || event.pointerType === 'mouse' || event.button !== 0) return;
    this.boardSwipeStartX = event.clientX;
  };

  private readonly onBoardPointerUp = (event: PointerEvent) => {
    if (this.boardSwipeStartX === null) return;
    const delta = event.clientX - this.boardSwipeStartX;
    this.boardSwipeStartX = null;
    if (Math.abs(delta) < 52) return;
    this.selectBoardPage(this.boardPageIndex + (delta < 0 ? 1 : -1));
  };

  private readonly onBoardPointerCancel = () => {
    this.boardSwipeStartX = null;
  };

  private readonly onSchoolhouseClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-schoolhouse-close]')) {
      this.closeSchoolhouse();
      return;
    }
    if (target?.closest('[data-schoolhouse-ledger]')) {
      requestOpenClaimLedger();
      return;
    }
    if (target?.closest('[data-raise-stamp-mill]')) {
      this.raiseStampMill();
      return;
    }
    const nodeButton = target?.closest<HTMLElement>('[data-research-node]');
    if (nodeButton?.dataset.researchNode) {
      this.selectResearchNode(nodeButton.dataset.researchNode);
      return;
    }
    const pinButton = target?.closest<HTMLElement>('[data-research-pin]');
    if (pinButton) this.pinResearchTarget(pinButton.dataset.researchPin || null);
  };

  private readonly onSchoolhouseKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSchoolhouse();
    }
    event.stopPropagation();
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
    if (this.boardOpen || this.schoolhouseOpen || this.assayBenchOpen()) {
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
    } else if (nearest.id === 'schoolhouse') {
      this.prompt.innerHTML = `
        <span>${nearest.name} ... Elder's Survey Chart</span>
        <button class="town-ui__prompt-button" type="button" data-town-schoolhouse data-testid="town-open-schoolhouse">Chart</button>
      `;
    } else if (nearest.id === 'assay_office') {
      this.prompt.innerHTML = `
        <span>${nearest.name} ... order status</span>
        <button class="town-ui__prompt-button" type="button" data-town-assay data-testid="town-open-assay">Orders</button>
      `;
    } else {
      this.prompt.textContent = `${nearest.name} ... opens soon`;
    }
  }

  private syncBark(): void {
    if (this.boardOpen || this.schoolhouseOpen || this.assayBenchOpen() || this.nameCardOpen) {
      this.hideBark();
      return;
    }

    if (this.firstClaimGuideActive && !this.firstClaimGreetingDismissed) {
      if (this.storyBeatVisible()) {
        this.hideBark();
        return;
      }
      const greeter = this.firstClaimGreeter();
      if (greeter) {
        if (this.activeBarkActor !== greeter || !this.firstClaimGreetingVisible) {
          this.showBark(greeter, FIRST_CLAIM_GREETING, true);
        }
        return;
      }
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
    discoverLedgerTownActor(nearest.definition.id);
    this.showBark(nearest, text);
  }

  private firstClaimGreeter(): TownActorRuntime | null {
    const position = this.hero.group.position;
    let nearest: TownActorRuntime | null = null;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;
    for (const actor of this.townActors) {
      if (actor.definition.id !== 'tavernkeeper' && actor.definition.id !== 'elder') continue;
      const dx = position.x - actor.position.x;
      const dz = position.z - actor.position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq >= nearestDistanceSq) continue;
      nearest = actor;
      nearestDistanceSq = distanceSq;
    }
    return nearest;
  }

  private showBark(nearest: TownActorRuntime, text: string, firstClaim = false): void {
    this.firstClaimGreetingVisible = firstClaim;
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
    if (firstClaim) this.barkCard.dataset.firstClaim = 'true';
    else delete this.barkCard.dataset.firstClaim;
    this.barkCard.hidden = false;
  }

  private hideBark(): void {
    this.activeBarkActor = null;
    this.activeBark = null;
    this.firstClaimGreetingVisible = false;
    this.barkCard.hidden = true;
    this.barkCard.textContent = '';
    delete this.barkCard.dataset.actorId;
    delete this.barkCard.dataset.firstClaim;
  }

  private openBoard(): void {
    this.renderBoard();
    this.emitReturnStorySignal();
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

  private openSchoolhouse(): void {
    this.schoolhouseOpen = true;
    this.selectedResearchNodeId = activeProfileResearchState().pinnedTarget ?? this.selectedResearchNodeId;
    this.renderSchoolhouse();
    this.schoolhouse.hidden = false;
    this.schoolhouse.querySelector<HTMLElement>('[data-research-node], [data-schoolhouse-close]')?.focus({ preventScroll: true });
    this.publishDiagnostics();
  }

  private closeSchoolhouse(): void {
    this.schoolhouse.hidden = true;
    this.schoolhouseOpen = false;
    this.syncPrompt();
    this.publishDiagnostics();
  }

  private renderSchoolhouse(): void {
    this.schoolhouse.innerHTML = `
      <div class="town-ui__surface-shell">
        <header class="town-ui__surface-header">
          <div>
            <p class="town-ui__board-eyebrow">Schoolhouse</p>
            <h2>Elder's Survey Chart</h2>
          </div>
          <button class="town-ui__board-close" type="button" data-schoolhouse-close data-testid="schoolhouse-close">Back</button>
          <button class="town-ui__board-close" type="button" data-schoolhouse-ledger data-testid="schoolhouse-open-ledger">Claim Ledger</button>
        </header>
        <div class="town-ui__surface-body">
          ${renderResearchChart(activeProfileResearchState(), this.selectedResearchNodeId)}
          ${this.renderEpochActivationAction()}
        </div>
      </div>
    `;
  }

  private renderEpochActivationAction(): string {
    const { manifest, project } = this.stampMill;
    if (!manifest || !project || epochIsActive(STEAMWORKS_EPOCH_ID)) return '';
    if (!scienceMeter(activeProfileResearchState()).complete || !megaprojectComplete(manifest, project)) return '';
    const pledgedGold = manifest.stages.reduce((sum, stage) => sum + Math.max(0, Math.floor(stage.materials.gold ?? 0)), 0);
    return `
      <section class="town-ui__epoch-door" data-testid="stamp-mill-epoch-door">
        <p class="town-ui__board-eyebrow">The town's next ledger</p>
        <h3>The Stamp Mill is ready.</h3>
        <p>Frontier science banked · ${pledgedGold} gold pledged across three defended stages.</p>
        <button type="button" data-raise-stamp-mill data-testid="raise-stamp-mill">Raise the Stamp Mill</button>
      </section>
    `;
  }

  private raiseStampMill(): void {
    const { manifest, project } = this.stampMill;
    if (!manifest || !project || !megaprojectComplete(manifest, project)) return;
    if (!scienceMeter(activeProfileResearchState()).complete || !activateEpoch(STEAMWORKS_EPOCH_ID)) return;
    this.renderSchoolhouse();
    emitStorySignal({ type: 'epoch-activated', epochId: STEAMWORKS_EPOCH_ID, displayName: 'The Steamworks' });
    this.publishDiagnostics();
  }

  private selectResearchNode(id: string): void {
    this.selectedResearchNodeId = id;
    this.renderSchoolhouse();
    this.schoolhouse.querySelector<HTMLElement>(`[data-research-node="${id}"]`)?.focus({ preventScroll: true });
  }

  private pinResearchTarget(id: string | null): void {
    const storage = browserResearchStorage();
    const next = saveResearchState(storage, setPinnedResearchTarget(activeProfileResearchState(), id));
    this.selectedResearchNodeId = next.pinnedTarget ?? this.selectedResearchNodeId;
    this.renderSchoolhouse();
    this.schoolhouse.querySelector<HTMLElement>('[data-testid="research-chart-pin"]')?.focus({ preventScroll: true });
  }

  private openAssayBench(): void {
    this.assayBench ??= installAssayBench(this.getElement('#app'), { initiallyOpen: false });
    this.assayBench?.focus();
    this.publishDiagnostics();
  }

  private closeAssayBench(): void {
    this.assayBenchRoot()?.querySelector<HTMLButtonElement>('[data-testid="assay-close"]')?.click();
    this.syncPrompt();
    this.publishDiagnostics();
  }

  private confirmFreshContractLaunch(contractId: string): boolean {
    const suspend = readRunSuspend();
    if (!suspend) return true;
    return window.confirm(`Abandon ${suspendContext(suspend)} and launch ${contractName(contractId)}?`);
  }

  private renderBoard(): void {
    const rows = listBoardContracts();
    for (const contract of rows) discoverLedgerContract(contract.id);
    const scores = loadScores();
    const pageIndex = clampBoardPage(this.boardPageIndex, rows.length);
    this.boardPageIndex = pageIndex;
    const contract = rows[pageIndex];
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
        <div class="town-ui__contracts" data-testid="contract-card-list" data-contract-page-index="${pageIndex}">
          <button class="town-ui__catalog-arrow town-ui__catalog-arrow--prev" type="button" data-contract-page-step="-1" data-testid="contract-page-prev" aria-label="Previous contract" ${
            pageIndex === 0 ? 'disabled' : ''
          }>&lsaquo;</button>
          ${contract ? this.renderContractCard(contract, scores, pageIndex, rows.length) : ''}
          <button class="town-ui__catalog-arrow town-ui__catalog-arrow--next" type="button" data-contract-page-step="1" data-testid="contract-page-next" aria-label="Next contract" ${
            pageIndex >= rows.length - 1 ? 'disabled' : ''
          }>&rsaquo;</button>
        </div>
        <nav class="town-ui__catalog-nav" data-testid="contract-page-nav" aria-label="Contract pages">
          <span class="town-ui__catalog-count" data-testid="contract-page-count">${pageIndex + 1} / ${rows.length}</span>
          <div class="town-ui__catalog-dots">
            ${rows
              .map(
                (row, index) => `
                  <button class="town-ui__catalog-dot" type="button" data-contract-page="${index}" data-testid="contract-page-dot-${escapeHtml(
                    row.id,
                  )}" aria-label="${escapeHtml(`Open ${row.boardRow.name}`)}" aria-current="${index === pageIndex ? 'page' : 'false'}"></button>
                `,
              )
              .join('')}
          </div>
        </nav>
        ${this.renderRideTogetherCard()}
      </div>
    `;
  }

  private selectBoardPage(index: number): void {
    this.boardPageIndex = clampBoardPage(index, listBoardContracts().length);
    this.renderBoard();
    this.board.querySelector<HTMLElement>('.town-ui__contract')?.focus({ preventScroll: true });
  }

  private renderContractCard(contract: ContractManifest, scores: readonly ScoreRecord[], pageIndex: number, pageCount: number): string {
    const unlock = contractUnlock(contract);
    const best = bestContractScore(contract.id, scores);
    const tags = contract.boardRow.tags.length > 0 ? contract.boardRow.tags : ['trail'];
    const medal = contract.id === 'e1-baron' && hasBaronMedal();
    const firstClaimHint = this.firstClaimGuideActive && contract.id === DEFAULT_CONTRACT_ID && unlock.unlocked;
    const baronStakes =
      contract.id === 'e1-baron' && unlock.unlocked
        ? `<p class="town-ui__contract-stakes" data-testid="contract-stakes-e1-baron">The Baron's outfit rides at 20 — cadence runs hot (+15%).</p>`
        : '';
    return `
      <article class="town-ui__contract ${unlock.unlocked ? '' : 'town-ui__contract--locked'}" tabindex="-1" data-testid="contract-card-${escapeHtml(
        contract.id,
      )}" data-contract-id="${escapeHtml(contract.id)}" data-contract-locked="${unlock.unlocked ? 'false' : 'true'}" aria-label="${escapeHtml(
        `${contract.boardRow.name}, page ${pageIndex + 1} of ${pageCount}`,
      )}">
        ${renderContractArt(contract)}
        <div class="town-ui__contract-copy">
          <div class="town-ui__contract-topline">
            <span class="town-ui__contract-tag">${escapeHtml(formatTag(tags[0] ?? 'trail'))}</span>
            <span class="town-ui__contract-state">${unlock.unlocked ? 'Open' : 'Locked'}</span>
          </div>
          <h3>${escapeHtml(contract.boardRow.name)}</h3>
          <p class="town-ui__contract-flavor" data-testid="contract-flavor-${escapeHtml(contract.id)}">${escapeHtml(
            contract.boardRow.ledgerBlurb,
          )}</p>
          ${
            unlock.unlocked
              ? `
                ${renderContractBriefing(contract)}
                ${baronStakes}
                ${
                  medal
                    ? `<p class="town-ui__contract-best town-ui__contract-medal" data-testid="contract-medal-e1-baron">Baron beaten. ${escapeHtml(BARON_MEDAL_BLURB)}</p>`
                    : `<p class="town-ui__contract-best" data-testid="contract-best-${escapeHtml(contract.id)}">${escapeHtml(formatBest(best))}</p>`
                }
              `
              : `
                <p class="town-ui__contract-lock" data-testid="contract-lock-${escapeHtml(contract.id)}">${escapeHtml(unlock.condition)}</p>
                <p class="town-ui__contract-teaser" data-testid="contract-teaser-${escapeHtml(
                  contract.id,
                )}">The clerk draws up the terms when you're ready.</p>
              `
          }
          ${firstClaimHint ? '<p class="town-ui__first-claim-tooltip" data-testid="first-claim-launch-tooltip">Stake your first claim</p>' : ''}
          <button class="town-ui__contract-action" type="button" data-contract-launch="${escapeHtml(contract.id)}" data-testid="contract-launch-${escapeHtml(
            contract.id,
          )}" ${firstClaimHint ? 'data-first-claim-launch="true" title="Stake your first claim"' : ''} ${unlock.unlocked ? '' : 'disabled'}>
            ${escapeHtml(unlock.unlocked ? 'Launch' : unlock.condition)}
          </button>
        </div>
      </article>
    `;
  }

  private renderRideTogetherCard(): string {
    const phrase = this.ridePhrase;
    const status = this.rideStatus || (phrase ? 'Give this claim word to the other rider.' : 'Open a claim or join with a claim word.');
    return `
      <aside class="town-ui__ride-card" data-testid="ride-together-card">
        <div>
          <p class="town-ui__board-eyebrow">Ride Together</p>
          <h3>Share this claim</h3>
          <p>${escapeHtml(status)}</p>
        </div>
        <div class="town-ui__ride-actions">
          <button class="town-ui__contract-action" type="button" data-ride-open data-testid="ride-open-claim" ${this.rideBusy ? 'disabled' : ''}>
            Open the Claim
          </button>
          ${
            phrase
              ? `<button class="town-ui__contract-action" type="button" data-ride-start data-testid="ride-start" ${this.rideBusy ? 'disabled' : ''}>Start Ride</button>`
              : ''
          }
        </div>
        ${
          phrase
            ? `<output class="town-ui__ride-code" data-testid="ride-code-word">${escapeHtml(phrase)}</output>`
            : '<output class="town-ui__ride-code town-ui__ride-code--empty" data-testid="ride-code-word">No claim open</output>'
        }
        <div class="town-ui__ride-join">
          <input class="town-ui__name-input" data-ride-join-input data-testid="ride-join-input" aria-label="Claim word" autocomplete="off" spellcheck="false" />
          <button class="town-ui__contract-action" type="button" data-ride-join data-testid="ride-join-submit" ${this.rideBusy ? 'disabled' : ''}>
            Join a Ride
          </button>
        </div>
        <p class="town-ui__ride-status" data-testid="ride-status">${escapeHtml(status)}</p>
      </aside>
    `;
  }

  private async openRideTogetherClaim(): Promise<void> {
    if (this.rideBusy) return;
    this.rideBusy = true;
    this.rideStatus = 'Opening the claim wire...';
    this.renderBoard();
    try {
      const ride = await createRideRoom(relayBaseFromTownSearch(), this.ridePlayer());
      this.ridePhrase = ride.phrase;
      this.rideStatus = 'Claim open. Give this word to the other rider.';
    } catch {
      this.rideStatus = "The claim wire isn't ready yet.";
    } finally {
      this.rideBusy = false;
      this.renderBoard();
    }
  }

  private launchRideTogether(): void {
    if (!this.ridePhrase) return;
    if (!this.confirmFreshContractLaunch(DEFAULT_CONTRACT_ID)) return;
    clearRunSuspend();
    this.options.onLaunchContract?.(DEFAULT_CONTRACT_ID);
  }

  private async joinRideTogether(): Promise<void> {
    if (this.rideBusy) return;
    const input = this.board.querySelector<HTMLInputElement>('[data-ride-join-input]');
    const code = resolveJoinPhrase(input?.value ?? '');
    if (!code) {
      this.rideStatus = "That claim's gone quiet.";
      this.renderBoard();
      return;
    }
    this.rideBusy = true;
    this.rideStatus = 'Checking the claim wire...';
    this.renderBoard();
    const relayBase = relayBaseFromTownSearch();
    const player = this.ridePlayer();
    const setup = currentMultiplayerSetup(DEFAULT_CONTRACT_ID);
    const ok = await probeRideRoom(relayBase, code, player, setup);
    if (!ok) {
      this.rideBusy = false;
      this.rideStatus = "That claim's gone quiet.";
      this.renderBoard();
      return;
    }
    stageRideConfig({ relayBase, code, player, phrase: input?.value.trim().toUpperCase() || code, setup });
    clearRunSuspend();
    this.options.onLaunchContract?.(DEFAULT_CONTRACT_ID);
  }

  private ridePlayer(): { name: string; town: string } {
    return {
      name: activeProfileName(),
      town: this.townName ?? 'Home Claim',
    };
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

  private emitReturnStorySignal(): void {
    if (!this.options.returnResult || this.returnBeatEmitted) return;
    this.returnBeatEmitted = true;
    emitStorySignal({ type: 'run-return-town', result: this.options.returnResult });
  }

  private loadTavernBackdrop(): void {
    this.tavernBackdropRequest ??= loadTavernBackdropUrl();
    void this.tavernBackdropRequest.then((url) => {
      this.tavernBackdropUrl = url;
      const backdrop = this.board.querySelector<HTMLElement>('.town-ui__board-backdrop');
      if (backdrop) backdrop.style.backgroundImage = `url("${url}")`;
    });
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
      schoolhouseOpen: this.schoolhouseOpen,
      activeEpochId: activeEpochId(),
      assayOpen: this.assayBenchOpen(),
      buildings: townBuildings.map((building) => ({
        id: building.id,
        name: building.name,
        visible: this.visibleBuildings.includes(building),
        territoryRequired: building.requires?.territory ?? null,
        barkSlot: building.barkSlot ?? null,
        position: building.position,
        approach: townPlazaSlot(building.id).approach,
        plotVisible: !this.visibleBuildings.includes(building),
        facadeKey: townFacadeKey(building),
      })),
      plaza: {
        clearRadius: townPlazaLayout.clearRadius,
        gate: townPlazaLayout.gate,
        emptyPlots: townBuildings.length - this.visibleBuildings.length,
        trailCount: townPlazaLayout.slots.length + 1,
      },
      actors: TOWN_ACTORS.map((actor) => {
        const runtime = this.townActors.find((item) => item.definition.id === actor.id);
        const placement = townActorPlazaPlacement(actor);
        return {
          id: actor.id,
          name: actor.name,
          post: actor.post,
          visible: !!runtime,
          anchor: actor.anchor,
          position: {
            x: round2(runtime?.position.x ?? placement.position.x),
            z: round2(runtime?.position.z ?? placement.position.z),
          },
          bark: this.activeBark?.actorId === actor.id ? this.activeBark.text : null,
          loaded: runtime?.loaded ?? false,
          loop: !!actor.loop,
          trailId: actor.loop?.trailId ?? null,
          assetSlot: actor.assetSlot,
        };
      }),
      stampMill: this.stampMillDiagnostics(),
      propRing: this.propRingDiagnostics(),
      ambientDust: {
        enabled: !!this.ambientDust,
        tier: this.performanceTier,
        count: this.ambientDust?.count ?? 0,
        drawCalls: this.ambientDust ? 1 : 0,
      },
      firstClaimGuide: {
        active: this.firstClaimGuideActive,
        done: firstClaimDone(),
        greetingVisible: this.firstClaimGreetingVisible,
        trailVisible: this.firstClaimGuideGroup.visible,
        flagKey: FIRST_CLAIM_DONE_KEY,
      },
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

  private propRingDiagnostics(): TownDiagnostics['propRing'] {
    const counts = townPropRing.props.reduce(
      (acc, prop) => {
        acc[prop.kind] += 1;
        return acc;
      },
      {
        covered_wagon: 0,
        fence: 0,
        cactus: 0,
        water_trough: 0,
        lantern_post: 0,
        pony_express_plot: 0,
      } satisfies Record<TownPropKind, number>,
    );
    const pony = townPropRing.props.find((prop) => prop.kind === 'pony_express_plot');
    return {
      enabled: this.propRingEnabled,
      night: this.townNight,
      drawCallBudget: 12,
      counts,
      panMonument: {
        visible: this.propRingEnabled,
        x: townPropRing.panMonument.position.x,
        z: townPropRing.panMonument.position.z,
        waterState: 'dry',
      },
      ponyExpressPlot: {
        visible: this.propRingEnabled && !!pony,
        x: pony?.position.x ?? 0,
        z: pony?.position.z ?? 0,
        pictogram: 'rider-horn',
      },
      lanterns: counts.lantern_post,
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

  private storyBeatVisible(): boolean {
    return document.querySelector('[data-testid="story-beat-card"]') !== null;
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Missing ${selector}`);
    return element;
  }

  private assayBenchRoot(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[data-testid="assay-bench"]');
  }

  private assayBenchOpen(): boolean {
    return this.assayBenchRoot()?.hidden === false;
  }

  private createFirstClaimGuide(): void {
    this.firstClaimGuideGroup.name = 'FirstClaimGuide';
    this.firstClaimGuideGroup.visible = false;
    const dotGeometry = new THREE.CircleGeometry(0.18, 24);
    for (let index = 0; index < 8; index += 1) {
      const dot = new THREE.Mesh(dotGeometry, this.firstClaimTrailMaterial);
      dot.name = `FirstClaimTrailDot:${index}`;
      dot.rotation.x = -Math.PI / 2;
      dot.renderOrder = RenderLayers.worldUi;
      this.firstClaimTrailDots.push(dot);
      this.firstClaimGuideGroup.add(dot);
    }

    const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.46, 48), this.firstClaimPulseMaterial);
    ring.name = 'FirstClaimTavernPulse';
    ring.position.copy(TAVERN_DOOR);
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = RenderLayers.worldUi;
    this.firstClaimPulseRing = ring;
    this.firstClaimGuideGroup.add(ring);
    this.scene.add(this.firstClaimGuideGroup);
  }

  private updateAmbientDust(): void {
    if (!this.ambientDust) return;
    const object = this.ambientDustObject;
    for (let index = 0; index < this.ambientDust.count; index += 1) {
      const seed = index * 17.17;
      const radius = 3.8 + (index % 9) * 1.15;
      const angle = seed + this.elapsed * (0.045 + (index % 5) * 0.008);
      object.position.set(Math.sin(angle) * radius, 0.55 + ((seed + this.elapsed * 0.16) % 2.8), Math.cos(angle) * radius);
      object.scale.setScalar(0.035 + (index % 4) * 0.012);
      object.updateMatrix();
      this.ambientDust.setMatrixAt(index, object.matrix);
    }
    this.ambientDust.instanceMatrix.needsUpdate = true;
  }

  private updateFirstClaimGuide(): void {
    const visible = this.firstClaimGuideActive && !this.nameCardOpen && !this.boardOpen && !this.schoolhouseOpen && !this.assayBenchOpen();
    this.firstClaimGuideGroup.visible = visible;
    if (!visible) return;

    const phase = (Math.sin(this.elapsed * 2.6) + 1) * 0.5;
    this.firstClaimTrailMaterial.opacity = 0.42 + phase * 0.16;
    this.firstClaimPulseMaterial.opacity = 0.24 + phase * 0.22;
    const start = this.hero.group.position;
    const count = this.firstClaimTrailDots.length + 1;
    this.firstClaimTrailDots.forEach((dot, index) => {
      const t = (index + 1) / count;
      dot.position.set(
        THREE.MathUtils.lerp(start.x, TAVERN_DOOR.x, t),
        0.075,
        THREE.MathUtils.lerp(start.z, TAVERN_DOOR.z, t),
      );
      dot.scale.setScalar(0.82 + phase * 0.22);
    });
    this.firstClaimPulseRing?.scale.setScalar(1 + phase * 0.08);
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

function clampBoardPage(index: number, count: number): number {
  if (count <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

function boardPageIndexForContract(id: string | undefined): number {
  if (!id) return 0;
  const index = listBoardContracts().findIndex((contract) => contract.id === id);
  return index >= 0 ? index : 0;
}

function renderContractArt(contract: ContractManifest): string {
  const art = contractArtRegistry[contract.id] ?? contractArtRegistry[DEFAULT_CONTRACT_ID];
  const image = art?.imageUrl ? `<img class="town-ui__contract-art-image" src="${escapeHtml(art.imageUrl)}" alt="" />` : '';
  const inset = art?.insetUrl ? `<img class="town-ui__contract-art-inset" src="${escapeHtml(art.insetUrl)}" alt="" />` : '';
  return `
    <figure class="town-ui__contract-art town-ui__contract-art--${escapeHtml(art?.key ?? 'river-tile')}" data-contract-art-key="${escapeHtml(
      art?.key ?? 'river-tile',
    )}" data-testid="contract-art-${escapeHtml(contract.id)}" aria-hidden="true">
      ${image}
      ${inset}
    </figure>
  `;
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
  if (unlock === STEAMWORKS_EPOCH_ID) {
    return { unlocked: epochIsActive(STEAMWORKS_EPOCH_ID), condition: 'Awaits the Steamworks era' };
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

function renderContractBriefing(contract: ContractManifest): string {
  const geographyLine = contract.briefing.geographyLine.trim();
  const duplicateFlavor = geographyLine === contract.boardRow.ledgerBlurb.trim();
  return `
    <div class="town-ui__contract-briefing" data-testid="contract-board-briefing-${escapeHtml(contract.id)}">
      ${
        geographyLine && !duplicateFlavor
          ? `<p class="town-ui__contract-briefing-geography" data-testid="contract-board-geography-${escapeHtml(
              contract.id,
            )}">${escapeHtml(geographyLine)}</p>`
          : ''
      }
      <section>
        <p class="town-ui__contract-briefing-label">Goals</p>
        <ul>${contract.briefing.goals.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
      </section>
      <section>
        <p class="town-ui__contract-briefing-label">Rules</p>
        <ul>${contract.briefing.rules.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
      </section>
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

function activeProfileResearchState() {
  const storage = browserResearchStorage();
  return loadResearchState(storage, storage, { rocketCartCaptured: hasRocketCartCaptured() });
}

function shouldStartFirstClaimGuide(townName: string | null, meta: MetaProgress): boolean {
  const flag = firstClaimFlag();
  if (flag === '1' || readRunSuspend() || loadScores().length > 0) return false;
  if (!Object.values(meta.tracks).every((value) => value === 0)) return false;
  return flag === FIRST_CLAIM_PENDING || !townName;
}

function markFirstClaimGuidePending(): void {
  try {
    const storage = browserStorage();
    if (storage?.getItem(FIRST_CLAIM_DONE_KEY) === null) storage.setItem(FIRST_CLAIM_DONE_KEY, FIRST_CLAIM_PENDING);
  } catch {
    // Optional storage; the visual guide can still run for this session.
  }
}

function firstClaimDone(): boolean {
  return firstClaimFlag() === '1';
}

function firstClaimFlag(): string | null {
  try {
    return browserStorage()?.getItem(FIRST_CLAIM_DONE_KEY) ?? null;
  } catch {
    return null;
  }
}

function suspendContext(suspend: RunSuspendEnvelope): string {
  return `wave ${suspend.wave} · ${contractName(suspend.contractId)}`;
}

function contractName(contractId: string): string {
  try {
    return loadContract(contractId).name;
  } catch {
    return contractId;
  }
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
  const manifest = loadEpoch(DEFAULT_EPOCH_ID).megaprojects.find((entry) => entry.id === STAMP_MILL_ID) ?? null;
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

type BoxPart = { x: number; y: number; z: number; sx: number; sy: number; sz: number; rotation?: number };
type CylinderPart = { x: number; y: number; z: number; scale: [number, number, number]; rotation: THREE.Euler };

function createTownPropRing(night: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TownPropRing';
  const woodParts: BoxPart[] = [];
  const canvasParts: BoxPart[] = [];
  const cactusParts: CylinderPart[] = [];
  const wheelParts: CylinderPart[] = [];
  const lanternPositions: THREE.Vector3[] = [];

  const addBox = (parts: BoxPart[], x: number, y: number, z: number, sx: number, sy: number, sz: number, rotation = 0) =>
    parts.push({ x, y, z, sx, sy, sz, rotation });

  for (const prop of townPropRing.props) {
    const scale = prop.scale ?? 1;
    if (prop.kind === 'covered_wagon') {
      addBox(woodParts, prop.position.x, 0.32, prop.position.z, 1.6 * scale, 0.48 * scale, 0.86 * scale, prop.rotation);
      addBox(canvasParts, prop.position.x, 0.82, prop.position.z, 1.35 * scale, 0.72 * scale, 0.72 * scale, prop.rotation);
      for (const sx of [-0.52, 0.52]) {
        for (const sz of [-0.36, 0.36]) {
          const p = localPoint(prop, sx * scale, sz * scale);
          wheelParts.push({ x: p.x, y: 0.28, z: p.z, scale: [0.18 * scale, 0.12 * scale, 0.18 * scale], rotation: new THREE.Euler(Math.PI / 2, 0, -prop.rotation) });
        }
      }
      continue;
    }
    if (prop.kind === 'fence') {
      addBox(woodParts, prop.position.x, 0.38, prop.position.z, 2.4 * scale, 0.1, 0.1, prop.rotation);
      for (const offset of [-1.05, 0, 1.05]) {
        const p = localPoint(prop, offset * scale, 0);
        addBox(woodParts, p.x, 0.38, p.z, 0.08, 0.76, 0.08, prop.rotation);
      }
      continue;
    }
    if (prop.kind === 'cactus') {
      cactusParts.push({ x: prop.position.x, y: 0.62 * scale, z: prop.position.z, scale: [0.16 * scale, 0.62 * scale, 0.16 * scale], rotation: new THREE.Euler(0, 0, 0) });
      const left = localPoint(prop, -0.23 * scale, 0);
      const right = localPoint(prop, 0.24 * scale, 0.03 * scale);
      cactusParts.push({ x: left.x, y: 0.82 * scale, z: left.z, scale: [0.08 * scale, 0.26 * scale, 0.08 * scale], rotation: new THREE.Euler(0, prop.rotation, Math.PI / 2) });
      cactusParts.push({ x: right.x, y: 0.56 * scale, z: right.z, scale: [0.08 * scale, 0.22 * scale, 0.08 * scale], rotation: new THREE.Euler(0, prop.rotation, -Math.PI / 2) });
      continue;
    }
    if (prop.kind === 'water_trough') {
      addBox(woodParts, prop.position.x, 0.28, prop.position.z, 1.55 * scale, 0.46 * scale, 0.62 * scale, prop.rotation);
      addBox(canvasParts, prop.position.x, 0.53, prop.position.z, 1.28 * scale, 0.04, 0.4 * scale, prop.rotation);
      continue;
    }
    if (prop.kind === 'lantern_post') {
      addBox(woodParts, prop.position.x, 0.85 * scale, prop.position.z, 0.09 * scale, 1.7 * scale, 0.09 * scale, prop.rotation);
      addBox(woodParts, prop.position.x, 1.65 * scale, prop.position.z, 0.42 * scale, 0.08 * scale, 0.08 * scale, prop.rotation);
      lanternPositions.push(new THREE.Vector3(prop.position.x, 1.48 * scale, prop.position.z));
      continue;
    }
    if (prop.kind === 'pony_express_plot') {
      for (const [x, z] of [
        [-1.45, -0.92],
        [1.45, -0.92],
        [1.45, 0.92],
        [-1.45, 0.92],
      ] as const) {
        const p = localPoint(prop, x * scale, z * scale);
        addBox(woodParts, p.x, 0.38, p.z, 0.08, 0.76, 0.08, prop.rotation);
      }
      const signRail = localPoint(prop, 0, -0.96 * scale);
      addBox(woodParts, signRail.x, 0.68, signRail.z, 0.86 * scale, 0.1, 0.08, prop.rotation);
      const pictogram = createPonyExpressPictogram();
      pictogram.name = 'TownProp:PonyExpressStation:Pictogram';
      const sign = localPoint(prop, 0, -1.08 * scale);
      pictogram.position.set(sign.x, 1.05, sign.z);
      pictogram.rotation.y = prop.rotation;
      group.add(pictogram);
    }
  }

  addPanMonumentParts(woodParts, group);
  group.add(
    createBoxInstances('TownPropWoodInstances', woodParts, new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.84, metalness: 0.03 })),
    createBoxInstances('TownPropCanvasInstances', canvasParts, new THREE.MeshStandardMaterial({ color: '#e8d5a8', roughness: 0.88, metalness: 0.01 })),
    createCylinderInstances('TownPropWagonWheels', new THREE.CylinderGeometry(1, 1, 1, 16), wheelParts, new THREE.MeshStandardMaterial({ color: '#3b2416', roughness: 0.82 })),
    createCylinderInstances('TownPropCacti', new THREE.CylinderGeometry(1, 1, 1, 10), cactusParts, new THREE.MeshStandardMaterial({ color: '#5b8a72', roughness: 0.9 })),
    createLanternGlow(lanternPositions, night),
    createPanBowl(),
  );
  return group;
}

function localPoint(prop: { position: { x: number; z: number }; rotation: number }, x: number, z: number): { x: number; z: number } {
  const cos = Math.cos(prop.rotation);
  const sin = Math.sin(prop.rotation);
  return {
    x: prop.position.x + x * cos + z * sin,
    z: prop.position.z - x * sin + z * cos,
  };
}

function addPanMonumentParts(parts: BoxPart[], group: THREE.Group): void {
  const { x, z } = townPropRing.panMonument.position;
  parts.push({ x, y: 0.11, z: z - 0.68, sx: 1.62, sy: 0.22, sz: 0.16 });
  parts.push({ x, y: 0.11, z: z + 0.68, sx: 1.62, sy: 0.22, sz: 0.16 });
  parts.push({ x: x - 0.68, y: 0.11, z, sx: 0.16, sy: 0.22, sz: 1.18 });
  parts.push({ x: x + 0.68, y: 0.11, z, sx: 0.16, sy: 0.22, sz: 1.18 });
  parts.push({ x: x + 0.92, y: 0.36, z, sx: 0.28, sy: 0.52, sz: 0.28 });
  parts.push({ x: x + 0.92, y: 0.64, z, sx: 0.62, sy: 0.06, sz: 0.08, rotation: -0.2 });
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(townPropRing.panMonument.radius, townPropRing.panMonument.radius + 0.04, 48),
    new THREE.MeshBasicMaterial({ color: '#fff0bd', transparent: true, opacity: 0.24, depthWrite: false }),
  );
  ring.name = 'TownProp:PanMonument:DryClearRing';
  ring.position.set(x, 0.035, z);
  ring.rotation.x = -Math.PI / 2;
  ring.renderOrder = RenderLayers.groundDecals;
  group.add(ring);
}

function createBoxInstances(name: string, parts: readonly BoxPart[], material: THREE.Material): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, Math.max(1, parts.length));
  mesh.name = name;
  const object = new THREE.Object3D();
  parts.forEach((part, index) => {
    object.position.set(part.x, part.y, part.z);
    object.rotation.set(0, part.rotation ?? 0, 0);
    object.scale.set(part.sx, part.sy, part.sz);
    object.updateMatrix();
    mesh.setMatrixAt(index, object.matrix);
  });
  mesh.count = parts.length;
  return mesh;
}

function createCylinderInstances(name: string, geometry: THREE.BufferGeometry, parts: readonly CylinderPart[], material: THREE.Material): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, parts.length));
  mesh.name = name;
  const object = new THREE.Object3D();
  parts.forEach((part, index) => {
    object.position.set(part.x, part.y, part.z);
    object.rotation.copy(part.rotation);
    object.scale.set(...part.scale);
    object.updateMatrix();
    mesh.setMatrixAt(index, object.matrix);
  });
  mesh.count = parts.length;
  return mesh;
}

function createLanternGlow(positions: readonly THREE.Vector3[], night: boolean): THREE.InstancedMesh {
  const material = new THREE.MeshBasicMaterial({
    color: night ? '#ffe4a0' : '#fff0bd',
    transparent: true,
    opacity: night ? 0.86 : 0.48,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 12, 8), material, Math.max(1, positions.length));
  mesh.name = 'TownPropLanternGlow';
  const object = new THREE.Object3D();
  positions.forEach((position, index) => {
    object.position.copy(position);
    object.scale.setScalar(night ? 1.35 : 1);
    object.updateMatrix();
    mesh.setMatrixAt(index, object.matrix);
  });
  mesh.count = positions.length;
  mesh.renderOrder = RenderLayers.worldUi;
  return mesh;
}

function createPanBowl(): THREE.Mesh {
  const { x, z } = townPropRing.panMonument.position;
  const pan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.34, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.48, metalness: 0.32 }),
  );
  pan.name = 'TownProp:PanMonument:BrassPan';
  pan.position.set(x + 0.92, 0.78, z);
  pan.rotation.z = -0.12;
  return pan;
}

function createPonyExpressPictogram(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(245, 230, 200, 0.94)';
    roundRect(ctx, 14, 14, 132, 92, 10);
    ctx.fill();
    ctx.strokeStyle = '#2e1b0e';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = '#2e1b0e';
    ctx.beginPath();
    ctx.arc(58, 58, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(70, 55, 42, 8);
    ctx.beginPath();
    ctx.moveTo(110, 42);
    ctx.lineTo(136, 32);
    ctx.lineTo(136, 82);
    ctx.lineTo(110, 72);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5b8a8a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(42, 84, 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.68),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.04, depthWrite: false, side: THREE.DoubleSide }),
  );
  mesh.renderOrder = RenderLayers.worldUi;
  return mesh;
}

function createShell(building: TownBuilding): THREE.Group {
  const group = new THREE.Group();
  group.name = `TownShell:${building.id}`;
  group.position.set(building.position.x, 0, building.position.z);
  const shell = new THREE.Group();
  shell.name = `TownFacadeAssembly:${building.id}`;
  const approach = townPlazaSlot(building.id).approach;
  shell.rotation.y = Math.atan2(approach.x - building.position.x, approach.z - building.position.z);
  const halfX = building.footprint.w * 0.5;
  const halfZ = building.footprint.d * 0.5;
  const facadeWidth = building.footprint.w * 0.86;
  const facadeHeight = facadeWidth;
  const facadeKey = townFacadeKey(building);
  const sideMaterial = new THREE.MeshStandardMaterial({ color: building.color, roughness: 0.86, metalness: 0.02 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: building.roof, roughness: 0.74, metalness: 0.06 });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w, 0.16, building.footprint.d),
    new THREE.MeshStandardMaterial({ color: '#8b6c3f', roughness: 0.9, metalness: 0.02 }),
  );
  base.name = `TownFacadeBase:${building.id}`;
  base.position.y = 0.08;
  base.castShadow = true;
  base.receiveShadow = true;

  const ao = new THREE.Mesh(
    new THREE.PlaneGeometry(building.footprint.w + 0.55, 0.58),
    new THREE.MeshBasicMaterial({ color: '#2e1b0e', transparent: true, opacity: 0.22, depthWrite: false }),
  );
  ao.name = `TownFacadeAO:${building.id}`;
  ao.rotation.x = -Math.PI / 2;
  ao.position.set(0, 0.022, halfZ + 0.18);
  ao.renderOrder = RenderLayers.groundDecals;

  const front = new THREE.Mesh(new THREE.PlaneGeometry(facadeWidth, facadeHeight), createFacadeMaterial(building));
  front.name = `TownFacade:${building.id}:${facadeKey}`;
  front.position.set(0, facadeHeight * 0.48 + 0.08, halfZ + 0.045);
  front.renderOrder = RenderLayers.gameplay;

  const back = new THREE.Mesh(new THREE.BoxGeometry(building.footprint.w, 1.35, 0.18), sideMaterial);
  back.name = `TownFacadeBack:${building.id}`;
  back.position.set(0, 0.75, -halfZ + 0.09);
  back.castShadow = true;
  back.receiveShadow = true;

  const porch = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w * 0.72, 0.12, 0.78),
    new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.8, metalness: 0.02 }),
  );
  porch.name = `TownFacadePorch:${building.id}`;
  porch.position.set(0, 0.1, building.footprint.d / 2 + 0.36);

  const left = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.48, building.footprint.d), sideMaterial);
  left.name = `TownFacadeSide:${building.id}:left`;
  left.position.set(-halfX + 0.09, 0.82, 0);
  left.castShadow = true;
  left.receiveShadow = true;

  const right = left.clone();
  right.name = `TownFacadeSide:${building.id}:right`;
  right.position.x = halfX - 0.09;

  const cap = new THREE.Mesh(new THREE.BoxGeometry(building.footprint.w + 0.24, 0.18, 0.32), trimMaterial);
  cap.name = `TownFacadeCap:${building.id}`;
  cap.position.set(0, 1.58, halfZ - 0.02);
  cap.castShadow = true;

  shell.add(base, ao, back, left, right, porch, front, cap);
  group.add(shell);
  return group;
}

function townFacadeKey(building: TownBuilding): string {
  return townFacadeUrls[building.id]?.key ?? `fallback-${building.id.replace(/_/g, '-')}`;
}

function createFacadeMaterial(building: TownBuilding): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: createFallbackFacadeTexture(building),
    transparent: true,
    alphaTest: 0.04,
    roughness: 0.78,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const facade = townFacadeUrls[building.id];
  if (!facade) return material;
  loadTownFacadeTexture(facade).then((texture) => {
    if (!texture) return;
    const previous = material.map;
    material.map = texture;
    material.needsUpdate = true;
    if (previous && previous !== texture) previous.dispose();
  });
  return material;
}

function loadTownFacadeTexture(facade: { key: string; url: string }): Promise<THREE.Texture | null> {
  const cached = townFacadeTextures.get(facade.key);
  if (cached) return cached;
  const promise = new Promise<THREE.Texture | null>((resolve) => {
    townFacadeLoader.load(
      facade.url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        resolve(texture);
      },
      undefined,
      () => resolve(null),
    );
  });
  townFacadeTextures.set(facade.key, promise);
  return promise;
}

function createFallbackFacadeTexture(building: TownBuilding): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = building.color;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 248, 232, 0.44)';
    roundRect(ctx, 46, 74, width - 92, height - 126, 28);
    ctx.fill();
    ctx.strokeStyle = building.roof;
    ctx.lineWidth = 18;
    ctx.stroke();
    ctx.fillStyle = building.accent;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.42, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e1b0e';
    ctx.fillRect(width / 2 - 82, height * 0.69, 164, 82);
    ctx.fillStyle = '#ffe4a0';
    ctx.fillRect(width / 2 - 8, height * 0.69, 16, 82);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e8c98f';
    ctx.fillRect(0, 0, size, size);

    const wash = ctx.createRadialGradient(size * 0.48, size * 0.44, size * 0.04, size * 0.5, size * 0.5, size * 0.68);
    wash.addColorStop(0, 'rgba(255, 235, 180, 0.44)');
    wash.addColorStop(0.52, 'rgba(231, 190, 116, 0.18)');
    wash.addColorStop(1, 'rgba(122, 81, 50, 0.16)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(196, 136, 58, 0.16)';
    for (let i = 0; i < 1_800; i += 1) {
      const x = (i * 71) % size;
      const y = (i * 149) % size;
      ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, 1);
    }

    const point = ({ x, z }: { x: number; z: number }) => ({
      x: ((x + TOWN_HALF) / (TOWN_HALF * 2)) * size,
      y: ((TOWN_HALF - z) / (TOWN_HALF * 2)) * size,
    });
    const center = point(townPlazaLayout.center);
    for (const trail of townTrailLayout.radial) {
      const screenPoints = trail.points.map(point);
      ctx.strokeStyle = 'rgba(93, 57, 31, 0.2)';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        screenPoints.forEach((screenPoint, index) => {
          const previous = screenPoints[Math.max(0, index - 1)]!;
          const next = screenPoints[Math.min(screenPoints.length - 1, index + 1)]!;
          const length = Math.max(1, Math.hypot(next.x - previous.x, next.y - previous.y));
          const x = screenPoint.x + (-(next.y - previous.y) / length) * 5.5 * side;
          const y = screenPoint.y + ((next.x - previous.x) / length) * 5.5 * side;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(93, 57, 31, 0.16)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const ringRadius = Math.hypot(townTrailLayout.ringRoad.points[0]!.x, townTrailLayout.ringRoad.points[0]!.z);
    ctx.arc(center.x, center.y, (ringRadius / (TOWN_HALF * 2)) * size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, (townPlazaLayout.clearRadius / (TOWN_HALF * 2)) * size, 0, Math.PI * 2);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createAmbientDust(tier: PerformanceTier, night: boolean): THREE.InstancedMesh | null {
  if (tier === 'lite' || night) return null;
  const count = tier === 'full' ? 48 : 28;
  const mesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 5, 4),
    new THREE.MeshBasicMaterial({ color: '#ffe4a0', transparent: true, opacity: 0.34, depthWrite: false }),
    count,
  );
  mesh.name = 'TownAmbientDust';
  mesh.count = count;
  mesh.frustumCulled = false;
  mesh.renderOrder = RenderLayers.worldUi;
  return mesh;
}

function createSurveyPlot(building: TownBuilding): THREE.Group {
  const group = new THREE.Group();
  group.name = `TownSurveyPlot:${building.id}`;
  group.position.set(building.position.x, 0, building.position.z);
  const halfX = building.footprint.w * 0.5;
  const halfZ = building.footprint.d * 0.5;
  const corners = [
    [-halfX, -halfZ],
    [halfX, -halfZ],
    [halfX, halfZ],
    [-halfX, halfZ],
  ] as const;
  const pegs = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.09, 0.72, 0.09),
    new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.86, metalness: 0.02 }),
    corners.length,
  );
  const matrix = new THREE.Matrix4();
  corners.forEach(([x, z], index) => pegs.setMatrixAt(index, matrix.makeTranslation(x, 0.36, z)));
  pegs.name = `TownSurveyPegs:${building.id}`;
  pegs.castShadow = true;

  const linePoints: THREE.Vector3[] = [];
  corners.forEach(([x, z], index) => {
    const next = corners[(index + 1) % corners.length]!;
    linePoints.push(new THREE.Vector3(x, 0.34, z), new THREE.Vector3(next[0], 0.34, next[1]));
  });
  const string = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(linePoints),
    new THREE.LineBasicMaterial({ color: '#c4883a', transparent: true, opacity: 0.82 }),
  );
  string.name = `TownSurveyString:${building.id}`;
  group.add(pegs, string);
  return group;
}

function townActorPlazaPlacement(actor: TownActorDefinition): TownActorDefinition {
  if (actor.loop) return actor;
  const offset = townPlazaLayout.actorOffsets[actor.id as keyof typeof townPlazaLayout.actorOffsets];
  if (!offset) return actor;
  const anchor = townBuildings.find((building) => building.id === actor.anchor);
  if (!anchor) return actor;
  return {
    ...actor,
    position: { x: anchor.position.x + offset.x, z: anchor.position.z + offset.z },
  };
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

  let pathLength = 0;
  const lengths: number[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const from = points[index]!;
    const to = points[(index + 1) % points.length]!;
    const length = Math.hypot(to.x - from.x, to.z - from.z);
    lengths.push(length);
    pathLength += length;
  }
  if (pathLength <= 0) return points[0]!;
  const cycleSeconds = Math.max(0.001, loop.seconds);
  const pauseSeconds = Object.values(loop.pauses ?? {}).reduce((sum, seconds) => sum + seconds, 0);
  const speed = pathLength / Math.max(0.001, cycleSeconds - pauseSeconds);
  let time = ((((elapsed / cycleSeconds + loop.phase) % 1) + 1) % 1) * cycleSeconds;
  for (let index = 0; index < points.length; index += 1) {
    const pause = loop.pauses?.[index] ?? 0;
    if (time <= pause) return points[index]!;
    time -= pause;
    const length = lengths[index] ?? 0;
    const duration = length / speed;
    if (time > duration) {
      time -= duration;
      continue;
    }
    const from = points[index]!;
    const to = points[(index + 1) % points.length]!;
    const t = duration > 0 ? time / duration : 0;
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
