// THE SHIPPED-SURFACE PROBE — deliberately quarantined from the honest-play runs.
//
// One question, asked by execution rather than by reading: what can the tool surface the GAME
// installs (Game.ts:2055) actually do, and can anything outside the page reach it at all?
// This boot uses ?debug on purpose (that is the only way window.__GR_AGENT__ exists) and therefore
// is NOT part of the honest-play attestation. It touches no __GR_TEST__ method; it only asks the
// shipped surface to act and writes down the refusals verbatim.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.SO_BASE ?? 'http://127.0.0.1:5241';
const CAMPAIGN = process.env.SO_CAMPAIGN ?? 'so-1';
const PROFILE_DIR = path.join(ROOT, `rehearsal-profile-${CAMPAIGN}`);
const OUT = path.join(ROOT, 'rehearsal', 'so-runs', CAMPAIGN, 'shipped-surface-probe.json');

const main = async () => {
  mkdirSync(path.dirname(OUT), { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chromium', headless: true, viewport: { width: 1280, height: 720 },
  });
  const page = context.pages()[0] ?? (await context.newPage());
  page.on('dialog', (d) => d.accept().catch(() => {}));
  const out = { note: 'DEBUG BOOT — quarantined from the honest-play runs; no __GR_TEST__ method was called.' };
  try {
    await page.goto(`${BASE}/?debug&contract=the-claim&seed=shipped-probe`);
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, { timeout: 40_000 });
    await page.waitForTimeout(1500);

    out.reach = await page.evaluate(() => {
      const stub = window.__GR_AGENT__;
      const surface = stub ? stub.surface : undefined;
      return {
        grAgentPresent: typeof stub !== 'undefined',
        grAgentKeys: stub ? Object.keys(stub).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(stub))) : null,
        stubHasSubmitOrders: !!(stub && typeof stub.submit_orders === 'function'),
        stubHasView: !!(stub && 'view' in stub),
        // AgentStub#surface is TS-private only; at runtime it is a plain own property. This is the
        // ONLY handle any outside caller has on the shipped ToolSurface, and it needs ?debug.
        surfaceReachable: !!surface,
        surfaceTools: surface ? Object.keys(surface.tools) : null,
        permissionLevel: surface ? surface.permissionLevel() : null,
        capabilities: surface ? surface.capabilities.map((c) => ({ id: c.id, level: c.level, tools: c.tools })) : null,
        meta: (() => { try { return JSON.parse(localStorage.getItem('gr.meta.v1') || 'null'); } catch { return null; } })(),
        agentAutonomyFromDiagnostics: window.__THREE_GAME_DIAGNOSTICS__?.agent?.stub?.permissionLevel ?? null,
      };
    });

    out.tools = await page.evaluate(() => {
      const s = window.__GR_AGENT__?.surface;
      if (!s) return { error: 'no surface' };
      const strip = (r) => ({ tool: r.tool, args: r.args, ok: r.outcome.ok, reason: r.outcome.reason ?? null, message: r.outcome.message ?? null, requiredLevel: r.outcome.requiredLevel ?? null });
      return {
        place_building: strip(s.tools.place_building('turret', { x: 0, z: 8 }, 0)),
        pan_at: strip(s.tools.pan_at('gold-seam-2')),
        repair: strip(s.tools.repair({ id: 'palisade', index: 0 })),
        collect_gold: strip(s.tools.collect_gold()),
        submit_build_order: strip(s.tools.submit_orders([{ verb: 'BUILD', what: 'turret', where: { x: 0, z: 8 }, when: { waveGte: 0 } }])),
        submit_harvest_order: strip(s.tools.submit_orders([{ verb: 'HARVEST', seam: 'gold-seam-2' }])),
        submit_hold_order: strip(s.tools.submit_orders([{ verb: 'HOLD', pos: { x: 0, z: 8 } }])),
      };
    });

    // Each submit REPLACES the record set, so re-submit the BUILD alone and let the executor tick
    // it. This is the direct evidence: an order the surface ACCEPTED, dying on actuation.
    await page.evaluate(() => window.__GR_AGENT__.surface.tools.submit_orders(
      [{ verb: 'BUILD', what: 'turret', where: { x: 0, z: 8 }, when: { waveGte: 0 } }]));
    await page.waitForTimeout(3000);
    out.buildOrderLifecycle = await page.evaluate(() => {
      const v = window.__GR_AGENT__.surface.tools.view().outcome.result;
      return {
        orders: v.orders.map((o) => ({ id: o.id, verb: o.order.verb, status: o.status, reason: o.reason })),
        surprises: v.log.filter((e) => e.type === 'surprise'),
        needsRider: v.needsRider,
        turrets: window.__THREE_GAME_DIAGNOSTICS__?.build?.turrets ?? null,
        gold: window.__THREE_GAME_DIAGNOSTICS__?.economy?.gold ?? null,
      };
    });

    // And the same for HARVEST, whose capability the surface does not even advertise.
    await page.evaluate(() => window.__GR_AGENT__.surface.tools.submit_orders([{ verb: 'HARVEST', seam: 'gold-seam-2' }]));
    await page.waitForTimeout(2500);
    out.harvestOrderLifecycle = await page.evaluate(() => {
      const v = window.__GR_AGENT__.surface.tools.view().outcome.result;
      return {
        orders: v.orders.map((o) => ({ id: o.id, verb: o.order.verb, status: o.status, reason: o.reason })),
        surprises: v.log.filter((e) => e.type === 'surprise').map((e) => ({ surprise: e.surprise, reason: e.reason })),
      };
    });

    await page.waitForTimeout(500);
    out.afterTicks = await page.evaluate(() => {
      const s = window.__GR_AGENT__?.surface;
      const v = s ? s.tools.view().outcome.result : null;
      return {
        orders: v ? v.orders.map((o) => ({ id: o.id, verb: o.order.verb, status: o.status, reason: o.reason })) : null,
        surprises: v ? v.log.filter((e) => e.type === 'surprise') : null,
        turrets: window.__THREE_GAME_DIAGNOSTICS__?.build?.turrets ?? null,
      };
    });
  } catch (err) {
    out.error = String((err && err.stack) || err);
  } finally {
    writeFileSync(OUT, JSON.stringify(out, null, 1));
    console.log(JSON.stringify(out, null, 1));
    await context.close();
  }
};

main().catch((e) => { console.error(e); process.exit(1); });
