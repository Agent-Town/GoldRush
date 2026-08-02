#!/usr/bin/env node
// twin-banks-hash-probe — re-derive an E1 headless secure-run hash and, on request,
// dump the hash's INPUTS so two environments can be diffed mechanically.
//
// WHY THIS EXISTS (F-1403-1, s1403): the twin-banks re-land was refused twice because
// its pinned secure hash `fnv1a32:5f57f7be` reproduces in the Codex runner's process
// and NOWHERE else — every gating environment measures `fnv1a32:bfd79d2a`. Seven
// measurements against one, on a byte-identical tree, same node, same shell, cold and
// warm vite caches. Arguing about which value is "right" has now cost three fires.
// The way out is not another re-derivation: it is to dump the hash's inputs on BOTH
// sides and diff them, so the divergence names itself.
//
// USAGE:
//   node scripts/twin-banks-hash-probe.mjs
//   node scripts/twin-banks-hash-probe.mjs --dump artifacts/twin-banks-<env>.json
//   node scripts/twin-banks-hash-probe.mjs --contract e1-night-shift --seed e1-night-shift-01
//
// Then diff the two dumps; the FIRST differing replay event is the divergence point.
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const contractId = flag('--contract', 'e1-twin-banks');
const seed = flag('--seed', 'e1-twin-banks-01');
const dumpPath = flag('--dump', null);

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const previousLocation = globalThis.location;
const previousWindow = globalThis.window;
const location = new URL(`http://gr-sim.local/?debug&contract=${contractId}&seed=${seed}`);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({ contractId, seed });
  sim.hero.applyStats(10_000, 1);
  sim.hero.heal(10_000);
  let turn = sim.currentTurn();
  while (!turn.terminal) turn = sim.advanceToTurn();
  const outcome = sim.outcome();

  const env = {
    node: process.version,
    execPath: process.execPath,
    platform: `${process.platform}/${process.arch}`,
    shell: process.env.SHELL ?? null,
    // CLAUDE_CONFIG_DIR is PRESENT in a fire shell and absent in lane/attended shells
    // (see playwright.config.ts's isFireShell) — the cheapest label for "which side am I".
    fireShell: Boolean(process.env.CLAUDE_CONFIG_DIR),
    tz: process.env.TZ ?? null,
  };

  console.log(`contract        : ${contractId} / ${seed}`);
  console.log(`fire shell      : ${env.fireShell}`);
  console.log(`node            : ${env.node}`);
  console.log(`HASH            : ${outcome.eventLogHash}`);
  console.log(`outcome         : ${JSON.stringify(outcome)}`);
  console.log(`replayEvents    : ${sim.replayEvents.length}`);
  console.log(`economy log     : ${sim.economy.log.length}`);

  if (dumpPath) {
    mkdirSync(dirname(dumpPath), { recursive: true });
    writeFileSync(
      dumpPath,
      `${JSON.stringify(
        {
          env,
          contractId,
          seed,
          outcome,
          replayEvents: sim.replayEvents,
          economy: sim.economy.log.map(({ id: _id, ...event }) => event),
          final: {
            hero: sim.hero.group.position,
            hp: sim.hero.hp,
            aliveEnemies: sim.enemies.all.filter((e) => e.isAlive).length,
            buildings: sim.build.diagnostics.hp,
          },
        },
        null,
        2,
      )}\n`,
    );
    console.log(`dumped          : ${dumpPath}`);
  }
} finally {
  await vite.close();
  if (previousLocation === undefined) delete globalThis.location;
  else globalThis.location = previousLocation;
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
}
