#!/usr/bin/env node
/**
 * s2134 EVIDENCE PROBE for F-A10-1 — RETAINED, CITED (F-1665-1: an evidence-producing
 * probe belongs in scripts/, unlike a one-shot splice helper).
 *
 * QUESTION: does `src/world/Terrain.ts`'s module-level `ACTIVE_CONTRACT` resolve to
 * `the-claim` under SSR, so that every bench placement/walkability answer is measured
 * against The Claim's ground rather than the contract under test?
 *
 * Read the CODE, not this comment: Terrain.ts:78 `const ACTIVE_CONTRACT = activeContract()`
 * (module scope, evaluated once at import); ContractFamilies.ts:2294 `currentSearch()`
 * returns '' when `globalThis.location` is absent; :1319 falls back to DEFAULT_CONTRACT_ID
 * ('the-claim', :837). HeadlessContractSim.ts:87 imports * as Terrain and consumes
 * bounds/sample/landmarkBlockers at :1347-1351 and nodeAnchors at :709.
 *
 * Run: node scripts/tmp-s2134-terrain-ssr-probe.mjs
 */
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const out = (...a) => process.stderr.write(a.join(' ') + '\n');

const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
try {
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  const CF = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

  const active = CF.activeContract();
  out('=== SSR-resolved ACTIVE_CONTRACT (what Terrain baked in at import) ===');
  out('id:', active.id, '| name:', active.name);
  out('DEFAULT_CONTRACT_ID:', CF.DEFAULT_CONTRACT_ID);
  out('Terrain.CLAIM_WIDTH x CLAIM_HEIGHT:', Terrain.CLAIM_WIDTH, 'x', Terrain.CLAIM_HEIGHT);
  out('the-claim buildZones:', JSON.stringify(active.tileParams.buildZones ?? []));
  out('Terrain.nodeAnchors count:', (Terrain.nodeAnchors ?? []).length);

  const contracts = CF.listBoardContracts();
  out('\n=== per-contract probe: centre of each contract OWN first buildZone ===');
  out('(a contract whose own legal build ground Terrain rejects is one the bench cannot place on)');
  const rows = [];
  for (const c of contracts) {
    const zones = c.tileParams.buildZones ?? [];
    if (zones.length === 0) continue;
    const z0 = zones[0];
    const cx = (z0.minX + z0.maxX) / 2;
    const cz = (z0.minZ + z0.maxZ) / 2;
    let terrainSays;
    try {
      terrainSays = Terrain.isBuildable(cx, cz);
    } catch (e) {
      terrainSays = `THREW:${e.message}`;
    }
    rows.push({ id: c.id, zones: zones.length, cx, cz, terrainSays });
  }
  for (const r of rows) {
    const flag = r.terrainSays === true ? '  ok    ' : ' DIVERGE';
    out(`${flag} ${r.id.padEnd(26)} zones=${String(r.zones).padStart(2)} ownZoneCentre=(${r.cx},${r.cz}) Terrain.isBuildable=${r.terrainSays}`);
  }
  const diverge = rows.filter((r) => r.terrainSays !== true);
  out(`\nCONTRACTS DECLARING buildZones: ${rows.length}`);
  out(`DIVERGENT (own buildZone centre NOT buildable per Terrain): ${diverge.length}`);
  out(`divergent ids: ${diverge.map((d) => d.id).join(', ') || '(none)'}`);

  out('\n=== anchors fallback (HeadlessContractSim.ts:709) ===');
  let noAnchors = 0;
  for (const c of contracts) {
    const a = c.tileParams.harvestAnchors;
    if (a === undefined) noAnchors++;
  }
  out(`contracts with harvestAnchors === undefined (so the sim falls back to Terrain.nodeAnchors, i.e. The Claim's): ${noAnchors}`);
} finally {
  await vite.close();
}
