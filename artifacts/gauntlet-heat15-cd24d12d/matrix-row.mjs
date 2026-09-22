// HEAT 12 MATRIX ROW — operator bookkeeping. Renders (and appends) one matrix row for one ride
// entirely from the evidence files on disk: summary.json (the rig's own outcome + tapes),
// verdict-slip.json / post-response.json (the door), ride-meta.json (the wall). Nothing is typed
// by hand, so a row can never drift from the receipt it describes.
// usage: node matrix-row.mjs --contract=<id> --seed=<seed> --stake=<s> --gen=<n> [--append]
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['contract', 'seed', 'stake', 'gen', 'n']) if (!args[key]) throw new Error(`--${key} required`);
// HEAT 15: --ride names the evidence dir (three rides on ONE board this heat; see ride-one.mjs).
const dir = join(HERE, 'rides', args.ride ?? args.contract);
const read = (f) => { if (!existsSync(join(dir, f))) return null; try { return JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { return null; } };
const s = read('summary.json');
const slip = read('verdict-slip.json');
const post = read('post-response.json');
if (!s) throw new Error(`no summary.json for ${args.contract}`);

const o = s.outcome?.outcome ?? s.outcome ?? {};
const secured = s.scoredTapes.filter((t) => t.outcome?.secured === true);
const chosen = secured.find((t) => t.promotedByRig) ?? secured.slice().sort((a, b) => (b.outcome?.waves ?? 0) - (a.outcome?.waves ?? 0))[0] ?? null;
const outcomeWord = chosen ? 'SECURED' : (s.wallHit ? 'not secured (WALL)' : 'not secured');
const waves = chosen?.outcome?.waves ?? o.waves ?? '—';
const gold = chosen?.outcome?.gold ?? o.gold ?? '—';
const timeAlive = chosen?.outcome?.timeAlive ?? (o.timeMs !== undefined ? (o.timeMs / 1000).toFixed(3) : o.timeAlive ?? '—');
const hash = o.eventLogHash ?? '—';
const verdict = slip
  ? `${slip.assay}${slip.assayHash ? ` \`${slip.assayHash}\`` : ''}${slip.ranked === false ? ' (unranked)' : ''}${post?.rank !== undefined && post?.rank !== null ? ` rank ${post.rank}` : ''}`
  : !chosen ? '—'
  : !post?.stored ? '⚠ not submitted'
  // POST's rank is computed BEFORE the assay. A number here means the row would rank once assayed;
  // null means the rig already holds a better row for this contract and the board keeps one standing
  // per owner, so the assay index is never synced and no slip is ever issued (F-HEAT12-4).
  : post.rank === null ? '**stored, never assayed** (F-HEAT12-4)'
  : `**stored, no slip yet** — POST rank ${post.rank}${post.decidedBy ? ` (${post.decidedBy})` : ''}`;
// When nothing secured, show the tape the RIG declared as its best in gauntlet-outcome.json — the
// waves/gold columns come from that same file, so showing a different tape would mismatch them.
const shown = chosen ?? s.scoredTapes.find((t) => t.promotedByRig) ?? s.scoredTapes[0] ?? null;
const tape = shown ? `\`${shown.file}\` · \`${shown.id}\`` : '—';
const row = `| ${args.n} | ${args.contract}${args.ride && args.ride !== args.contract ? `<br>\`${args.ride}\`` : ''} | \`${args.seed}\` | ${args.stake} | ${args.gen} | **${outcomeWord}** | ${waves} | ${gold} | ${timeAlive}s | ${s.wallClockSeconds}s${s.wallHit ? ' ⏱' : ''} | ${tape}<br>${hash} | ${verdict} | gen ${args.gen}${slip?.tapeId ? `<br>slip \`${slip.tapeId}\`` : ''} |`;
process.stdout.write(`${row}\n`);
if (args.append !== undefined) appendFileSync(join(HERE, 'matrix.md'), `${row}\n`);
process.stdout.write(`${JSON.stringify({ contract: args.contract, secured: Boolean(chosen), tapesOnDisk: s.workspaceFiles?.filter((f) => /\.json$/.test(f)).length ?? 0, scoredTapes: s.scoredTapes.length, otherSecured: s.otherSecuredTapes?.length ?? 0, runs: o.runsSoFar, scoredAttempts: o.scoredAttempts, wallHit: s.wallHit, rc: s.exitCode, assay: slip?.assay ?? null, ranked: slip?.ranked ?? null, winnability: s.report?.winnability ?? null })}\n`);
