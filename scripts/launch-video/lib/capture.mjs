// scripts/launch-video/lib/capture.mjs: the launch film's capture harness (task launch-video-capture-2).
//
// Every take in `scripts/launch-video/` goes through this file, so the treatment's runbook
// (docs/marketing/launch-video/treatment.md, "Capture runbook") is enforced here once:
//   - HEADED Chromium at real speed. The brand book bans headless and throttled gameplay captures
//     (docs/marketing/BRAND-BOOK.md §4), so the browser opens a real window on the GPU; audio is muted
//     so nothing plays aloud on the shared machine.
//   - NO NETWORK LEAVES THE MACHINE. Every request that is not to the local dev server is answered
//     here: the live county (agenttown.app) is aborted unless a fixture fulfils it, and everything else
//     external is aborted too. Each attempt is written to the take's ledger; `networkVerdict` turns the
//     ledger into the per-batch assertion the runbook asks for.
//   - THE CAPTURE PROFILE. Telemetry is opted out before the first script runs
//     (`gr.telemetry.optIn.v1` = '0', src/telemetry/payload.ts:3); no dev-send key is ever written.
//   - THE RECORDING. CDP screencast frames (JPEG) are re-timed onto a constant frame rate by their own
//     capture timestamps and encoded by ffmpeg (VideoToolbox H.264), so a take plays back at the speed
//     it was played. Stills are the screencast frame at the named moment, saved as JPEG.
// Nothing here is a test: this directory is never collected by any battery.

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, devices } from 'playwright';

export const BASE_URL = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5322';
export const OUT_DIR = process.env.GR_LV_OUT ?? path.join(os.homedir(), '.goldrush', 'launch-video');
export const COUNTY_HOST = 'agenttown.app';
export const CAPTURE_NAME = 'Wren';
// The e2e suite's own town name for the seeded Herald profile (e2e/gazette-living.spec.ts:21), used
// for the real profile too so the STAGED paper and the real footage name the same town.
export const CAPTURE_TOWN = 'Quartz Hill';
export const TELEMETRY_OPT_IN_KEY = 'gr.telemetry.optIn.v1';

// The two capture shapes of the runbook (§5). The master is 1280x800 at a device scale of 1.5, so
// frames come out 1920x1200 when the full tier holds (its maxDpr is 2, src/game/PerformanceTier.ts:52).
// The vertical is the e2e suite's mobile project (Pixel 5 emulation at 390x844, playwright.config.ts),
// at a device scale of 2: the game caps its WebGL at the full tier's maxDpr 2, so a larger scale would
// only upscale the same render in the compositor.
export const VIEWPORTS = {
  desktop: {
    id: '1280x800',
    frame: { width: 1920, height: 1200 },
    context: {
      viewport: { width: 1280, height: 800 },
      screen: { width: 1280, height: 800 },
      deviceScaleFactor: 1.5,
    },
  },
  mobile: {
    id: '390x844',
    frame: { width: 780, height: 1688 },
    context: {
      ...devices['Pixel 5'],
      viewport: { width: 390, height: 844 },
      screen: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    },
  },
};

export function takeName({ beat, map, viewport, take }) {
  return `${beat}-${map}-${VIEWPORTS[viewport]?.id ?? viewport}-${take}`;
}

export function outPath(...parts) {
  mkdirSync(OUT_DIR, { recursive: true });
  return path.join(OUT_DIR, ...parts);
}

export function log(...args) {
  const stamp = new Date().toISOString().slice(11, 19);
  console.log(`[lv ${stamp}]`, ...args);
}

export async function launchCaptureBrowser() {
  return chromium.launch({
    headless: false,
    args: [
      '--mute-audio',
      // Belt and braces for a window the owner may cover: Playwright already passes these for
      // Chromium, and a covered window must keep its frame rate or the take is not real speed.
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
    ],
  });
}

/**
 * A fresh, isolated capture context. `storageState` carries one player's saved data from an earlier
 * context (the same browser profile reopened), never a seed; seeded stores are built by the caller and
 * labelled STAGED there.
 */
export async function newCaptureContext(browser, viewport, { storageState, fulfil = [] } = {}) {
  const shape = VIEWPORTS[viewport];
  if (!shape) throw new Error(`unknown viewport ${viewport}`);
  const context = await browser.newContext({
    ...shape.context,
    baseURL: BASE_URL,
    ...(storageState ? { storageState } : {}),
  });
  await context.addInitScript(({ key }) => {
    try {
      window.localStorage.setItem(key, '0');
    } catch {
      // A store that throws cannot carry telemetry either.
    }
  }, { key: TELEMETRY_OPT_IN_KEY });
  const ledger = await guardNetwork(context, fulfil);
  return { context, ledger, shape };
}

/**
 * The no-network rule, as a route and a ledger. `fulfil` entries are { name, test(url), handle(route) }
 * and answer a county call locally (the e2e fixtures); every other external request is aborted.
 */
export async function guardNetwork(context, fulfil = []) {
  const local = new URL(BASE_URL);
  const ledger = { county: [], external: [], fulfilled: [], aborted: [], websockets: [], crafting: [] };
  const isLocal = (url) => url.origin === local.origin;
  context.on('request', (request) => {
    let url;
    try { url = new URL(request.url()); } catch { return; }
    if (url.hostname === COUNTY_HOST || url.hostname.endsWith(`.${COUNTY_HOST}`)) {
      ledger.county.push({ url: url.href, method: request.method(), at: Date.now() });
    }
  });
  await context.route((url) => {
    if (url.protocol === 'data:' || url.protocol === 'blob:') return false;
    return !isLocal(url) || url.pathname.startsWith('/__goldrush/crafting-queue/pending');
  }, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const entry = { url: url.href, method: request.method(), at: Date.now() };
    if (isLocal(url)) {
      // A crafting order writes into assets/crafting-queue/ (vite.config.ts craftingQueuePlugin);
      // the film never crafts, and a write there would cross the task's firewall.
      ledger.crafting.push(entry);
      await route.abort('blockedbyclient');
      return;
    }
    ledger.external.push(entry);
    const handler = fulfil.find((candidate) => candidate.test(url));
    if (handler) {
      ledger.fulfilled.push({ ...entry, by: handler.name });
      await handler.handle(route, url);
      return;
    }
    ledger.aborted.push(entry);
    await route.abort('blockedbyclient');
  });
  await context.routeWebSocket((url) => !isLocal(new URL(url.href.replace(/^ws/, 'http'))), (socket) => {
    ledger.websockets.push({ url: socket.url(), at: Date.now() });
    socket.close({ code: 1008, reason: 'launch-video capture: no network' });
  });
  return ledger;
}

/** The per-take network verdict: nothing reached the network, and every county call is accounted for. */
export function networkVerdict(ledger) {
  const handled = ledger.fulfilled.length + ledger.aborted.length;
  const countyUnhandled = ledger.county.filter((call) =>
    !ledger.fulfilled.some((entry) => entry.url === call.url) && !ledger.aborted.some((entry) => entry.url === call.url));
  return {
    countyAttempts: ledger.county.length,
    countyFulfilledLocally: ledger.fulfilled.filter((entry) => new URL(entry.url).hostname.endsWith(COUNTY_HOST)).length,
    countyAborted: ledger.aborted.filter((entry) => new URL(entry.url).hostname.endsWith(COUNTY_HOST)).length,
    externalAttempts: ledger.external.length,
    externalHandled: handled,
    websocketsClosed: ledger.websockets.length,
    craftingWritesAborted: ledger.crafting.length,
    reachedNetwork: countyUnhandled.length + Math.max(0, ledger.external.length - handled),
    ok: countyUnhandled.length === 0 && handled === ledger.external.length,
  };
}

/** Collects console and page errors, the way every e2e boot does (zero is the bar). */
export function collectErrors(page) {
  const errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text().slice(0, 400));
  });
  page.on('pageerror', (error) => errors.page.push(String(error?.message ?? error).slice(0, 400)));
  return errors;
}

// HUD-off takes hide `#hud` with a capture-side style rule (runbook §6). The rule is a stylesheet the
// capture adds and removes; the game's DOM and state are untouched, and the take's marks say when.
// Beside `#hud` it hides the other layers a player's chrome lives in, each mounted on `#app` rather than inside
// `#hud` (src/game/Game.ts:1928, :1961; src/story/StoryRuntime.ts:47; src/ui/WorldInfoNotes.ts:190): the story
// cards (clicking one can open the Claim Ledger and pause the run, so they are hidden, not clicked), the Patent
// Office choice (the pilot answers it at once; the sim waits meanwhile), the hover note and the prompt stack.
export const HUD_OFF_SELECTORS = ['#hud', '[data-testid="story-beat-layer"]', '[data-testid="upgrade-overlay"]', '[data-testid="world-info-note"]', '[data-testid="prompt-stack"]'];
const HUD_STYLE_ID = 'lv-capture-hud-off';
export async function setHudVisible(page, visible, { alsoHide = [], only = null } = {}) {
  await page.evaluate(({ id, visible: show, selectors }) => {
    document.getElementById(id)?.remove();
    if (show) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `${selectors.join(', ')} { visibility: hidden !important; }`;
    document.head.append(style);
  }, { id: HUD_STYLE_ID, visible, selectors: [...(only ?? HUD_OFF_SELECTORS), ...alsoHide] });
}

function jpegSize(buffer) {
  // Reads the SOF0/SOF2 marker for the frame's real pixel size.
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

/**
 * The recorder. Screencast frames arrive when the compositor draws; each one is written to ffmpeg as
 * many times as the constant-rate clock has ticked since the previous frame, so the file's timeline is
 * the wall clock of the take. `mark(name)` records a moment on that timeline; `still(name)` saves the
 * next frame as a JPEG named `<take>-<name>.jpg`.
 */
export class TakeRecorder {
  constructor(page, { name, frame, fps = 60, quality = 92, bitrate = '40M' }) {
    this.page = page;
    this.name = name;
    this.frame = frame;
    this.fps = fps;
    this.quality = quality;
    this.bitrate = bitrate;
    this.file = outPath(`${name}.mp4`);
    this.t0 = null;
    this.emitted = 0;
    this.last = null;
    this.received = 0;
    this.gaps = [];
    this.previousT = null;
    this.marks = [];
    this.stills = [];
    this.pendingStills = [];
    this.firstFrameSize = null;
    this.maxBuffered = 0;
    this.stopped = false;
  }

  async start() {
    this.cdp = await this.page.context().newCDPSession(this.page);
    this.ffmpeg = spawn('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'image2pipe', '-framerate', String(this.fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'h264_videotoolbox', '-b:v', this.bitrate, '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', '-an', this.file,
    ], { stdio: ['pipe', 'ignore', 'pipe'] });
    this.ffmpegErrors = '';
    this.ffmpeg.stderr.on('data', (chunk) => { this.ffmpegErrors += chunk.toString(); });
    this.ffmpeg.stdin.on('error', (error) => { this.ffmpegErrors += `stdin: ${error.message}\n`; });
    this.ffmpegDone = new Promise((resolve) => this.ffmpeg.on('close', (code) => resolve(code)));
    this.cdp.on('Page.screencastFrame', (event) => this.onFrame(event));
    await this.cdp.send('Page.startScreencast', {
      format: 'jpeg',
      quality: this.quality,
      maxWidth: this.frame.width,
      maxHeight: this.frame.height,
      everyNthFrame: 1,
    });
    this.startedWall = Date.now() / 1000;
    log(`recording ${this.name}`);
  }

  onFrame({ data, metadata, sessionId }) {
    this.cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    if (this.stopped) return;
    const buffer = Buffer.from(data, 'base64');
    const t = Number(metadata.timestamp) || Date.now() / 1000;
    this.received += 1;
    if (!this.firstFrameSize) this.firstFrameSize = jpegSize(buffer);
    if (this.previousT !== null) this.gaps.push(t - this.previousT);
    this.previousT = t;
    if (this.t0 === null) {
      this.t0 = t;
      // The screencast stamps frames on the wall clock; marks use Date.now(). This is the offset.
      this.clockSkewMs = Number((Date.now() - t * 1000).toFixed(1));
    }
    const due = Math.floor((t - this.t0) * this.fps);
    while (this.last && this.emitted < due) this.write(this.last);
    this.last = buffer;
    for (const pending of this.pendingStills.splice(0)) {
      writeFileSync(pending.file, buffer);
      this.stills.push({ name: pending.name, file: pending.file, t: t - this.t0 });
      pending.resolve(pending.file);
    }
  }

  write(buffer) {
    this.emitted += 1;
    if (!this.ffmpeg.stdin.writable) return;
    this.ffmpeg.stdin.write(buffer);
    this.maxBuffered = Math.max(this.maxBuffered, this.ffmpeg.stdin.writableLength);
  }

  /** Seconds since the first frame, on the file's own timeline. */
  now() {
    return this.t0 === null ? 0 : Date.now() / 1000 - this.t0;
  }

  mark(name, extra = {}) {
    const entry = { name, t: Number(this.now().toFixed(3)), wall: new Date().toISOString(), ...extra };
    this.marks.push(entry);
    log(`mark ${this.name} ${entry.t.toFixed(1)}s ${name}`);
    return entry;
  }

  still(name) {
    const file = outPath(`${this.name}-${name}.jpg`);
    this.mark(`still:${name}`);
    const fromFrame = new Promise((resolve) => this.pendingStills.push({ name, file, resolve }));
    // A static page sends no new frame; after a second the page itself is photographed instead.
    const fallback = sleep(1000).then(async () => {
      const index = this.pendingStills.findIndex((pending) => pending.file === file);
      if (index < 0) return null;
      const [pending] = this.pendingStills.splice(index, 1);
      await this.page.screenshot({ path: file, type: 'jpeg', quality: this.quality }).catch(() => {});
      this.stills.push({ name, file, t: this.now(), via: 'screenshot' });
      pending.resolve(file);
      return file;
    });
    return Promise.race([fromFrame, fallback.then(() => fromFrame)]);
  }

  async stop() {
    if (this.stopped) return this.summary();
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    this.stopped = true;
    const end = Date.now() / 1000;
    if (this.last && this.t0 !== null) {
      const due = Math.floor((end - this.t0) * this.fps) + 1;
      while (this.emitted < due) this.write(this.last);
    }
    for (const pending of this.pendingStills.splice(0)) pending.resolve(null);
    this.ffmpeg.stdin.end();
    this.exitCode = await this.ffmpegDone;
    await this.cdp.detach().catch(() => {});
    return this.summary();
  }

  summary() {
    const gaps = [...this.gaps].sort((a, b) => a - b);
    const pick = (q) => (gaps.length ? gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * q))] : null);
    const seconds = this.t0 === null ? 0 : this.emitted / this.fps;
    return {
      file: this.file,
      seconds: Number(seconds.toFixed(2)),
      fps: this.fps,
      framesReceived: this.received,
      framesWritten: this.emitted,
      receivedFps: seconds > 0 ? Number((this.received / seconds).toFixed(1)) : 0,
      frameGapMs: { p50: pick(0.5) && Number((pick(0.5) * 1000).toFixed(1)), p95: pick(0.95) && Number((pick(0.95) * 1000).toFixed(1)), max: gaps.length ? Number((gaps.at(-1) * 1000).toFixed(1)) : null },
      frameSize: this.firstFrameSize,
      clockSkewMs: this.clockSkewMs ?? null,
      jpegQuality: this.quality,
      bitrate: this.bitrate,
      encoder: 'h264_videotoolbox',
      maxBufferedBytes: this.maxBuffered,
      ffmpegExit: this.exitCode ?? null,
      ffmpegErrors: this.ffmpegErrors?.slice(0, 400) ?? '',
      marks: this.marks,
      stills: this.stills,
    };
  }
}

export function writeSidecar(name, data) {
  const file = outPath(`${name}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return file;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- the capture profile's lineage ---------------------------------------------------------------
// One player, "Wren", carried from session to session: the browser's own saved data (localStorage) is exported
// when a session ends and imported when the next begins, as if the same browser were reopened. It is never
// edited here; a seeded (STAGED) store is built by its own script and never written back to the lineage.
export function lineagePath(name) {
  mkdirSync(path.join(OUT_DIR, 'state'), { recursive: true });
  return path.join(OUT_DIR, 'state', `${name}.json`);
}

export async function saveLineage(context, name) {
  const file = lineagePath(name);
  await context.storageState({ path: file });
  log(`lineage saved: ${file}`);
  return file;
}

export function loadLineage(name) {
  const file = lineagePath(name);
  const state = JSON.parse(readFileSync(file, 'utf8'));
  const origin = new URL(BASE_URL).origin;
  // The same data under this batch's origin (5322 or 5323); nothing else changes.
  for (const entry of state.origins ?? []) entry.origin = origin;
  return state;
}

/** Stop every open recorder cleanly on SIGTERM (the batch watchdog), so no take is left unfinalized. */
export function installStopHandler(getRecorders) {
  const stop = async (signal) => {
    log(`${signal}: finalizing open recorders`);
    for (const recorder of getRecorders()) await recorder.stop().catch(() => {});
    process.exit(143);
  };
  process.once('SIGTERM', () => { void stop('SIGTERM'); });
  process.once('SIGINT', () => { void stop('SIGINT'); });
}
