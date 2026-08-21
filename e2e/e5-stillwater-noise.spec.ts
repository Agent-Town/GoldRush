import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
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

    // THE STRIKE COSTS A DECK AND NEVER THE HERO. Six strikes at 16 take a 96-integrity pad out
    // through the tile's own `loseHull` seam, and only when the head is actually alongside.
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
test('the best measured Stillwater play tops out at wave 4 of 12 on both bench seeds', () => {
  test.setTimeout(180_000);
  const expected = {
    'e5-stillwater-01': 'fnv1a32:e83bc5ff',
    'e5-stillwater-02': 'fnv1a32:96191e05',
  } as const;
  for (const [seed, eventLogHash] of Object.entries(expected)) {
    const outcomes = [1, 2].map(() => {
      const run = spawnSync(process.execPath, [
        'artifacts/e5-stillwater/prover.mjs', '--seed', seed,
        '--policy', 'deck', '--deck', 'turret,sentry_beacon,turret', '--harvest', 'off', '--quiet',
      ], { cwd: process.cwd(), encoding: 'utf8', timeout: 60_000 });
      // Law: the prover exits 1 when a public-verb run does NOT secure, which is the case here.
      expect(run.status, run.stderr).toBe(1);
      return JSON.parse(run.stdout.trim().split('\n').at(-1)!);
    });
    expect(outcomes[1]).toEqual(outcomes[0]);
    // NAMED-CAUSE PIN (A2, 2026-08-21): two ballistae and a beacon on the deck with the
    // Prospector kept off the seams — the quietest play that still shoots. The trail forms on the
    // reload, eighteen strikes take all three pads, and the hero falls at wave 4 of 12.
    //
    // `trail` IS DELIBERATELY NOT PINNED. It is a last-tick reading — whether the ballista had
    // fired within `harpoonReloadSeconds` of the hero falling — and it differs by seed (01 ends
    // on 'harpoon-reload', 02 on null) for a reason that says nothing about the mechanic. What
    // the strike count says is stronger and seed-stable: a strike is only reachable THROUGH a
    // trail, so 18 of them is proof the hunt held one.
    expect(outcomes[0]).toMatchObject({
      secured: false,
      waves: 4,
      eventLogHash,
      noiseHunt: { strikes: 18, decks: [], anchor: 'lagoon' },
    });
  }
});

/**
 * LAW 2. `e5-stillwater` is admission-exempt, so `scripts/null-floor-anchors.mjs` will not
 * generate a floor for it and `gr-sim --policy=idle` cannot construct it. The floor therefore
 * runs here, through the same `admissionProbe` seam, submitting NOTHING.
 */
test('idle Stillwater runs stay silent and still lose', () => {
  test.setTimeout(120_000);
  const expected = {
    'e5-stillwater-01': 'fnv1a32:824cf81d',
    'e5-stillwater-02': 'fnv1a32:5291107a',
  } as const;
  for (const [seed, eventLogHash] of Object.entries(expected)) {
    const outcomes = [1, 2].map(() => {
      const run = spawnSync(process.execPath, [
        'artifacts/e5-stillwater/prover.mjs', '--seed', seed, '--idle', '--quiet',
      ], { cwd: process.cwd(), encoding: 'utf8', timeout: 60_000 });
      // Inverted for the floor: the prover exits 1 when an IDLE run secures.
      expect(run.status, run.stderr).toBe(0);
      return JSON.parse(run.stdout.trim().split('\n').at(-1)!);
    });
    expect(outcomes[1]).toEqual(outcomes[0]);
    // NAMED-CAUSE PIN: idle runs no machine at all, so the hunt never takes a trail and never
    // strikes — and the run still ends at wave 3, killed by the ordinary leviathan pressure the
    // contract's own spawn edges field. The floor is honest WITHOUT the new mechanic, which is
    // what makes the mechanic's own cost measurable above.
    expect(outcomes[0]).toMatchObject({
      secured: false,
      waves: 3,
      eventLogHash,
      noiseHunt: { trail: null, strikes: 0 },
    });
  }
});

test('plain boot resolves the Stillwater contract without browser errors', async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto('/?debug&contract=e5-stillwater&nowaves&nolevel&nopause');
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
  expectNoConsoleErrors(watch, 'e5-stillwater plain boot');
});
