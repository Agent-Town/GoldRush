#!/usr/bin/env node
/**
 * campaign-map-dossier.mjs — the Surveyor's Dossier probe (F-1368-1).
 *
 * WHY THIS EXISTS: `docs/MAP-CAMPAIGN-LEDGER.md` says the build side of the 27-map campaign is
 * finished and that the only column with work left in it is the owner's — 25 maps each waiting on
 * a one-word verdict. Nothing on disk told him what he was about to look at. This probe boots every
 * wired campaign map once, records what actually mounted, photographs it at the shipped camera, and
 * hands the answers to `docs/MAP-CAMPAIGN-LEDGER-DOSSIER.md` so a verdict costs one look.
 *
 * READ-ONLY. It boots the game and writes only into its own artifact/screenshot directories; it
 * never edits a map, a contract, a pilot or the ledger's verdict column.
 *
 * The boot recipe is lifted verbatim from the house census pattern (`e2e/map-census.spec.ts:94-100`)
 * so this probe and the gate agree about what "booted" means: same query string, same
 * `__GR_TEST__` + frame>10 wait, same briefing dismissal, same pilot-state wait, same door check.
 * Divergence from the census is deliberate and limited to what a DOSSIER needs and a gate does not:
 * landmark provenance, terrain relief, frame luma, and one screenshot per map.
 *
 * Usage:
 *   PROBE_BASE=http://127.0.0.1:5199 node scripts/campaign-map-dossier.mjs [--only=id,id] [--retries=N]
 * The base URL must be served from THIS worktree — `resolveBase` proves it by the listener's cwd,
 * because a probe pointed at another tree reports a real verdict about the wrong subject.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { resolveBase } from '../rehearsal/base-url.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'reviews/shots-campaign-dossier');
const ARTIFACTS = path.join(ROOT, 'artifacts/campaign-dossier');
const PILOT_ASSETS = path.join(ROOT, 'assets/pilots/map-rebuild-spike');

// The 25 wired campaign rows of docs/MAP-CAMPAIGN-LEDGER.md, in ledger order. `The Last Claim`
// (Ark-deck class) and `The River` (Charter Press CP-05) are excluded by that file's own footnote,
// not by a gap, so they are not probed — a row here that the ledger does not carry would be a
// second, competing roster.
// HOSTS are not campaign rows. They are the four base contracts whose sculpt the reuse maps mount,
// probed only so a reuse map the door refuses can still show the owner the ground it would render.
// A host shot is labelled as the host in the dossier — never as the map.
const HOSTS = [
  { id: 'e5-deepwater-claim', era: 5, name: 'Deepwater Claim', host: true },
  { id: 'e6-glow-mesa', era: 6, name: 'Glow Mesa', host: true },
  { id: 'e7-relay-valley', era: 7, name: 'Relay Valley', host: true },
  { id: 'e8-mare-claim', era: 8, name: 'Mare Claim', host: true },
];

const MAPS = [
  { id: 'e2-trestle', era: 2, name: 'The Trestle' },
  { id: 'e2-pressure-garden', era: 2, name: 'The Pressure Garden' },
  { id: 'e2-incline', era: 2, name: 'The Incline' },
  { id: 'e3-blackout-ridge', era: 3, name: 'Blackout Ridge' },
  { id: 'e3-fairground', era: 3, name: 'The Fairground' },
  { id: 'e3-moth-season', era: 3, name: 'Moth Season' },
  { id: 'e4-long-road', era: 4, name: 'The Long Road' },
  { id: 'e4-gusher-county', era: 4, name: 'Gusher County' },
  { id: 'e4-boneyard', era: 4, name: 'The Boneyard' },
  { id: 'e5-flotilla', era: 5, name: 'The Flotilla', reuse: 'e5-deepwater-claim' },
  { id: 'e5-stillwater', era: 5, name: 'Stillwater', reuse: 'e5-deepwater-claim' },
  { id: 'e5-regatta', era: 5, name: 'The Regatta' },
  { id: 'e6-showroom', era: 6, name: 'The Showroom' },
  { id: 'e6-half-life-hollow', era: 6, name: 'Half-Life Hollow' },
  { id: 'e6-picnic', era: 6, name: 'The Picnic', reuse: 'e6-glow-mesa' },
  { id: 'e7-echo-canyon', era: 7, name: 'Echo Canyon' },
  { id: 'e7-dead-band', era: 7, name: 'The Dead Band', reuse: 'e7-relay-valley' },
  { id: 'e7-relay-rush', era: 7, name: 'Relay Rush', reuse: 'e7-relay-valley' },
  { id: 'e8-far-side', era: 8, name: 'The Far Side', reuse: 'e8-mare-claim' },
  { id: 'e8-low-orbit', era: 8, name: 'Low Orbit' },
  { id: 'e8-eclipse', era: 8, name: 'The Eclipse', reuse: 'e8-mare-claim' },
  { id: 'e9-seed-run', era: 9, name: 'The Seed Run' },
  { id: 'e9-devils-alley', era: 9, name: "Devil's Alley" },
  { id: 'e9-old-canal', era: 9, name: 'The Old Canal' },
  { id: 'e10-archive-world', era: 10, name: 'The Archive World' },
];

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length)?.split(',').filter(Boolean);
const retries = Number(args.find((a) => a.startsWith('--retries='))?.slice('--retries='.length) ?? 1);
const baseURL = resolveBase('PROBE_BASE', { root: ROOT });
const ROSTER = [...MAPS, ...HOSTS];
const targets = only ? ROSTER.filter((m) => only.includes(m.id)) : ROSTER;
if (only && targets.length !== only.length) {
  throw new Error(`--only named ids absent from the roster: ${only.filter((id) => !ROSTER.some((m) => m.id === id)).join(', ')}`);
}

await mkdir(SHOTS, { recursive: true });
await mkdir(ARTIFACTS, { recursive: true });

/** Landmark .glb files shipped under this map's OWN slug directory, whether or not it mounts them. */
function packOnDisk(slug) {
  const dir = path.join(PILOT_ASSETS, 'landmarks', slug);
  if (!existsSync(dir)) return null;
  return readdirSync(dir).filter((f) => f.endsWith('.glb')).sort();
}

/** The map's own terrain contract, if it has one on disk (five reuse maps do, unimported). */
function ownContract(slug) {
  const file = path.join(PILOT_ASSETS, `${slug}-terrain-contract.json`);
  if (!existsSync(file)) return null;
  try {
    const json = JSON.parse(readFileSync(file, 'utf8'));
    return {
      file: path.relative(ROOT, file),
      contractId: json.contractId ?? null,
      mounts: (json.landmarkMounts ?? []).filter((m) => m.asset).length,
      mountAssets: (json.landmarkMounts ?? []).flatMap((m) => (m.asset ? [m.asset] : [])),
    };
  } catch (error) {
    return { file: path.relative(ROOT, file), parseError: String(error) };
  }
}

/** `e6-picnic` -> `picnic`: the slug its own art directory is named for. */
const slugOf = (id) => id.replace(/^e\d+-/, '');

/**
 * The gameplay contract's harvest-anchor count — the field the door judges. `?? null` distinguishes
 * "declared empty" (0, which the door refuses) from "never declared" (null, which it admits): the
 * predicate at ContractFamilies.ts:1328 is `harvestAnchors?.length === 0`, so the two are opposite
 * verdicts and must never be collapsed into one number.
 */
const HARVEST_ANCHORS = (() => {
  const table = new Map();
  const root = path.join(ROOT, 'assets/contracts');
  for (const dir of readdirSync(root).filter((d) => d.startsWith('epoch-'))) {
    const file = path.join(root, dir, 'contracts.json');
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    for (const contract of Array.isArray(parsed) ? parsed : (parsed.contracts ?? [])) {
      table.set(contract.id, contract.tileParams?.harvestAnchors?.length ?? null);
    }
  }
  return table;
})();
const harvestAnchorsOf = (id) => (HARVEST_ANCHORS.has(id) ? HARVEST_ANCHORS.get(id) : 'no-contract');

function collectConsole(page) {
  const bucket = { errors: [], warnings: [], pageErrors: [] };
  page.on('console', (message) => {
    const type = message.type();
    if (type === 'error') bucket.errors.push(message.text());
    else if (type === 'warning') bucket.warnings.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

/** Mean/peak luma and a coarse histogram of the shipped frame — catches "black screen" and "blown out". */
function frameStats(buffer) {
  const png = PNG.sync.read(buffer);
  let sum = 0;
  let peak = 0;
  let count = 0;
  const hist = new Array(8).fill(0);
  // Every 3rd pixel in each axis: ~9x cheaper, and no statistic here is sensitive to the stride.
  for (let y = 0; y < png.height; y += 3) {
    for (let x = 0; x < png.width; x += 3) {
      const offset = (y * png.width + x) * 4;
      const luma = png.data[offset] * 0.2126 + png.data[offset + 1] * 0.7152 + png.data[offset + 2] * 0.0722;
      sum += luma;
      if (luma > peak) peak = luma;
      hist[Math.min(7, Math.floor(luma / 32))] += 1;
      count += 1;
    }
  }
  return {
    size: `${png.width}x${png.height}`,
    meanLuma: +(sum / count).toFixed(2),
    peakLuma: +peak.toFixed(1),
    // Share of the frame above 12.5% luma: "how much of the picture is lit at all".
    litShare: +((hist.slice(1).reduce((a, b) => a + b, 0) / count) * 100).toFixed(2),
    hist: hist.map((n) => +((n / count) * 100).toFixed(1)),
  };
}

async function probeMap(browser, map) {
  const started = Date.now();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const console_ = collectConsole(page);
  const row = { ...map, boot: 'FAIL: not run', console: console_ };
  try {
    // The census recipe, verbatim (e2e/map-census.spec.ts:94-100).
    await page.goto(`${baseURL}/?debug&era=${map.era}&contract=${map.id}&nowaves&nolevel&nokill&nopause&tier=full&seed=dossier-${map.id}`);
    await page.waitForFunction(
      () => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
      null,
      { timeout: 45_000 },
    );
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
    await page.waitForFunction(
      () => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState !== 'loading',
      null,
      { timeout: 45_000 },
    );
    // THE DOOR CHECK — and the reason this probe cannot just photograph everything.
    // `ContractFamilies.ts:1328` refuses any contract whose `tileParams.harvestAnchors` is an empty
    // array and opens The Claim instead, publishing its own reason as `fallbackReason`. The pilot is
    // then installed with `this.activeContract.id` (Game.ts:1741), i.e. the FALLBACK id — so a
    // screenshot taken after a refusal is a photograph of The Claim wearing the refused map's name.
    // We record the product's own diagnosis and take no picture, because a mislabelled shot in a
    // dossier is worse than a missing one: it would earn a verdict for the wrong map.
    row.door = await page.evaluate(() => {
      // Two independent readings of the same fact. `__GR_CONTRACT_REGISTRY__` publishes the door's
      // own diagnosis (ContractFamilies.ts:1368-1377); `__GR_TEST__.activeContract()` is what the
      // running game believes it is playing. Both are recorded so a disagreement between them shows
      // up as a disagreement rather than as one confident number.
      const registry = window.__GR_CONTRACT_REGISTRY__;
      if (!registry?.activeContractDiagnostics) throw new Error('__GR_CONTRACT_REGISTRY__ absent; the door verdict is unreadable');
      const d = registry.activeContractDiagnostics();
      return {
        activeId: d.activeId,
        requestedId: d.requestedId,
        fallbackReason: d.fallbackReason,
        gameBelievesActive: window.__GR_TEST__.activeContract().id,
      };
    });
    if (row.door.activeId !== row.door.gameBelievesActive) {
      throw new Error(`door diagnostics disagree with the running game: ${row.door.activeId} vs ${row.door.gameBelievesActive}`);
    }
    if (row.door.activeId !== map.id) {
      row.boot = `REFUSED: ${row.door.fallbackReason ?? 'unknown'} (opened ${row.door.activeId})`;
      row.bootMs = Date.now() - started;
      return row;
    }
    // Landmarks mount asynchronously after the terrain resolves; a dossier that photographs the
    // map before they land would report an honest number about the wrong moment.
    await page
      .waitForFunction(
        () => ['mounted', 'off', 'lite'].includes(document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState ?? ''),
        null,
        { timeout: 30_000 },
      )
      .catch(() => {});
    row.bootMs = Date.now() - started;

    row.pilot = await page.evaluate(() => {
      const d = document.querySelector('#game-canvas').dataset;
      const num = (v) => (v === undefined ? null : Number(v));
      return {
        state: d.terrain3dPilotState ?? null,
        contract: d.terrain3dPilotContract ?? null,
        renderSource: d.terrain3dPilotRenderSource ?? null,
        heightSource: d.terrain3dPilotHeightSource ?? null,
        failure: d.terrain3dPilotFailure ?? null,
        terrainLoadState: d.terrain3dPilotTerrainLoadState ?? null,
        panoramaLoadState: d.terrain3dPilotPanoramaLoadState ?? null,
        landmarkLoadState: d.terrain3dPilotLandmarkLoadState ?? null,
        meshes: num(d.terrain3dPilotMeshes),
        triangles: num(d.terrain3dPilotTriangles),
        vertices: num(d.terrain3dPilotVertices),
        materials: num(d.terrain3dPilotMaterials),
        panorama: d.terrain3dPilotPanorama ?? null,
        panoramaMeshes: num(d.terrain3dPilotPanoramaMeshes),
        panoramaTriangles: num(d.terrain3dPilotPanoramaTriangles),
        panoramaFraming: d.terrain3dPilotPanoramaFraming ?? null,
        panoramaFog: d.terrain3dPilotPanoramaFog ?? null,
        continuation: d.terrain3dPilotContinuation ?? null,
        landmarks: num(d.terrain3dPilotLandmarks),
        landmarkExpected: num(d.terrain3dPilotLandmarkExpected),
        landmarkSkipped: num(d.terrain3dPilotLandmarkSkipped),
        landmarkDiagnostics: d.terrain3dPilotLandmarkDiagnostics ?? '',
        landmarkMountIds: JSON.parse(d.terrain3dPilotLandmarkMounts ?? '[]').map((m) => m.id),
      };
    });

    // RELIEF, sampled through the render-side height source the player's eye actually reads
    // (`terrainVisualY`), not the contract's declared bounds — a contract can promise relief a
    // sculpt never delivers. 21x21 stations across the playable square.
    row.relief = await page.evaluate(() => {
      const api = window.__GR_TEST__;
      const span = 48;
      const step = span / 10;
      const values = [];
      for (let x = -span; x <= span; x += step) {
        for (let z = -span; z <= span; z += step) values.push(api.terrainVisualY(x, z, 0, 1));
      }
      const finite = values.filter((v) => Number.isFinite(v));
      const min = Math.min(...finite);
      const max = Math.max(...finite);
      const mean = finite.reduce((a, b) => a + b, 0) / finite.length;
      const sd = Math.sqrt(finite.reduce((a, b) => a + (b - mean) ** 2, 0) / finite.length);
      return {
        stations: values.length,
        nonFinite: values.length - finite.length,
        min: +min.toFixed(3),
        max: +max.toFixed(3),
        range: +(max - min).toFixed(3),
        sd: +sd.toFixed(3),
      };
    });

    // Two settled frames before the photograph, so the shot is of a rendered map rather than of
    // whatever the first post-mount frame happened to be mid-way through.
    const frame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
    await page
      .waitForFunction((f) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) >= f + 4, frame, { timeout: 10_000 })
      .catch(() => {});
    const shotPath = path.join(SHOTS, `${map.id}.png`);
    const buffer = await page.locator('#game-canvas').screenshot({ path: shotPath });
    row.shot = path.relative(ROOT, shotPath);
    row.frame = frameStats(buffer);

    // SECOND STATION. The spawn camera frames the Prospector, not the map: on The Trestle all six
    // landmarks sit outside it, so a verdict taken from shot one would be a verdict on a patch of
    // dirt. The same shipped camera rig, walked to the map's first landmark mount, is what lets the
    // owner see the thing the map is named for. Same camera, different standpoint — not a rig.
    const firstMount = row.pilot.landmarkMountIds.length
      ? await page.evaluate(() => JSON.parse(document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkMounts)[0])
      : null;
    if (firstMount) {
      await page.evaluate(({ x, z }) => window.__GR_TEST__.teleport(x, z - 6), firstMount);
      const at = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
      await page.waitForFunction((f) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) >= f + 6, at, { timeout: 10_000 }).catch(() => {});
      const landmarkPath = path.join(SHOTS, `${map.id}-landmark.png`);
      const landmarkBuffer = await page.locator('#game-canvas').screenshot({ path: landmarkPath });
      row.landmarkShot = path.relative(ROOT, landmarkPath);
      row.landmarkFrame = frameStats(landmarkBuffer);
      row.landmarkStation = { id: firstMount.id, x: +firstMount.x.toFixed(1), z: +firstMount.z.toFixed(1) };
    }
    row.boot = 'PASS';
  } catch (error) {
    row.boot = `FAIL: ${(error instanceof Error ? error.message : String(error)).split('\n')[0]}`;
    row.bootMs = Date.now() - started;
  } finally {
    await page.close().catch(() => {});
  }
  return row;
}

const browser = await chromium.launch();
const rows = [];
for (const map of targets) {
  let row = await probeMap(browser, map);
  for (let attempt = 1; attempt <= retries && row.boot.startsWith('FAIL'); attempt += 1) {
    // A retry is only honest if it is REPORTED: a flaky map and a solid one must not look alike.
    const retried = await probeMap(browser, map);
    row = { ...retried, retriedAfter: [...(row.retriedAfter ?? []), row.boot] };
  }
  const slug = slugOf(map.id);
  row.disk = { slug, pack: packOnDisk(slug), ownContract: ownContract(slug), harvestAnchors: harvestAnchorsOf(map.id) };
  if (map.reuse) row.disk.reusePack = packOnDisk(slugOf(map.reuse));
  rows.push(row);
  const lm = row.pilot ? `${row.pilot.landmarks}/${row.pilot.landmarkExpected}` : '—';
  const tag = row.boot === 'PASS' ? 'OK  ' : row.boot.startsWith('REFUSED') ? 'SHUT' : 'FAIL';
  console.log(
    `${tag} ${map.id.padEnd(22)} ${String(row.bootMs).padStart(6)}ms  ` +
      `anchors ${String(row.disk.harvestAnchors).padStart(3)}  ` +
      `landmarks ${lm.padEnd(7)} relief ${String(row.relief?.range ?? '—').padStart(7)}m  ` +
      `luma ${String(row.frame?.meanLuma ?? '—').padStart(6)}  ` +
      `err ${row.console.errors.length}/${row.console.pageErrors.length}` +
      `${row.boot === 'PASS' ? '' : `  ${row.boot}`}`,
  );
}
await browser.close();

const out = path.join(ARTIFACTS, 'probe.json');
await writeFile(
  out,
  `${JSON.stringify(
    {
      baseURL,
      viewport: '1280x800',
      recipe: '/?debug&era=<era>&contract=<id>&nowaves&nolevel&nokill&nopause&tier=full&seed=dossier-<id>',
      probed: rows.length,
      rows,
    },
    null,
    2,
  )}\n`,
);
console.log(`\nwrote ${path.relative(ROOT, out)}  (${rows.length} probed)`);
const campaign = rows.filter((r) => !r.host);
const refused = campaign.filter((r) => r.boot.startsWith('REFUSED'));
const failed = campaign.filter((r) => r.boot.startsWith('FAIL'));
console.log(`CAMPAIGN ROWS: ${campaign.length}  opened ${campaign.length - refused.length - failed.length}  refused ${refused.length}  failed ${failed.length}`);
if (refused.length) console.log(`REFUSED BY THE DOOR: ${refused.map((r) => r.id).join(', ')}`);
if (failed.length) console.log(`BOOT FAILURES: ${failed.map((r) => r.id).join(', ')}`);
