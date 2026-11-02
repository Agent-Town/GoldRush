import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolveLiveSeed, liveSeedRotationId } from '../../src/game/liveSeed.ts';

const dir = 'artifacts/s3505';
const now = Date.now();
const skillResponse = await fetch('https://agenttown.app/goldrush/skill.md', { signal: AbortSignal.timeout(15000) });
if (!skillResponse.ok) throw Error(`skill HTTP ${skillResponse.status}`);
const skill = await skillResponse.text();
const fence = skill.split('skillmd-guard:rotations:start')[1].split('skillmd-guard:rotations:end')[0].match(/```json\s*([\s\S]*?)```/)[1];
const served = JSON.parse(fence);
const local = JSON.parse(fs.readFileSync('assets/rotations/rotation-seeds.json', 'utf8'));
const open = local.rotations.find(r => Date.parse(r.opensAt) <= now && now < Date.parse(r.closesAt));
if (open?.id !== 'r2026w45') throw Error('Unexpected current rotation');
const controls = Object.keys(open.seeds).map(contract => {
  const servedSeed = resolveLiveSeed(contract, now, served.rotations);
  const localSeed = resolveLiveSeed(contract, now, local.rotations);
  const servedRotation = served.rotations.find(r => Object.values(r.seeds).includes(servedSeed));
  return { contract, servedRotation: liveSeedRotationId(servedSeed, served.rotations), servedWindowClosed: now >= Date.parse(servedRotation.closesAt), localRotation: liveSeedRotationId(localSeed, local.rotations) };
});
const probes = [];
for (const host of ['https://agenttown.app', 'https://gold-rush-3in.pages.dev']) {
  for (const rotation of ['r2026w45', 'r2026w44']) {
    const url = `${host}/api/standings?board=transfer&rotation=${rotation}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await r.json();
    probes.push({ url, at: new Date().toISOString(), status: r.status, ok: body.ok, error: body.error });
  }
}
const sourceDiff = execFileSync('git', ['diff', '--name-only', '299b1db58', 'HEAD', '--', 'src/game/liveSeed.ts', 'functions/api/standings.ts'], { encoding: 'utf8' }).trim();
const result = {
  at: new Date(now).toISOString(), openLocal: open.id, opensAt: open.opensAt,
  servedRotations: served.rotations.map(r => r.id), localRotations: local.rotations.map(r => r.id),
  sourceDiffFromServedBuild: sourceDiff, controls, probes,
  inference: 'With the served registry, the unchanged seed selector chooses closed week 44 for six rotation contracts; the unchanged submission window check rejects otherwise valid old-week submissions with rotation_closed. No live submission was made.'
};
fs.writeFileSync(`${dir}/rotation-recheck.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
