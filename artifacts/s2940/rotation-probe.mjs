import fs from 'node:fs';
import { resolveLiveSeed } from '../../src/game/liveSeed.ts';
const observedAt = new Date().toISOString();
const readRegistry = text => JSON.parse(text.split('<!-- skillmd-guard:rotations:start -->')[1].split('<!-- skillmd-guard:rotations:end -->')[0].match(/```json\s*([\s\S]*?)```/)[1]);
const liveRegistry = readRegistry(fs.readFileSync(new URL('./live-skill.md', import.meta.url), 'utf8'));
const localRegistry = JSON.parse(fs.readFileSync('assets/rotations/rotation-seeds.json', 'utf8'));
const latest = liveRegistry.rotations.at(-1);
const result = { observedAt, liveDocumentRotations: liveRegistry.rotations.map(x => x.id), localRotations: localRegistry.rotations.map(x => x.id), liveDocumentOpenRotations: liveRegistry.rotations.filter(x => Date.parse(x.opensAt) <= Date.parse(observedAt) && Date.parse(observedAt) < Date.parse(x.closesAt)).map(x => x.id), selectorControl: Object.keys(latest.seeds).map(contract => ({ contract, selected: resolveLiveSeed(contract, Date.parse(observedAt), liveRegistry.rotations), closed: Date.parse(observedAt) >= Date.parse(latest.closesAt), localSelected: resolveLiveSeed(contract, Date.parse(observedAt), localRegistry.rotations) })), reads: [] };
for (const week of ['r2026w41', 'r2026w40']) {
  const url = `https://agenttown.app/api/standings?board=transfer&rotation=${week}`;
  const response = await fetch(url, {signal: AbortSignal.timeout(20000), headers: {'Cache-Control':'no-cache'}});
  const body = await response.json();
  result.reads.push({url, status: response.status, ok: body.ok, error: body.error ?? null, message: body.message ?? null, topLevelKeys: Object.keys(body)});
}
result.scope = 'Read-only HTTP probes and local selector control using the deployed public document registry. No standing submitted; POST refusal is inferred from the existing window check, not measured live.';
fs.writeFileSync(new URL('./rotation-probe.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
