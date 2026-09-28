#!/usr/bin/env node

// THE MOTOR RIDE — drives one `gr-sim` run of a Motor contract with the shared floor policy
// (`scripts/e4-motor-floor.mjs`) over the door's own NDJSON transport, and records what the
// audit recorded (`docs/audits/2026-09-02-era-mechanic-audit.md` §Method): every view, the
// terminal outcome and the speed line, verbatim, plus the reel the true-reel harness replays.
//
//   node scripts/e4-motor-ride.mjs --contract e4-dust-flats --seed e4-dust-flats-01 \
//        --log artifacts/e4-roads-and-convoys/e4-dust-flats.log \
//        --tape artifacts/e4-roads-and-convoys/e4-dust-flats-floor.tape.json [--policy idle] [--variant rig]
//
// The log is the evidence the task asks for: a headless ride whose views show the E4 events
// (`now.motor.events`: road use, fuel, the haul's arrival) next to the ordinary wave ledger.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { motorFloorOrders } from './e4-motor-floor.mjs';
import { isMain } from './is-main.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url));

export function parseRideArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith('--')) throw new Error(`Unknown argument: ${raw}`);
    const key = raw.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value.`);
    values[key] = value;
    index += 1;
  }
  if (!values.contract) throw new Error('--contract is required.');
  return {
    contract: values.contract,
    seed: values.seed ?? `${values.contract}-01`,
    log: values.log ?? null,
    tape: values.tape ?? null,
    summary: values.summary ?? null,
    policy: values.policy ?? 'floor',
    variant: values.variant ?? 'rig',
  };
}

/** Rides one run; resolves with the transcript, the outcome and the speed line. */
export function rideMotorContract(options) {
  const args = ['scripts/gr-sim.mjs', '--contract', options.contract, '--seed', options.seed];
  if (options.policy === 'idle') args.push('--policy=idle');
  if (options.tape) args.push('--tape', options.tape);
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
    const lines = [];
    const views = [];
    let outcome = null;
    let buffer = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        lines.push(line);
        const message = JSON.parse(line);
        if (message.schema === 'goldrush.view.v1') {
          views.push(message);
          if (options.policy !== 'idle') {
            const terminal = message.now.hero.hp <= 0 || message.appendLog.at(-1)?.outcome === 'secured';
            if (!terminal) child.stdin.write(`${JSON.stringify(motorFloorOrders(message, options.variant))}\n`);
          }
        } else outcome = message;
      }
    });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (status) => {
      if (status !== 0) reject(new Error(`gr-sim exited ${status}\n${stderr}`));
      else resolve({ lines, views, outcome, stderr, speedLine: stderr.split('\n').find((line) => line.startsWith('gr-sim speed:')) ?? '' });
    });
  });
}

if (isMain(import.meta.url)) {
  const options = parseRideArgs(process.argv.slice(2));
  if (options.tape) mkdirSync(path.dirname(path.resolve(ROOT, options.tape)), { recursive: true });
  const ride = await rideMotorContract({ ...options, tape: options.tape ? path.resolve(ROOT, options.tape) : null });
  if (options.log) {
    mkdirSync(path.dirname(path.resolve(ROOT, options.log)), { recursive: true });
    writeFileSync(path.resolve(ROOT, options.log), `${ride.lines.join('\n')}\n${ride.speedLine}\n`);
  }
  const motorEvents = ride.views.flatMap((view) => view.now.motor?.events ?? []);
  const summary = {
    contract: options.contract,
    seed: options.seed,
    policy: options.policy,
    variant: options.variant,
    views: ride.views.length,
    outcome: ride.outcome,
    motorEventKinds: [...new Set(motorEvents.map((event) => event.type))].sort(),
    motorEventCount: ride.views.at(-1)?.now.motor?.eventCount ?? 0,
    terminalMotor: ride.views.at(-1)?.now.motor ?? null,
    speedLine: ride.speedLine,
  };
  if (options.summary) {
    mkdirSync(path.dirname(path.resolve(ROOT, options.summary)), { recursive: true });
    writeFileSync(path.resolve(ROOT, options.summary), `${JSON.stringify(summary, null, 2)}\n`);
  }
  process.stdout.write(`${JSON.stringify({ ...summary, terminalMotor: undefined })}\n`);
}
