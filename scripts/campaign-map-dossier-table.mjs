#!/usr/bin/env node
/**
 * campaign-map-dossier-table.mjs — renders the measured half of the Surveyor's Dossier.
 *
 * WHY IT IS SEPARATE FROM THE PROBE: the probe takes ~20 minutes of browser time. The table it
 * feeds went through several drafts. Re-booting 29 maps to reword a column heading would be the
 * kind of cost that quietly discourages getting the wording right, so rendering reads the probe's
 * artifact and never touches a browser.
 *
 * WHY THE VERDICT IS DERIVED RATHER THAN TYPED: a hand-written "looks fine" column is unfalsifiable
 * and rots silently. Every verdict here is a stated predicate over a measured number, listed in
 * RULES below, so the owner (or the next fire) can disagree with the RULE rather than with a mood.
 * The OWNER VERDICT column is not produced here and never will be — it is his.
 *
 * Usage: node scripts/campaign-map-dossier-table.mjs [--json artifacts/campaign-dossier/probe.json]
 * Writes the markdown table to stdout. Read-only.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonArg = process.argv.find((a) => a.startsWith('--json='))?.slice('--json='.length);
const probe = JSON.parse(readFileSync(path.resolve(ROOT, jsonArg ?? 'artifacts/campaign-dossier/probe.json'), 'utf8'));

// Each rule is one measured predicate. A row trips NEEDS-EYES if any rule fires; the fired rules
// become the look-flag text, so the flag always says which number it is standing on.
const RULES = [
  { flag: 'console errors', when: (r) => r.console.errors.length > 0, detail: (r) => `${r.console.errors.length}` },
  { flag: 'page errors', when: (r) => r.console.pageErrors.length > 0, detail: (r) => `${r.console.pageErrors.length}` },
  { flag: 'pilot failure', when: (r) => Boolean(r.pilot?.failure), detail: (r) => r.pilot.failure },
  { flag: 'not GLB', when: (r) => r.pilot?.renderSource !== 'glb', detail: (r) => `render=${r.pilot?.renderSource}` },
  { flag: 'landmarks short', when: (r) => r.pilot && r.pilot.landmarks < r.pilot.landmarkExpected, detail: (r) => `${r.pilot.landmarks}/${r.pilot.landmarkExpected}` },
  // The full diagnostic string is four clauses long; a table cell that carries all of it stops
  // being readable, and the detail is preserved verbatim in the probe artifact either way.
  {
    flag: 'landmarks skipped',
    when: (r) => (r.pilot?.landmarkSkipped ?? 0) > 0,
    detail: (r) => `${r.pilot.landmarkSkipped}× ${(r.pilot.landmarkDiagnostics.split(': ')[1] ?? '').split(';')[0] || 'see artifact'}`,
  },
  { flag: 'no panorama', when: (r) => !r.pilot?.panorama || r.pilot.panorama === 'off' || r.pilot.panoramaMeshes === 0, detail: (r) => `panorama=${r.pilot?.panorama}` },
  // 0.30 m is the house relief floor: e2e/w1-01-terrain-relief.spec.ts asserts max-min > 0.3 on the
  // painted heightfield. Below it the ground reads as a flat plate to the eye.
  { flag: 'flat terrain', when: (r) => (r.relief?.range ?? 0) < 0.3, detail: (r) => `${r.relief?.range}m` },
  { flag: 'near-black frame', when: (r) => (r.frame?.meanLuma ?? 0) < 12, detail: (r) => `luma ${r.frame?.meanLuma}` },
  { flag: 'blown-out frame', when: (r) => (r.frame?.meanLuma ?? 0) > 200, detail: (r) => `luma ${r.frame?.meanLuma}` },
];

/**
 * The map mounts landmarks belonging to another map's pack. Not a defect by itself — the seven
 * reuse mounts are a ruling (MAP-CAMPAIGN-LEDGER.md) — but it is the difference between "this map
 * has its own dressing" and "this map wears the host's", which is a thing an owner verdict turns on.
 */
function dressing(row) {
  if (!row.pilot?.landmarkMountIds?.length) return '—';
  const own = new Set((row.disk.pack ?? []).map((f) => f.replace(/\.glb$/, '')));
  const mine = row.pilot.landmarkMountIds.filter((id) => own.has(id)).length;
  if (!own.size) return `host (${row.disk.slug} ships no pack)`;
  return mine === row.pilot.landmarkMountIds.length ? 'own' : `host (${mine}/${row.pilot.landmarkMountIds.length} own)`;
}

/**
 * THE SECOND AXIS, and it is independent of the first. The door judges `harvestAnchors` alone;
 * `engineDependencies` records whether the system the map is ABOUT has been built. They do not move
 * together — `e8-eclipse` and `e5-stillwater` both declare a missing consumer and both open, while
 * `e6-picnic` declares nothing missing and is refused. Keeping them in separate columns is the
 * difference between "you can walk it" and "it plays as designed", which is what a verdict turns on.
 * ⚠️ UNDECLARED is not READY: F-1480-2 found that a contract with no `engineDependencies` field
 * reads as more finished than its honest siblings. It is reported as its own value, never as ready.
 */
const CONSUMERS = (() => {
  const table = new Map();
  const root = path.join(ROOT, 'assets/contracts');
  for (const dir of readdirSync(root).filter((d) => d.startsWith('epoch-'))) {
    const file = path.join(root, dir, 'contracts.json');
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    for (const contract of Array.isArray(parsed) ? parsed : (parsed.contracts ?? [])) {
      const deps = contract.tileParams?.engineDependencies;
      table.set(contract.id, deps === undefined
        ? { state: 'undeclared', text: '⚪ *undeclared*' }
        : deps.some((d) => d.status === 'missing')
          ? { state: 'missing', text: `🟠 missing: \`${deps.filter((d) => d.status === 'missing').map((d) => d.dep).join('`, `')}\`` }
          : { state: 'ready', text: '🟢 declared ready' });
    }
  }
  return table;
})();
const consumerOf = (id) => CONSUMERS.get(id) ?? { state: 'unknown', text: '—' };

const rows = probe.rows.filter((r) => !r.host);
const hosts = new Map(probe.rows.filter((r) => r.host).map((r) => [r.id, r]));

const lines = [
  '| era | map | opens? | its mechanic | terrain | relief | landmarks | dressing | look-flag | shot | FACTORY SAYS | OWNER VERDICT |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
];
const summary = { shipShape: 0, lookOnly: 0, shut: 0, failed: 0 };

for (const row of rows) {
  const consumer = consumerOf(row.id);
  if (row.boot.startsWith('REFUSED')) {
    summary.shut += 1;
    const host = row.reuse ? hosts.get(row.reuse) : null;
    const shot = host?.shot ? `[host sculpt](../${host.shot})` : '—';
    lines.push(
      `| E${row.era} | **${row.name}** | ❌ **no** — \`${row.door.fallbackReason}\`; opens *${row.door.activeId}* instead | ${consumer.text} | — | — | — | — | ` +
        `**0 harvest anchors** | ${shot} | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |`,
    );
    continue;
  }
  if (!row.boot.startsWith('PASS')) {
    summary.failed += 1;
    lines.push(`| E${row.era} | **${row.name}** | ⚠️ boot failed | ${consumer.text} | — | — | — | — | \`${row.boot}\` | — | 🔧 **BROKEN** — do not show it | — |`);
    continue;
  }
  const fired = RULES.filter((rule) => rule.when(row));
  const shots = [`[spawn](../${row.shot})`];
  if (row.landmarkShot) shots.push(`[landmark](../${row.landmarkShot})`);
  // The verdict answers ONE question — what is a verdict on this row worth tonight? A map whose
  // mechanic is unbuilt can still earn an honest verdict on how it LOOKS, and saying so is more
  // use than a green tick that quietly means something narrower than the owner will read into it.
  const verdict = fired.length
    ? `👀 **LOOK AGAIN** — ${fired.map((f) => f.flag).join(', ')}`
    : consumer.state === 'missing'
      ? '🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet'
      : '✅ **SHIP-SHAPE** — plays and looks finished';
  summary[fired.length || consumer.state === 'missing' ? 'lookOnly' : 'shipShape'] += 1;
  lines.push(
    `| E${row.era} | **${row.name}** | ✅ yes | ${consumer.text} | ${row.pilot.triangles.toLocaleString()} tri | ` +
      `${row.relief.range} m | ${row.pilot.landmarks}/${row.pilot.landmarkExpected} | ${dressing(row)} | ` +
      `${fired.length ? fired.map((f) => `${f.flag} (${f.detail(row)})`).join('; ') : '— none'} | ${shots.join(' · ')} | ${verdict} | — |`,
  );
}

console.log(lines.join('\n'));
console.log('');
console.log(
  `<!-- derived from ${probe.probed} probed boots: ${rows.length} campaign rows — ${summary.shipShape} ship-shape, ` +
    `${summary.lookOnly} look-only/look-again, ${summary.shut} refused by the door, ${summary.failed} broken -->`,
);
