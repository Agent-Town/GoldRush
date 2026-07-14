#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolveSpec, runShowcase } from './stream-showcase.mjs';
import { consumeNextShowcase, readShowcaseQueue, showcaseQueueStatus } from './stream-showcase-queue.mjs';

const FACTORY = 'FACTORY';
const AUTOPILOT = 'AUTOPILOT';
const digest = (value) => createHash('sha256').update(value).digest('base64');

export function obsAuthentication(password, { salt, challenge }) {
  return digest(digest(password + salt) + challenge);
}

export function connectObs({
  url = process.env.OBS_WEBSOCKET_URL || `ws://${process.env.OBS_WEBSOCKET_HOST || '127.0.0.1'}:${process.env.OBS_WEBSOCKET_PORT || '4455'}`,
  password = process.env.OBS_WEBSOCKET_PASSWORD || '',
  timeoutMs = 1_500,
  WebSocketImpl = globalThis.WebSocket,
} = {}) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocketImpl(url);
    const pending = new Map();
    let ready = false;
    const timer = setTimeout(() => { socket.close(); reject(new Error('OBS websocket timeout')); }, timeoutMs);
    const fail = (error) => {
      const reason = error instanceof Error ? error : new Error('OBS websocket unavailable');
      if (!ready) { clearTimeout(timer); reject(reason); }
      for (const waiter of pending.values()) { clearTimeout(waiter.timer); waiter.reject(reason); }
      pending.clear();
    };
    socket.onerror = fail;
    socket.onclose = () => fail(new Error('OBS websocket closed'));
    socket.onmessage = ({ data }) => {
      try {
        const message = JSON.parse(String(data));
        if (message.op === 0) {
          const authentication = message.d.authentication;
          if (authentication && !password) return fail(new Error('OBS websocket password missing'));
          socket.send(JSON.stringify({ op:1, d:{ rpcVersion:1, ...(authentication ? { authentication:obsAuthentication(password, authentication) } : {}) } }));
        } else if (message.op === 2) {
          ready = true;
          clearTimeout(timer);
          const request = (requestType, requestData = {}) => new Promise((requestResolve, requestReject) => {
            const requestId = randomUUID();
            const requestTimer = setTimeout(() => { pending.delete(requestId); requestReject(new Error(`OBS request timeout: ${requestType}`)); }, timeoutMs);
            pending.set(requestId, { resolve:requestResolve, reject:requestReject, timer:requestTimer });
            socket.send(JSON.stringify({ op:6, d:{ requestType, requestId, requestData } }));
          });
          resolve({
            async scenes() { return (await request('GetSceneList')).scenes.map((scene) => scene.sceneName); },
            async streaming() { return Boolean((await request('GetStreamStatus')).outputActive); },
            switchScene(sceneName) { return request('SetCurrentProgramScene', { sceneName }); },
            close() { socket.close(); },
          });
        } else if (message.op === 7) {
          const waiter = pending.get(message.d.requestId);
          if (!waiter) return;
          pending.delete(message.d.requestId);
          clearTimeout(waiter.timer);
          message.d.requestStatus.result ? waiter.resolve(message.d.responseData || {}) : waiter.reject(new Error(message.d.requestStatus.comment || 'OBS request failed'));
        }
      } catch (error) { fail(error); }
    };
  });
}

export async function directShowcase(slice, {
  displayReady = process.env.STREAM_VIRTUAL_DISPLAY_READY === '1',
  connect = connectObs,
  showcase = runShowcase,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  if (!displayReady) return false;
  let obs;
  let switchAttempted = false;
  try {
    await resolveSpec(slice);
    obs = await connect();
    if (!await obs.streaming()) return false;
    const scenes = await obs.scenes();
    if (!scenes.includes(FACTORY) || !scenes.includes(AUTOPILOT)) return false;
    switchAttempted = true;
    await obs.switchScene(FACTORY);
    const code = await showcase(slice);
    if (code === 0) await sleep(10_000);
    return code === 0;
  } catch {
    return false;
  } finally {
    if (obs && switchAttempted) { try { await obs.switchScene(AUTOPILOT); } catch {} }
    obs?.close();
  }
}

async function check() {
  let obs;
  try {
    obs = await connectObs();
    console.log(`stream: ${await obs.streaming() ? 'live' : 'offline'}`);
    const scenes = await obs.scenes();
    console.log('websocket: reachable and authenticated');
    console.log(`scenes: ${scenes.includes(FACTORY) && scenes.includes(AUTOPILOT) ? 'FACTORY + AUTOPILOT ready' : 'missing FACTORY or AUTOPILOT'}`);
  } catch {
    console.log('websocket: unavailable or unauthenticated');
    console.log('scenes: unknown');
  } finally { obs?.close(); }
  const queue = await showcaseQueueStatus();
  const age = queue.depth ? `${Math.floor(queue.oldestAgeMs / 60_000)} min` : 'n/a';
  console.log(`showcase queue: ${queue.depth} pending; oldest ${age}`);
  if (process.env.STREAM_VIRTUAL_DISPLAY_READY === '1') {
    const positioned = /^-?\d+$/.test(process.env.STREAM_DISPLAY_X || '') && /^-?\d+$/.test(process.env.STREAM_DISPLAY_Y || '');
    console.log(`virtual display: ready (${positioned ? 'window bounds configured' : 'place the headed window there once, then keep that Space active'})`);
  } else {
    console.log('virtual display: not armed; place the headed window there once, then set STREAM_VIRTUAL_DISPLAY_READY=1 (optional STREAM_DISPLAY_X/Y bounds)');
  }
}

async function main(args) {
  if (args.includes('--check')) return check();
  if (!args.includes('--showcase')) return;
  if (args.includes('--dry-run')) {
    const calls = [];
    const entry = (await readShowcaseQueue()).entries.find((candidate) => !candidate.shown);
    if (!entry) return console.log('[dry-run] showcase queue empty');
    await directShowcase(entry.spec, {
      displayReady:true,
      connect:async () => ({ streaming:async () => true, scenes:async () => [AUTOPILOT, FACTORY], switchScene:async (scene) => { calls.push(`scene ${scene}`); }, close() {} }),
      showcase:async (name) => { calls.push(`showcase ${name}`); return 0; },
      sleep:async (ms) => { calls.push(`dwell ${ms}ms`); },
    });
    calls.forEach((call) => console.log(`[dry-run] ${call}`));
    return;
  }
  await consumeNextShowcase((entry) => directShowcase(entry.spec));
}

try { process.loadEnvFile?.('.env.local'); } catch {}
if (pathToFileURL(process.argv[1]).href === import.meta.url) await main(process.argv.slice(2));
