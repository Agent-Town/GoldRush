// F-FC2-5 scope 3 — the walk probes, in run 7's shape, PLUS the one run 7 did not probe.
//
// Adapted from `artifacts/sol/map-art-campaign-2/run-7/walk-proof.mjs` (Astra's harness) with
// four changes: port 5307, this task's output directory, the four solids read LIVE from the
// registry (so the cradle's new rim mount is the thing under test rather than a frozen copy),
// and a RECOVERY PROBE — walk the hero from the start stake to the recovery zone's centre
// (0,45) on foot and fire `CONTEXT_ACTION recover` there. Run 7 checked that the published
// sites were walkable; it never checked that the recovery ACTION could be reached, which is
// the hole F-FC2-5 fell through.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const id = 'e8-far-side';
const out = 'artifacts/f-fc2-5-cradle-to-rim';
const root = 'assets/pilots/map-rebuild-spike';
const config = { epoch: 'epoch-8-orbital', variant: 'far-side', parent: 'mare-claim' };
const variant = JSON.parse(readFileSync(`${root}/${config.variant}-terrain-contract.json`));
const parent = JSON.parse(readFileSync(`${root}/${config.parent}-terrain-contract.json`));
const registry = JSON.parse(readFileSync(`${root}/landmark-collision-contract.json`));
const solids = registry.maps[config.variant];
mkdirSync(`${out}/shots`, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 }, isMobile: width === 390, hasTouch: width === 390 });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:5307/?debug&epoch=${config.epoch}&contract=${id}&nowaves&nolevel&nokill&nopause&nosteal&nowreck&tier=full&seed=f-fc2-5-rim`);
    await page.waitForFunction(() => window.__GR_TEST__ && document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
    const begin = page.getByTestId('contract-briefing-dismiss');
    if (await begin.isVisible()) await begin.click();
    await page.evaluate(() => window.__GR_TEST__.setManualSim(true));

    const navigation = await page.evaluate(async ({ solids, variant, parent }) => {
      const t = await import('/src/world/Terrain.ts');
      const api = window.__GR_TEST__;
      const contract = api.activeContract();
      const spawn = { ...window.__THREE_GAME_DIAGNOSTICS__.heroPos };
      const blockers = t.landmarkBlockers();
      const own = blockers.filter((b) => solids.some((s) => b.id.endsWith(':' + s.id)));
      const step = .5, minX = t.bounds.minX + 1, minZ = t.bounds.minZ + 1;
      const nx = Math.floor((t.bounds.maxX - minX - 1) / step) + 1, nz = Math.floor((t.bounds.maxZ - minZ - 1) / step) + 1;
      const point = (i) => ({ x: minX + (i % nx) * step, z: minZ + Math.floor(i / nx) * step });
      const index = (x, z) => Math.round((z - minZ) / step) * nx + Math.round((x - minX) / step);
      const visited = new Uint8Array(nx * nz), queue = [index(spawn.x, spawn.z)];
      visited[queue[0]] = 1;
      for (let k = 0; k < queue.length; k++) {
        const i = queue[k], x = i % nx, z = Math.floor(i / nx);
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + dx, zz = z + dz, j = zz * nx + xx;
          if (xx < 0 || zz < 0 || xx >= nx || zz >= nz || visited[j]) continue;
          const p = point(j);
          if (!t.sample(p.x, p.z).walkable) continue;
          visited[j] = 1; queue.push(j);
        }
      }
      const reachable = (x, z) => t.sample(x, z).walkable && !!visited[index(x, z)];
      const targets = []; const tile = contract.tileParams;
      for (const [kind, list] of [['stake', tile.stakeMarkers ?? []], ['harvest', tile.harvestAnchors ?? []]]) {
        for (const [i, p] of list.entries()) targets.push({ kind, id: p.id ?? String(i), x: p.x, z: p.z, reachable: reachable(p.x, p.z) });
      }
      const stations = new Map([...(parent.landmarkAcceptanceStations ?? []), ...(variant.landmarkAcceptanceStations ?? [])].map((s) => [s.id, s]));
      for (const s of stations.values()) { const [x, z] = s.heroPositionXZ; targets.push({ kind: 'station', id: s.id, x, z, reachable: reachable(x, z) }); }
      for (const [kind, list] of [['site', tile.buildZones ?? []], ['probe-zone', tile.probeRecoveryZones ?? []]]) {
        for (const area of list) {
          const center = { x: (area.minX + area.maxX) / 2, z: (area.minZ + area.maxZ) / 2 };
          const choices = queue.map(point).filter((p) => p.x >= area.minX && p.x <= area.maxX && p.z >= area.minZ && p.z <= area.maxZ)
            .sort((a, b) => Math.hypot(a.x - center.x, a.z - center.z) - Math.hypot(b.x - center.x, b.z - center.z));
          // THE ADDED ASSERTION (F-FC2-5): the zone's own CENTRE has to be reachable, not merely
          // some cell of the zone. At (0,45) the cradle made the centre unwalkable and this row
          // would have been the alarm the drain had to find in a failing sim test instead.
          targets.push({ kind, id: area.id, center, approach: choices[0] ?? null, reachable: choices.length > 0, centreReachable: reachable(center.x, center.z) });
        }
      }
      for (const [i, route] of (tile.lanes?.patrolRoutes ?? []).entries()) {
        for (const [j, p] of (route.points ?? route).entries()) {
          const x = p.x ?? p[0], z = p.z ?? p[1];
          targets.push({ kind: 'route', id: `${i}:${j}`, x, z, reachable: reachable(x, z) });
        }
      }
      return { spawn, spawnWalkable: t.sample(spawn.x, spawn.z).walkable, own, blockers, targets, reachableCells: queue.length, step };
    }, { solids, variant, parent });

    assert.ok(navigation.spawnWalkable, 'spawn is walkable');
    assert.equal(navigation.own.length, solids.length);

    const probes = [];
    for (const b of navigation.own) {
      const faces = [], group = [b];
      for (let i = 0; i < group.length; i++) {
        for (const other of navigation.blockers) {
          if (!group.includes(other) && Math.abs(other.x - group[i].x) <= other.halfX + group[i].halfX + 1.16 && Math.abs(other.z - group[i].z) <= other.halfZ + group[i].halfZ + 1.16) group.push(other);
        }
      }
      for (const [axis, sign, key] of [['x', -1, 'KeyD'], ['x', 1, 'KeyA'], ['z', -1, 'KeyS'], ['z', 1, 'KeyW']]) {
        const half = (o) => (axis === 'x' ? o.halfX : o.halfZ);
        const faceBody = group.reduce((a, c) => (sign * (c[axis] + sign * half(c)) > sign * (a[axis] + sign * half(a)) ? c : a));
        const start = { x: faceBody.x, z: faceBody.z };
        start[axis] += sign * (half(faceBody) + .58 + .6);
        await page.evaluate((p) => window.__GR_TEST__.teleport(p.x, p.z), start);
        await page.keyboard.down(key);
        await page.evaluate(() => window.__GR_TEST__.advanceSim(1.5));
        await page.keyboard.up(key);
        await page.waitForTimeout(40);
        const hero = await page.evaluate(() => ({ ...window.__THREE_GAME_DIAGNOSTICS__.heroPos }));
        const blocked = !navigation.blockers.some((a) => Math.abs(hero.x - a.x) <= a.halfX + .58 && Math.abs(hero.z - a.z) <= a.halfZ + .58);
        const boundary = faceBody[axis] + sign * (half(faceBody) + .58);
        const boundaryDistance = Math.abs(hero[axis] - boundary);
        faces.push({ axis, sign, key, faceBody: faceBody.id, start, hero, boundaryDistance, outsideAllBlockers: blocked });
        assert.ok(blocked, `${b.id} ${key}`);
        assert.ok(boundaryDistance < .12, `${b.id} ${key} boundary: ${boundaryDistance}`);
      }
      await page.evaluate((b) => window.__GR_TEST__.teleport(b.x, b.z), b);
      await page.keyboard.down('KeyD');
      await page.evaluate(() => window.__GR_TEST__.advanceSim(3));
      await page.keyboard.up('KeyD');
      await page.waitForTimeout(40);
      const hero = await page.evaluate(() => ({ ...window.__THREE_GAME_DIAGNOSTICS__.heroPos }));
      const released = !navigation.blockers.some((a) => Math.abs(hero.x - a.x) <= a.halfX + .58 && Math.abs(hero.z - a.z) <= a.halfZ + .58);
      probes.push({ id: b.id, overlappingBlockerGroup: group.map((o) => o.id), faces, depenetrated: released, releasePosition: hero });
      assert.ok(released, `${b.id} depenetration`);
      await page.evaluate((b) => window.__GR_TEST__.teleport(b.x, b.z + b.halfZ + 3), b);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${out}/shots/walk-${b.id.split(':')[1]}-${width}.png` });
    }

    // THE RECOVERY PROBE — the one run 7 did not do. Walk the hero on foot from the start stake
    // to the recovery zone's centre (0,45) with the keys a human uses, then check the engine's
    // own reach predicate there. `recover` itself is a headless CONTEXT_ACTION; the browser's
    // half of the same gate is `ProbeRecovery.inReach`, read here off the live run.
    const recovery = await page.evaluate(async () => {
      const t = await import('/src/world/Terrain.ts');
      const api = window.__GR_TEST__;
      const tile = api.activeContract().tileParams;
      const zone = tile.probeRecoveryZones[0];
      const centre = { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 };
      const stake = tile.stakeMarkers.find((s) => s.heroStart);
      return { zone, centre, stake, centreWalkable: t.sample(centre.x, centre.z).walkable, stakeWalkable: t.sample(stake.x, stake.z).walkable };
    });
    // Which key walks NORTH (+z) is decided by measurement, not by assumption: the face probes
    // above drive the hero INTO a face, so their `KeyW` is the −z key. One second of each settles it.
    await page.evaluate((s) => window.__GR_TEST__.teleport(s.x, s.z), recovery.stake);
    await page.waitForTimeout(40);
    let northKey = null;
    for (const key of ['KeyS', 'KeyW']) {
      await page.evaluate((s) => window.__GR_TEST__.teleport(s.x, s.z), recovery.stake);
      await page.keyboard.down(key);
      await page.evaluate(() => window.__GR_TEST__.advanceSim(1));
      await page.keyboard.up(key);
      await page.waitForTimeout(40);
      const hero = await page.evaluate(() => ({ ...window.__THREE_GAME_DIAGNOSTICS__.heroPos }));
      if (hero.z > recovery.stake.z + 0.5) { northKey = key; break; }
    }
    recovery.northKey = northKey;
    assert.ok(northKey, 'a key walks the hero north');
    await page.evaluate((s) => window.__GR_TEST__.teleport(s.x, s.z), recovery.stake);
    await page.waitForTimeout(40);
    const walkTrace = [];
    await page.keyboard.down(northKey);
    for (let i = 0; i < 90; i += 1) {
      await page.evaluate(() => window.__GR_TEST__.advanceSim(1));
      const hero = await page.evaluate(() => ({ ...window.__THREE_GAME_DIAGNOSTICS__.heroPos }));
      walkTrace.push({ second: i + 1, x: Math.round(hero.x * 1000) / 1000, z: Math.round(hero.z * 1000) / 1000 });
      if (hero.z >= recovery.centre.z) break;
    }
    await page.keyboard.up(northKey);
    await page.waitForTimeout(40);
    recovery.walkTrace = walkTrace;
    recovery.arrived = await page.evaluate(() => ({ ...window.__THREE_GAME_DIAGNOSTICS__.heroPos }));
    recovery.reachedCentre = Math.hypot(recovery.arrived.x - recovery.centre.x, recovery.arrived.z - recovery.centre.z) <= 1.5;
    recovery.inReach = await page.evaluate(async () => {
      const { ProbeRecovery } = await import('/src/systems/ProbeRecovery.ts');
      const api = window.__GR_TEST__;
      const probe = ProbeRecovery.create(api.activeContract());
      const hero = window.__THREE_GAME_DIAGNOSTICS__.heroPos;
      const before = probe.inReach({ x: hero.x, z: hero.z });
      const result = probe.recover({ x: hero.x, z: hero.z });
      return { declared: probe.declared, before, result, recovered: probe.recovered, diagnostics: probe.diagnostics };
    });
    assert.ok(recovery.centreWalkable, 'the recovery zone centre is walkable ground');
    assert.ok(recovery.reachedCentre, `the hero walked to the recovery point: ${JSON.stringify(recovery.arrived)}`);
    assert.ok(recovery.inReach.before, 'the engine agrees the hero is in reach at the point it walked to');
    assert.equal(recovery.inReach.result.ok, true, 'CONTEXT_ACTION recover succeeds there');
    await page.screenshot({ path: `${out}/shots/recovery-point-${width}.png` });

    const cycles = await page.evaluate(async ({ id, tileId, solids }) => {
      const T = await import('/@id/three');
      const { installTerrain3dClaimPilot } = await import('/src/world/Terrain3dClaimPilot.ts');
      const rows = [];
      for (let cycle = 0; cycle < 3; cycle++) {
        const scene = new T.Scene(), canvas = document.createElement('canvas');
        const dispose = installTerrain3dClaimPilot({ scene, canvas, contractId: id, tileId });
        await new Promise((resolve, reject) => {
          const until = performance.now() + 30000;
          function poll() {
            if (canvas.dataset.terrain3dPilotLandmarkLoadState === 'mounted') resolve();
            else if (performance.now() > until) reject(Error(JSON.stringify(canvas.dataset)));
            else requestAnimationFrame(poll);
          }
          poll();
        });
        const bodies = solids.map((s) => {
          const model = scene.getObjectByName(s.id);
          if (!model) throw Error('missing ' + s.id);
          return { id: s.id, position: model.position.toArray(), rotation: model.rotation.toArray().slice(0, 3), scale: model.scale.toArray(), bounds: new T.Box3().setFromObject(model) };
        });
        const dataset = { ...canvas.dataset };
        dispose();
        rows.push({ cycle, bodies, dataset, remainingSceneChildren: scene.children.length });
      }
      return rows;
    }, { id, tileId: `${id.slice(0, 2)}-${config.parent}`, solids });
    for (const cycle of cycles) {
      assert.equal(cycle.remainingSceneChildren, 0);
      assert.equal(cycle.dataset.terrain3dPilotLandmarkSkipped, '0');
      assert.equal(cycle.dataset.terrain3dPilotLandmarks, '10');
      for (const b of cycle.bodies) {
        const s = solids.find((s) => s.id === b.id);
        assert.deepEqual([b.position[0], b.position[2]], s.position);
        assert.deepEqual(b.rotation, [0, s.rotation, 0]);
        assert.deepEqual([b.scale[0], b.scale[2]], s.scale);
      }
    }
    rows.push({ width, navigation, probes, recovery, cycles, errors });
    writeFileSync(`${out}/walk-proof.json`, JSON.stringify(rows, null, 2) + '\n');
    assert.deepEqual(errors, []);
    assert.ok(navigation.targets.every((t) => t.reachable), JSON.stringify(navigation.targets.filter((t) => !t.reachable)));
    assert.ok(navigation.targets.filter((t) => t.kind === 'probe-zone').every((t) => t.centreReachable), 'the probe zone centre is reachable on foot');
    console.log(id, width, 'PASS', probes.length, 'bodies', navigation.targets.length, 'destinations', 'recovery', recovery.inReach.result.ok);
    await page.close();
  }
} finally { await browser.close(); }
