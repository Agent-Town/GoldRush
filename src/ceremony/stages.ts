import type { CeremonyScript } from './scripts';

// Placeholder staging law (CLAUDE.md §4.3): markers and primitives first — the
// art dresses later. Everything here is deterministic from elapsed state: no
// Date.now(), no Math.random() — jitter comes from index hashes.

export type StageHandState = {
  held: boolean;
  /** drive: convoy marker positions in route space, leader first. */
  convoyPositions: readonly { x: number; z: number }[];
  /** drive: leader's fraction along the route, 0..1. */
  routeFraction: number;
  /** rhythm */
  goodPulls: number;
  pullsRequired: number;
  windowOpen: boolean;
  /** 0..1 progress through the open window (for the pulse ring). */
  windowFraction: number;
  passPulls: number;
  lastPullAgoMs: number;
};

export type StageState = {
  script: CeremonyScript;
  phaseId: string;
  phaseElapsedMs: number;
  phaseDurationMs: number;
  elapsedMs: number;
  hand: StageHandState;
};

type StagePainter = (ctx: CanvasRenderingContext2D, w: number, h: number, state: StageState) => void;

const painters: Record<string, StagePainter> = {
  't4-the-boat': drawT4,
  't5-the-deep-reactor': drawT5,
};

export function drawCeremonyStage(ctx: CanvasRenderingContext2D, w: number, h: number, state: StageState): void {
  ctx.clearRect(0, 0, w, h);
  (painters[state.script.id] ?? drawGenericStage)(ctx, w, h, state);
}

/** Deterministic per-index jitter in [-1, 1). */
function jitter(index: number, salt = 0): number {
  let hash = (index * 374761393 + salt * 668265263) >>> 0;
  hash = (hash ^ (hash >> 13)) * 1274126177;
  return (((hash >>> 0) % 2000) / 1000) - 1;
}

function phaseIndex(state: StageState): number {
  return state.script.phases.findIndex((phase) => phase.id === state.phaseId);
}

function phaseReached(state: StageState, id: string): boolean {
  const at = state.script.phases.findIndex((phase) => phase.id === id);
  return at >= 0 && phaseIndex(state) >= at;
}

function phaseProgress(state: StageState): number {
  return state.phaseDurationMs > 0 ? Math.min(1, state.phaseElapsedMs / state.phaseDurationMs) : 0;
}

/** Fallback staging for scripts without a dressed painter yet: the direction
 * line over a marker row — the framework stays playable before its art. */
function drawGenericStage(ctx: CanvasRenderingContext2D, w: number, h: number, state: StageState): void {
  ctx.fillStyle = '#241d16';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = `${Math.round(h * 0.06)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  const phase = state.script.phases[Math.max(0, phaseIndex(state))];
  ctx.fillText(phase?.direction ?? state.script.title, w / 2, h / 2);
  for (let index = 0; index < 5; index += 1) {
    ctx.beginPath();
    ctx.arc(w * (0.3 + index * 0.1), h * 0.7 + jitter(index) * 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── T4 — THE BOAT: dune road, convoy, THE SEA ──────────────────────────────
function drawT4(ctx: CanvasRenderingContext2D, w: number, h: number, state: StageState): void {
  const seaReveal = phaseReached(state, 'the-sea') ? 1 : phaseReached(state, 'crest') ? phaseProgress(state) : 0;
  const horizon = h * 0.42;

  // Sky, warming toward the reveal.
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, seaReveal > 0 ? '#f4e2c0' : '#eed9ae');
  sky.addColorStop(1, '#f7ead0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);

  // THE SEA — a band sweeping in from the east as the hull crests.
  if (seaReveal > 0) {
    const seaWidth = w * 0.55 * seaReveal;
    const sea = ctx.createLinearGradient(w - seaWidth, 0, w, 0);
    sea.addColorStop(0, 'rgba(74, 125, 138, 0)');
    sea.addColorStop(1, 'rgba(58, 112, 128, 0.92)');
    ctx.fillStyle = sea;
    ctx.fillRect(w - seaWidth, horizon * 0.55, seaWidth, horizon * 0.45);
    // The first wave: one bright line rolling to shore during its beat.
    if (phaseReached(state, 'first-wave')) {
      const wave = phaseProgress(state);
      ctx.strokeStyle = 'rgba(232, 240, 238, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const waveX = w - seaWidth * 0.1 - (seaWidth * 0.75 * (state.phaseId === 'first-wave' ? wave : 1));
      ctx.moveTo(waveX, horizon * 0.62);
      ctx.lineTo(w, horizon * 0.62 + 6);
      ctx.stroke();
    }
  }

  // Dune ridges — layered deterministic sines.
  for (let layer = 0; layer < 3; layer += 1) {
    ctx.fillStyle = ['#d9b97f', '#cfa96a', '#c19a58'][layer]!;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const t = x / w;
      const rise = Math.sin(t * (4 + layer) * Math.PI + layer * 1.7) * h * 0.035;
      const lastDune = Math.exp(-((t - 0.8) ** 2) / 0.008) * h * 0.1 * (layer === 2 ? 1 : 0.3);
      ctx.lineTo(x, horizon + h * 0.1 + layer * h * 0.12 + rise - lastDune);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  // Route space (x −14..14) → screen.
  const toScreenX = (x: number): number => ((x + 14) / 28) * (w * 0.86) + w * 0.07;
  const roadY = (t: number): number => horizon + h * 0.3 - Math.exp(-((t - 0.8) ** 2) / 0.01) * h * 0.12;

  // The convoy: the hull-carrier leads; every vehicle in the valley follows.
  const convoy = state.hand.convoyPositions;
  for (let index = convoy.length - 1; index >= 0; index -= 1) {
    const member = convoy[index]!;
    const t = (member.x + 14) / 28;
    const x = toScreenX(member.x);
    const y = roadY(t) + member.z * 2;
    if (index === 0) {
      // The Boat on its carrier: hull polygon + cab. After the reveal, the
      // toy-boat kid stands at the bow (one small warm marker).
      ctx.fillStyle = '#7d5a3c';
      ctx.fillRect(x - 16, y - 8, 32, 8);
      ctx.fillStyle = '#4a7d8a';
      ctx.beginPath();
      ctx.moveTo(x - 14, y - 8);
      ctx.lineTo(x + 14, y - 8);
      ctx.lineTo(x + 8, y - 20);
      ctx.lineTo(x - 10, y - 20);
      ctx.closePath();
      ctx.fill();
      if (phaseReached(state, 'the-sea')) {
        ctx.fillStyle = '#e8b04a';
        ctx.fillRect(x + 9, y - 26, 4, 6);
      }
      // The hull's shadow — the kept image's subject — falls east off the dune.
      ctx.fillStyle = 'rgba(52, 40, 26, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x + 10 + seaReveal * 14, y + 4, 18 + seaReveal * 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = ['#8a5f3a', '#6e6e5a', '#7a4f4f'][index % 3]!;
      ctx.fillRect(x - 5, y - 5 + jitter(index) * 1.5, 10, 6);
    }
    // Dust like a parade — only while the hand moves the haul.
    if (state.hand.held && state.phaseId === 'haul') {
      ctx.fillStyle = 'rgba(214, 187, 138, 0.5)';
      for (let puff = 0; puff < 3; puff += 1) {
        const drift = ((state.elapsedMs / 90 + index * 7 + puff * 11) % 30) / 30;
        ctx.beginPath();
        ctx.arc(x - 8 - drift * 14, y - 2 - drift * 6 + jitter(index * 3 + puff) * 3, 2.5 + drift * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// ─── T5 — THE DEEP REACTOR: the raise, the glow, the homecoming pass ────────
function drawT5(ctx: CanvasRenderingContext2D, w: number, h: number, state: StageState): void {
  const surfacing = phaseReached(state, 'surfacing') ? (state.phaseId === 'surfacing' ? phaseProgress(state) : 1) : 0;
  const passing = state.phaseId === 'homecoming-pass' ? phaseProgress(state) : phaseReached(state, 'homecoming-pass') ? 1 : 0;
  const raise = state.hand.pullsRequired > 0 ? Math.min(1, state.hand.goodPulls / state.hand.pullsRequired) : 0;
  const waterline = h * 0.38;

  // Dusk sky over the year's flattest calm.
  const sky = ctx.createLinearGradient(0, 0, 0, waterline);
  sky.addColorStop(0, '#3d3a55');
  sky.addColorStop(1, '#8a6a63');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, waterline);

  // The inland water, lit from above as the reactor rises.
  const water = ctx.createLinearGradient(0, waterline, 0, h);
  water.addColorStop(0, '#2e4f58');
  water.addColorStop(1, '#1c333c');
  ctx.fillStyle = water;
  ctx.fillRect(0, waterline, w, h - waterline);

  // The homecoming pass: every prior claim in green glass beneath the keel —
  // flats, canyon, hill, river bend — sliding under as the barge crosses.
  const claims = [
    { name: 'flats', color: '#5a7d52' },
    { name: 'canyon', color: '#6b7a4a' },
    { name: 'hill', color: '#4f7a5c' },
    { name: 'river bend', color: '#54806e' },
  ];
  const panX = passing * w * 0.5;
  for (let index = 0; index < claims.length; index += 1) {
    const tileX = w * 0.12 + index * w * 0.24 - panX + w * 0.2;
    const tileY = waterline + h * 0.24;
    ctx.fillStyle = claims[index]!.color;
    ctx.globalAlpha = 0.5 + surfacing * 0.3;
    ctx.fillRect(tileX, tileY, w * 0.2, h * 0.2);
    ctx.globalAlpha = 1;
    // The town waving DOWN at its own history.
    if (passing > 0) {
      ctx.fillStyle = '#e8d9b8';
      for (let waver = 0; waver < 3; waver += 1) {
        const wx = tileX + w * 0.04 + waver * w * 0.05;
        ctx.beginPath();
        ctx.arc(wx, tileY + h * 0.04 + jitter(index * 5 + waver) * 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // The reactor: teal, warm, patient — rising from depth with the raise, then
  // laying its glow across the drowned claims.
  const reactorDepth = h * 0.92 - (h * 0.4) * raise - h * 0.06 * surfacing;
  const glow = ctx.createRadialGradient(w / 2, reactorDepth, 4, w / 2, reactorDepth, w * (0.12 + surfacing * 0.3));
  glow.addColorStop(0, 'rgba(96, 216, 208, 0.95)');
  glow.addColorStop(1, 'rgba(96, 216, 208, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, waterline, w, h - waterline);
  ctx.fillStyle = '#67c9c2';
  ctx.beginPath();
  ctx.arc(w / 2, reactorDepth, 10 + surfacing * 6, 0, Math.PI * 2);
  ctx.fill();

  // All hulls, one line: the flotilla tightens toward center with each pull.
  const hulls = 6;
  for (let index = 0; index < hulls; index += 1) {
    const spread = 1 - raise * 0.35;
    const hx = w / 2 + (index - (hulls - 1) / 2) * w * 0.13 * spread + jitter(index) * 3;
    const bob = Math.sin(state.elapsedMs / 700 + index * 1.3) * 2;
    ctx.fillStyle = '#6e4f33';
    ctx.fillRect(hx - 12, waterline - 6 + bob, 24, 7);
    // One line: rope from every hull to the raise point.
    ctx.strokeStyle = 'rgba(226, 205, 160, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx, waterline + 1 + bob);
    ctx.lineTo(w / 2, reactorDepth - 8);
    ctx.stroke();
  }

  // The homecoming barge crossing the new inland water.
  if (passing > 0) {
    const bx = w * 0.1 + passing * w * 0.8;
    ctx.fillStyle = '#7d5a3c';
    ctx.fillRect(bx - 16, waterline - 9, 32, 9);
    ctx.fillStyle = '#e8b04a';
    ctx.fillRect(bx - 4, waterline - 15, 8, 6);
  }

  // The rhythm: the pull-window pulse ring around the winch point.
  if (state.phaseId === 'the-raise' || (state.phaseId === 'homecoming-pass' && passing < 1)) {
    ctx.strokeStyle = state.hand.windowOpen ? 'rgba(232, 176, 74, 0.95)' : 'rgba(232, 176, 74, 0.25)';
    ctx.lineWidth = state.hand.windowOpen ? 4 : 2;
    ctx.beginPath();
    ctx.arc(w / 2, waterline - 2, 18 + (state.hand.windowOpen ? state.hand.windowFraction * 8 : 0), 0, Math.PI * 2);
    ctx.stroke();
    // A good pull flashes the line taut.
    if (state.hand.lastPullAgoMs < 260) {
      ctx.strokeStyle = 'rgba(240, 232, 210, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w / 2, waterline);
      ctx.lineTo(w / 2, reactorDepth - 8);
      ctx.stroke();
    }
  }
}
