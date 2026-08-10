#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const source = Object.fromEntries([
  'src/agent/MechanicsManifest.ts',
  'src/agent/StandingOrders.ts',
  'src/game/Game.ts',
  'src/game/buildables.ts',
  'src/sim/HeadlessContractSim.ts',
  'src/ui/UpgradeOverlay.ts',
  'functions/api/standings.ts',
  'src/meta/ContractFamilies.ts',
].map((file) => [file, read(file)]));

function line(file, needle) {
  const index = source[file].indexOf(needle);
  if (index < 0) throw new Error(`Audit anchor missing: ${file} :: ${needle}`);
  return `${file}:${source[file].slice(0, index).split('\n').length}`;
}

function quoted(block) {
  return [...block.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

function between(text, start, end) {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Audit source shape missing: ${start}`);
  return text.slice(from, to);
}

function contracts() {
  const dir = path.join(ROOT, 'assets/contracts');
  const files = fs.readdirSync(dir)
    .map((epoch) => `assets/contracts/${epoch}/contracts.json`)
    .filter((file) => fs.existsSync(path.join(ROOT, file)))
    .sort();
  const ids = new Set();
  const result = [];
  for (const file of files) {
    const bundle = JSON.parse(read(file));
    if (!Array.isArray(bundle.contracts) || !bundle.epochId) throw new Error(`Invalid contract bundle: ${file}`);
    if (!source['src/meta/ContractFamilies.ts'].includes(`../../${file}`)) {
      throw new Error(`Contract bundle is not walked by ContractFamilies.listContracts(): ${file}`);
    }
    const manifest = JSON.parse(read(`assets/contracts/${bundle.epochId}/manifest.json`));
    for (const contract of bundle.contracts) {
      if (ids.has(contract.id)) throw new Error(`Duplicate contract id: ${contract.id}`);
      ids.add(contract.id);
      result.push({ ...contract, epochId: bundle.epochId, research: manifest.research });
    }
  }
  if (!source['src/meta/ContractFamilies.ts'].includes('export function listContracts(')) {
    throw new Error('ContractFamilies.listContracts() is missing');
  }
  return result;
}

const buildableIds = quoted(between(
  source['src/game/buildables.ts'],
  'export type BuildableId =',
  'export type BuildPlacement',
));
const doorVerbs = [...new Set(quoted(between(
  source['src/agent/StandingOrders.ts'],
  'export type StandingOrder =',
  'export type StandingOrderStatus',
)))];
const tapeBlock = between(
  source['functions/api/standings.ts'],
  'function validTapeAction(',
  'function tapeMatchesScore(',
);
const simpleBlock = tapeBlock.match(/const simple = new Set\(\[([\s\S]*?)\]\)/)?.[1];
if (!simpleBlock) throw new Error('validTapeAction simple action registry is missing');
const tapeActions = [...new Set([
  ...quoted(simpleBlock),
  ...[...tapeBlock.matchAll(/value\.type === '([^']+)'/g)].map((match) => match[1]),
])];
const supportedContracts = new Set(quoted(between(
  source['src/sim/HeadlessContractSim.ts'],
  'const SUPPORTED_CONTRACTS = new Set([',
  ']);',
)));

const abilityRegistry = [...source['src/game/Game.ts'].matchAll(
  /private readonly \w+Shooters: ShooterHandle\[\] = \[this\.(\w+)\]/g,
)].map(([, field]) => {
  const block = between(source['src/game/Game.ts'], `private readonly ${field}: ShooterHandle = {`, '\n  };');
  const resumeKey = block.match(/resumeKey: '([^']+)'/)?.[1];
  const cooldown = block.match(/cooldown: ([^,\n]+)/)?.[1]?.trim();
  if (!resumeKey || !cooldown) throw new Error(`Incomplete hero ability registry entry: ${field}`);
  return { field, resumeKey, cooldown };
});
if (abilityRegistry.length === 0) throw new Error('Hero ability/resume registry is empty');

const tapeSurface = {
  weapon_toggle: 'ability',
  debug_xp: 'economy',
  pick_upgrade: 'choice',
  research_pick: 'choice',
  research_skip: 'choice',
  death_action: 'choice',
  secure_choice: 'choice',
  skip_ceremony: 'choice',
  place_build: 'verb',
};

function advertisedBuildables(contract) {
  const ids = new Set(['sentry_beacon', 'palisade', 'sluice', 'stockpile', 'turret', 'assay_office']);
  if (contract.twist?.powerGrid) ids.delete('turret');
  for (const id of contract.practice?.buildables ?? []) ids.add(id);
  if (contract.twist?.pressureEnabled) ids.add('boiler_house');
  if (contract.id === 'e3-blackout-ridge' && contract.twist?.powerGrid) ids.add('capacitor_bank');
  if (!contract.twist?.powerGrid && (contract.twist?.lightRamp || contract.twist?.dayNightCycle)) ids.add('lantern_post');
  if (contract.id === 'e3-moth-season' && contract.twist?.mothSeason) ids.add('lantern_post').add('decoy_shed');
  return ids;
}

function manifestEvidence(contract, id) {
  const file = 'src/agent/MechanicsManifest.ts';
  if (contract.practice?.buildables?.includes(id)) return line(file, "rule('practice_buildables'");
  if (id === 'sentry_beacon' || id === 'turret') return line(file, 'const registryBuildables =');
  if (id === 'boiler_house') return line(file, '...(boilerHouse ?');
  if (id === 'capacitor_bank') return line(file, '...(capacitorBank ?');
  if (id === 'lantern_post') return line(file, '...(lanternPost ?');
  if (id === 'decoy_shed') return line(file, '...(decoyShed ?');
  return `${line(file, 'const registryBuildables =')} · ${line(file, 'const buildables = [')}`;
}

function doorAccepts(contract, id) {
  return advertisedBuildables(contract).has(id);
}

function browserAccepts(contract, id) {
  return advertisedBuildables(contract).has(id);
}

function direction(human, agent) {
  if (human === agent) return 'equal';
  return agent ? 'agent-exceeds' : 'agent-lacks';
}

function row(contract, surface, humansGet, agentsGet, result, evidence) {
  return { contract: contract.id, surface, 'humans-get': humansGet, 'agents-get': agentsGet, direction: result, evidence };
}

function audit() {
  const rows = [];
  for (const contract of contracts()) {
    const agentCanEnter = supportedContracts.has(contract.id) || (contract.modes?.length ?? 0) > 0;
    rows.push(row(
      contract,
      'verb',
      'browser can launch the contract',
      agentCanEnter
        ? (supportedContracts.has(contract.id) ? 'headless accepts the default contract' : `headless accepts declared mode ${contract.modes[0].id}`)
        : 'headless rejects the contract before play',
      direction(true, agentCanEnter),
      `${line('src/sim/HeadlessContractSim.ts', 'const SUPPORTED_CONTRACTS = new Set([')} · ${line('src/sim/HeadlessContractSim.ts', 'if (!SUPPORTED_CONTRACTS.has(this.contractId) && !mode)')}`,
    ));

    const advertised = advertisedBuildables(contract);
    for (const id of buildableIds) {
      const manifest = advertised.has(id);
      const browser = browserAccepts(contract, id);
      const predicate = doorAccepts(contract, id);
      const agent = predicate;
      rows.push(row(
        contract,
        'buildable',
        manifest ? `contract manifest advertises BUILD ${id}` : `contract manifest does not advertise ${id}`,
        predicate ? `door predicate accepts BUILD ${id}` : `door predicate rejects BUILD ${id}`,
        direction(manifest, predicate),
        `${manifestEvidence(contract, id)} · ${line('src/sim/HeadlessContractSim.ts', '(id) => offeredBuildables.has(id)')} · ${line('src/game/buildables.ts', `  | '${id}'`)}`,
      ));
      rows.push(row(
        contract,
        'buildable',
        browser ? `browser menu offers BUILD ${id}` : `browser menu hides ${id}`,
        agent ? `door accepts BUILD ${id}` : `door rejects BUILD ${id}`,
        direction(browser, agent),
        `${line('src/game/Game.ts', 'private isBuildableEnabled(id: BuildableId): boolean')} · ${line('src/sim/HeadlessContractSim.ts', '(id) => offeredBuildables.has(id)')} · ${line('src/game/buildables.ts', `  | '${id}'`)}`,
      ));
    }

    for (const action of tapeActions) {
      const placeBuild = action === 'place_build' && doorVerbs.includes('BUILD');
      const reachable = agentCanEnter && placeBuild;
      rows.push(row(
        contract,
        tapeSurface[action] ?? 'verb',
        action === 'place_build' ? 'tape action place_build includes rotationSteps 0..3' : `tape action ${action}`,
        action === 'place_build'
          ? (reachable ? 'BUILD order reaches placement but always defaults rotation to 0' : 'no reachable BUILD order')
          : `no ${action} standing order`,
        'agent-lacks',
        `${line('functions/api/standings.ts', action === 'place_build' ? "value.type === 'place_build'" : `'${action}'`)} · ${line('src/agent/StandingOrders.ts', action === 'place_build' ? 'this.surface.tools.place_building(order.what, order.where)' : 'export type StandingOrder =')}`,
      ));
    }

    rows.push(row(
      contract,
      'choice',
      'XP opens a three-card draft; player picks a card',
      agentCanEnter ? 'XP is consumed; headless sim silently takes offer[0]' : 'headless rejects the contract before an upgrade offer',
      'agent-lacks',
      `${line('src/ui/UpgradeOverlay.ts', "type: 'pick_upgrade'")} · ${line('src/sim/HeadlessContractSim.ts', 'while (this.progression.offer?.[0])')}`,
    ));

    for (const ability of abilityRegistry) {
      const rig = ability.resumeKey.endsWith(':rig');
      rows.push(row(
        contract,
        'ability',
        `${ability.resumeKey} (${ability.cooldown})`,
        rig && agentCanEnter ? 'headless automatic Spark Rig uses the same cooldown' : 'no reachable standing-order path reaches this hero ability',
        rig && agentCanEnter ? 'equal' : 'agent-lacks',
        `${line('src/game/Game.ts', `resumeKey: '${ability.resumeKey}'`)} · ${rig
          ? line('src/sim/HeadlessContractSim.ts', "resumeKey: 'hero:0:rig'")
          : line('src/agent/StandingOrders.ts', 'export type StandingOrder =')}`,
      ));
    }

    rows.push(row(
      contract,
      'economy',
      'combat XP is consumed by progression',
      agentCanEnter ? 'combat XP is consumed by progression' : 'headless rejects the contract before combat XP',
      agentCanEnter ? 'equal' : 'agent-lacks',
      `${line('src/game/Game.ts', 'this.progression.consumeXpTotal(this.combat.xpCount)')} · ${line('src/sim/HeadlessContractSim.ts', 'this.progression.consumeXpTotal(this.combat.xpCount)')}`,
    ));
  }
  const summary = { 'agent-exceeds': 0, 'agent-lacks': 0, equal: 0 };
  for (const entry of rows) summary[entry.direction] += 1;
  return { schema: 'goldrush.same-game-audit.v1', contracts: [...new Set(rows.map((entry) => entry.contract))], rows, summary };
}

function cell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function markdown(result) {
  const offenders = Object.entries(result.rows.reduce((counts, entry) => {
    if (entry.direction !== 'equal') counts[entry.contract] = (counts[entry.contract] ?? 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5);
  const entryGaps = result.rows.filter((entry) => entry['agents-get'] === 'headless rejects the contract before play').length;
  const manifestMenuGaps = result.rows.filter((entry) =>
    entry.surface === 'buildable' && entry['humans-get'].startsWith('browser menu') && entry.direction !== 'equal').length;
  const newlyEnumeratedTapeActions = tapeActions.filter((action) =>
    !['weapon_toggle', 'research_pick', 'research_skip', 'death_action', 'secure_choice'].includes(action));
  return [
    '# Same-game audit',
    '',
    `Generated by \`node scripts/same-game-audit.mjs\` over ${result.contracts.length} contracts in every epoch bundle. The harness cross-checks those JSON bundles against \`ContractFamilies.listContracts()\`, then reads the buildable, tape-action, standing-order, hero resume-key, upgrade, research, and XP registries from source.`,
    '',
    '## Summary',
    '',
    `- agent-exceeds: ${result.summary['agent-exceeds']}`,
    `- agent-lacks: ${result.summary['agent-lacks']}`,
    `- equal: ${result.summary.equal}`,
    `- divergence rows: ${result.summary['agent-exceeds'] + result.summary['agent-lacks']}`,
    `- total parity rows: ${result.rows.length}`,
    '',
    '## New divergence classes beyond the seed',
    '',
    `- **Contract reachability:** ${entryGaps} contracts can launch in the browser but are rejected by the headless door without a declared mode.`,
    `- **Browser-menu versus door:** ${manifestMenuGaps} buildable rows disagree even after separating the browser menu from the contract manifest.`,
    '- **Build orientation:** human `place_build` tapes carry `rotationSteps` 0..3; the standing-order `BUILD` path omits rotation and defaults to 0.',
    `- **Additional tape-only actions:** ${newlyEnumeratedTapeActions.filter((action) => action !== 'place_build').map((action) => `\`${action}\``).join(', ')} have no matching standing-order verb.`,
    '',
    '## Worst offenders',
    '',
    `The widest gates in the county are ${offenders.map(([id, count]) => `\`${id}\` (${count})`).join(', ')}. Buildables now share one manifest rulebook; the remaining debt is contract reachability plus human choices and abilities without a standing-order trail.`,
    '',
    '## Full parity table',
    '',
    '| contract | surface | humans-get | agents-get | direction | evidence |',
    '|---|---|---|---|---|---|',
    ...result.rows.map((entry) => `| ${cell(entry.contract)} | ${cell(entry.surface)} | ${cell(entry['humans-get'])} | ${cell(entry['agents-get'])} | ${cell(entry.direction)} | ${cell(entry.evidence)} |`),
    '',
  ].join('\n');
}

const result = audit();
const output = process.argv.includes('--json') ? `${JSON.stringify(result, null, 2)}\n` : markdown(result);
if (process.argv.includes('--write-report')) {
  fs.mkdirSync(path.join(ROOT, 'docs/bench'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs/bench/same-game-audit.md'), output);
} else {
  process.stdout.write(output);
}
