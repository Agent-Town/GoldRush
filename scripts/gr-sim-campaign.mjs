#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = parseArgs(process.argv.slice(2));
const outputDir = resolve(args.output);
const checkpointPath = resolve(args.checkpoint);
const playerModule = await import(pathToFileURL(resolve(args.player)).href);
const player = playerModule.default ?? playerModule.ordersFor;
if (typeof player !== 'function') throw new Error('Player module must export a default order-generator function.');

const location = new URL('http://gr-sim-campaign.local/?debug');
globalThis.location = location;
const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

try {
  const { FakeStorage } = await vite.ssrLoadModule('/src/sim/FakeStorage.ts');
  let storage = new FakeStorage();
  installStorage(storage);
  const [
    { HeadlessContractSim },
    { packActiveProfile, unpackProfile },
    { contractUnlockStatus },
    { listBoardContracts },
    { recordScore, loadScores },
    { addMetaPayout, loadMetaProgress, saveMetaProgress },
    { availablePicks, loadResearchState, saveResearchState, takeNode },
    { awardBaronMedal, hasRocketCartCaptured },
    { stableHash },
    { resetStandingOrders },
  ] = await Promise.all([
    vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
    vite.ssrLoadModule('/src/game/ProfileTransfer.ts'),
    vite.ssrLoadModule('/src/meta/ContractUnlock.ts'),
    vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    vite.ssrLoadModule('/src/game/Scoreboard.ts'),
    vite.ssrLoadModule('/src/game/MetaProgress.ts'),
    vite.ssrLoadModule('/src/meta/ResearchTree.ts'),
    vite.ssrLoadModule('/src/game/Medals.ts'),
    vite.ssrLoadModule('/src/mp/LockstepClient.ts'),
    vite.ssrLoadModule('/src/agent/StandingOrders.ts'),
  ]);
  Object.assign(console, originalConsole);

  let legs = [];
  let campaignHash = stableHash([]);

  if (args.resume) {
    const checkpoint = JSON.parse(await readFile(resolve(args.resume), 'utf8'));
    const restored = unpackProfile(storage, checkpoint);
    if (!restored.ok) throw new Error(restored.message);
    legs = checkpoint.campaign?.legs ?? [];
    campaignHash = checkpoint.campaign?.hash ?? stableHash([]);
  }

  await mkdir(outputDir, { recursive: true });
  for (let index = 0; index < legs.length; index += 1) {
    await writeLegArtifact(outputDir, index, legs[index]);
  }
  const contracts = listBoardContracts().filter((contract) =>
    contract.id === 'the-claim' || contract.id.startsWith('e1-'))
    .filter((contract) => contract.practice?.scores !== false);

  while (true) {
    const secured = new Set(loadScores().filter((score) => score.secured).map((score) => score.contractId));
    const contract = contracts.find((candidate) => !secured.has(candidate.id) && contractUnlockStatus(candidate).unlocked);
    if (!contract) break;

    resetStandingOrders();
    player.reset?.({ contractId: contract.id, legIndex: legs.length });
    const seed = benchSeeds[contract.id]?.[0];
    if (!seed) throw new Error(`No pinned bench seed for ${contract.id}.`);
    const startState = canonicalState(packActiveProfile(storage).envelope);
    let outcome;
    if (args.testFixture) {
      if (process.env.NODE_ENV !== 'test' || typeof playerModule.fixtureOutcome !== 'function') {
        throw new Error('--test-fixture requires NODE_ENV=test and a fixtureOutcome export.');
      }
      outcome = await playerModule.fixtureOutcome({ contractId: contract.id, seed, legIndex: legs.length });
    } else {
      const sim = new HeadlessContractSim({ contractId: contract.id, seed }, { storage });
      let turn = sim.currentTurn();
      while (!turn.terminal) {
        const orders = await player(turn.view, { contractId: contract.id, legIndex: legs.length });
        const receipt = sim.submitOrders(orders ?? []);
        if (!receipt.outcome.ok) throw new Error(`${contract.id} player orders rejected: ${receipt.outcome.message ?? receipt.outcome.reason}`);
        turn = sim.advanceToTurn();
      }
      outcome = sim.outcome();
    }
    if (!outcome.secured) throw new Error(`${contract.id} ended unsecured at wave ${outcome.waves}.`);
    if (args.testFixture) {
      saveMetaProgress(storage, addMetaPayout(loadMetaProgress(storage), {
        territory: 1,
        science: contract.id === 'e1-baron' ? 2 : 1,
        hero: 1,
        agent: 1,
      }));
    }
    recordScore({
      waves: outcome.waves,
      kills: outcome.kills,
      gold: outcome.gold,
      timeAlive: outcome.timeMs / 1000,
      at: legs.length + 1,
      secured: true,
      secureWave: outcome.waves,
      deepestWave: outcome.waves,
      contractId: contract.id,
    });
    if (contract.id === 'e1-baron') awardBaronMedal(storage);
    let research = loadResearchState(storage, storage, {
      rocketCartCaptured: hasRocketCartCaptured(storage),
    });
    for (let round = 0; round < 2; round += 1) {
      const pick = availablePicks(research)[0];
      if (!pick) break;
      research = saveResearchState(storage, takeNode(research, pick.id), storage);
    }

    const state = canonicalState(packActiveProfile(storage).envelope);
    const stateHash = stableHash(state);
    campaignHash = stableHash({ previous: campaignHash, contractId: contract.id, seed, eventLogHash: outcome.eventLogHash });
    const leg = {
      contractId: contract.id,
      seed,
      startStateHash: stableHash(startState),
      stateHash,
      eventLogHash: outcome.eventLogHash,
      outcome,
    };
    legs.push(leg);
    const checkpoint = { ...state, campaign: { version: 1, hash: campaignHash, legs } };
    await writeLegArtifact(outputDir, legs.length - 1, leg);
    await writeFile(checkpointPath, `${JSON.stringify(checkpoint, null, 2)}\n`);
    const carriedStorage = new FakeStorage();
    const carried = unpackProfile(carriedStorage, state);
    if (!carried.ok) throw new Error(carried.message);
    storage = carriedStorage;
    installStorage(storage);
    process.stdout.write(`${JSON.stringify({ schema: 'goldrush.campaign.leg.v1', ...leg, campaignHash })}\n`);
  }

  const artifact = { schema: 'goldrush.campaign.v1', campaignHash, legs };
  await writeFile(resolve(outputDir, 'campaign.json'), `${JSON.stringify(artifact, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(artifact)}\n`);
} finally {
  Object.assign(console, originalConsole);
  await vite.close();
}

function canonicalState(envelope) {
  const state = structuredClone(envelope);
  state.exportedAt = '1970-01-01T00:00:00.000Z';
  state.profile.id = 'campaign';
  state.profile.name = 'Campaign';
  state.profile.createdAt = 0;
  state.profile.updatedAt = 0;
  for (const value of Object.values(state.data)) {
    if (Array.isArray(value)) for (const entry of value) if (entry && typeof entry === 'object' && 'at' in entry) entry.at = 0;
  }
  return state;
}

function writeLegArtifact(outputDir, index, leg) {
  return writeFile(resolve(outputDir, `${String(index + 1).padStart(2, '0')}-${leg.contractId}.json`), `${JSON.stringify(leg, null, 2)}\n`);
}

function installStorage(storage) {
  globalThis.localStorage = storage;
  globalThis.window = { location, localStorage: storage };
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const match = /^--([^=]+)=(.*)$/.exec(argv[index]);
    const key = match?.[1] ?? argv[index].replace(/^--/, '');
    if (!['player', 'output', 'checkpoint', 'resume', 'test-fixture'].includes(key)) throw new Error(`Unknown argument: ${argv[index]}`);
    values[key] = key === 'test-fixture' ? true : match?.[2] ?? argv[++index];
  }
  if (!values.player) throw new Error('--player is required.');
  return {
    player: values.player,
    output: values.output ?? 'artifacts/gr-sim-campaign',
    checkpoint: values.checkpoint ?? 'artifacts/gr-sim-campaign/checkpoint.json',
    resume: values.resume,
    testFixture: values['test-fixture'] === true,
  };
}
