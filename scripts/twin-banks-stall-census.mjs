#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const PORT = Number(process.env.GR_TB_CENSUS_PORT ?? 5274);
const STEP_SECONDS = 0.5;
const ROUTE_SECONDS = 36;
const STALL_SECONDS = 3;
const MIN_PROGRESS = 0.35;
const FORDS = [-16, 16];

const routes = [
  ...FORDS.flatMap((crossingX) => [-1, 1].flatMap((bank) => [-4, 0, 4].map((offset) => ({
    kind: 'bank-approach',
    start: { x: crossingX + offset, z: bank * 20 },
    target: { x: crossingX, z: -bank * 20 },
  })))),
  ...[-8, 0, 8].flatMap((startX) => [-1, 1].flatMap((bank) => [-24, 24].map((targetX) => ({
    kind: 'crossing-choice',
    start: { x: startX, z: bank * 14 },
    target: { x: targetX, z: -bank * 14 },
  })))),
  ...[-18, -12, -8, -6.25, 0, 6.25, 8, 12, 18].map((z) => ({
    kind: 'right-spawn',
    start: { x: 26, z },
    target: { x: 0, z: -12 },
  })),
];
const packScenarios = [
  { kind: 'north-west-crossing', target: { x: -24, z: -12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: 14 })) },
  { kind: 'north-east-crossing', target: { x: 24, z: -12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: 14 })) },
  { kind: 'south-west-crossing', target: { x: -24, z: 12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: -30 })) },
  { kind: 'south-east-crossing', target: { x: 24, z: 12 }, starts: [-4, -2.5, -1, 0, 1, 2.5, 4].map((x) => ({ x, z: -30 })) },
  { kind: 'right-spawn-pack', target: { x: 0, z: -12 }, starts: [-18, -16.5, -15, -13.5, -12, -10.5, -9, -7.5, -6].map((z) => ({ x: 26, z })) },
];

const root = process.env.GR_TB_CENSUS_ROOT ?? fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  logLevel: 'silent',
  resolve: { preserveSymlinks: Boolean(process.env.GR_TB_CENSUS_ROOT) },
  server: { host: '127.0.0.1', port: PORT, strictPort: true },
});
let browser;

try {
  await server.listen();
  browser = await chromium.launch({ channel: 'chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await page.goto(`http://127.0.0.1:${PORT}/?debug&terrain2d&contract=e1-twin-banks&nowaves&nolevel&nokill&nopause&nosteal&nowreck&seed=tb-stall-census`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);

  const result = await page.evaluate(async ({ routes, packScenarios, stepSeconds, routeSeconds, stallSeconds, minProgress, fords }) => {
    const api = window.__GR_TEST__;
    if (!api) throw new Error('Missing __GR_TEST__ harness.');
    const terrain = await Function('return import("/src/world/Terrain.ts")')();
    api.setManualSim(true);
    api.setBalance('enemy.contactDamage', 0);
    api.teleport(0, -12);
    const rows = [];
    const trace = [];

    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      api.clearEnemies();
      const slot = routeIndex % 4;
      for (let dummy = 0; dummy < slot; dummy += 1) api.spawnEnemyAt(-30, -30);
      if (!api.scriptEnemyAt(route.start.x, route.start.z, route.target.x, route.target.z, 2.7)) {
        throw new Error(`Could not spawn route ${routeIndex}.`);
      }
      const enemyId = api.enemyPositions().find((candidate) => candidate.x === route.start.x && candidate.z === route.start.z)?.id;
      if (enemyId === undefined) throw new Error(`Could not identify route enemy ${routeIndex}.`);
      let enemy = api.enemyPositions().find((candidate) => candidate.id === enemyId);
      if (!enemy) throw new Error(`Missing route enemy ${enemyId}.`);
      let anchor = { at: 0, distance: Math.hypot(route.target.x - enemy.x, route.target.z - enemy.z) };
      let reached = false;
      let stall = null;
      let previousChoice = null;
      let switches = 0;

      for (let at = stepSeconds; at <= routeSeconds; at += stepSeconds) {
        api.advanceSim(stepSeconds);
        enemy = api.enemyPositions().find((candidate) => candidate.id === enemyId);
        if (!enemy) throw new Error(`Route enemy ${enemyId} disappeared.`);
        const distance = Math.hypot(route.target.x - enemy.x, route.target.z - enemy.z);
        if (routeIndex === 0) trace.push([Number(at.toFixed(1)), Number(enemy.x.toFixed(4)), Number(enemy.z.toFixed(4))]);
        if (distance <= 1.25) {
          reached = true;
          break;
        }
        if (Math.abs(enemy.z) <= 7) {
          const choice = Math.abs(enemy.x - fords[0]) <= Math.abs(enemy.x - fords[1]) ? 'west' : 'east';
          if (previousChoice && choice !== previousChoice) switches += 1;
          previousChoice = choice;
        }
        if (at - anchor.at < stallSeconds) continue;
        const progress = anchor.distance - distance;
        if (progress < minProgress) {
          stall = { at, x: enemy.x, z: enemy.z, progress };
          break;
        }
        anchor = { at, distance };
      }
      rows.push({ ...route, routeIndex, reached, stall, switches });
    }

    for (const scenario of packScenarios) {
      api.clearEnemies();
      api.teleport(scenario.target.x, scenario.target.z);
      const ids = [];
      for (const start of scenario.starts) {
        if (!api.spawnEnemyAt(start.x, start.z)) throw new Error(`Could not spawn ${scenario.kind}.`);
        const id = api.enemyPositions().find((candidate) => candidate.x === start.x && candidate.z === start.z)?.id;
        if (id === undefined) throw new Error(`Could not identify ${scenario.kind} enemy.`);
        ids.push({ id, start });
      }
      const states = new Map(ids.map(({ id }) => [id, { anchorAt: 0, anchorDistance: 0, reached: false, stall: null, previousChoice: null, switches: 0 }]));
      for (const { id } of ids) {
        const enemy = api.enemyPositions().find((candidate) => candidate.id === id);
        states.get(id).anchorDistance = Math.hypot(scenario.target.x - enemy.x, scenario.target.z - enemy.z);
      }
      for (let at = stepSeconds; at <= routeSeconds; at += stepSeconds) {
        api.advanceSim(stepSeconds);
        for (const { id } of ids) {
          const state = states.get(id);
          if (state.reached || state.stall) continue;
          const enemy = api.enemyPositions().find((candidate) => candidate.id === id);
          if (!enemy) throw new Error(`${scenario.kind} enemy ${id} disappeared.`);
          const distance = Math.hypot(scenario.target.x - enemy.x, scenario.target.z - enemy.z);
          if (distance <= 1.25) {
            state.reached = true;
            continue;
          }
          if (Math.abs(enemy.z) <= 7) {
            const choice = Math.abs(enemy.x - fords[0]) <= Math.abs(enemy.x - fords[1]) ? 'west' : 'east';
            if (state.previousChoice && choice !== state.previousChoice) state.switches += 1;
            state.previousChoice = choice;
          }
          if (at - state.anchorAt < stallSeconds) continue;
          const progress = state.anchorDistance - distance;
          if (progress < minProgress) state.stall = { at, x: enemy.x, z: enemy.z, progress };
          else {
            state.anchorAt = at;
            state.anchorDistance = distance;
          }
        }
      }
      for (const { id, start } of ids) {
        const state = states.get(id);
        rows.push({ kind: scenario.kind, start, target: scenario.target, routeIndex: id, ...state });
      }
    }
    return { rows, trace, blockers: terrain.landmarkBlockers() };
  }, { routes, packScenarios, stepSeconds: STEP_SECONDS, routeSeconds: ROUTE_SECONDS, stallSeconds: STALL_SECONDS, minProgress: MIN_PROGRESS, fords: FORDS });

  if (errors.length > 0) throw new Error(errors.join('\n'));
  const stalled = result.rows.filter((row) => row.stall);
  const clusters = new Map();
  for (const row of stalled) {
    const position = `${Math.round(row.stall.x)},${Math.round(row.stall.z)}`;
    const blocker = nearestBlocker(row.stall, result.blockers);
    const key = `${row.kind}|${position}|${blocker}`;
    const cluster = clusters.get(key) ?? { cause: row.kind, position, blocker, count: 0, switches: 0 };
    cluster.count += 1;
    cluster.switches += row.switches;
    clusters.set(key, cluster);
  }

  console.log(`Twin Banks stall census: ${result.rows.length} routes; stall = <${MIN_PROGRESS}wu goal progress / ${STALL_SECONDS}s`);
  console.log('| cause | position cluster | nearest blocker | stalls | crossing switches |');
  console.log('|---|---:|---|---:|---:|');
  for (const row of [...clusters.values()].sort((a, b) => b.count - a.count || a.cause.localeCompare(b.cause))) {
    console.log(`| ${row.cause} | ${row.position} | ${row.blocker} | ${row.count} | ${row.switches} |`);
  }
  if (clusters.size === 0) console.log('| none | - | none | 0 | 0 |');
  console.log(`Reached: ${result.rows.filter((row) => row.reached).length}/${result.rows.length}`);
  console.log(`Deterministic reference trace: ${JSON.stringify(result.trace)}`);
  if ((stalled.length > 0 || result.rows.some((row) => !row.reached)) && !process.argv.includes('--allow-stalls')) process.exitCode = 1;
} finally {
  await browser?.close();
  await server.close();
}

function nearestBlocker(point, blockers) {
  const nearest = blockers.reduce((best, blocker) => {
    const dx = Math.max(Math.abs(point.x - blocker.x) - blocker.halfX, 0);
    const dz = Math.max(Math.abs(point.z - blocker.z) - blocker.halfZ, 0);
    const distance = Math.hypot(dx, dz);
    return distance < best.distance ? { id: blocker.id, distance } : best;
  }, { id: 'none', distance: Number.POSITIVE_INFINITY });
  return nearest.distance <= 2 ? nearest.id : 'none';
}
