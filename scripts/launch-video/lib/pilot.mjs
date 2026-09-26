// scripts/launch-video/lib/pilot.mjs: the capture pilot (task launch-video-capture-2).
//
// The film's takes are real play at 1x on the plain seed, played by this script instead of a hand:
//   - It SEES what a player sees, through the diagnostics the game publishes on every boot
//     (`window.__THREE_GAME_DIAGNOSTICS__`, src/game/Game.ts publishDiagnostics; the town's
//     `window.__GR_TOWN_DIAGNOSTICS__`). An agent rider sees the same facts (src/agent/View.ts).
//   - It ACTS only through the page's keyboard and mouse: WASD to walk, B and the slot digits and Space
//     to build (src/core/InputController.ts HERO_INPUT_BINDINGS), a mouse click to point the Prospector
//     at a seam (src/ui/ProspectorDispatchInput.ts), Digit keys on the Patent Office (src/ui/UpgradeOverlay.ts).
//   - It NEVER writes game state: no `?debug`, no `__GR_TEST__` (it does not exist in a plain boot), no
//     teleport, no grant. Blurring a focused button before a key press is the one DOM touch, so a stray
//     focus cannot turn Space into a click.
// The capture scripts disclose this in every sidecar: "pilot: capture script, real keyboard and mouse at 1x".

import * as THREE from 'three';
import { log, sleep } from './capture.mjs';

export const PILOT_DISCLOSURE = 'pilot: the capture script, playing through real keyboard and mouse events at 1x; it reads the published diagnostics and never writes game state';

// The camera, as src/systems/CameraRig.ts places it for a run (sceneScale 1): the tracked target is the
// hero's render position, the eye sits at target + offset * distanceScale, and it looks 0.45 up and
// 3.35 north of the target (Balance.camera: fov 42, offset (0, 26.2, 18.3), downScreenLookOffset 3.35).
const CAMERA = { fov: 42, offset: new THREE.Vector3(0, 26.2, 18.3), lookUp: 0.45, lookNorth: 3.35 };

export async function readRun(page) {
  return page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    if (!d) return null;
    const build = d.build ?? {};
    const harvest = d.harvest ?? {};
    return {
      frame: d.frame,
      elapsed: d.elapsed,
      timeAlive: d.timeAlive,
      simTick: d.simulation?.tick ?? null,
      runState: d.runState,
      paused: d.paused,
      wave: d.wave,
      waveState: d.waveState,
      edge: d.edge,
      nextWaveInSim: d.nextWaveInSim,
      hp: d.hp,
      maxHp: d.maxHp,
      enemiesAlive: d.enemiesAlive,
      kills: d.kills,
      hero: d.heroPos ? { x: d.heroPos.x, y: d.heroPos.y, z: d.heroPos.z } : null,
      heroRender: d.heroRenderPos ? { x: d.heroRenderPos.x, y: d.heroRenderPos.y, z: d.heroRenderPos.z } : null,
      speed: d.speed,
      gold: d.economy?.gold ?? 0,
      bankCap: d.economy?.bankCap ?? null,
      zoom: d.camera?.distanceScale ?? 1,
      zoomTarget: d.camera?.targetDistanceScale ?? 1,
      glance: d.camera?.glanceActive ?? false,
      canvas: d.canvas,
      frameMs: d.frameMs,
      tier: d.performance?.tier ?? null,
      runtimeVerdict: d.performance?.runtimeVerdict ?? null,
      build: {
        mode: build.mode,
        selected: build.selectedBuildable,
        ghostValid: build.ghostValid,
        ghostPos: build.ghostPos,
        buildables: build.buildables,
        entries: (build.hp ?? []).map((entry) => ({ id: entry.id, index: entry.index, x: entry.position?.x, z: entry.position?.z, hp: entry.hp, maxHp: entry.maxHp, wrecked: entry.wrecked })),
        repair: build.repair,
      },
      seams: (harvest.activeNodes ?? []).map((node) => ({ id: node.id, x: node.position?.x, z: node.position?.z, active: node.active, remaining: node.remaining })),
      channeling: harvest.channeling,
      channelNodeId: harvest.channelNodeId,
      secured: d.run?.secured ?? false,
      endedReason: d.run?.lastRunEndedReason ?? null,
      contract: { id: d.contract?.activeId, requested: d.contract?.requestedId, fallback: d.contract?.fallbackReason, secureWave: d.contract?.secureWave },
      prospector: d.agent?.embodiment ?? null,
      lastFloat: d.vfx?.lastFloatText ?? null,
      // Freed walkers (the cure): the counter every freed walker bumps; the first four float the word FREED
      // (src/game/Game.ts onEnemyKilled, Balance.legibility.freedFloatLimit).
      freed: d.freedWalkers ? { spawned: d.freedWalkers.spawned, active: d.freedWalkers.active, at: (d.freedWalkers.entities ?? []).filter((entity) => entity.active).map((entity) => ({ x: Number(entity.x.toFixed(1)), z: Number(entity.z.toFixed(1)) })) } : null,
      lighting: d.lighting ? { phase: d.lighting.phase ?? d.lighting.dayNight?.phase ?? null, darkness: d.lighting.darkness ?? d.lighting.dayNight?.darkness ?? null } : null,
      baron: d.baronStandard ? { standardVisible: d.baronStandard.visible, boss: d.readability?.bossHpBar ?? null } : null,
    };
  });
}

export async function readTown(page) {
  return page.evaluate(() => {
    const t = window.__GR_TOWN_DIAGNOSTICS__;
    if (!t) return null;
    return {
      frame: t.frame,
      player: t.player,
      activePrompt: t.activePrompt,
      townName: t.townName,
      namingPrompt: t.namingPrompt,
      boardOpen: t.boardOpen,
      schoolhouseOpen: t.schoolhouseOpen,
      buildings: (t.buildings ?? []).map((building) => ({ id: building.id, visible: building.visible, approach: building.approach, position: building.position })),
      firstClaimGuide: t.firstClaimGuide ?? null,
    };
  });
}

/** World point to page CSS pixels, from the published hero position and zoom (see CAMERA). */
export function projectToScreen(run, world, viewport) {
  const target = run.heroRender ?? run.hero;
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, viewport.width / viewport.height, 0.1, 500);
  camera.position.copy(CAMERA.offset).multiplyScalar(run.zoom ?? 1).add(new THREE.Vector3(target.x, target.y ?? 0, target.z));
  camera.lookAt(target.x, (target.y ?? 0) + CAMERA.lookUp, target.z - CAMERA.lookNorth);
  camera.updateMatrixWorld();
  const point = new THREE.Vector3(world.x, world.y ?? target.y ?? 0, world.z).project(camera);
  return { x: ((point.x + 1) / 2) * viewport.width, y: ((1 - point.y) / 2) * viewport.height };
}

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];

export class Pilot {
  constructor(page, { viewport, recorder = null, avoid = [], picks = DEFAULT_PICKS, onService = null } = {}) {
    this.page = page;
    this.viewport = viewport;
    this.recorder = recorder;
    this.avoid = avoid;
    this.picks = picks;
    this.onService = onService;
    this.held = new Set();
    this.lastRepress = 0;
    this.pointerOnCanvas = false;
    this.events = [];
    this.lastRun = null;
  }

  note(kind, detail = {}) {
    const entry = { kind, t: this.recorder ? Number(this.recorder.now().toFixed(2)) : null, at: new Date().toISOString(), ...detail };
    this.events.push(entry);
    log(`pilot ${kind}`, JSON.stringify(detail));
    return entry;
  }

  async run() {
    this.lastRun = await readRun(this.page);
    return this.lastRun;
  }

  // ---- keys -------------------------------------------------------------------------------
  async hold(keys) {
    const next = new Set(keys);
    for (const key of this.held) if (!next.has(key)) await this.page.keyboard.up(key);
    for (const key of next) if (!this.held.has(key)) await this.page.keyboard.down(key);
    this.held = next;
    // A blur drops held keys (src/core/InputController.ts clearHeldInput); re-press every half second.
    if (Date.now() - this.lastRepress > 500) {
      for (const key of this.held) await this.page.keyboard.down(key);
      this.lastRepress = Date.now();
    }
  }

  async release() {
    for (const key of MOVE_KEYS) await this.page.keyboard.up(key).catch(() => {});
    this.held = new Set();
  }

  async blurFocus() {
    await this.page.evaluate(() => {
      const active = document.activeElement;
      if (active && active !== document.body && typeof active.blur === 'function') active.blur();
    });
  }

  async tap(key) {
    await this.blurFocus();
    await this.page.keyboard.press(key);
  }

  // ---- interrupts -------------------------------------------------------------------------
  /**
   * The chores a player does between moves: take a Patent Office invention (the sim waits on it) and close the
   * Claim Ledger if it ever opens over a run (it pauses the run). Story cards are NEVER clicked: a ledger-page card
   * opens the Claim Ledger when pressed (probe 2, 2026-09-27: `ledger-page:claim_jumper` froze a run for two
   * minutes), so cards leave on their own six-second timer (src/story/StoryRuntime.ts CARD_MS) and HUD-off takes
   * hide the story layer instead. Returns the overlay state so a caller can stop on a run end.
   */
  async service() {
    const state = await this.page.evaluate(() => {
      const visible = (element) => {
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const upgrade = document.querySelector('[data-testid="upgrade-overlay"].upgrade-overlay--visible');
      const cards = upgrade ? [...upgrade.querySelectorAll('[data-testid^="upgrade-card-"]')].filter((card) => !card.hidden).map((card) => card.dataset.upgradeId ?? '') : [];
      const story = document.querySelector('[data-testid="story-beat-card"]');
      return {
        upgradeCards: cards,
        story: story ? story.dataset.beatId ?? '' : null,
        ledger: Boolean(document.querySelector('[data-testid="claim-ledger-close"]')),
        secured: visible(document.querySelector('[data-testid="claim-secured"]')),
        summary: visible(document.querySelector('.death-overlay.death-overlay--visible:not([data-testid="claim-secured"])')),
      };
    });
    if (state.upgradeCards.length) await this.pickUpgrade(state.upgradeCards);
    if (state.ledger) {
      await this.page.locator('[data-testid="claim-ledger-close"]').first().click().catch(() => {});
      this.note('ledger-closed');
    }
    if (state.story && state.story !== this.lastStory) this.note('story-card', { id: state.story });
    this.lastStory = state.story;
    if (this.onService) await this.onService(state);
    return state;
  }

  async pickUpgrade(cards) {
    let index = 0;
    let best = Number.POSITIVE_INFINITY;
    cards.forEach((id, cardIndex) => {
      const rank = this.picks.indexOf(id);
      const score = rank < 0 ? 100 + cardIndex : rank;
      if (score < best) { best = score; index = cardIndex; }
    });
    await this.release();
    await this.page.keyboard.press(`Digit${index + 1}`);
    this.note('invention', { offered: cards, took: cards[index] });
    await sleep(120);
  }

  // ---- walking ----------------------------------------------------------------------------
  directionKeys(dx, dz) {
    const length = Math.hypot(dx, dz);
    if (length < 1e-3) return [];
    const nx = dx / length;
    const nz = dz / length;
    const keys = [];
    if (nx > 0.38) keys.push('KeyD'); else if (nx < -0.38) keys.push('KeyA');
    if (nz > 0.38) keys.push('KeyS'); else if (nz < -0.38) keys.push('KeyW');
    return keys;
  }

  /** Steer around the avoid circles (cold lanterns the film relights later, deep water). */
  steer(from, to) {
    let dx = to.x - from.x;
    let dz = to.z - from.z;
    for (const circle of this.avoid) {
      const cx = circle.x - from.x;
      const cz = circle.z - from.z;
      const distance = Math.hypot(cx, cz);
      if (distance > circle.r + 2.2) continue;
      const toTarget = Math.hypot(to.x - circle.x, to.z - circle.z);
      if (toTarget < circle.r) continue;
      const push = Math.max(0, (circle.r + 2.2 - distance) / 2.2);
      dx -= (cx / Math.max(0.01, distance)) * push * 1.6;
      dz -= (cz / Math.max(0.01, distance)) * push * 1.6;
    }
    return { dx, dz };
  }

  async walkTo(target, { tolerance = 0.9, timeoutMs = 25_000, service = true, until = null } = {}) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (service) {
        const state = await this.service();
        if (state.secured || state.summary) { await this.release(); return 'overlay'; }
      }
      const run = await this.run();
      if (!run?.hero) { await sleep(100); continue; }
      if (run.runState === 'dead') { await this.release(); return 'dead'; }
      if (until && (await until(run))) { await this.release(); return 'until'; }
      const distance = Math.hypot(target.x - run.hero.x, target.z - run.hero.z);
      if (distance <= tolerance) { await this.release(); return 'arrived'; }
      const { dx, dz } = this.steer(run.hero, target);
      // Inside a metre, tap rather than hold, so the hero stops on the mark instead of past it.
      await this.hold(this.directionKeys(dx, dz));
      if (distance < 1.6) { await sleep(60); await this.release(); await sleep(90); } else await sleep(70);
    }
    await this.release();
    return 'timeout';
  }

  /** Stand still, serving interrupts, for `ms` or until `until(run)` is true. */
  async wait(ms, { until = null, every = 150 } = {}) {
    const started = Date.now();
    await this.release();
    while (Date.now() - started < ms) {
      const state = await this.service();
      if (state.secured || state.summary) return 'overlay';
      const run = await this.run();
      if (run?.runState === 'dead') return 'dead';
      if (until && run && (await until(run))) return 'until';
      await sleep(every);
    }
    return 'timeout';
  }

  // ---- pointing -----------------------------------------------------------------------------
  async pointAt(world) {
    const run = await this.run();
    const point = projectToScreen(run, world, this.viewport);
    const x = Math.max(2, Math.min(this.viewport.width - 2, point.x));
    const y = Math.max(2, Math.min(this.viewport.height - 2, point.y));
    await this.page.mouse.move(x, y);
    this.pointerOnCanvas = true;
    return { x, y };
  }

  /** Park the pointer outside the page so hover notes close and nothing under it reacts. */
  async pointerAway() {
    await this.page.mouse.move(-20, -20);
  }

  async settleCamera(ms = 700) {
    await this.release();
    await this.wait(ms);
  }

  // ---- building -----------------------------------------------------------------------------
  /**
   * The digit a player presses for `id`: its place among the build menu's own tiles, which list only what this
   * contract offers (src/ui/BuildButton.ts `data-buildable-id`, numbered from 1; Game.selectBuildableByIndex reads
   * buildSystem.buildableSnapshots). Diagnostics' `build.buildables` lists every family, offered or not.
   */
  async slotFor(id) {
    const order = await this.page.evaluate(() => [...document.querySelectorAll('#hud [data-buildable-id]')].map((tile) => tile.dataset.buildableId));
    return order.indexOf(id);
  }

  countOf(run, id) {
    return (run.build.buildables ?? []).find((entry) => entry.id === id)?.count ?? 0;
  }

  /**
   * Build `id` the way a mouse player does: walk within reach, open the build menu (B), pick the slot (digit),
   * point at the spot until the ghost sits on it and reads valid, confirm (Space), close the menu (B). `spots` is
   * one point or a list tried in order (placement rules such as a sluice's river pad are easier to try than to
   * predict).
   */
  async build(id, spots, { standAt = null } = {}) {
    const list = Array.isArray(spots) ? spots : [spots];
    let run = await this.run();
    const before = this.countOf(run, id);
    for (const spot of list) {
      const stand = standAt ?? { x: spot.x, z: spot.z + 2.5 };
      const walked = await this.walkTo(stand, { tolerance: 1.2 });
      if (walked === 'dead' || walked === 'overlay') return false;
      await this.settleCamera(500);
      run = await this.run();
      if (!run.build.mode) await this.tap('KeyB');
      await sleep(200);
      const slot = await this.slotFor(id);
      if (slot < 0 || slot > 5) {
        this.note('build-unavailable', { id, slot });
        if ((await this.run()).build.mode) await this.tap('KeyB');
        return false;
      }
      await this.tap(`Digit${slot + 1}`);
      await sleep(160);
      let placed = false;
      for (let nudge = 0; nudge < 3; nudge += 1) {
        await this.pointAt(spot);
        await sleep(180);
        run = await this.run();
        const ghost = run.build.ghostPos;
        const onSpot = ghost && Math.hypot(ghost.x - spot.x, ghost.z - spot.z) <= 0.8;
        if (onSpot && run.build.ghostValid && run.build.mode) { placed = true; break; }
      }
      if (!placed) {
        this.note('build-spot-refused', { id, spot, ghost: run.build.ghostPos, valid: run.build.ghostValid, mode: run.build.mode, selected: run.build.selected, gold: run.gold });
        continue;
      }
      await this.tap('Space');
      await sleep(260);
      run = await this.run();
      if (this.countOf(run, id) > before) {
        if (run.build.mode) await this.tap('KeyB');
        await this.pointerAway();
        this.note('built', { id, spot, gold: run.gold, wave: run.wave });
        return true;
      }
      this.note('build-confirm-refused', { id, spot, gold: run.gold });
    }
    run = await this.run();
    if (run.build.mode) await this.tap('KeyB');
    await this.pointerAway();
    this.note('build-failed', { id, gold: run.gold });
    return false;
  }

  /**
   * Upgrade the building at `at` the way a keyboard player does: stand within the context prompt's reach
   * (Balance.demolish.interactRadius 1.6 m) and press U (src/game/Game.ts confirmUpgrade). Returns true when the
   * purse paid for it.
   */
  async upgradeNear(at, { standOffset = { x: 0, z: 1.2 } } = {}) {
    const stand = { x: at.x + standOffset.x, z: at.z + standOffset.z };
    const walked = await this.walkTo(stand, { tolerance: 0.45 });
    if (walked === 'dead' || walked === 'overlay') return false;
    await this.release();
    await sleep(350);
    const before = await this.run();
    await this.tap('KeyU');
    await sleep(350);
    const after = await this.run();
    const paid = after.gold < before.gold - 50;
    this.note(paid ? 'upgraded' : 'upgrade-refused', { at, goldBefore: before.gold, goldAfter: after.gold });
    return paid;
  }

  // ---- the Prospector -----------------------------------------------------------------------
  /**
   * G opens its charter and selects it (src/ui/Hud.ts setProspectorPanelOpen); with build mode off, a click on a
   * seam then sends it panning (src/ui/ProspectorDispatchInput.ts; the click's ray must land within 2.2 m of the
   * seam, Game.prospectorDispatchTargetAt).
   */
  async sendProspectorTo(seam, { charterMs = 2600, onCharterOpen = null } = {}) {
    await this.settleCamera(500);
    let run = await this.run();
    if (run.build.mode) await this.tap('KeyB');
    // G opens the charter and selects the Prospector; a second G closes the panel and the selection stays
    // (src/ui/Hud.ts setProspectorPanelOpen), so the click that follows lands on the world, not on the panel.
    await this.tap('KeyG');
    this.note('charter-open');
    await sleep(900);
    if (onCharterOpen) await onCharterOpen();
    await sleep(Math.max(0, charterMs - 900));
    await this.tap('KeyG');
    await sleep(450);
    const selected = await this.page.evaluate(() => document.querySelector('[data-testid="hud-agent"]')?.dataset.selected ?? null);
    const point = await this.pointAt(seam);
    await sleep(120);
    await this.page.mouse.click(point.x, point.y);
    this.note('prospector-ordered', { seam: seam.id, selected, screen: { x: Math.round(point.x), y: Math.round(point.y) } });
    await sleep(300);
    await this.pointerAway();
  }

  /** A live seam the Prospector can be sent to: not the hero's own, and inside the frame clear of the HUD. */
  async orderableSeam(margin = { x: 110, top: 150, bottom: 170 }) {
    const run = await this.run();
    const { width, height } = this.viewport;
    const seams = (run.seams ?? [])
      .filter((seam) => seam.active !== false && Number.isFinite(seam.x) && (seam.remaining ?? 1) > 0)
      .filter((seam) => Math.hypot(seam.x - run.hero.x, seam.z - run.hero.z) > 3.5)
      .map((seam) => ({ ...seam, screen: projectToScreen(run, seam, this.viewport), distance: Math.hypot(seam.x - run.hero.x, seam.z - run.hero.z) }))
      .filter((seam) => seam.screen.x > margin.x && seam.screen.x < width - margin.x && seam.screen.y > margin.top && seam.screen.y < height - margin.bottom)
      .sort((a, b) => a.distance - b.distance);
    return seams[0] ?? null;
  }

  // ---- the camera ---------------------------------------------------------------------------
  /** The wheel over the canvas zooms (src/systems/CameraZoomController.ts); 0.7 is the floor. */
  async zoomTo(scale) {
    const run = await this.run();
    const current = run.zoomTarget ?? 1;
    const deltaY = Math.log(scale / current) / 0.001;
    await this.pointAt(run.hero);
    const steps = Math.max(1, Math.ceil(Math.abs(deltaY) / 100));
    for (let index = 0; index < steps; index += 1) {
      await this.page.mouse.wheel(0, deltaY / steps);
      await sleep(40);
    }
    await this.pointerAway();
    this.note('zoom', { from: current, to: scale });
  }
}

// Patent Office preference, from the rider tape that reached the Baron's wave 20 from an empty profile
// (artifacts/gauntlet-heat5-20260824/e1-baron/attempt-3-tape.json): the Spark first, then plating.
export const DEFAULT_PICKS = [
  'heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'tinkers_plating', 'beacon_dynamo',
  'quick_fuse', 'powder_charge', 'prospectors_luck',
];

// Build prices as src/game/Balance.ts sets them (beacon 25 x 1.3^n, turret 50 x 1.35^n, flat costs otherwise).
export function priceOf(id, count) {
  if (id === 'sentry_beacon') return Math.ceil(25 * 1.3 ** count);
  if (id === 'turret') return Math.ceil(50 * 1.35 ** count);
  return { sluice: 40, stockpile: 60, lantern_post: 15, palisade: 10, decoy_shed: 20 }[id] ?? 50;
}

/** The live seam to work: the nearest to `anchor` that still holds gold, skipping any in `avoid`. */
export function chooseSeam(run, anchor, { maxDistance = 30, avoid = [] } = {}) {
  const seams = (run.seams ?? [])
    .filter((seam) => seam.active !== false && Number.isFinite(seam.x) && (seam.remaining ?? 1) > 0)
    .filter((seam) => !avoid.some((circle) => Math.hypot(seam.x - circle.x, seam.z - circle.z) < circle.r + 1.2))
    .map((seam) => ({ ...seam, distance: Math.hypot(seam.x - anchor.x, seam.z - anchor.z) }))
    .filter((seam) => seam.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
  return seams[0] ?? null;
}

/**
 * The turtle: hold a home bank, pan the nearest live seam, raise the plan's works in order as the purse allows.
 * It is the shape of the rider ride that reached the Baron's twentieth horn from an empty profile. Returns when
 * `until(run)` is true, an overlay (secured, summary) opens, the hero falls, or the time runs out.
 * `onTick(run)` lets a capture mark moments and move the camera's subject (return 'pause' to hand the loop back).
 */
export async function turtle(pilot, plan, { until = null, timeoutMs = 15 * 60_000, onTick = null } = {}) {
  const started = Date.now();
  const builds = plan.builds.map((entry) => ({ ...entry, failures: 0, done: false }));
  let lastSeen = Date.now();
  while (Date.now() - started < timeoutMs) {
    const state = await pilot.service();
    if (state.secured) return 'secured';
    if (state.summary) return 'summary';
    const run = await pilot.run();
    if (!run) {
      if (Date.now() - lastSeen > 20_000) return 'no-run';
      await sleep(200);
      continue;
    }
    lastSeen = Date.now();
    if (run.runState === 'dead') return 'dead';
    if (until && (await until(run))) { await pilot.release(); return 'until'; }
    if (onTick && (await onTick(run)) === 'pause') continue;
    const next = builds.find((entry) => !entry.done && entry.failures < 3 && (entry.afterWave ?? 0) <= run.wave);
    const price = next ? (next.upgrade ? next.cost : priceOf(next.id, pilot.countOf(run, next.id))) : Infinity;
    if (next && run.gold >= price + (next.reserve ?? 0)) {
      const ok = next.upgrade ? await pilot.upgradeNear(next.at) : await pilot.build(next.id, next.at, { standAt: next.standAt });
      if (ok) next.done = true; else next.failures += 1;
      continue;
    }
    const anchor = plan.seamAnchor ?? plan.home;
    const seam = chooseSeam(run, anchor, { maxDistance: plan.seamRange ?? 16, avoid: pilot.avoid });
    if (seam && run.gold < (run.bankCap ?? 200) - 5) {
      const stand = { x: seam.x + (plan.seamSide?.x ?? 0), z: seam.z + (plan.seamSide?.z ?? 0.9) };
      if (Math.hypot(run.hero.x - seam.x, run.hero.z - seam.z) > 1.3) {
        await pilot.walkTo(stand, { tolerance: 0.6, timeoutMs: 12_000 });
      } else {
        await pilot.wait(400);
      }
      continue;
    }
    if (Math.hypot(run.hero.x - plan.home.x, run.hero.z - plan.home.z) > 1.2) {
      await pilot.walkTo(plan.home, { tolerance: 0.8, timeoutMs: 12_000 });
    } else {
      await pilot.wait(400);
    }
  }
  await pilot.release();
  return 'timeout';
}

/** The Claim Secured choice, then the run summary: keep the tape, take the first research, return to town. */
export async function bankSecuredClaim(page, { keepTape = true, onSummary = null } = {}) {
  await page.getByTestId('bank-secured-claim').click();
  const keep = page.getByTestId('keep-run-tape');
  await page.waitForSelector('.death-overlay.death-overlay--visible', { timeout: 20_000 });
  await sleep(1200);
  const research = page.locator('[data-research-id]');
  const researchOffered = await research.count();
  let researchTaken = null;
  if (researchOffered > 0) {
    researchTaken = await research.first().getAttribute('data-research-id');
    await research.first().click();
    await sleep(600);
  }
  let tapeKept = false;
  if (keepTape && (await keep.count()) > 0) {
    await keep.click();
    await sleep(500);
    tapeKept = (await keep.textContent())?.includes('kept') ?? false;
  }
  if (onSummary) await onSummary();
  const finish = page.getByTestId('stake-again');
  const label = (await finish.textContent())?.trim();
  await finish.click();
  return { researchOffered, researchTaken, tapeKept, finishLabel: label };
}
