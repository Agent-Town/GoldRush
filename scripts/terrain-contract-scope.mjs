#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPORT_PATH = path.join(ROOT, 'docs/bench/terrain-contract-scope.md');
const TERRAIN_PATH = path.join(ROOT, 'src/world/Terrain.ts');
const args = process.argv.slice(2);

export function terrainSeamCensus(source) {
  const declarationReads = [...source.matchAll(/\bconst ACTIVE_CONTRACT\s*=/g)].length;
  const fallbackReads = [...source.matchAll(/\breturn editorPreviewContract\s*\?\?\s*ACTIVE_CONTRACT\s*;/g)].length;
  const structuralFloor = declarationReads + fallbackReads;
  return {
    bypassingReads: [...source.matchAll(/\bACTIVE_CONTRACT\b/g)].length - structuralFloor,
    structuralFloor,
    seamCalls: [...source.matchAll(/\bcurrentContract\(\)/g)].length
      - [...source.matchAll(/\bfunction currentContract\(\)/g)].length,
  };
}

async function main() {
  if (args.some((arg) => !['--check', '--write-report'].includes(arg)) || args.length > 1) {
    throw new Error('Usage: node scripts/terrain-contract-scope.mjs [--check|--write-report]');
  }

  const vite = await createServer({
    root: ROOT,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  });

  let result;
  try {
    const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
    const contracts = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const rows = contracts.listBoardContracts().flatMap((contract) => {
      const zone = contract.tileParams.buildZones?.[0];
      if (!zone) return [];
      const x = (zone.minX + zone.maxX) / 2;
      const z = (zone.minZ + zone.maxZ) / 2;
      return [{ contract: contract.id, x, z, buildable: Terrain.isBuildable(x, z) }];
    });
    result = {
      contractId: contracts.activeContract().id,
      rows,
      acceptedByBenchGround: rows.filter((row) => row.buildable).length,
      rejectedByBenchGround: rows.filter((row) => !row.buildable).length,
      ...terrainSeamCensus(readFileSync(TERRAIN_PATH, 'utf8')),
    };
  } finally {
    await vite.close();
  }

  const committed = args.includes('--check') ? readFileSync(REPORT_PATH, 'utf8') : null;
  const priorDate = committed?.match(/^Measured: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  const measured = priorDate ?? new Date().toISOString().slice(0, 10);
  const output = markdown(result, measured);

  if (args.includes('--write-report')) {
    writeFileSync(REPORT_PATH, output);
    process.stdout.write(`Wrote ${path.relative(ROOT, REPORT_PATH)}: ${result.acceptedByBenchGround} accepted, ${result.rejectedByBenchGround} rejected by bench ground.\n`);
  } else if (committed !== null) {
    if (committed === output) {
      process.stdout.write(`${path.relative(ROOT, REPORT_PATH)} is current: ${result.acceptedByBenchGround} accepted, ${result.rejectedByBenchGround} rejected by bench ground.\n`);
    } else {
      printDiff(committed, output);
      process.exitCode = 1;
    }
  } else {
    process.stdout.write(output);
  }
}

function markdown(scope, date) {
  return [
    '# Bench terrain contract scope',
    '',
    `Measured: ${date}`,
    '',
    `The SSR bench resolved Terrain's module-scoped contract as \`${scope.contractId}\`.`,
    '',
    '## First declared build-zone centre',
    '',
    '| contract | centre x | centre z | accepted by bench ground |',
    '|---|---:|---:|---|',
    ...scope.rows.map((row) => `| ${row.contract} | ${row.x} | ${row.z} | ${row.buildable} |`),
    '',
    `- accepted by bench ground: ${scope.acceptedByBenchGround}`,
    `- rejected by bench ground: ${scope.rejectedByBenchGround}`,
    `- contracts declaring build zones: ${scope.rows.length}`,
    '',
    '## Terrain seam census',
    '',
    `- \`ACTIVE_CONTRACT\` reads bypassing \`currentContract()\`: ${scope.bypassingReads}`,
    `- structural \`ACTIVE_CONTRACT\` floor (declaration + \`currentContract()\` fallback): ${scope.structuralFloor}`,
    `- calls routed through \`currentContract()\`: ${scope.seamCalls}`,
    '',
    '## What this means',
    '',
    'This report measures only the bench\'s ground; it does not compare that answer with each contract\'s own ground.',
    '',
    `A browser boot can select a contract from its URL, so its placement answers come from that contract's ground. Direct in-process SSR bench callers with no browser location currently bake \`${scope.contractId}\` into Terrain instead. Browser placement reasoning is therefore not established by those bare-SSR bench answers until the headless Terrain seam is rewired. CLI paths such as \`gr-sim.mjs\` install a contract URL before importing Terrain and are outside this no-location measurement.`,
    '',
  ].join('\n');
}

function printDiff(before, after) {
  const committedLines = before.split('\n');
  const derivedLines = after.split('\n');
  let differences = 0;
  for (let index = 0; index < Math.max(committedLines.length, derivedLines.length); index += 1) {
    if (committedLines[index] === derivedLines[index]) continue;
    differences += 1;
    process.stderr.write(`line ${index + 1}:\n- committed: ${committedLines[index] ?? '<missing>'}\n+ derived:   ${derivedLines[index] ?? '<missing>'}\n`);
  }
  process.stderr.write(`${differences} differing line${differences === 1 ? '' : 's'} in ${path.relative(ROOT, REPORT_PATH)}.\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
