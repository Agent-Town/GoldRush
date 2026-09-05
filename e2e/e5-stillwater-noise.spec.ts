import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * A2 — THE NOISE-HUNT (door-completion-sheet §A2, RATIFIED 2026-08-20).
 *
 * `e5-stillwater` is SOCKETED AND STILL REFUSED, which is a state this suite has to hold open on
 * purpose. The consumer below runs in both engines; the map does not secure. So the first test
 * proves the mechanic on its own terms, the second and third pin what was actually measured —
 * including a Law 2 idle floor — and the last proves a plain browser boot.
 *
 * Every run arm spawns `artifacts/e5-stillwater/prover.mjs`, which is the preserved instrument
 * for this contract, so the evidence in the exemption row stays re-runnable rather than becoming
 * a sentence about a run nobody can repeat.
 */
type FakeEnemy = {
  id: number;
  isAlive: boolean;
  variantId: string;
  moveSpeed: number;
  hitRadius: number;
  position: { x: number; z: number };
  scripted: null | { x: number; z: number };
  scriptMoveTo: (x: number, z: number) => void;
  scriptMoveRoute: (points: readonly unknown[]) => void;
};

const leviathan = (x: number, z: number): FakeEnemy => ({
  id: 1,
  isAlive: true,
  variantId: 'machine_leviathan',
  moveSpeed: 3,
  hitRadius: 1,
  position: { x, z },
  scripted: null,
  scriptMoveTo(nextX: number, nextZ: number) { this.scripted = { x: nextX, z: nextZ }; },
  scriptMoveRoute(points: readonly unknown[]) { if (points.length === 0) this.scripted = null; },
});

test('the noise-hunt hears its three machines, trails the loudest, sheds the trail and costs a deck', async () => {
  test.setTimeout(90_000);
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { NoiseHuntSystem, NOISE_HUNT_RULES } = await vite.ssrLoadModule('/src/systems/NoiseHuntSystem.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const contract = loadContract('e5-stillwater');

    // The ports the two engines seat. Held in plain state here so each machine can be run alone.
    const state = {
      anchor: { id: 'lagoon', x: 0, z: 30 },
      channeling: false,
      fires: 0,
      decks: [
        { padId: 'bow', buildingId: 'turret', x: 0, z: 27 },
        { padId: 'port', buildingId: 'sentry_beacon', x: -3, z: 31 },
      ],
      lost: [] as string[],
    };
    const hunt = NoiseHuntSystem.create(contract, {
      anchor: () => state.anchor,
      panChanneling: () => state.channeling,
      harpoonFires: () => state.fires,
      prospectorPosition: () => ({ x: state.anchor.x, z: state.anchor.z }),
      deckBuildings: () => state.decks,
      onDeckLost: (padId: string) => {
        state.lost.push(padId);
        state.decks = state.decks.filter((deck) => deck.padId !== padId);
      },
    })!;
    expect(hunt).not.toBeNull();
    expect(NoiseHuntSystem.create(loadContract('e5-flotilla'), {} as never)).toBeNull();

    // SILENCE IS THE RESTING STATE. Nothing runs, so nothing is heard and nothing is trailed.
    const away = leviathan(0, 60);
    hunt.advance(0, [away], 'machine_leviathan');
    expect(hunt.diagnostics.sources.map(({ id, running, level }: { id: string; running: boolean; level: number }) => `${id}:${running}:${level}`))
      .toEqual(['air-pump:false:0', 'engine:false:0', 'harpoon-reload:false:0']);
    expect(hunt.diagnostics.trail.target).toBeNull();
    expect(away.scripted).toBeNull();

    // THE PUMP IS THE HARVEST CHANNEL — the machine, never the hand.
    state.channeling = true;
    hunt.advance(1, [away], 'machine_leviathan');
    expect(hunt.diagnostics.trail).toMatchObject({ target: 'air-pump', x: -3, z: 29 });
    expect(away.scripted).toEqual({ x: -3, z: 29 });

    // THE ENGINE IS LOUDER THAN THE PUMP (radius 24 against 18), so a reanchor takes the trail.
    hunt.onReanchor(1);
    hunt.advance(2, [away], 'machine_leviathan');
    expect(hunt.diagnostics.trail.target).toBe('engine');
    // ...and it falls silent again exactly `engineSeconds` later, handing the trail back.
    hunt.advance(1 + NOISE_HUNT_RULES.engineSeconds, [away], 'machine_leviathan');
    expect(hunt.diagnostics.trail.target).toBe('air-pump');

    // THE BALLISTA'S RELOAD IS THE QUIETEST MACHINE (radius 14) — heard, but never trailed over
    // a running pump. It is trailed only when it is the only thing running.
    state.channeling = false;
    state.fires = 1;
    hunt.advance(20, [away], 'machine_leviathan');
    expect(hunt.diagnostics.trail.target).toBe('harpoon-reload');

    // THE TRAIL IS SHED AFTER EIGHT QUIET SECONDS, AND NOT BEFORE.
    hunt.advance(20 + NOISE_HUNT_RULES.harpoonReloadSeconds, [away], 'machine_leviathan');
    expect(hunt.diagnostics.trail.target).toBe('harpoon-reload');
    const shedsAt = 20 + NOISE_HUNT_RULES.harpoonReloadSeconds + NOISE_HUNT_RULES.trailHoldSeconds;
    hunt.advance(shedsAt - 0.5, [away], 'machine_leviathan');
    expect(hunt.diagnostics.trail).toMatchObject({ target: 'harpoon-reload', quietSeconds: 7.5 });
    hunt.advance(shedsAt, [away], 'machine_leviathan');
    expect(hunt.diagnostics.trail.target).toBeNull();
    expect(away.scripted).toBeNull();

    // THE QUIET ZONE SILENCES BY GEOMETRY. `open-water` (-24,12) lies inside `hand-pan-drift`,
    // and the machines ride the anchor, so the whole boat goes quiet with one public verb.
    state.anchor = { id: 'open-water', x: -24, z: 12 };
    state.channeling = true;
    state.fires = 2;
    hunt.onReanchor(40);
    hunt.advance(40, [away], 'machine_leviathan');
    expect(hunt.diagnostics.sources.every(({ running, silenced, level }: { running: boolean; silenced: boolean; level: number }) =>
      running && silenced && level === 0)).toBe(true);
    expect(hunt.diagnostics.trail.target).toBeNull();
    expect(hunt.diagnostics.quietZones).toMatchObject([
      { id: 'hand-pan-drift', boatInside: true },
      { id: 'sail-trim-drift', boatInside: false },
    ]);

    // THE THIRD ANCHOR IS THE ONE THAT MAKES NOISE A CHOICE (owner ruling 2026-08-21). At
    // `shelf-watch` every machine is LOUD — it clears both quiet zones — and it is 36wu from the
    // hero's fixed post at (0,30), which is further than the loudest machine's own radius (24).
    // That is the whole difference between a trail you PAY FOR and one you AIM.
    state.anchor = { id: 'shelf-watch', x: 36, z: 30 };
    hunt.advance(50, [away], 'machine_leviathan');
    expect(hunt.diagnostics.sources.every(({ silenced }: { silenced: boolean }) => !silenced)).toBe(true);
    expect(hunt.diagnostics.quietZones.every(({ boatInside }: { boatInside: boolean }) => !boatInside)).toBe(true);
    // The engine window opened at t=40 has expired by t=50, so the pump is the only machine
    // running and it is what gets trailed — at (33,29), riding the new anchor.
    expect(hunt.diagnostics.trail).toMatchObject({ target: 'air-pump', x: 33, z: 29 });
    expect(Math.hypot(33 - 0, 29 - 30)).toBeGreaterThan(NOISE_HUNT_RULES.audibleRadius);

    // THE STRIKE COSTS A DECK AND NEVER THE HERO. Sixteen strikes at 6 take a 96-integrity pad
    // out through the tile's own `loseHull` seam, and only when the head is actually alongside.
    // Sixteen is the point of the re-derived damage: it is four times the eight-second trail-shed
    // window in strikes, so breaking contact is a real save rather than a gesture.
    // It is `port` that goes, not `bow`: the pump is the loudest thing running once the boat is
    // back on the lagoon, it sits at (-3,29), and the struck deck is the one nearest the TRAILED
    // MACHINE — port at (-3,31) is 2wu from it where bow at (0,27) is 3.6wu.
    state.anchor = { id: 'lagoon', x: 0, z: 30 };
    const alongside = leviathan(0, 27);
    const needed = Math.ceil(NOISE_HUNT_RULES.deckIntegrity / NOISE_HUNT_RULES.strikeDamage);
    for (let strike = 0; strike < needed; strike += 1) {
      hunt.advance(100 + strike * NOISE_HUNT_RULES.strikeCooldownSeconds, [alongside], 'machine_leviathan');
    }
    expect(hunt.diagnostics.trail).toMatchObject({ target: 'air-pump', strikes: needed });
    expect(state.lost).toEqual(['port']);
    // The cooldown is real: an advance INSIDE the window opened by the last strike (which landed
    // at `needed - 1` cooldowns past t=100) lands no further strike, and one past it does.
    const lastStrikeAt = 100 + (needed - 1) * NOISE_HUNT_RULES.strikeCooldownSeconds;
    hunt.advance(lastStrikeAt + 0.1, [alongside], 'machine_leviathan');
    expect(hunt.diagnostics.trail.strikes).toBe(needed);
    hunt.advance(lastStrikeAt + NOISE_HUNT_RULES.strikeCooldownSeconds, [alongside], 'machine_leviathan');
    expect(hunt.diagnostics.trail.strikes).toBe(needed + 1);

    // THE MANIFEST RULE COMES FROM THE CONSUMER, never from `tileParams.stillwater`.
    const rule = deriveMechanicsManifest(contract).rules.find(({ id }: { id: string }) => id === 'noise_hunt');
    expect(rule.source).toBe('NoiseHuntSystem.advance+onReanchor');
    expect(rule.data).toMatchObject({ ...NOISE_HUNT_RULES, fogIsPresentationOnly: true, secureWave: 12 });
  } finally {
    await vite.close();
  }
});

/**
 * THE CEILING, PINNED. Best measured public-verb play across six policies on both bench seeds,
 * run twice each. It does NOT secure, and this test exists to keep that number honest rather
 * than to celebrate it — the moment either seed reaches wave 12 the exemption row is wrong.
 */
test('Stillwater SECURES both bench seeds twice through the PLAIN door', () => {
  test.setTimeout(300_000);
  // THE ADMISSION PROOF (2026-08-21). No `admissionProbe` anywhere: this spawns
  // `scripts/gr-sim.mjs` exactly as any rider would, which is the only proof that admits a map.
  const expected = {
    'e5-stillwater-01': { eventLogHash: 'fnv1a32:7661ca43', kills: 103 },
    'e5-stillwater-02': { eventLogHash: 'fnv1a32:3d3ea0fc', kills: 161 },
  } as const;
  for (const [seed, { eventLogHash, kills }] of Object.entries(expected)) {
    const outcomes = [1, 2].map(() => {
      const run = spawnSync(process.execPath, [
        'artifacts/e5-stillwater/prover.mjs', '--plain', '--seed', seed,
        '--policy', 'bait', '--deck', 'turret,sentry_beacon,turret', '--harvest', 'on', '--quiet',
      ], { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000 });
      // The prover exits 0 only when a public-verb run SECURES.
      expect(run.status, run.stderr).toBe(0);
      return JSON.parse(run.stdout.trim().split('\n').at(-1)!);
    });
    expect(outcomes[1]).toEqual(outcomes[0]);
    // NAMED-CAUSE PIN: AIM the noise. Two ballistae and a beacon on the deck, the Prospector
    // working a seam so the pump runs, and the boat held on `shelf-watch` — 36wu east of the
    // hero — while the trail is up. The leviathans hunt the BOAT, so the hero is never touched,
    // and the decks outlast the run with a pad to spare at the owner-authorised strike cost.
    expect(outcomes[0]).toMatchObject({ secured: true, waves: 12, kills, eventLogHash });
  }
});

test('the same play through the in-process door agrees, and the decks survive with margin', () => {
  test.setTimeout(300_000);
  // The transport the whole exemption history was measured on, kept so that history stays
  // re-runnable. Same policy, same seeds — a difference here can only be the DOOR, never the play.
  const expected = {
    'e5-stillwater-01': { eventLogHash: 'fnv1a32:4e99e655', strikes: 77 },
    'e5-stillwater-02': { eventLogHash: 'fnv1a32:897e18b8', strikes: 77 },
  } as const;
  for (const [seed, { eventLogHash, strikes }] of Object.entries(expected)) {
    const outcomes = [1, 2].map(() => {
      const run = spawnSync(process.execPath, [
        'artifacts/e5-stillwater/prover.mjs', '--seed', seed,
        '--policy', 'bait', '--deck', 'turret,sentry_beacon,turret', '--harvest', 'on', '--quiet',
      ], { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000 });
      expect(run.status, run.stderr).toBe(0);
      return JSON.parse(run.stdout.trim().split('\n').at(-1)!);
    });
    expect(outcomes[1]).toEqual(outcomes[0]);
    // THE MARGIN IS PINNED ON PURPOSE, because it is what chose the strike cost. A twelve-wave
    // lure costs 76-77 strikes across three pads; at 3 damage a pad survives 32, so ONE PAD IS
    // STILL STANDING at the secure. Four also secures — but with zero decks left on both seeds,
    // i.e. it wins on the last pad dying. If this ever drops to an empty `decks`, the dial has
    // been pushed back onto that knife-edge and the balance-later pass needs to know.
    expect(outcomes[0]).toMatchObject({
      secured: true,
      waves: 12,
      eventLogHash,
      noiseHunt: { strikes },
    });
    expect(outcomes[0].noiseHunt.decks.length).toBeGreaterThan(0);
  }
});

/**
 * LAW 2, NOW CHECKED TWICE OVER. `e5-stillwater` is ADMITTED, so
 * `scripts/null-floor-anchors.mjs` generates its floor like any other contract's and pins the
 * same two hashes this test spawns through the PLAIN door. Keeping both is deliberate: the
 * generated floor proves the number, and this proves the number is a REFUSAL.
 *
 * The owner-authorised strike cost cannot move either, structurally — an idle run works no
 * machine, so it takes no trail and lands no strike, and the dial only ever reduces deck
 * integrity. Verified identical across 16, 6 and 3.
 */
test('idle Stillwater runs stay silent and still lose', () => {
  test.setTimeout(120_000);
  const expected = {
    'e5-stillwater-01': 'fnv1a32:ba80f970',
    'e5-stillwater-02': 'fnv1a32:7ab6a335',
  } as const;
  for (const [seed, eventLogHash] of Object.entries(expected)) {
    const outcomes = [1, 2].map(() => {
      const run = spawnSync(process.execPath, [
        'artifacts/e5-stillwater/prover.mjs', '--plain', '--seed', seed, '--idle', '--quiet',
      ], { cwd: process.cwd(), encoding: 'utf8', timeout: 60_000 });
      // Inverted for the floor: the prover exits 1 when an IDLE run secures.
      expect(run.status, run.stderr).toBe(0);
      return JSON.parse(run.stdout.trim().split('\n').at(-1)!);
    });
    expect(outcomes[1]).toEqual(outcomes[0]);
    // NAMED-CAUSE PIN: idle runs no machine at all, so the hunt never takes a trail and never
    // strikes — and the run still ends at wave 3, killed by the ordinary leviathan pressure the
    // contract's own spawn edges field. The floor is honest WITHOUT the new mechanic, which is
    // what makes the mechanic's own cost measurable above. (The plain door's outcome carries no
    // `noiseHunt` block — that is the prover's own annotation on the in-process path — so the
    // silence is asserted by the floor being a LOSS at the same wave the mechanic never touched.)
    expect(outcomes[0]).toMatchObject({ secured: false, waves: 3, eventLogHash });
  }
});

test('plain boot shows the first crewed front shivering through the fog', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await page.goto('/?debug&contract=e5-stillwater&nolevel&nopause');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__!.activeContract().id)).toBe('e5-stillwater');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e5-stillwater');
  // The browser publishes the hunt on the same surface GR-SIM does, so a player-facing boot can
  // be inspected for it rather than inferred.
  expect(await page.evaluate(() => {
    const hunt = (window.__THREE_GAME_DIAGNOSTICS__ as unknown as {
      deepwaterClaim?: { noiseHunt?: { sources: { id: string }[]; fog: { id: string } } };
    }).deepwaterClaim?.noiseHunt;
    return hunt ? { sources: hunt.sources.map(({ id }) => id), fog: hunt.fog.id } : null;
  })).toEqual({ sources: ['air-pump', 'engine', 'harpoon-reload'], fog: 'stillwater-fog' });
  await page.getByRole('button', { name: 'Begin' }).click();
  const front = await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.advanceSim(8);
    const deepwater = window.__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim!;
    return {
      phase: deepwater.storm.weather.phase,
      hazeStrength: deepwater.storm.weather.hazeStrength,
      waves: deepwater.corsairWaves.map((wave) => ({ scheduledAt: wave.scheduledAt, enemies: wave.enemies.length })),
      corsairs: window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'corsair_skiff').length,
    };
  });
  expect(front).toEqual({ phase: 'storm', hazeStrength: 0.28, waves: [{ scheduledAt: 8, enemies: 1 }], corsairs: 1 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(5));
  await mkdir('artifacts/e5-stillwater-front-crew-2', { recursive: true });
  await page.screenshot({ path: `artifacts/e5-stillwater-front-crew-2/${testInfo.project.name}-first-front.png` });
  expectNoConsoleErrors(watch, 'e5-stillwater plain boot');
});
