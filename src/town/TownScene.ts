import './town.css';
import { performanceTierDiagnostics, type PerformanceTier } from '../game/PerformanceTier';
import * as THREE from 'three';
import { OrientationResolver, type RotationDirection } from '../assets/OrientationResolver';
import { SpriteAnimator } from '../assets/SpriteAnimator';
import { clearProcessedCharacterTextureCache, loadGeneratedTexture, loadProcessedCharacterTexture } from '../assets/generated';
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
  listEpochs,
  loadEpoch,
  pendingEpochContracts,
  type ContractManifest,
  type EpochUpcomingContract,
} from '../meta/ContractFamilies';
import {
  ensureMegaprojectProject,
  isMegaprojectUnlocked,
  loadMegaprojectState,
  megaprojectComplete,
  type MegaprojectManifest,
  type MegaprojectProjectState,
} from '../meta/Megaproject';
import { RESEARCH_STATE_KEY, browserResearchStorage, loadResearchState, reconcileActiveEpoch, researchStateKey, saveResearchState, scienceMeter, setPinnedResearchTarget, type ResearchState } from '../meta/ResearchTree';
import { CeremonySystem, type CeremonyDiagnostics } from '../ceremony/CeremonySystem';
import { emitStorySignal } from '../story';
import { requestOpenClaimLedger } from '../encyclopedia/events';
import { discoverLedgerContract, discoverLedgerEntry, discoverLedgerTownActor } from '../encyclopedia/state';
import { renderResearchChart } from '../ui/ResearchChart';
import { eraBackdropRef, loadEraBackdrop } from '../ui/EraBackdrop';
import { WorldInfoNotePrompt, type WorldInfoObjectClass } from '../ui/WorldInfoNotes';
import { disposeObject3D } from '../utils/dispose';
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
  type TownBuilding,
  type TownBuildingId,
  type TownPropKind,
} from './townLayout';
import { readTownName, saveTownName, validateTownName } from './TownNaming';
import { TOWN_ACTORS, TOWN_CAST_METROLOGY, townActorBark, visibleTownActors, type TownActorDefinition, type TownActorId } from './townsfolk';

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
const DYNAMO_HALL_ID = 'dynamo-hall';
const VOLTAGE_EPOCH_ID = 'epoch-3-voltage';
const DYNAMO_CRANK_MS = 1_200;
const STAMP_MILL_TOWN_SITE = { ...townPlazaSlot('stamp-mill').position, w: 6.2, d: 1.65 };
const STAMP_MILL_COMPLETE_LINE = 'awaits the whistle';
const RIDE_DISCLOSURE_KEY = 'gold-rush:ride-together-open';
const STAMP_MILL_PROGRESS_LINES = [
  'The Stamp Mill rises: the rail spur is staked.',
  'The Stamp Mill rises: the boilers are seated.',
  'The Stamp Mill rises: the stamps are set.',
] as const;

export type TownDiagnostics = {
  frame: number;
  elapsed: number;
  player: { x: number; z: number };
  activePrompt: TownBuildingId | typeof STAMP_MILL_ID | typeof DYNAMO_HALL_ID | null;
  activeBark: { actorId: TownActorId; speaker: string; text: string } | null;
  townName: string | null;
  namingPrompt: boolean;
  boardOpen: boolean;
  schoolhouseOpen: boolean;
  activeEpochId: string;
  assayOpen: boolean;
  textures: {
    ground: 'placeholder';
    facades: Record<string, 'placeholder' | 'loaded' | 'error'>;
    barkPortrait: 'hidden' | 'pending' | 'loaded' | 'fallback';
  };
  lighting: {
    night: boolean;
    background: string;
    fog: string;
    fogNear: number;
    fogFar: number;
    sunIntensity: number;
    fillIntensity: number;
  };
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
    assetSlot: string;
    spriteAspect: number;
    spriteHeight: number;
    frameKey: string;
    presentation: 'full_body' | 'portrait_post';
    fullBodyStandIn: boolean;
    moving: boolean;
    motion: { x: number; z: number };
    trailId: string | null;
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
  dynamoHall: {
    visible: boolean;
    stage: number;
    totalStages: number;
    funded: boolean;
    complete: boolean;
    visibleStages: string[];
    surveyVisible: boolean;
  };
  ceremony: CeremonyDiagnostics;
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

type TownMegaproject = {
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
  private readonly schoolhouse = document.createElement('section');
  private readonly hiddenButtons: HiddenButtonState[];
  private readonly metaProgress = readTownMetaProgress();
  private readonly visibleBuildings = earnedTownBuildings(this.metaProgress.tracks.territory);
  private readonly visibleActors = visibleTownActors(this.visibleBuildings);
  private readonly stampMill = readTownStampMill(this.metaProgress);
  private town3dPilotDispose?: () => void;
  /** The interstitials T4+ stage here; T1/T2 keep their own doors (wrap law). */
  private readonly ceremonies = new CeremonySystem({
    onBegin: () => this.closeSchoolhouse(),
    onArmed: () => {
      this.renderSchoolhouse();
      this.syncPrompt();
      this.publishDiagnostics();
    },
    onClosed: () => {
      this.syncPrompt();
      this.publishDiagnostics();
    },
  });
  private readonly dynamoHall = readTownMegaproject(STEAMWORKS_EPOCH_ID, DYNAMO_HALL_ID);
  private readonly dynamoHallGroup = new THREE.Group();
  private readonly dynamoHallStageVisuals: THREE.Object3D[] = [];
  private readonly dynamoHallSurveyVisuals: THREE.Object3D[] = [];
  private readonly stampMillGroup = new THREE.Group();
  private readonly stampMillStageVisuals: THREE.Object3D[] = [];
  private readonly stampMillSurveyVisuals: THREE.Object3D[] = [];
  private readonly stampMillConstructionProps: THREE.Object3D[] = [];
  private disposed = false;
  private dynamoCrankTimer = 0;
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
  private activePrompt: TownBuilding | { id: typeof STAMP_MILL_ID; name: 'Stamp Mill' } | { id: typeof DYNAMO_HALL_ID; name: 'Dynamo Hall' } | null = null;
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
  private selectedResearchEpochId = activeEpochId();
  private nameBeatTimer = 0;
  private lastExitIntent = false;
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
  private rideExpanded = sessionStorage.getItem(RIDE_DISCLOSURE_KEY) === '1';

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onExit: () => void,
    private readonly options: TownSceneOptions = {},
  ) {
    reconcileActiveEpoch();
    this.selectedResearchEpochId = activeEpochId();
    this.boardPageIndex = boardPageIndexForContract(options.initialBoardContractId);
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = 1.02;
    this.input = new InputController(this.getElement('#touch-stick'), this.getElement('#touch-knob'), this.getElement('#confirm-button'));
    this.hiddenButtons = this.hideTownActionButtons();
    this.firstClaimGuideActive = shouldStartFirstClaimGuide(this.townName, this.metaProgress);
    if (this.firstClaimGuideActive) markFirstClaimGuidePending();
    this.createScene();
    this.dressScene();
    this.createUi();
    window.addEventListener('keydown', this.onFirstClaimInput, true);
    window.addEventListener('pointerdown', this.onFirstClaimInput, true);
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    this.cameraRig.snapTo(this.hero.group.position);
    this.publishDiagnostics();
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
    this.disposed = true;
    this.loop.stop();
    this.input.dispose();
    for (const state of this.hiddenButtons) state.element.hidden = state.hidden;
    window.clearTimeout(this.nameBeatTimer);
    window.clearTimeout(this.dynamoCrankTimer);
    window.removeEventListener('keydown', this.onFirstClaimInput, true);
    window.removeEventListener('pointerdown', this.onFirstClaimInput, true);
    this.prompt.removeEventListener('click', this.onPromptClick);
    this.prompt.removeEventListener('pointerdown', this.onDynamoCrankStart);
    this.prompt.removeEventListener('pointerup', this.onDynamoCrankStop);
    this.prompt.removeEventListener('pointercancel', this.onDynamoCrankStop);
    this.prompt.removeEventListener('pointerleave', this.onDynamoCrankStop);
    this.prompt.removeEventListener('keydown', this.onDynamoCrankKeyDown);
    this.prompt.removeEventListener('keyup', this.onDynamoCrankKeyUp);
    this.board.removeEventListener('click', this.onBoardClick);
    this.board.removeEventListener('keydown', this.onBoardKeyDown);
    this.board.removeEventListener('pointerdown', this.onBoardPointerDown);
    this.board.removeEventListener('pointerup', this.onBoardPointerUp);
    this.board.removeEventListener('pointercancel', this.onBoardPointerCancel);
    this.schoolhouse.removeEventListener('click', this.onSchoolhouseClick);
    this.schoolhouse.removeEventListener('keydown', this.onSchoolhouseKeyDown);
    this.schoolhouse.removeEventListener('pointerdown', this.onDynamoCrankStart);
    this.schoolhouse.removeEventListener('pointerup', this.onDynamoCrankStop);
    this.schoolhouse.removeEventListener('pointercancel', this.onDynamoCrankStop);
    this.schoolhouse.removeEventListener('pointerleave', this.onDynamoCrankStop);
    this.schoolhouse.removeEventListener('keyup', this.onDynamoCrankKeyUp);
    this.nameCard.removeEventListener('submit', this.onNameSubmit);
    this.nameInput?.removeEventListener('keydown', stopKeyPropagation);
    this.infoNote?.dispose();
    this.assayBench?.dispose();
    this.ceremonies.dispose();
    for (const actor of this.townActors) actor.dispose();
    clearProcessedCharacterTextureCache();
    this.ui.remove();
    this.hero.dispose();
    this.canvas.dataset.town3dPilotState = 'disposed';
    this.town3dPilotDispose?.();
    disposeObject3D(this.scene);
    this.scene.clear();
    this.renderer.dispose();
    window.__GR_TOWN_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number): void {
    this.frame += 1;
    this.elapsed += delta;
    this.updateAmbientDust();
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    const intents = this.input.readIntents();
    const rawExitIntent = intents.cancel || intents.pause;
    this.ceremonies.update(delta);
    if (this.boardOpen || this.schoolhouseOpen || this.assayBenchOpen() || this.ceremonies.modalOpen()) {
      for (const actor of this.townActors) actor.update(delta, this.elapsed);
      if (rawExitIntent && !this.lastExitIntent) {
        if (this.ceremonies.modalOpen()) this.ceremonies.requestLeave();
        else if (this.boardOpen) this.closeBoard();
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
      walkable:
        !shellAt(this.visibleBuildings, x, z) &&
        !megaprojectAt(this.stampMill, STAMP_MILL_TOWN_SITE, x, z) &&
        !megaprojectAt(this.dynamoHall, this.dynamoHall.manifest?.siteFootprint, x, z),
      speedMul: 1,
      zone: 'bank' as const,
    };
  };

  private createScene(): void {
    this.scene.name = 'TownScene';
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
    if (this.propRingEnabled) {
      const pilot = new URLSearchParams(window.location.search).get('town3dPilot');
      // The props pilot replaces wagons/trough/pan with GLBs; building their
      // primitives too double-renders (owner saw the old frame atop Sol's pan).
      const eraOrder = loadEpoch(activeEpochId()).order;
      this.canvas.dataset.townEraAccent = String(eraOrder);
      this.scene.add(createTownPropRing(this.townNight, pilot === 'all' || pilot === 'props', eraOrder));
    }
    this.createStampMillVignette();
    this.createDynamoHallVignette();
    this.createFirstClaimGuide();
    for (const actor of this.visibleActors) {
      const runtime = new TownActorRuntime(townActorPlazaPlacement(actor));
      this.townActors.push(runtime);
      this.scene.add(runtime.group);
    }

    if (this.ambientDust) this.scene.add(this.ambientDust);
    this.hero.group.position.copy(HERO_START);
    this.scene.add(this.hero.group);

    const pilotSearch = new URLSearchParams(window.location.search);
    const pilot = pilotSearch.get('town3dPilot');
    const pilotLite = pilotSearch.get('tier') === 'lite' || this.performanceTier === 'lite';
    this.canvas.dataset.town3dPilotState = pilot !== null ? (pilotLite ? 'lite' : 'loading') : 'off';
    this.canvas.dataset.town3dPilotRenderSource = 'facade';
    this.canvas.dataset.town3dSteamAnchors = '0';
    this.canvas.dataset.town3dSteamPlumes = '0';
    this.canvas.dataset.town3dPlateState = pilot === 'plate' || pilot === 'all' ? (pilotLite ? 'lite' : 'loading') : 'off';
    this.canvas.dataset.town3dPlateGround = 'painted';
    if (pilot !== null && !pilotLite) {
      void import('./TownTavernPilot').then(({ installTownAssayOfficePilot, installTownChapelPilot, installTownClaimOfficePilot, installTownDynamoHallPilot, installTownGeneralStorePilot, installTownPlatePilot, installTownPlazaPropsPilot, installTownSchoolhousePilot, installTownStampMillPilot, installTownTavernPilot }) => {
        if (this.disposed) return;
        const stampMillComplete = !!this.stampMill.manifest && !!this.stampMill.project && megaprojectComplete(this.stampMill.manifest, this.stampMill.project);
        const dynamoReady = this.dynamoHall.manifest && this.dynamoHall.project && megaprojectComplete(this.dynamoHall.manifest, this.dynamoHall.project);
        const dynamoDispose = () => {
          if (dynamoReady) return installTownDynamoHallPilot({ scene: this.scene, canvas: this.canvas }, this.dynamoHallGroup, this.dynamoHall.manifest!.siteFootprint);
          if (pilot === 'dynamo_hall') this.canvas.dataset.town3dPilotState = 'off';
          return () => {};
        };
        const disposers = pilot === 'all'
          ? [installTownPlatePilot({ scene: this.scene, canvas: this.canvas }), installTownTavernPilot({ scene: this.scene, canvas: this.canvas }), installTownGeneralStorePilot({ scene: this.scene, canvas: this.canvas }), installTownClaimOfficePilot({ scene: this.scene, canvas: this.canvas }), installTownAssayOfficePilot({ scene: this.scene, canvas: this.canvas }), installTownChapelPilot({ scene: this.scene, canvas: this.canvas }), installTownSchoolhousePilot({ scene: this.scene, canvas: this.canvas }), ...(stampMillComplete ? [installTownStampMillPilot({ scene: this.scene, canvas: this.canvas })] : []), dynamoDispose(), installTownPlazaPropsPilot({ scene: this.scene, canvas: this.canvas })]
          : [pilot === 'props'
              ? installTownPlazaPropsPilot({ scene: this.scene, canvas: this.canvas })
              : pilot === 'plate'
                ? installTownPlatePilot({ scene: this.scene, canvas: this.canvas })
              : pilot === 'general_store'
              ? installTownGeneralStorePilot({ scene: this.scene, canvas: this.canvas })
              : pilot === 'claim_office'
                ? installTownClaimOfficePilot({ scene: this.scene, canvas: this.canvas })
                : pilot === 'assay_office'
                  ? installTownAssayOfficePilot({ scene: this.scene, canvas: this.canvas })
                : pilot === 'chapel'
                  ? installTownChapelPilot({ scene: this.scene, canvas: this.canvas })
                  : pilot === 'schoolhouse'
                    ? installTownSchoolhousePilot({ scene: this.scene, canvas: this.canvas })
                    : pilot === 'stamp-mill'
                      ? (stampMillComplete ? installTownStampMillPilot({ scene: this.scene, canvas: this.canvas }) : () => {})
                      : pilot === 'dynamo_hall'
                        ? dynamoDispose()
                        : installTownTavernPilot({ scene: this.scene, canvas: this.canvas })];
        this.town3dPilotDispose = () => disposers.forEach((dispose) => dispose());
      });
    }
  }

  private dressScene(): void {
    this.scene.background = new THREE.Color(this.townNight ? '#41365a' : '#e9c98d');
    this.scene.fog = new THREE.Fog(this.townNight ? '#41365a' : '#e9c98d', this.townNight ? 24 : 34, this.townNight ? 58 : 76);
    const fill = new THREE.HemisphereLight(
      this.townNight ? '#ddc6a0' : '#fff2cc',
      this.townNight ? '#2e2642' : '#8b6c3f',
      this.townNight ? 0.62 : 1.15,
    );
    fill.name = 'TownFill';
    const sun = new THREE.DirectionalLight(this.townNight ? '#bfa3ff' : '#ffd28a', this.townNight ? 0.82 : 1.85);
    sun.name = 'TownSun';
    sun.position.set(-22, 18, -18);
    sun.castShadow = true;
    this.scene.add(fill, sun);
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

  private createDynamoHallVignette(): void {
    const { manifest, project, visible } = this.dynamoHall;
    if (!manifest || !project || !visible || epochIsActive(VOLTAGE_EPOCH_ID)) return;
    const complete = megaprojectComplete(manifest, project);
    const visibleStages = Math.min(manifest.stages.length, project.stage + (project.funded ? 1 : 0));
    const site = manifest.siteFootprint;
    const group = this.dynamoHallGroup;
    group.name = 'TownDynamoHallSite';
    group.position.set(site.x, 0, site.z);
    const material = new THREE.MeshStandardMaterial({ color: complete ? '#c4883a' : '#5b8a8a', roughness: 0.72, metalness: 0.12 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(site.w, 0.1, site.d), material);
    base.name = 'TownDynamoHallPackedEarth';
    base.position.y = 0.05;
    group.add(base);
    const surveyVisible = project.stage === 0 && !project.funded && !complete;
    for (const [x, z] of [[-site.w / 2, -site.d / 2], [site.w / 2, -site.d / 2], [site.w / 2, site.d / 2], [-site.w / 2, site.d / 2]] as const) {
      const stake = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), material);
      stake.name = 'TownDynamoHallSurveyStake';
      stake.position.set(x, 0.35, z);
      stake.visible = surveyVisible;
      this.dynamoHallSurveyVisuals.push(stake);
      group.add(stake);
    }
    for (let index = 0; index < manifest.stages.length; index += 1) {
      const height = 0.7 + index * 0.28;
      const section = new THREE.Mesh(new THREE.BoxGeometry(site.w / 3 - 0.12, height, site.d * 0.72), material);
      section.name = `TownDynamoHallStage${index + 1}`;
      section.position.set((index - 1) * (site.w / 3), height / 2 + 0.1, 0);
      section.visible = complete || index < visibleStages;
      this.dynamoHallStageVisuals.push(section);
      group.add(section);
    }
    const portraitMaterial = new THREE.MeshStandardMaterial({
      color: complete ? '#c4883a' : '#5b8a8a',
      transparent: true,
      opacity: complete ? 0.92 : 0.25,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const portrait = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), portraitMaterial);
    portrait.name = 'TownDynamoHallPortrait';
    portrait.position.set(0, 1.3, -site.d / 2 + 0.05);
    portrait.visible = project.stage > 0 || project.funded || complete;
    group.add(portrait);
    const plaque = createPlaqueSprite(
      complete
        ? ['DYNAMO HALL', 'ready to crank', 'the tree waits for light']
        : project.stage === 0 && !project.funded
          ? ['DYNAMO HALL', 'surveyed for the town', 'gold + pressure pledged']
          : ['DYNAMO HALL', `stage ${Math.min(project.stage + 1, manifest.stages.length)} of ${manifest.stages.length}`, 'the flywheels rise'],
    );
    plaque.position.set(0, 3.1, -site.d / 2 - 0.2);
    group.add(plaque);
    this.scene.add(group);
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
    this.prompt.addEventListener('pointerdown', this.onDynamoCrankStart);
    this.prompt.addEventListener('pointerup', this.onDynamoCrankStop);
    this.prompt.addEventListener('pointercancel', this.onDynamoCrankStop);
    this.prompt.addEventListener('pointerleave', this.onDynamoCrankStop);
    this.prompt.addEventListener('keydown', this.onDynamoCrankKeyDown);
    this.prompt.addEventListener('keyup', this.onDynamoCrankKeyUp);
    this.board.addEventListener('click', this.onBoardClick);
    this.board.addEventListener('keydown', this.onBoardKeyDown);
    this.board.addEventListener('pointerdown', this.onBoardPointerDown);
    this.board.addEventListener('pointerup', this.onBoardPointerUp);
    this.board.addEventListener('pointercancel', this.onBoardPointerCancel);
    this.schoolhouse.addEventListener('click', this.onSchoolhouseClick);
    this.schoolhouse.addEventListener('keydown', this.onSchoolhouseKeyDown);
    this.schoolhouse.addEventListener('pointerdown', this.onDynamoCrankStart);
    this.schoolhouse.addEventListener('pointerup', this.onDynamoCrankStop);
    this.schoolhouse.addEventListener('pointercancel', this.onDynamoCrankStop);
    this.schoolhouse.addEventListener('pointerleave', this.onDynamoCrankStop);
    this.schoolhouse.addEventListener('keyup', this.onDynamoCrankKeyUp);
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
    if (target?.closest('[data-raise-stamp-mill]')) this.raiseStampMill();
    if (target?.closest('[data-town-board]')) this.openBoard();
    if (target?.closest('[data-town-rename]')) this.openNameCard('rename');
    if (target?.closest('[data-town-schoolhouse]')) this.openSchoolhouse();
    if (target?.closest('[data-town-assay]')) this.openAssayBench();
  };

  private readonly onDynamoCrankStart = (event: Event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-crank-dynamo]');
    if (!button || this.dynamoCrankTimer) return;
    button.dataset.crankState = 'cranking';
    button.textContent = 'Keep cranking…';
    this.dynamoCrankTimer = window.setTimeout(() => {
      this.dynamoCrankTimer = 0;
      this.activateVoltage();
    }, DYNAMO_CRANK_MS);
  };

  private readonly onDynamoCrankStop = (event: Event) => {
    if (!(event.target as HTMLElement | null)?.closest('[data-crank-dynamo]') || !this.dynamoCrankTimer) return;
    window.clearTimeout(this.dynamoCrankTimer);
    this.dynamoCrankTimer = 0;
    this.renderSchoolhouse();
    this.syncPrompt();
  };

  private readonly onDynamoCrankKeyDown = (event: KeyboardEvent) => {
    if ((event.key === ' ' || event.key === 'Enter') && (event.target as HTMLElement | null)?.closest('[data-crank-dynamo]')) {
      event.preventDefault();
      this.onDynamoCrankStart(event);
    }
  };

  private readonly onDynamoCrankKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') this.onDynamoCrankStop(event);
  };

  private readonly onBoardClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-contract-close]')) {
      this.closeBoard();
      return;
    }
    if (target?.closest('[data-ride-toggle]')) {
      event.preventDefault();
      this.rideExpanded = !this.rideExpanded;
      sessionStorage.setItem(RIDE_DISCLOSURE_KEY, this.rideExpanded ? '1' : '0');
      const disclosure = this.board.querySelector<HTMLDetailsElement>('[data-ride-disclosure]');
      if (disclosure) disclosure.open = this.rideExpanded;
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
      const search = new URLSearchParams(window.location.search);
      launch.dataset.contractMode ? search.set('mode', launch.dataset.contractMode) : search.delete('mode');
      history.replaceState(null, '', `${window.location.pathname}?${search.toString()}${window.location.hash}`);
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
    if (target?.closest('[data-begin-ceremony]')) {
      this.ceremonies.begin();
      this.publishDiagnostics();
      return;
    }
    const eraButton = target?.closest<HTMLElement>('[data-research-era]');
    if (eraButton?.dataset.researchEra) {
      this.selectResearchEra(eraButton.dataset.researchEra);
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
    this.onDynamoCrankKeyDown(event);
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
    if (this.boardOpen || this.schoolhouseOpen || this.assayBenchOpen() || this.ceremonies.modalOpen()) {
      this.prompt.hidden = true;
      this.infoNote?.update(null);
      return;
    }
    const position = this.hero.group.position;
    let nearest: TownBuilding | { id: typeof STAMP_MILL_ID; name: 'Stamp Mill' } | { id: typeof DYNAMO_HALL_ID; name: 'Dynamo Hall' } | null = null;
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
    if (this.stampMill.visible) {
      const approach = townPlazaSlot(STAMP_MILL_ID).approach;
      const dx = position.x - approach.x;
      const dz = position.z - approach.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < nearestDistanceSq) nearest = { id: STAMP_MILL_ID, name: 'Stamp Mill' };
    }
    if (this.dynamoHall.visible && !epochIsActive(VOLTAGE_EPOCH_ID) && this.dynamoHall.manifest) {
      const site = this.dynamoHall.manifest.siteFootprint;
      const dx = position.x - site.x;
      const dz = position.z - (site.z - site.d / 2 - 1.2);
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < nearestDistanceSq) nearest = { id: DYNAMO_HALL_ID, name: 'Dynamo Hall' };
    }
    this.activePrompt = nearest;
    this.prompt.hidden = nearest === null;
    if (!nearest) {
      this.promptKey = '';
      this.prompt.textContent = '';
      this.infoNote?.update(null);
      return;
    }
    const infoClass = nearest.id === STAMP_MILL_ID || nearest.id === DYNAMO_HALL_ID ? null : townInfoClass(nearest.id);
    this.infoNote?.update(infoClass ? { objectClass: infoClass } : null);
    const promptKey = `${nearest.id}:${this.townName ?? ''}:${activeEpochId()}:${scienceMeter(activeProfileResearchState()).complete}`;
    if (promptKey === this.promptKey) return;
    this.promptKey = promptKey;
    if (nearest.id === STAMP_MILL_ID || nearest.id === DYNAMO_HALL_ID) {
      const action = this.renderEpochActivationAction('site');
      this.prompt.hidden = !action;
      this.prompt.innerHTML = action;
    } else if (nearest.id === 'claim_office' && this.townName) {
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
      <img class="town-ui__bark-portrait" src="${escapeHtml(nearest.definition.portraitUrl)}" alt="" data-state="pending" />
      <div class="town-ui__bark-copy">
        <strong data-testid="town-bark-speaker">${escapeHtml(nearest.definition.name)}</strong>
        <span>${escapeHtml(nearest.definition.post)}</span>
        <p data-testid="town-bark-text">${escapeHtml(text)}</p>
      </div>
    `;
    const portrait = this.barkCard.querySelector<HTMLImageElement>('.town-ui__bark-portrait');
    if (portrait) {
      portrait.addEventListener('load', () => {
        portrait.dataset.state = portrait.src.startsWith('data:') ? 'fallback' : 'loaded';
      });
      portrait.addEventListener('error', () => {
        if (portrait.dataset.retried !== 'true') {
          portrait.dataset.retried = 'true';
          const retry = new URL(nearest.definition.portraitUrl, window.location.href);
          retry.searchParams.set('retry', '1');
          portrait.src = retry.href;
          return;
        }
        portrait.src = portraitFallbackUrl(nearest.definition.name);
      });
    }
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
    const eras = activeProfileResearchStates();
    const activeId = activeEpochId();
    const selected = eras.find((state) => state.epochId === this.selectedResearchEpochId) ?? activeProfileResearchState();
    const selectedEpochId = selected.epochId ?? activeId;
    const readonly = selectedEpochId !== activeId;
    this.schoolhouse.innerHTML = `
      <div class="town-ui__era-backdrop" data-era-backdrop="${eraBackdropRef(selectedEpochId)}" aria-hidden="true"></div>
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
          ${this.renderEpochActivationAction()}
          ${renderResearchChart(selected, readonly ? undefined : this.selectedResearchNodeId, { readonly, eras })}
        </div>
      </div>
    `;
    this.loadSurfaceEraBackdrop(this.schoolhouse, selectedEpochId);
  }

  private loadSurfaceEraBackdrop(surface: HTMLElement, epochId: string): void {
    void loadEraBackdrop(epochId).then((url) => {
      const backdrop = surface.querySelector<HTMLElement>(`.town-ui__era-backdrop[data-era-backdrop="${eraBackdropRef(epochId)}"]`);
      if (!url) return;
      document.documentElement.style.setProperty('--gr-era-backdrop', `url("${url}")`);
      if (backdrop) backdrop.style.backgroundImage = `url("${url}")`;
    });
  }

  private renderEpochActivationAction(surface: 'schoolhouse' | 'site' = 'schoolhouse'): string {
    // Framework-staged eras (T4+) render the ceremony door; null = not ours.
    const ceremonyDoor = this.ceremonies.renderDoor();
    if (ceremonyDoor !== null) return surface === 'schoolhouse' ? ceremonyDoor : '';
    if (activeEpochId() === STEAMWORKS_EPOCH_ID) return this.renderDynamoActivationAction(surface);
    const { manifest, project } = this.stampMill;
    if (!manifest || !project || epochIsActive(STEAMWORKS_EPOCH_ID)) return '';
    if (!megaprojectComplete(manifest, project)) return '';
    const meter = scienceMeter(activeProfileResearchState());
    // A ready mill is never silent: if the chart still wants science, say so in-world.
    if (!meter.complete) {
      if (surface === 'site') return `<span>The Stamp Mill waits on ${meter.remaining} more science${meter.remaining === 1 ? '' : 's'}.</span>`;
      return `
        <section class="town-ui__epoch-door" data-testid="stamp-mill-epoch-door" data-door-state="needs-science">
          <p class="town-ui__board-eyebrow">The town's next ledger</p>
          <h3>The Stamp Mill stands ready.</h3>
          <p>The chart wants ${meter.remaining} more science${meter.remaining === 1 ? '' : 's'} before the whistle.</p>
        </section>
      `;
    }
    // Owner ruling 2026-07-12: the transition is E1's graduation — the Baron answers first.
    if (!hasBaronMedal()) {
      if (surface === 'site') return `<span>The valley has one answer left to give — the Baron still rides.</span>`;
      return `
        <section class="town-ui__epoch-door" data-testid="stamp-mill-epoch-door" data-door-state="needs-baron">
          <p class="town-ui__board-eyebrow">The town's next ledger</p>
          <h3>The Stamp Mill stands ready.</h3>
          <p>The valley has one answer left to give — the Baron still rides.</p>
        </section>
      `;
    }
    if (surface === 'site') {
      return `<span>The Stamp Mill is ready.</span><button class="town-ui__prompt-button" type="button" data-raise-stamp-mill data-testid="raise-stamp-mill-site">Raise the Stamp Mill</button>`;
    }
    const pledgedGold = manifest.stages.reduce((sum, stage) => sum + Math.max(0, Math.floor(stage.materials.gold ?? 0)), 0);
    return `
      <section class="town-ui__epoch-door" data-testid="stamp-mill-epoch-door" data-door-state="ready">
        <p class="town-ui__board-eyebrow">The town's next ledger</p>
        <h3>The Stamp Mill is ready.</h3>
        <p>Frontier science banked · ${pledgedGold} gold pledged across three defended stages.</p>
        <button type="button" data-raise-stamp-mill data-testid="raise-stamp-mill">Raise the Stamp Mill</button>
      </section>
    `;
  }

  private renderDynamoActivationAction(surface: 'schoolhouse' | 'site'): string {
    const { manifest, project } = this.dynamoHall;
    if (!manifest || !project || epochIsActive(VOLTAGE_EPOCH_ID) || !megaprojectComplete(manifest, project)) return '';
    const meter = scienceMeter(activeProfileResearchState());
    if (!meter.complete) {
      if (surface === 'site') return `<span>The Dynamo Hall waits on ${meter.remaining} more science${meter.remaining === 1 ? '' : 's'}.</span>`;
      return `
        <section class="town-ui__epoch-door" data-testid="dynamo-hall-epoch-door" data-door-state="needs-science">
          <p class="town-ui__board-eyebrow">The town's next ledger</p>
          <h3>The Dynamo Hall stands ready.</h3>
          <p>The chart wants ${meter.remaining} more science${meter.remaining === 1 ? '' : 's'} before current can take.</p>
        </section>
      `;
    }
    const action = `<button class="town-ui__prompt-button" type="button" data-crank-dynamo data-testid="crank-dynamo">Hold to crank the flywheel</button>`;
    if (surface === 'site') return `<span>The Dynamo Hall is ready.</span>${action}`;
    const pledged = manifest.stages.reduce(
      (sum, stage) => ({ gold: sum.gold + (stage.materials.gold ?? 0), pressure: sum.pressure + (stage.materials.pressure ?? 0) }),
      { gold: 0, pressure: 0 },
    );
    return `
      <section class="town-ui__epoch-door" data-testid="dynamo-hall-epoch-door" data-door-state="ready">
        <p class="town-ui__board-eyebrow">The town's next ledger</p>
        <h3>The Dynamo Hall is ready.</h3>
        <p>Steamworks science banked · ${pledged.gold} gold and ${pledged.pressure} pressure pledged across three defended stages.</p>
        ${action}
      </section>
    `;
  }

  private raiseStampMill(): void {
    const { manifest, project } = this.stampMill;
    if (!manifest || !project || !megaprojectComplete(manifest, project)) return;
    if (!hasBaronMedal()) return;
    if (!scienceMeter(activeProfileResearchState()).complete || !activateEpoch(STEAMWORKS_EPOCH_ID)) return;
    this.renderSchoolhouse();
    emitStorySignal({ type: 'epoch-activated', epochId: STEAMWORKS_EPOCH_ID, displayName: 'The Steamworks' });
    this.syncPrompt();
    this.publishDiagnostics();
  }

  private activateVoltage(): void {
    const { manifest, project } = this.dynamoHall;
    if (!manifest || !project || !megaprojectComplete(manifest, project)) return;
    if (!scienceMeter(activeProfileResearchState()).complete || !activateEpoch(VOLTAGE_EPOCH_ID)) return;
    this.renderSchoolhouse();
    emitStorySignal({ type: 'epoch-activated', epochId: VOLTAGE_EPOCH_ID, displayName: 'The Voltage Age' });
    this.syncPrompt();
    this.publishDiagnostics();
  }

  private selectResearchEra(epochId: string): void {
    this.selectedResearchEpochId = epochId;
    this.selectedResearchNodeId = undefined;
    this.renderSchoolhouse();
    this.schoolhouse.querySelector<HTMLElement>(`[data-research-era="${epochId}"]`)?.focus({ preventScroll: true });
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
    const contracts = listBoardContracts();
    const activeEpoch = loadEpoch(activeEpochId());
    const rows: Array<ContractManifest | EpochUpcomingContract | { id: string; name: string; line: string; successor: true }> = [
      ...contracts,
      ...pendingEpochContracts(activeEpoch, contracts),
      ...(activeEpoch.upcoming.length > 0 && activeEpoch.successor
        ? [{ id: activeEpoch.successor, name: loadEpoch(activeEpoch.successor).displayName, line: 'Awaits the town beyond the Dynamo.', successor: true as const }]
        : []),
    ];
    for (const contract of contracts) discoverLedgerContract(contract.id);
    const scores = loadScores();
    const pageIndex = clampBoardPage(this.boardPageIndex, rows.length);
    this.boardPageIndex = pageIndex;
    const contract = rows[pageIndex];
    const playablePage = rows.slice(0, pageIndex + 1).filter((row) => 'boardRow' in row).length;
    const boardEpochId = activeEpochId();
    const host = this.visibleActors.find((actor) => actor.id === 'tavernkeeper');
    this.board.innerHTML = `
      <div class="town-ui__board-backdrop town-ui__era-backdrop" data-era-backdrop="${eraBackdropRef(boardEpochId)}" aria-hidden="true"></div>
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
          ${
            contract
              ? 'boardRow' in contract
                ? this.renderContractCard(contract, scores, pageIndex, rows.length)
                : this.renderUpcomingContractCard(contract, pageIndex, rows.length)
              : ''
          }
          <button class="town-ui__catalog-arrow town-ui__catalog-arrow--next" type="button" data-contract-page-step="1" data-testid="contract-page-next" aria-label="Next contract" ${
            pageIndex >= rows.length - 1 ? 'disabled' : ''
          }>&rsaquo;</button>
        </div>
        <nav class="town-ui__catalog-nav" data-testid="contract-page-nav" aria-label="Contract pages">
          <span class="town-ui__catalog-count" data-testid="contract-page-count">${playablePage} / ${contracts.length}</span>
          <div class="town-ui__catalog-dots">
            ${rows
              .map(
                (row, index) => `
                  <button class="town-ui__catalog-dot ${'boardRow' in row ? '' : 'town-ui__catalog-dot--muted'}" type="button" data-contract-page="${index}" data-contract-playable="${'boardRow' in row ? 'true' : 'false'}" data-testid="contract-page-dot-${escapeHtml(
                    row.id,
                  )}" aria-label="${escapeHtml(`Open ${'boardRow' in row ? row.boardRow.name : row.name}`)}" aria-current="${index === pageIndex ? 'page' : 'false'}"></button>
                `,
              )
              .join('')}
          </div>
        </nav>
        ${this.renderRideTogetherCard()}
      </div>
    `;
    this.loadSurfaceEraBackdrop(this.board, boardEpochId);
  }

  private selectBoardPage(index: number): void {
    this.boardPageIndex = index;
    this.renderBoard();
    this.board.querySelector<HTMLElement>('.town-ui__contract')?.focus({ preventScroll: true });
  }

  private renderUpcomingContractCard(
    entry: EpochUpcomingContract | { id: string; name: string; line: string; successor: true },
    pageIndex: number,
    pageCount: number,
  ): string {
    const successor = 'successor' in entry;
    return `
      <article class="town-ui__contract town-ui__contract--locked" tabindex="-1" data-testid="${successor ? 'contract-next-epoch' : `contract-upcoming-${escapeHtml(entry.id)}`}" data-contract-id="${escapeHtml(entry.id)}" data-contract-locked="true" aria-label="${escapeHtml(`${entry.name}, page ${pageIndex + 1} of ${pageCount}`)}">
        <div class="town-ui__contract-copy">
          <div class="town-ui__contract-topline">
            <span class="town-ui__contract-tag">${successor ? 'Next epoch' : 'Upcoming contract'}</span>
            <span class="town-ui__contract-state">${successor ? 'Awaits the town' : 'Survey pending'}</span>
          </div>
          <h3>${escapeHtml(entry.name)}</h3>
          <p class="town-ui__contract-flavor">${escapeHtml(entry.line)}</p>
          <p class="town-ui__contract-lock">${successor ? 'The Voltage Age waits behind the Dynamo.' : 'SURVEY PENDING'}</p>
        </div>
      </article>
    `;
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
          )}" data-contract-mode="${escapeHtml(contract.modes?.[0]?.id ?? '')}" ${firstClaimHint ? 'data-first-claim-launch="true" title="Stake your first claim"' : ''} ${unlock.unlocked ? '' : 'disabled'}>
            ${escapeHtml(unlock.unlocked ? 'Launch' : (unlock.action ?? unlock.condition))}
          </button>
        </div>
      </article>
    `;
  }

  private renderRideTogetherCard(): string {
    const phrase = this.ridePhrase;
    const status = this.rideStatus || (phrase ? 'Give this claim word to the other rider.' : 'Open a claim or join with a claim word.');
    return `
      <details class="town-ui__ride-card" data-ride-disclosure data-testid="ride-together-card" ${this.rideExpanded ? 'open' : ''}>
        <summary class="town-ui__ride-toggle" data-ride-toggle data-testid="ride-together-toggle">
          <span>Ride Together</span>
          <span aria-hidden="true">${this.rideExpanded ? 'Close' : 'Open'}</span>
        </summary>
        <div class="town-ui__ride-body" data-testid="ride-together-controls">
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
        </div>
      </details>
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

  private publishDiagnostics(): void {
    const dpr = this.renderer.getPixelRatio();
    const background = this.scene.background as THREE.Color;
    const fog = this.scene.fog as THREE.Fog;
    const sun = this.scene.getObjectByName('TownSun') as THREE.DirectionalLight | undefined;
    const fill = this.scene.getObjectByName('TownFill') as THREE.HemisphereLight | undefined;
    const facades: Record<string, 'placeholder' | 'loaded' | 'error'> = {};
    this.scene.traverse((object) => {
      if (!object.name.startsWith('TownFacade:')) return;
      const material = (object as THREE.Mesh).material as THREE.MeshStandardMaterial;
      facades[object.name.split(':')[1] ?? object.name] = material.userData.textureState ?? 'placeholder';
    });
    const barkPortrait = this.barkCard.querySelector<HTMLImageElement>('.town-ui__bark-portrait');
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
      textures: {
        ground: 'placeholder',
        facades,
        barkPortrait: this.barkCard.hidden ? 'hidden' : (barkPortrait?.dataset.state as 'pending' | 'loaded' | 'fallback' | undefined) ?? 'fallback',
      },
      lighting: {
        night: this.townNight,
        background: `#${background.getHexString()}`,
        fog: `#${fog.color.getHexString()}`,
        fogNear: fog.near,
        fogFar: fog.far,
        sunIntensity: sun?.intensity ?? 0,
        fillIntensity: fill?.intensity ?? 0,
      },
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
          assetSlot: actor.assetSlot,
          spriteAspect: runtime?.spriteAspect ?? 0,
          spriteHeight: runtime?.spriteHeight ?? 0,
          frameKey: runtime?.frameKey ?? '',
          presentation: actor.fullBody ? 'full_body' : 'portrait_post',
          fullBodyStandIn: false,
          moving: runtime?.moving ?? false,
          motion: runtime?.motion ?? { x: 0, z: 0 },
          trailId: actor.loop?.trailId ?? null,
        };
      }),
      stampMill: this.stampMillDiagnostics(),
      dynamoHall: this.dynamoHallDiagnostics(),
      ceremony: this.ceremonies.diagnostics(),
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

  private dynamoHallDiagnostics(): TownDiagnostics['dynamoHall'] {
    const { manifest, project, visible } = this.dynamoHall;
    return {
      visible,
      stage: project?.stage ?? 0,
      totalStages: manifest?.stages.length ?? 0,
      funded: project?.funded ?? false,
      complete: !!manifest && !!project && megaprojectComplete(manifest, project),
      visibleStages: this.dynamoHallStageVisuals.filter((visual) => visual.visible).map((visual) => visual.name),
      surveyVisible: this.dynamoHallSurveyVisuals.some((visual) => visual.visible),
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
    // Chroma-cut walk8 cells carry key-tinted edge pixels; a firm alpha clip kills the fringe.
    alphaTest: 0.35,
    depthWrite: false,
  });
  private readonly sprite = new THREE.Sprite(this.material);
  private readonly animator: SpriteAnimator | null;
  private frameElapsed = 0;
  private stillElapsed = 0;
  private frame = 0;
  private currentFrameKey = '';
  private disposed = false;
  private fitted = false;
  private movedThisTick = false;
  private motionX = 0;
  private motionZ = 0;
  private readonly orientationResolver = new OrientationResolver();
  private currentDirection: RotationDirection;

  constructor(readonly definition: TownActorDefinition) {
    if (!definition.fullBody) this.material.alphaTest = 0.04;
    this.group.name = `TownActor:${definition.id}`;
    this.group.position.set(definition.position.x, 0, definition.position.z);
    this.sprite.name = `TownActorSprite:${definition.id}`;
    const worldHeight = definition.scale * TOWN_CAST_METROLOGY.worldUnitsPerHero;
    if (!definition.fullBody) {
      const cardSize = worldHeight * 0.58;
      this.sprite.scale.setScalar(cardSize);
      this.sprite.position.y = 0.62 + cardSize / 2;
      this.group.add(createPortraitPost(cardSize));
    } else if (definition.id === 'prospector') {
      this.sprite.scale.setScalar(worldHeight);
      this.sprite.position.y = worldHeight * 0.55 + 0.08;
    } else {
      this.sprite.scale.set(worldHeight * 0.42, worldHeight, 1);
      this.sprite.position.y = worldHeight / 2 + 0.08;
    }
    this.sprite.renderOrder = RenderLayers.companion;
    this.sprite.visible = true;
    this.group.add(this.sprite);
    this.currentDirection = definition.facing;
    this.orientationResolver.reset(definition.facing);
    this.animator = definition.id === 'prospector' ? new SpriteAnimator(definition.assetSlot, this.material, this.sprite) : null;
    if (definition.fullBody) this.applyFullBodyFrame(0);
    else this.loadPortrait();
    tagPlaceholder(this.group, definition.assetSlot);
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get loaded(): boolean {
    return !!this.material.map;
  }

  get spriteAspect(): number {
    return this.sprite.scale.y / this.sprite.scale.x;
  }

  get spriteHeight(): number {
    return this.sprite.scale.y;
  }

  get frameKey(): string {
    return this.definition.id === 'prospector' ? 'SpriteAnimator:char.prospector_agent' : this.currentFrameKey;
  }

  get moving(): boolean {
    return this.movedThisTick;
  }

  get motion(): { x: number; z: number } {
    return { x: this.motionX, z: this.motionZ };
  }

  update(delta: number, elapsed: number): void {
    if (!this.fitted && this.definition.fullBody && this.definition.id !== 'prospector' && this.material.map) this.fitSpriteToTexture(this.material.map);
    const previousX = this.group.position.x;
    const previousZ = this.group.position.z;
    const point = this.definition.loop ? loopPoint(this.definition.loop, elapsed) : this.definition.position;
    this.group.position.x = point.x;
    this.group.position.z = point.z;
    const dx = point.x - previousX;
    const dz = point.z - previousZ;
    this.motionX = dx;
    this.motionZ = dz;
    const previousDirection = this.currentDirection;
    const wasMoving = this.movedThisTick;
    this.movedThisTick = dx * dx + dz * dz > 1e-8;
    if (this.movedThisTick) this.currentDirection = this.orientationResolver.resolve(dx, dz);

    const phase = actorPhase(this.definition);
    const breathe = Math.sin((elapsed * 0.58 + phase) * Math.PI * 2);
    const sway = Math.sin((elapsed * 0.31 + phase) * Math.PI * 2);
    this.group.position.y = this.definition.fullBody ? breathe * 0.035 : 0;
    this.material.rotation = this.definition.fullBody ? THREE.MathUtils.degToRad(sway * 1.7) : 0;
    if (this.definition.id === 'prospector') {
      if (wasMoving && !this.movedThisTick) this.animator?.reset('walk');
      this.animator?.update(this.movedThisTick ? delta : 0, 'walk', this.currentDirection);
    } else if (this.definition.fullBody?.animated && this.movedThisTick) {
      this.stillElapsed = 0;
      if (this.currentDirection !== previousDirection) this.applyFullBodyFrame(this.frame);
      this.frameElapsed += delta;
      const frameDuration = 1 / (this.definition.fullBody.fps ?? 8);
      if (this.frameElapsed >= frameDuration) {
        this.frameElapsed %= frameDuration;
        this.frame = (this.frame + 1) % (this.definition.fullBody.frameMap?.length ?? 8);
        this.applyFullBodyFrame(this.frame);
      }
    } else if (this.definition.fullBody?.animated && this.frame !== 0) {
      // Loop points can be float-identical on alternate frames; only snap to the
      // standing frame after a real stop, or the walk thrashes back to column 0.
      this.stillElapsed += delta;
      if (this.stillElapsed >= 0.15) {
        this.frameElapsed = 0;
        this.frame = 0;
        this.applyFullBodyFrame(0);
      }
    }
  }

  dispose(): void {
    this.disposed = true;
    this.animator?.dispose();
    this.material.dispose();
  }

  private applyFullBodyFrame(frame: number): void {
    const fullBody = this.definition.fullBody;
    if (this.definition.id === 'prospector' || !fullBody) return;
    const row = directionRow(this.currentDirection);
    const sourceFrame = fullBody.frameMap?.[frame] ?? frame;
    const key = `${fullBody.sheet}-r${row}c${fullBody.animated ? sourceFrame : 0}.png`;
    this.currentFrameKey = key;
    void loadProcessedCharacterTexture(key).then((texture) => {
      if (texture && !this.disposed && this.currentFrameKey === key) {
        this.material.map = texture;
        this.material.needsUpdate = true;
        this.fitSpriteToTexture(texture);
      }
    });
  }

  private loadPortrait(): void {
    this.currentFrameKey = `portrait:${this.definition.id}`;
    void loadGeneratedTexture(this.definition.assetSlot).then((texture) => {
      if (texture && !this.disposed) {
        this.material.map = texture;
        this.material.needsUpdate = true;
      }
    });
  }

  // Size the billboard from the cell's real aspect: fixed height band, width follows
  // the sheet — a 2.4:1 plane on a 1.2:1 cell was the town-wide vertical stretch.
  private fitSpriteToTexture(texture: THREE.Texture): void {
    const image = texture.image as { width?: number; height?: number } | undefined;
    const width = typeof image?.width === 'number' ? image.width : 0;
    const height = typeof image?.height === 'number' ? image.height : 0;
    if (!width || !height) return;
    this.fitted = true;
    const targetHeight = this.definition.scale * TOWN_CAST_METROLOGY.worldUnitsPerHero;
    this.sprite.scale.set(targetHeight * (width / height), targetHeight, 1);
    this.sprite.position.y = targetHeight / 2 + 0.08;
  }
}

function createPortraitPost(cardSize: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TownPortraitPost';
  const wood = new THREE.MeshStandardMaterial({ color: '#6f4528', roughness: 0.9 });
  const parchment = new THREE.SpriteMaterial({ color: '#f5e6c8', depthWrite: false });
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.72, 0.11), wood);
  post.position.y = 0.36;
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.32), wood);
  base.position.y = 0.04;
  const card = new THREE.Sprite(parchment);
  card.name = 'TownPortraitPostCard';
  card.scale.setScalar(cardSize * 1.12);
  card.position.y = 0.62 + cardSize / 2;
  card.renderOrder = RenderLayers.companion - 0.01;
  group.add(post, base, card);
  return group;
}

function directionRow(direction: RotationDirection): number {
  if (direction === 'w' || direction === 'sw' || direction === 'nw') return 1;
  if (direction === 'e' || direction === 'se' || direction === 'ne') return 2;
  return direction === 'n' ? 3 : 0;
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

function contractUnlock(contract: ContractManifest): { unlocked: boolean; condition: string; action?: string } {
  const epochs = listEpochs().map(({ id }) => loadEpoch(id));
  const epoch = epochs.find((entry) => entry.contracts.some(({ id }) => id === contract.id));
  if (epoch && !epochIsActive(epoch.id)) {
    const predecessor = epochs.find((entry) => entry.successor === epoch.id);
    const action = `Awaits the ${epoch.displayName} era`;
    return {
      unlocked: false,
      condition: predecessor
        ? `The ${epoch.displayName} awaits — ${predecessor.megaproject.raiseActionText.replace(/^./, (letter) => letter.toLowerCase())}.`
        : action,
      action,
    };
  }
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
  if (unlock.startsWith('secured:')) {
    const requiredId = unlock.slice('secured:'.length);
    const required = listBoardContracts().find((entry) => entry.id === requiredId);
    return {
      unlocked: scores.some((score) => contractIdOf(score) === requiredId && score.secured === true),
      condition: `Secure ${required?.name ?? requiredId} first`,
    };
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
  return `${score.secured ? 'Secured' : 'Overrun'} — wave ${score.waves} — ${score.gold} gold`;
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

function activeProfileResearchStates(): ResearchState[] {
  const storage = browserResearchStorage();
  const activeId = activeEpochId();
  return listEpochs()
    .filter(
      (epoch: ReturnType<typeof listEpochs>[number]) =>
        epoch.order <= loadEpoch(activeId).order &&
        (epoch.id === activeId ||
          storage?.getItem(researchStateKey(epoch.id)) !== null ||
          (epoch.id === DEFAULT_EPOCH_ID && storage?.getItem(RESEARCH_STATE_KEY) !== null)),
    )
    .map((epoch: ReturnType<typeof listEpochs>[number]) => loadResearchState(storage, storage, { rocketCartCaptured: hasRocketCartCaptured() }, epoch.id));
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

function readTownStampMill(meta: MetaProgress): TownMegaproject {
  const manifest = loadEpoch(DEFAULT_EPOCH_ID).megaprojects.find((entry) => entry.id === STAMP_MILL_ID) ?? null;
  if (!manifest) return { manifest: null, project: null, visible: false };
  const state = loadMegaprojectState(browserStorage());
  const project = ensureMegaprojectProject(state, manifest);
  const visible = isMegaprojectUnlocked(manifest, meta.tracks.science) || project.stage > 0 || project.funded;
  return { manifest, project, visible };
}

function readTownMegaproject(epochId: string, id: string): TownMegaproject {
  const manifest = loadEpoch(epochId).megaprojects.find((entry) => entry.id === id) ?? null;
  if (!manifest) return { manifest: null, project: null, visible: false };
  const storage = browserStorage();
  const project = ensureMegaprojectProject(loadMegaprojectState(storage), manifest);
  const active = epochIsActive(epochId);
  const steps = active ? scienceMeter(loadResearchState(storage, storage, { rocketCartCaptured: hasRocketCartCaptured() }, epochId)).steps : 0;
  return {
    manifest,
    project,
    visible: active && (isMegaprojectUnlocked(manifest, steps) || project.stage > 0 || project.funded),
  };
}

function shellAt(buildings: readonly TownBuilding[], x: number, z: number): boolean {
  const pad = Balance.hero.radius + 0.08;
  return buildings.some((building) => {
    const halfX = building.footprint.w / 2 + pad;
    const halfZ = building.footprint.d / 2 + pad;
    return Math.abs(x - building.position.x) <= halfX && Math.abs(z - building.position.z) <= halfZ;
  });
}

function megaprojectAt(
  megaproject: TownMegaproject,
  site: MegaprojectManifest['siteFootprint'] | undefined,
  x: number,
  z: number,
): boolean {
  if (!megaproject.visible || !site) return false;
  const pad = Balance.hero.radius + 0.08;
  return (
    Math.abs(x - site.x) <= site.w / 2 + pad &&
    Math.abs(z - site.z) <= site.d / 2 + pad
  );
}

type BoxPart = { x: number; y: number; z: number; sx: number; sy: number; sz: number; rotation?: number };
type CylinderPart = { x: number; y: number; z: number; scale: [number, number, number]; rotation: THREE.Euler };

const townEraAccents: Record<number, { lanternGlass: string; lanternNightGlass: string; lanternOpacity: number }> = {
  1: { lanternGlass: '#fff0bd', lanternNightGlass: '#ffe4a0', lanternOpacity: 0.48 },
  2: { lanternGlass: '#d9975b', lanternNightGlass: '#f1b56f', lanternOpacity: 0.62 },
};

function townEraAccent(eraOrder: number): { lanternGlass: string; lanternNightGlass: string; lanternOpacity: number } {
  const key = Math.max(...Object.keys(townEraAccents).map(Number).filter((order) => order <= eraOrder));
  return townEraAccents[key] ?? townEraAccents[1]!;
}

function createTownPropRing(night: boolean, propsPiloted = false, eraOrder = 1): THREE.Group {
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
    if (propsPiloted && (prop.kind === 'covered_wagon' || prop.kind === 'water_trough')) continue;
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

  addPanMonumentParts(woodParts, group, propsPiloted);
  group.add(
    createBoxInstances('TownPropWoodInstances', woodParts, new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.84, metalness: 0.03 })),
    createBoxInstances('TownPropCanvasInstances', canvasParts, new THREE.MeshStandardMaterial({ color: '#e8d5a8', roughness: 0.88, metalness: 0.01 })),
    createCylinderInstances('TownPropWagonWheels', new THREE.CylinderGeometry(1, 1, 1, 16), wheelParts, new THREE.MeshStandardMaterial({ color: '#3b2416', roughness: 0.82 })),
    createCylinderInstances('TownPropCacti', new THREE.CylinderGeometry(1, 1, 1, 10), cactusParts, new THREE.MeshStandardMaterial({ color: '#5b8a72', roughness: 0.9 })),
    createLanternGlow(lanternPositions, night, townEraAccent(eraOrder)),
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

function addPanMonumentParts(parts: BoxPart[], group: THREE.Group, propsPiloted = false): void {
  const { x, z } = townPropRing.panMonument.position;
  if (!propsPiloted) {
  parts.push({ x, y: 0.11, z: z - 0.68, sx: 1.62, sy: 0.22, sz: 0.16 });
  parts.push({ x, y: 0.11, z: z + 0.68, sx: 1.62, sy: 0.22, sz: 0.16 });
  parts.push({ x: x - 0.68, y: 0.11, z, sx: 0.16, sy: 0.22, sz: 1.18 });
  parts.push({ x: x + 0.68, y: 0.11, z, sx: 0.16, sy: 0.22, sz: 1.18 });
  parts.push({ x: x + 0.92, y: 0.36, z, sx: 0.28, sy: 0.52, sz: 0.28 });
  parts.push({ x: x + 0.92, y: 0.64, z, sx: 0.62, sy: 0.06, sz: 0.08, rotation: -0.2 });
  }
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

function createLanternGlow(
  positions: readonly THREE.Vector3[],
  night: boolean,
  accent: { lanternGlass: string; lanternNightGlass: string; lanternOpacity: number },
): THREE.InstancedMesh {
  const material = new THREE.MeshBasicMaterial({
    color: night ? accent.lanternNightGlass : accent.lanternGlass,
    transparent: true,
    opacity: night ? 0.86 : accent.lanternOpacity,
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
  material.userData.textureState = 'placeholder';
  const facade = townFacadeUrls[building.id];
  if (!facade) return material;
  loadTownFacadeTexture(facade).then((texture) => {
    if (!texture) {
      material.userData.textureState = 'error';
      return;
    }
    const previous = material.map;
    material.map = texture;
    material.needsUpdate = true;
    material.userData.textureState = 'loaded';
    if (previous && previous !== texture) previous.dispose();
  });
  return material;
}

function portraitFallbackUrl(name: string): string {
  const initial = escapeHtml(name.trim().charAt(0).toUpperCase() || '?');
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54"><rect width="54" height="54" fill="#e8d5a8"/><text x="27" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="700" fill="#2e1b0e">${initial}</text></svg>`)}`;
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
    const trails = [...townPlazaLayout.slots.map((slot) => slot.approach), townPlazaLayout.gate];
    for (const [index, destination] of trails.entries()) {
      const end = point(destination);
      const dx = end.x - center.x;
      const dy = end.y - center.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const ox = (-dy / length) * 5.5;
      const oy = (dx / length) * 5.5;
      const bend = (index % 2 === 0 ? 1 : -1) * 10;
      ctx.strokeStyle = 'rgba(93, 57, 31, 0.2)';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(center.x + ox * side, center.y + oy * side);
        ctx.quadraticCurveTo((center.x + end.x) / 2 + ox * side + bend, (center.y + end.y) / 2 + oy * side - bend * 0.35, end.x + ox * side, end.y + oy * side);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(93, 57, 31, 0.16)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(center.x, center.y, (8 / (TOWN_HALF * 2)) * size, 0, Math.PI * 2);
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
  const offset = actor.portraitPost?.offset ?? townPlazaLayout.actorOffsets[actor.id as keyof typeof townPlazaLayout.actorOffsets];
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

  const pauses = loop.pauses ?? {};
  let pauseTotal = 0;
  for (const seconds of Object.values(pauses)) pauseTotal += seconds;
  const walkSeconds = Math.max(0.001, loop.seconds);
  const cycle = walkSeconds + pauseTotal;
  let time = ((((elapsed / cycle + loop.phase) % 1) + 1) % 1) * cycle;
  const speed = total / walkSeconds;
  for (let index = 0; index < points.length; index += 1) {
    const pause = pauses[index] ?? 0;
    if (time < pause) return points[index]!;
    time -= pause;
    const length = lengths[index] ?? 0;
    const segmentSeconds = length / speed;
    if (time < segmentSeconds) {
      const from = points[index]!;
      const to = points[(index + 1) % points.length]!;
      const t = segmentSeconds > 0 ? time / segmentSeconds : 0;
      return { x: THREE.MathUtils.lerp(from.x, to.x, t), z: THREE.MathUtils.lerp(from.z, to.z, t) };
    }
    time -= segmentSeconds;
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
