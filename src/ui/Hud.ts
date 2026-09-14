import type { UiSnapshot } from '../systems/UiBridge';
import type { BuildableId } from '../game/buildables';
import type { AgentAbility } from '../agent/AgentConsent';
import type { AgentPermissionLevel } from '../agent/PermissionLadder';
import type { ContractBriefing } from '../meta/ContractFamilies';
import { bindAudioSettingsControls, renderAudioSettingsControls } from '../audio/AudioSettingsControl';
import { bindStorySettingsControl, renderStorySettingsControl } from '../story/settings';
import { BuildButton } from './BuildButton';
import { ProspectorPanel } from './ProspectorPanel';
import { accountSync } from '../game/AccountSync';
import { afterStartupFrame } from '../assets/generated';

const prospectorPortraitUrlLoader = async () => new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;
const baronPortraitUrlLoader = async () => new URL('../../assets/processed/char-baron-sheet-walk4-a-r0c0.png', import.meta.url).href;
const PAUSE_AUDIO_SETTINGS_IDS = {
  volume: 'pause-volume',
  volumeValue: 'pause-volume-value',
  mute: 'pause-mute',
  music: 'pause-music-volume',
  musicValue: 'pause-music-volume-value',
};
const PAUSE_STORY_SETTINGS_IDS = {
  tales: 'pause-tales',
};

export type UiIntent =
  | { type: 'restart' | 'toggle_build_menu' | 'close_build_menu' | 'pause' | 'open_ledger' | 'back_to_town' }
  | { type: 'save_claim'; name: string }
  | { type: 'select_buildable'; id: BuildableId | string }
  | { type: 'set_agent_rung'; level: AgentPermissionLevel; granted: boolean }
  | { type: 'set_agent_ability'; ability: AgentAbility; granted: boolean };

export type ContractBriefingSnapshot = ContractBriefing & {
  name: string;
};

export type PauseMetaSnapshot = {
  training: boolean;
  save: string;
  goalProgress: string | null;
  manualSave: {
    canSave: boolean;
    defaultName: string;
    message: string;
    open: boolean;
  };
  contract: ContractBriefingSnapshot;
  science: string;
  territory: string;
  boons: Array<{ name: string; effect: string }>;
  mastery: Array<{ name: string; effect: string }>;
};

/**
 * E10S-3 — what the HUD needs to draw the Ember Shore's vent, and nothing more. Derived from
 * `E10PreserveSystem.diagnostics` by `Game.ventWarmthState`; structural rather than imported so
 * this module keeps its render-only import list.
 */
export type VentWarmthState = {
  warmth: number;
  maxWarmth: number;
  alight: boolean;
  /** True only while the squall is actually taking warmth — the meter turns as the shore does. */
  draining: boolean;
  stokeCost: number;
  inReach: boolean;
  squallsSurvived: number;
  squallsRequired: number;
};

/**
 * E8 — WHAT THE HUD NEEDS TO DRAW THE HUMAN'S SUIT, and nothing more (owner directive 2026-09-07,
 * verbatim: "I want space experiences of humans to need them having air. It has to be logical. If
 * that means we have to change something ok"). Derived from `E8HumanSuit.diagnostics` by
 * `Game.suitAirState`; structural rather than imported so this module keeps its sim-free imports,
 * exactly as `VentWarmthState` above does.
 *
 * A MECHANIC A PLAYER CANNOT SEE IS A MECHANIC THAT DID NOT SHIP (Mistake #10), and this one can
 * kill her: the dial is the only warning between a full suit and a hero losing hit points a second
 * at a time in silence.
 */
export type SuitAirState = {
  seconds: number;
  capacity: number;
  /** The pressurised rectangle she is breathing in, or null in vacuum. */
  inDome: string | null;
  empty: boolean;
  /** hp a second an empty suit costs; null where the contract authors no harm. */
  harmPerSecond: number | null;
};

type HudElements = {
  root: HTMLElement;
  contractBriefing: HTMLElement;
  metaRecap: HTMLElement;
  pauseMeta: HTMLElement;
  hpText: HTMLElement;
  hpFill: HTMLElement;
  goldText: HTMLElement;
  goldPanel: HTMLElement;
  pressurePanel: HTMLElement;
  pressureLabel: HTMLElement;
  pressureText: HTMLElement;
  pressureFill: HTMLElement;
  powerPanel: HTMLElement;
  powerText: HTMLElement;
  warmthPanel: HTMLElement;
  warmthText: HTMLElement;
  warmthFill: HTMLElement;
  warmthStoke: HTMLElement;
  archivePanel: HTMLElement;
  archiveProgress: HTMLElement;
  archiveTarget: HTMLElement;
  archiveInstruction: HTMLElement;
  suitPanel: HTMLElement;
  suitText: HTMLElement;
  suitFill: HTMLElement;
  weaponPanel: HTMLElement;
  weaponReason: HTMLElement;
  weaponChip: HTMLElement;
  agentChip: HTMLElement;
  agentDetail: HTMLElement;
  agentName: HTMLElement;
  agentLevel: HTMLElement;
  agentLabel: HTMLElement;
  agentPortrait: HTMLImageElement;
  agentFeed: HTMLElement;
  xpText: HTMLElement;
  xpFill: HTMLElement;
  levelText: HTMLElement;
  waveText: HTMLElement;
  waveTitle: HTMLElement;
  waveEdge: HTMLElement;
  wavePortrait: HTMLImageElement;
  waveNumber: HTMLElement;
  timeText: HTMLElement;
  pauseHint: HTMLElement;
  buildMount: HTMLElement;
};

/**
 * ONE HUD PER SURFACE (F-CWBC-2). `#hud` is a shared element and the constructor below REPLACES its
 * children, so two live Huds on one root leave the older one holding detached nodes while its
 * timers keep firing against the LIVE root: `dispose()` clears `elements.root`'s own classes and
 * datasets, and `hideContractBriefing` would hide a card the older instance no longer owns. That is
 * how a first-timer lost the contract briefing inside its own 8 s timer. So every mount retires the
 * previous Hud on that root first, and `dispose()` is idempotent, so a late `Game.dispose()` on an
 * already-retired Hud cannot reach through to the live one.
 */
const mountedHuds = new WeakMap<HTMLElement, Hud>();

export class Hud {
  private readonly elements: HudElements;
  private disposed = false;
  private lastGold = 0;
  private lastAnnouncement: string | null = null;
  private lastAnnouncementAt = -1;
  private announcementClearTimer = 0;
  private metaRecapClearTimer = 0;
  private contractBriefingTimer = 0;
  private pauseMetaKey = '';
  private disposeAudioSettings: () => void = () => undefined;
  private disposeStorySettings: () => void = () => undefined;
  private readonly buildButton: BuildButton;
  private readonly prospectorPanel: ProspectorPanel;
  private prospectorPortraitUrl = '';
  private baronPortraitUrl = '';
  private baronPortraitLoading = false;
  private prospectorPanelOpen = false;
  private prospectorSelectedValue = false;

  constructor(root: HTMLElement, private readonly onIntent: (intent: UiIntent) => void) {
    // Retire any Hud still bound to this root BEFORE the markup below replaces its nodes.
    mountedHuds.get(root)?.dispose();
    mountedHuds.set(root, this);
    root.innerHTML = `
      <section class="contract-briefing" data-testid="contract-briefing" aria-live="polite" role="status" hidden></section>

      <div class="hud-meta-recap" data-testid="run-meta-recap" aria-live="polite" hidden></div>

      <div class="hud__wave" data-testid="hud-wave" aria-label="Wave status">
        <img class="hud__wave-portrait" alt="" data-hud-wave-portrait hidden />
        <span class="hud__wave-edge" data-testid="hud-edge" data-hud-edge aria-hidden="true"></span>
        <span class="hud__wave-copy">
          <strong data-hud-wave-title></strong>
          <span data-hud-wave>Stake your claim.</span>
        </span>
      </div>

      <section class="hud-panel hud-panel--vitals" data-testid="hud-vitals" aria-label="Run vitals">
        <div class="hud-row">
          <span class="hud-label">HP</span>
          <strong class="hud-value" data-hud-hp>100 / 100</strong>
        </div>
        <div class="hud-bar" aria-hidden="true">
          <div class="hud-bar__fill hud-bar__fill--hp" data-hud-hp-fill></div>
        </div>
        <div class="hud-row hud-row--split">
          <span class="hud-label">Time</span>
          <strong class="hud-value" data-hud-time>00:00</strong>
        </div>
        <div class="hud-row hud-row--split">
          <span class="hud-label">Wave</span>
          <strong class="hud-value" data-hud-wave-number>0</strong>
        </div>
      </section>

      <section class="hud-panel hud-panel--gold" data-testid="hud-gold" aria-label="Gold pouch">
        <span class="hud-coin" aria-hidden="true"></span>
        <span class="hud-label">Gold</span>
        <strong class="hud-value" data-hud-gold>0</strong>
      </section>

      <section class="hud-panel hud-panel--resource hud-panel--pressure" data-testid="hud-pressure" aria-label="Pressure gauge" hidden>
        <span class="hud-gauge" aria-hidden="true"></span>
        <span class="hud-label" data-hud-pressure-label>Pressure</span>
        <span class="hud-pressure-uses" data-hud-pressure-uses hidden></span>
        <strong class="hud-value" data-hud-pressure>0</strong>
        <span class="hud-pressure-track" aria-hidden="true"><span class="hud-pressure-safe" data-hud-pressure-safe></span><span class="hud-pressure-fill" data-hud-pressure-fill></span></span>
      </section>

      <section class="hud-panel hud-panel--resource hud-panel--power" data-testid="hud-power" aria-label="Power ledger" hidden>
        <span class="hud-gauge" aria-hidden="true"></span>
        <span class="hud-label">Grid</span>
        <strong class="hud-value" data-hud-power></strong>
      </section>

      <!--
        E10S-3: THE VENT'S WARMTH, on the HUD a plain boot already draws (Mistake #10: a mechanic
        a player cannot see is a mechanic that did not ship). It rides the resource-panel grid the
        pressure gauge and the power ledger already share, and it is contract-scoped exactly as
        they are: hidden on every map that declares no vent, which is every map but the Ember
        Shore. It reuses their track and fill classes rather than minting a second meter's CSS.
        NOTE: this comment lives inside a template literal, so it survives transpilation and is
        scanned by scripts/no-emdash-guard.test.mjs. No em dashes and no backticks here.
      -->
      <section class="hud-panel hud-panel--resource hud-panel--warmth" data-testid="hud-warmth" aria-label="Vent warmth" hidden>
        <span class="hud-gauge" aria-hidden="true"></span>
        <span class="hud-label">Warmth</span>
        <span class="hud-pressure-uses" data-hud-warmth-stoke hidden></span>
        <strong class="hud-value" data-hud-warmth>0</strong>
        <span class="hud-pressure-track" aria-hidden="true"><span class="hud-pressure-fill" data-hud-warmth-fill></span></span>
      </section>

      <section class="hud-panel hud-panel--resource hud-panel--archive" data-testid="hud-archive" aria-label="Archive restoration" hidden>
        <span class="hud-label" data-hud-archive-progress></span>
        <strong class="hud-value" data-hud-archive-target></strong>
        <span class="hud-pressure-uses" data-hud-archive-instruction></span>
      </section>

      <!--
        E8: THE HUMAN'S SUIT, on the HUD a plain boot already draws. It rides the same
        resource-panel grid the pressure gauge, the power ledger and the vent meter share, and it
        is contract-scoped exactly as they are: hidden on every map that declares no atmosphere,
        which is every map outside the Orbital bundle. It reuses their track and fill classes
        rather than minting a second meter's CSS.
        NOTE: this comment lives inside a template literal, so it survives transpilation and is
        scanned by scripts/no-emdash-guard.test.mjs. No em dashes and no backticks here.
      -->
      <section class="hud-panel hud-panel--resource hud-panel--suit-air" data-testid="hud-suit-air" aria-label="Suit air" hidden>
        <span class="hud-gauge" aria-hidden="true"></span>
        <span class="hud-label">Air</span>
        <strong class="hud-value" data-hud-suit-air>0s</strong>
        <span class="hud-pressure-track" aria-hidden="true"><span class="hud-pressure-fill" data-hud-suit-air-fill></span></span>
      </section>

      <section class="hud-panel hud-panel--weapon" data-testid="hud-weapon" aria-label="Active weapon">
        <span class="hud-label">Weapon</span>
        <strong class="hud-value" data-hud-weapon>Spark Rig</strong>
        <span class="hud-weapon-reason" data-testid="hud-weapon-reason" hidden>Hands full of river.</span>
        <button class="hud-agent-chip" type="button" data-testid="hud-agent" aria-label="Prospector permission chip" aria-expanded="false">
          <img class="hud-agent-chip__portrait" alt="" data-hud-agent-portrait />
          <span class="hud-agent-chip__main">
            <span data-hud-agent-name>the Prospector</span>
            <strong data-hud-agent-level>L0</strong>
            <span data-hud-agent-label>suggest-only</span>
          </span>
          <span class="hud-agent-feed" data-testid="hud-agent-feed" data-hud-agent-feed aria-live="polite"></span>
          <span class="hud-agent-detail" data-hud-agent-detail aria-hidden="true"></span>
        </button>
      </section>

      <section class="hud-panel hud-panel--xp" data-testid="hud-xp" aria-label="Experience">
        <div class="hud-row">
          <span class="hud-label">Level <strong data-hud-level>1</strong></span>
          <strong class="hud-value" data-hud-xp>0 / 12 XP</strong>
        </div>
        <div class="hud-bar" aria-hidden="true">
          <div class="hud-bar__fill hud-bar__fill--xp" data-hud-xp-fill></div>
        </div>
      </section>

      <section class="hud-panel hud-panel--build" data-testid="hud-build-panel" aria-label="Build">
        <div data-hud-build></div>
      </section>

      <section class="hud-panel hud-panel--meta" data-testid="pause-meta-panel" aria-label="Claim paused" hidden></section>

      <button class="hud-pause" type="button" data-testid="hud-pause" data-hud-pause aria-keyshortcuts="P Escape">
        <span class="hud-pause__key" aria-hidden="true">P - </span>catch your breath
      </button>
    `;

    this.elements = {
      root,
      contractBriefing: this.get(root, '[data-testid="contract-briefing"]'),
      metaRecap: this.get(root, '[data-testid="run-meta-recap"]'),
      pauseMeta: this.get(root, '[data-testid="pause-meta-panel"]'),
      hpText: this.get(root, '[data-hud-hp]'),
      hpFill: this.get(root, '[data-hud-hp-fill]'),
      goldText: this.get(root, '[data-hud-gold]'),
      goldPanel: this.get(root, '[data-testid="hud-gold"]'),
      pressurePanel: this.get(root, '[data-testid="hud-pressure"]'),
      pressureLabel: this.get(root, '[data-hud-pressure-label]'),
      pressureText: this.get(root, '[data-hud-pressure]'),
      pressureFill: this.get(root, '[data-hud-pressure-fill]'),
      powerPanel: this.get(root, '[data-testid="hud-power"]'),
      powerText: this.get(root, '[data-hud-power]'),
      warmthPanel: this.get(root, '[data-testid="hud-warmth"]'),
      warmthText: this.get(root, '[data-hud-warmth]'),
      warmthFill: this.get(root, '[data-hud-warmth-fill]'),
      warmthStoke: this.get(root, '[data-hud-warmth-stoke]'),
      archivePanel: this.get(root, '[data-testid="hud-archive"]'),
      archiveProgress: this.get(root, '[data-hud-archive-progress]'),
      archiveTarget: this.get(root, '[data-hud-archive-target]'),
      archiveInstruction: this.get(root, '[data-hud-archive-instruction]'),
      suitPanel: this.get(root, '[data-testid="hud-suit-air"]'),
      suitText: this.get(root, '[data-hud-suit-air]'),
      suitFill: this.get(root, '[data-hud-suit-air-fill]'),
      weaponPanel: this.get(root, '[data-testid="hud-weapon"]'),
      weaponReason: this.get(root, '[data-testid="hud-weapon-reason"]'),
      weaponChip: this.get(root, '[data-hud-weapon]'),
      agentChip: this.get(root, '[data-testid="hud-agent"]'),
      agentDetail: this.get(root, '[data-hud-agent-detail]'),
      agentName: this.get(root, '[data-hud-agent-name]'),
      agentLevel: this.get(root, '[data-hud-agent-level]'),
      agentLabel: this.get(root, '[data-hud-agent-label]'),
      agentPortrait: this.get(root, '[data-hud-agent-portrait]') as HTMLImageElement,
      agentFeed: this.get(root, '[data-hud-agent-feed]'),
      xpText: this.get(root, '[data-hud-xp]'),
      xpFill: this.get(root, '[data-hud-xp-fill]'),
      levelText: this.get(root, '[data-hud-level]'),
      waveText: this.get(root, '[data-hud-wave]'),
      waveTitle: this.get(root, '[data-hud-wave-title]'),
      waveEdge: this.get(root, '[data-hud-edge]'),
      wavePortrait: this.get(root, '[data-hud-wave-portrait]') as HTMLImageElement,
      waveNumber: this.get(root, '[data-hud-wave-number]'),
      timeText: this.get(root, '[data-hud-time]'),
      pauseHint: this.get(root, '[data-hud-pause]'),
      buildMount: this.get(root, '[data-hud-build]'),
    };
    this.buildButton = new BuildButton(this.onIntent);
    this.elements.buildMount.append(this.buildButton.element);
    this.prospectorPanel = new ProspectorPanel(() => this.prospectorPortraitUrl, this.onIntent, () => this.setProspectorPanelOpen(false));
    root.append(this.prospectorPanel.element);
    this.loadProspectorPortrait();

    this.elements.pauseHint.addEventListener('click', this.onPauseClick);
    this.elements.contractBriefing.addEventListener('click', this.onBriefingClick);
    this.elements.agentChip.addEventListener('click', this.onAgentChipClick);
    window.addEventListener('keydown', this.onKeyDown, { capture: true });
  }

  get prospectorSelected(): boolean {
    return this.prospectorSelectedValue;
  }

  update(snapshot: UiSnapshot, meta: PauseMetaSnapshot, showPauseMeta = snapshot.paused): void {
    this.elements.hpText.textContent = `${Math.ceil(snapshot.hp)} / ${Math.round(snapshot.maxHp)}`;
    this.elements.hpFill.style.width = `${this.percent(snapshot.hp, snapshot.maxHp)}%`;
    this.elements.goldText.textContent = this.goldText(snapshot);
    this.updatePressure(snapshot);
    this.updatePower(snapshot);
    this.elements.weaponChip.textContent = snapshot.weapon === 'blast' ? 'Blast Charge' : 'Spark Rig';
    this.elements.weaponChip.dataset.weapon = snapshot.weapon;
    this.elements.agentName.textContent = snapshot.agent?.name ?? 'the Prospector';
    this.elements.agentLevel.textContent = `L${snapshot.agent?.permissionLevel ?? 0}`;
    this.elements.agentLabel.textContent = snapshot.agent?.permissionLabel ?? 'suggest-only';
    this.elements.agentChip.dataset.level = String(snapshot.agent?.permissionLevel ?? 0);
    this.elements.agentDetail.textContent = agentAbilityDetail(snapshot.agent?.permissionLevel ?? 0);
    const agentFeed = snapshot.agent?.receiptFeed[0] ?? '';
    const trailGuide = agentFeed.startsWith('Guide: ');
    this.elements.agentChip.dataset.guide = String(trailGuide);
    this.elements.agentFeed.dataset.guide = String(trailGuide);
    this.elements.agentFeed.textContent = trailGuide ? agentFeed.slice('Guide: '.length) : agentFeed;
    this.prospectorPanel.update(snapshot);
    this.elements.xpText.textContent = `${snapshot.xp} / ${snapshot.xpNeed} XP`;
    this.elements.xpFill.style.width = `${this.percent(snapshot.xp, snapshot.xpNeed)}%`;
    this.elements.levelText.textContent = snapshot.level.toString();
    this.elements.waveNumber.textContent = snapshot.wave.toString();
    this.elements.timeText.textContent = this.formatTime(snapshot.timeAlive);
    this.updateAnnouncement(snapshot);
    this.elements.root.dataset.runState = snapshot.state;
    this.elements.root.dataset.paused = String(snapshot.paused);
    this.elements.pauseHint.innerHTML = `<span class="hud-pause__key" aria-hidden="true">P - </span>${
      snapshot.paused ? 'back to the claim' : 'catch your breath'
    }`;
    this.elements.pauseHint.setAttribute('aria-label', snapshot.paused ? 'Back to the claim' : 'Pause the claim');
    this.updatePauseMeta(showPauseMeta, meta);
    this.buildButton.update(snapshot);

    if (snapshot.gold !== this.lastGold) {
      this.elements.goldPanel.classList.remove('hud-panel--tick');
      this.elements.goldText.classList.remove('hud-value--gold-pop');
      void this.elements.goldPanel.offsetWidth;
      this.elements.goldPanel.classList.add('hud-panel--tick');
      this.elements.goldText.classList.add('hud-value--gold-pop');
      this.lastGold = snapshot.gold;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (mountedHuds.get(this.elements.root) === this) mountedHuds.delete(this.elements.root);
    this.disposeAudioSettings();
    this.disposeStorySettings();
    this.elements.pauseHint.removeEventListener('click', this.onPauseClick);
    this.elements.contractBriefing.removeEventListener('click', this.onBriefingClick);
    this.elements.agentChip.removeEventListener('click', this.onAgentChipClick);
    window.removeEventListener('keydown', this.onKeyDown, { capture: true });
    this.prospectorPanel.dispose();
    this.buildButton.dispose();
    window.clearTimeout(this.announcementClearTimer);
    window.clearTimeout(this.metaRecapClearTimer);
    window.clearTimeout(this.contractBriefingTimer);
    this.elements.root.classList.remove('hud--announcement-visible');
    delete this.elements.root.dataset.announcementKind;
    this.elements.contractBriefing.classList.remove('contract-briefing--visible');
    this.elements.contractBriefing.hidden = true;
    this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
    this.elements.metaRecap.hidden = true;
  }

  /**
   * E10S-3 — the vent meter, pushed rather than folded into `UiSnapshot`, on the same seam
   * `setWeaponDisarmReason` below uses. `UiBridge.build` takes twenty-four positional arguments
   * and a twenty-fifth for one contract's meter would make every caller pay for one map; a setter
   * costs nothing anywhere else and keeps `UiBridge` untouched.
   *
   * `null` hides the panel, which is what every map but the Ember Shore passes.
   */
  setVentWarmth(vent: VentWarmthState | null): void {
    this.elements.warmthPanel.hidden = !vent;
    if (!vent) return;
    const percent = this.percent(vent.warmth, vent.maxWarmth);
    this.elements.warmthPanel.dataset.state = !vent.alight ? 'cold' : vent.draining ? 'draining' : 'alight';
    this.elements.warmthText.textContent = `${Math.ceil(vent.warmth)}/${Math.round(vent.maxWarmth)}`;
    this.elements.warmthFill.style.width = `${percent}%`;
    // Ember while it burns, deeper as the squall takes it, cold brown when it has gone out. Set
    // here rather than in the stylesheet so the meter needs no CSS of its own (see the markup).
    this.elements.warmthFill.style.background = !vent.alight ? '#4a3a2c' : vent.draining ? '#a0522d' : '#f0a860';
    // The price is only worth showing where the player can actually pay it: standing in the disc.
    this.elements.warmthStoke.hidden = !vent.inReach || !vent.alight;
    this.elements.warmthStoke.textContent = `STOKE ${vent.stokeCost}g`;
    this.elements.warmthPanel.title = vent.alight
      ? `Squalls ridden out ${vent.squallsSurvived}/${vent.squallsRequired} · stand at the vent and confirm to stoke (${vent.stokeCost} gold)`
      : 'The last warm vent has gone out.';
    this.elements.warmthPanel.setAttribute(
      'aria-label',
      `Vent warmth ${Math.ceil(vent.warmth)} of ${Math.round(vent.maxWarmth)}, ${vent.alight ? (vent.draining ? 'falling in the squall' : 'holding') : 'out'}`,
    );
  }

  setArchiveStatus(status: { progress: string; target: string; instruction: string } | null): void {
    this.elements.archivePanel.hidden = !status;
    if (!status) return;
    this.elements.archiveProgress.textContent = status.progress;
    this.elements.archiveTarget.textContent = status.target;
    this.elements.archiveInstruction.textContent = status.instruction;
    this.elements.archivePanel.setAttribute('aria-label', `Archive: ${status.progress}. ${status.target}. ${status.instruction}`);
  }


  /**
   * E8 — the suit dial, pushed on the same seam `setVentWarmth` above uses and for the same
   * reason: `UiBridge.build` already takes two dozen positional arguments and one era's meter is
   * not worth a twenty-fifth. `null` hides the panel, which is what every map outside the Orbital
   * bundle passes.
   *
   * THREE STATES, and they are the three a rider has to tell apart at a glance: BREATHING inside
   * pressurised ground (the dial is filling), DRAINING in vacuum with air left, and EMPTY, which
   * on a contract that authors harm is the state that is actively killing her.
   */

  setSuitAir(suit: SuitAirState | null): void {
    this.elements.suitPanel.hidden = !suit;
    if (!suit) return;
    const seconds = Math.max(0, suit.seconds);
    const state = suit.empty ? 'empty' : suit.inDome !== null ? 'breathing' : 'draining';
    this.elements.suitPanel.dataset.state = state;
    this.elements.suitText.textContent = `${Math.ceil(seconds)}s`;
    this.elements.suitFill.style.width = `${this.percent(seconds, suit.capacity)}%`;
    // Teal while the town's air holds her, amber out on the flat, red once it is gone. Set here
    // rather than in the stylesheet so the meter needs no CSS of its own (the vent meter's rule).
    this.elements.suitFill.style.background = suit.empty ? '#c0392b' : suit.inDome !== null ? '#4fb3a6' : '#e0a83c';
    const harm = suit.harmPerSecond === null ? '' : ` Losing ${suit.harmPerSecond} hit points a second.`;
    this.elements.suitPanel.title = suit.empty
      ? `The suit is empty.${harm} Reach pressurised ground.`
      : suit.inDome !== null
        ? `Breathing in ${suit.inDome}; the suit is filling.`
        : `${Math.ceil(seconds)}s of air left outside pressurised ground.`;
    this.elements.suitPanel.setAttribute(
      'aria-label',
      `Suit air ${Math.ceil(seconds)} of ${Math.round(suit.capacity)} seconds, ${state}`,
    );
  }

  setWeaponDisarmReason(reason: string | null): void {
    this.elements.weaponPanel.classList.toggle('hud-panel--disarmed', reason !== null);
    this.elements.weaponReason.hidden = reason === null;
    if (reason) this.elements.weaponReason.textContent = reason;
  }

  showContractBriefing(briefing: ContractBriefingSnapshot): void {
    window.clearTimeout(this.contractBriefingTimer);
    window.clearTimeout(this.metaRecapClearTimer);
    this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
    this.elements.metaRecap.hidden = true;
    this.elements.contractBriefing.innerHTML = `
      <div class="contract-briefing__paper">
        <div class="contract-briefing__topline">
          <p class="contract-briefing__eyebrow">The Contract</p>
          <button class="contract-briefing__dismiss" type="button" data-testid="contract-briefing-dismiss">Begin</button>
        </div>
        <h2 data-testid="contract-briefing-name">${this.escape(briefing.name)}</h2>
        <p class="contract-briefing__geography" data-testid="contract-briefing-geography">${this.escape(
          briefing.geographyLine,
        )}</p>
        <div class="contract-briefing__columns">
          <section>
            <p class="contract-briefing__label">Goals</p>
            ${this.renderBriefingLines(briefing.goals, 'contract-briefing-goals')}
          </section>
          <section>
            <p class="contract-briefing__label">Rules</p>
            ${this.renderBriefingLines(briefing.rules, 'contract-briefing-rules')}
          </section>
        </div>
      </div>
    `;
    this.elements.contractBriefing.hidden = false;
    this.elements.contractBriefing.classList.remove('contract-briefing--visible');
    void this.elements.contractBriefing.offsetWidth;
    this.elements.contractBriefing.classList.add('contract-briefing--visible');
    this.contractBriefingTimer = window.setTimeout(() => this.hideContractBriefing(), 8000);
  }

  showMetaRecap(text: string | null, durationSeconds = 4): void {
    window.clearTimeout(this.metaRecapClearTimer);
    if (!text) {
      this.elements.metaRecap.hidden = true;
      this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
      return;
    }
    this.elements.metaRecap.textContent = text;
    this.elements.metaRecap.hidden = false;
    this.elements.metaRecap.classList.add('hud-meta-recap--visible');
    this.metaRecapClearTimer = window.setTimeout(() => {
      this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
      this.elements.metaRecap.hidden = true;
    }, Math.min(4, Math.max(0.1, durationSeconds)) * 1000);
  }

  private readonly onPauseClick = () => {
    this.onIntent({ type: 'pause' });
  };

  private readonly onBriefingClick = () => {
    this.hideContractBriefing();
  };

  private readonly onAgentChipClick = () => {
    this.setProspectorPanelOpen(!this.prospectorPanelOpen);
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.code === 'KeyG') {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.setProspectorPanelOpen(!this.prospectorPanelOpen);
    } else if (event.code === 'Escape' && this.prospectorPanelOpen) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.setProspectorPanelOpen(false);
    }
  };

  private setProspectorPanelOpen(open: boolean): void {
    if (open && !this.prospectorSelectedValue) {
      // Opening the charter (chip click or G) selects the Prospector: from here on a click on a
      // seam or sluice sends it to pan (ProspectorDispatchInput). Modifier-click never needed it.
      this.prospectorSelectedValue = true;
      this.elements.agentChip.dataset.selected = 'true';
    }
    this.prospectorPanelOpen = open;
    this.elements.agentChip.dataset.open = String(open);
    this.elements.agentChip.setAttribute('aria-expanded', String(open));
    this.elements.agentDetail.setAttribute('aria-hidden', String(!open));
    this.prospectorPanel.setOpen(open);
  }

  private percent(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  private formatTime(secondsAlive: number): string {
    const minutes = Math.floor(secondsAlive / 60).toString().padStart(2, '0');
    const seconds = Math.floor(secondsAlive % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private goldText(snapshot: UiSnapshot): string {
    const gold = Math.trunc(snapshot.gold);
    const cap = Math.trunc(snapshot.bankCap);
    return gold >= cap * 0.8 || snapshot.stockpileCount > 0 ? `${gold}/${cap}` : gold.toString();
  }

  private updatePressure(snapshot: UiSnapshot): void {
    const pressure = snapshot.resources.find((resource) => resource.id === 'pressure');
    this.elements.root.classList.toggle('hud--pressure-visible', Boolean(pressure));
    this.elements.pressurePanel.hidden = !pressure;
    if (!pressure) return;
    this.elements.pressureLabel.textContent = pressure.name;
    const uses = this.elements.pressurePanel.querySelector<HTMLElement>('[data-hud-pressure-uses]');
    const requiredUses = pressure.objective?.match(/\d+\/(\d+)/)?.[1];
    if (uses) {
      if (requiredUses) {
        uses.hidden = false;
        uses.textContent = `×${requiredUses}`;
      } else if (!pressure.objective) {
        uses.hidden = true;
        uses.textContent = '';
      }
    }
    this.elements.pressurePanel.title = pressure.objective ? 'Pressurize windows open waves 8–12' : '';
    this.elements.pressureText.textContent = `${pressure.amount}/${pressure.cap}`;
    this.elements.pressureFill.style.width = `${this.percent(pressure.amount, pressure.cap)}%`;
    const safe = this.elements.pressurePanel.querySelector<HTMLElement>('[data-hud-pressure-safe]');
    if (safe) {
      safe.hidden = pressure.safeMin === undefined || pressure.safeMax === undefined;
      safe.style.left = `${this.percent(pressure.safeMin ?? 0, pressure.cap)}%`;
      safe.style.width = `${this.percent((pressure.safeMax ?? 0) - (pressure.safeMin ?? 0), pressure.cap)}%`;
    }
    this.elements.pressurePanel.dataset.state = pressure.amount > (pressure.safeMax ?? pressure.cap) ? 'vent' : pressure.safeMax === undefined ? 'unassayed' : 'safe';
  }

  private updatePower(snapshot: UiSnapshot): void {
    const power = snapshot.power;
    this.elements.powerPanel.hidden = !power;
    if (!power) return;
    this.elements.powerPanel.dataset.state = power.dark > 0 ? 'dark' : power.brown > 0 ? 'brown' : 'lit';
    this.elements.powerPanel.setAttribute(
      'aria-label',
      `Power ledger: ${power.supplyWatts} of ${power.demandWatts} watts, ${power.lit} lit, ${power.brown} brown, ${power.dark} dark`,
    );
    const connect = power.connect ? ` · CONNECT ${power.connect.complete ? 'COMPLETE' : `${power.connect.powered}/${power.connect.required} W${power.connect.byWave}`}` : '';
    const next = power.nextDark ? ` · next ${power.nextDark}` : '';
    this.elements.powerPanel.title = `L lit · B brown · D dark${next}`;
    this.elements.powerText.textContent = `${power.supplyWatts}/${power.demandWatts}W · ${power.lit}L ${power.brown}B ${power.dark}D${connect}${next}`;
  }

  private updateAnnouncement(snapshot: UiSnapshot): void {
    const changed =
      snapshot.announcement !== this.lastAnnouncement || snapshot.announcementAt !== this.lastAnnouncementAt;
    if (!changed) return;

    this.lastAnnouncement = snapshot.announcement;
    this.lastAnnouncementAt = snapshot.announcementAt;
    window.clearTimeout(this.announcementClearTimer);

    if (!snapshot.announcement) {
      this.elements.root.classList.remove('hud--announcement-visible');
      this.elements.wavePortrait.hidden = true;
      delete this.elements.root.dataset.announcementKind;
      return;
    }

    this.elements.waveText.textContent = snapshot.announcement;
    this.elements.waveTitle.textContent = snapshot.announcementTitle ?? '';
    this.elements.waveTitle.hidden = !snapshot.announcementTitle;
    const baronAnnouncement = snapshot.announcementKind === 'baron' || snapshot.announcementKind === 'baron-defeat';
    if (baronAnnouncement) {
      this.loadBaronPortrait();
      if (this.baronPortraitUrl && this.elements.wavePortrait.src !== this.baronPortraitUrl) {
        this.elements.wavePortrait.src = this.baronPortraitUrl;
      }
    }
    this.elements.wavePortrait.hidden = !baronAnnouncement;
    this.elements.waveEdge.textContent = snapshot.announcementEdge ? edgeGlyph(snapshot.announcementEdge) : '';
    this.elements.waveEdge.dataset.edge = snapshot.announcementEdge ?? '';
    this.elements.root.dataset.announcementKind = snapshot.announcementKind;
    this.elements.root.classList.add('hud--announcement-visible');
    this.announcementClearTimer = window.setTimeout(() => {
      if (this.lastAnnouncement === snapshot.announcement && this.lastAnnouncementAt === snapshot.announcementAt) {
        this.elements.root.classList.remove('hud--announcement-visible');
      }
    }, Math.max(0.1, snapshot.announcementDurationSeconds) * 1000);
  }

  private get(root: HTMLElement, selector: string): HTMLElement {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing HUD element: ${selector}`);
    return element;
  }

  private loadProspectorPortrait(): void {
    void afterStartupFrame()
      .then(prospectorPortraitUrlLoader)
      .then((url) => {
        this.prospectorPortraitUrl = url;
        this.elements.agentPortrait.src = url;
      });
  }

  private loadBaronPortrait(): void {
    if (this.baronPortraitUrl || this.baronPortraitLoading) return;
    this.baronPortraitLoading = true;
    void baronPortraitUrlLoader().then((url) => {
      this.baronPortraitUrl = url;
      this.elements.wavePortrait.src = url;
    });
  }

  private updatePauseMeta(paused: boolean, meta: PauseMetaSnapshot): void {
    const syncStatus = accountSync.snapshot().label;
    const key = paused ? JSON.stringify({ ...meta, syncStatus }) : '';
    if (key === this.pauseMetaKey) return;
    this.pauseMetaKey = key;
    this.disposeAudioSettings();
    this.disposeStorySettings();
    if (paused) {
      this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
      this.elements.metaRecap.hidden = true;
    }
    this.elements.pauseMeta.hidden = !paused;
    if (!paused) return;

    this.elements.pauseMeta.innerHTML = `
      <p class="hud-meta__eyebrow">Claim Memory</p>
      <h2 class="hud-meta__pause-title">Claim Paused</h2>
      ${meta.training ? '<p class="hud-meta__training" data-testid="pause-drill-yard-training">This is practice. Nothing is at stake. Leave anytime.</p>' : ''}
      <button class="hud-meta__chip" type="button" data-testid="pause-open-ledger">Claim Ledger</button>
      <button class="hud-meta__chip" type="button" data-testid="pause-back-to-town">Back to Town - the claim keeps your place</button>
      <p class="hud-meta__line" data-testid="pause-meta-save">${this.escape(meta.save)}</p>
      ${this.renderManualSave(meta.manualSave)}
      <p class="hud-meta__line gr-account-chip gr-account-chip--pause" data-testid="pause-account-status-chip">${this.escape(syncStatus)}</p>
      <section class="hud-meta__contract" data-testid="pause-contract">
        <p class="hud-meta__label">The Contract</p>
        <strong data-testid="pause-contract-name">${this.escape(meta.contract.name)}</strong>
        <span data-testid="pause-contract-geography">${this.escape(meta.contract.geographyLine)}</span>
        <p class="hud-meta__label">Goals</p>
        ${meta.goalProgress ? this.renderBriefingLines([meta.goalProgress], 'pause-contract-goal-progress') : ''}
        ${this.renderBriefingLines(meta.contract.goals, 'pause-contract-goals')}
        <p class="hud-meta__label">Rules</p>
        ${this.renderBriefingLines(meta.contract.rules, 'pause-contract-rules')}
      </section>
      <p class="hud-meta__line" data-testid="pause-meta-science">${this.escape(meta.science)}</p>
      <p class="hud-meta__line" data-testid="pause-meta-territory">${this.escape(meta.territory)}</p>
      <div class="hud-meta__audio" data-testid="pause-audio-settings">
        <p class="hud-meta__label">Sound</p>
        ${renderAudioSettingsControls(PAUSE_AUDIO_SETTINGS_IDS)}
        ${renderStorySettingsControl(PAUSE_STORY_SETTINGS_IDS)}
      </div>
      <p class="hud-meta__label">Active Research</p>
      <ul class="hud-meta__list" data-testid="pause-meta-boons">
        ${this.renderMetaLines(meta.boons, '0 active research boons', '0 named family effects earned.')}
      </ul>
      <p class="hud-meta__label">Mastery</p>
      <ul class="hud-meta__list" data-testid="pause-meta-mastery">
        ${this.renderMetaLines(meta.mastery, '0 mastery tracks exposed', '0 mastery conversions active.')}
      </ul>
    `;
    this.disposeAudioSettings = bindAudioSettingsControls(this.elements.pauseMeta, PAUSE_AUDIO_SETTINGS_IDS);
    this.disposeStorySettings = bindStorySettingsControl(this.elements.pauseMeta, PAUSE_STORY_SETTINGS_IDS);
    this.elements.pauseMeta.querySelector<HTMLFormElement>('[data-testid="manual-save-form"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = this.elements.pauseMeta.querySelector<HTMLInputElement>('[data-testid="manual-save-name"]');
      this.onIntent({ type: 'save_claim', name: input?.value ?? '' });
    });
    this.elements.pauseMeta.querySelector<HTMLButtonElement>('[data-testid="pause-open-ledger"]')?.addEventListener('click', () => {
      this.onIntent({ type: 'open_ledger' });
    });
    this.elements.pauseMeta.querySelector<HTMLButtonElement>('[data-testid="pause-back-to-town"]')?.addEventListener('click', () => {
      this.onIntent({ type: 'back_to_town' });
    });
  }

  private renderManualSave(save: PauseMetaSnapshot['manualSave']): string {
    return `
      <details class="hud-meta__save" data-testid="manual-save-card" ${save.open ? 'open' : ''}>
        <summary>📒 Save this claim…</summary>
        <form class="hud-meta__save-form" data-testid="manual-save-form">
          <input data-testid="manual-save-name" name="manualSaveName" minlength="2" maxlength="24" autocomplete="off" value="${this.escape(
            save.defaultName,
          )}" ${save.canSave ? '' : 'disabled'} />
          <button class="hud-meta__chip" type="submit" data-testid="manual-save-confirm" ${save.canSave ? '' : 'disabled'}>Save</button>
        </form>
        <p class="hud-meta__save-message" data-testid="manual-save-message">${this.escape(save.message)}</p>
      </details>
    `;
  }

  private renderMetaLines(lines: PauseMetaSnapshot['boons'], emptyName: string, emptyEffect: string): string {
    const source = lines.length > 0 ? lines : [{ name: emptyName, effect: emptyEffect }];
    return source
      .map(
        (line) => `
          <li>
            <strong>${this.escape(line.name)}</strong>
            <span>${this.escape(line.effect)}</span>
          </li>
        `,
      )
      .join('');
  }

  private renderBriefingLines(lines: readonly string[], testId: string): string {
    return `
      <ul class="briefing-lines" data-testid="${testId}">
        ${lines.map((line) => `<li>${this.escape(line)}</li>`).join('')}
      </ul>
    `;
  }

  private hideContractBriefing(): void {
    window.clearTimeout(this.contractBriefingTimer);
    this.elements.contractBriefing.classList.remove('contract-briefing--visible');
    this.elements.contractBriefing.hidden = true;
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

function edgeGlyph(edge: UiSnapshot['announcementEdge']): string {
  if (edge === 'north') return 'N';
  if (edge === 'south') return 'S';
  if (edge === 'east') return 'E';
  if (edge === 'west') return 'W';
  return '';
}

function agentAbilityDetail(level: number): string {
  if (level >= 3) return 'Can gather XP motes, tend walls, and work claim pans. Grows when secured claims add agent progress.';
  if (level >= 2) return 'Can gather XP motes and tend walls when trusted. Grows when secured claims add agent progress.';
  if (level >= 1) return 'Can gather XP motes and handle chores when approved. Grows when secured claims add agent progress.';
  return 'Follows you, observes the claim, and suggests work. Grows when secured claims add agent progress.';
}
