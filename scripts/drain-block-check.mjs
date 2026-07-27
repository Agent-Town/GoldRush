#!/usr/bin/env node
// drain-block-check.mjs — answer ONE question before any drain: is this slice ALLOWED to land?
//
// WHY THIS EXISTS (F-1104-7, 2026-07-27): s1104 merged rf-34 (hero-y) onto main although it was
// owner-gated, then had to reverse it in the same fire. Every check that fire ran asked "is it
// READY" — `main..lane/m3` ahead, two-dot diff real, main never moved the file, the runner's
// report sound. All true, and all blind: a policy block is not a property of the tree, so no git
// probe can see it. It lives in `tasks/goals.json` as `status:"blocked"` + `blockedReason`, keyed
// by `taskFile` — which every done-move filename already contains. So it is a LOOKUP, not a
// judgement, and a lookup belongs in a script rather than in a tired reader's discipline.
//
// USAGE
//   node scripts/drain-block-check.mjs <done-move filename | task file | branch | slice id>
//   node scripts/drain-block-check.mjs <task file> --queue # refuse already-shipped work
//   node scripts/drain-block-check.mjs --all          # audit every blocked leaf
//   node scripts/drain-block-check.mjs <arg> --strict # unknown slice becomes a failure too
//
// EXIT CODES
//   0  CLEAR    — a leaf matched and it is not blocked (or --all found nothing blocked)
//   1  BLOCKED  — DO NOT DRAIN. The reason is printed.
//   2  UNKNOWN  — no goal leaf matched. Advisory by default (Goal Registration Law says one
//                 should exist, so this is itself a bookkeeping finding); fails under --strict.

import { readFileSync, existsSync } from 'node:fs';

const GOALS = 'tasks/goals.json';
const BACKLOG = 'tasks/BACKLOG.md';

// Filename-level markers. Independent of goals.json on purpose: the done-move rename convention
// ("OWNER-GATED-...-do-not-drain-...") is a second, cheaper line of defence, and a fire that
// renames a file but forgets the leaf should still be stopped.
const FILENAME_BLOCK_MARKERS = [/do-not-drain/i, /OWNER-GATED/i];
const TERMINAL_SHIPPED_STATUSES = new Set(['merged', 'shipped']);

function collectLeaves(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectLeaves(child, out);
    return out;
  }
  if (typeof node.taskFile === 'string') out.push(node);
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectLeaves(value, out);
  }
  return out;
}

// Reduce any input shape to the bare slice name:
//   20260727-011937-lane-hero-y-restore-roundtrip.md          (done-move)
//   OWNER-GATED-F-1096-2-do-not-drain-20260727-011937-lane-... (renamed done-move)
//   tasks/lane-hero-y-restore-roundtrip.md                     (master)
//   lane/m3                                                    (branch — matched loosely)
function normalize(raw) {
  return raw
    .replace(/^.*\//, '')            // drop any directory
    .replace(/\.md$/i, '')           // drop the extension
    .replace(/\.log$/i, '')
    .replace(/^.*?(\d{8}-\d{6})-/, '') // drop everything up to and incl. a run stamp
    .replace(/^(lane-[a-d]|main|art)-(?=lane-|art-)/, ''); // drop a leading slot label
}

function findLeaves(leaves, needle) {
  const key = normalize(needle).toLowerCase();
  const hits = [];
  for (const leaf of leaves) {
    const taskKey = normalize(leaf.taskFile).toLowerCase();
    if (!taskKey) continue;
    // Substring either way: the done-move carries the taskFile, and an id may be the shorter side.
    if (key.includes(taskKey) || taskKey.includes(key)) hits.push({ leaf, taskKey });
    else if (leaf.id && key.includes(String(leaf.id).toLowerCase())) hits.push({ leaf, taskKey });
  }
  // Longest match wins — guards against a short taskFile matching many done-moves by accident.
  hits.sort((a, b) => b.taskKey.length - a.taskKey.length);
  return hits.map((h) => h.leaf);
}

function backlogMentions(needle) {
  if (!existsSync(BACKLOG)) return [];
  const key = normalize(needle).toLowerCase();
  const stem = key.replace(/^lane-/, '').slice(0, 28);
  if (stem.length < 6) return [];
  return readFileSync(BACKLOG, 'utf8')
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => line.toLowerCase().includes(stem))
    .filter(({ line }) => /owner|block|gate|desk|unruled|hold/i.test(line))
    .slice(0, 6);
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const all = argv.includes('--all');
  const queue = argv.includes('--queue');
  const target = argv.find((a) => !a.startsWith('--'));

  if (!existsSync(GOALS)) {
    console.error(`drain-block-check: ${GOALS} not found (run from the repo root)`);
    process.exit(2);
  }
  const leaves = collectLeaves(JSON.parse(readFileSync(GOALS, 'utf8')));

  if (all) {
    const blocked = leaves.filter((l) => l.status === 'blocked');
    console.log(`Scanned ${leaves.length} goal leaves — ${blocked.length} BLOCKED.`);
    for (const leaf of blocked) {
      console.log(`\n  BLOCKED  ${leaf.taskFile}  [${leaf.id}]`);
      console.log(`           ${leaf.blockedReason || '(no blockedReason recorded)'}`);
    }
    process.exit(blocked.length ? 1 : 0);
  }

  if (!target) {
    console.error('usage: node scripts/drain-block-check.mjs <done-move|taskfile|branch|id> [--strict]');
    console.error('       node scripts/drain-block-check.mjs --all');
    process.exit(2);
  }

  const marker = FILENAME_BLOCK_MARKERS.find((re) => re.test(target));
  const hits = findLeaves(leaves, target);
  let blockedHit = hits.find((l) => l.status === 'blocked');

  // Branch-name path. /drain step 1 works from `main..<branch>`, but branches are not registered
  // in goals.json, so a fire starting from the branch got no protection (proven: "lane/m3", the
  // exact ref s1104 merged, read UNKNOWN). Blocked leaves are few and they name their branch in
  // prose, so scan THEIR text only — narrow enough to stay false-positive-cheap.
  if (!blockedHit) {
    const token = target.trim().toLowerCase();
    if (/^[\w.-]+\/[\w.-]+$/.test(token)) {
      const wordRe = new RegExp(`(^|[^\\w/-])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w/-]|$)`, 'i');
      blockedHit = leaves.find(
        (l) => l.status === 'blocked' && wordRe.test(`${l.blockedReason || ''} ${l.title || ''}`)
      );
      if (blockedHit) hits.unshift(blockedHit);
    }
  }

  if (marker || blockedHit) {
    console.log(`\n  ⛔ BLOCKED — DO NOT DRAIN: ${target}\n`);
    if (marker) console.log(`  filename marker : ${marker} — the done-move is renamed do-not-drain`);
    if (blockedHit) {
      console.log(`  goal leaf       : ${blockedHit.id}  (${GOALS}, status="blocked")`);
      console.log(`  reason          : ${blockedHit.blockedReason || '(none recorded)'}`);
    } else {
      console.log(`  goal leaf       : none blocked — filename marker alone. Fix the leaf too.`);
    }
    const mentions = backlogMentions(target);
    if (mentions.length) {
      console.log(`\n  BACKLOG context:`);
      for (const { line, n } of mentions) console.log(`    ${BACKLOG}:${n}  ${line.trim().slice(0, 150)}`);
    }
    console.log(`\n  A block is lifted by the OWNER, never by a green gate battery or a sound`);
    console.log(`  runner report. If you believe it is stale, re-verify the leaf and say so`);
    console.log(`  in the handoff — do not merge first.\n`);
    process.exit(1);
  }

  // A CLEAR verdict must never rest on a coincidental substring. Branch names are not registered
  // in goals.json, so "lane/perf" matching an unrelated "perf-05" leaf is noise, not clearance.
  const branchShaped = /^[\w.-]+\/[\w.-]+$/.test(target.trim());
  const queueTaskFile = queue && /\.md$/i.test(target.trim());
  const leaf = queueTaskFile
    ? hits.find((l) => normalize(l.taskFile).toLowerCase() === normalize(target).toLowerCase())
    : hits[0];
  const branchFallback = branchShaped && !queueTaskFile;
  if (!leaf || branchFallback) {
    console.log(`  ? UNKNOWN — no ${branchFallback ? 'BLOCKED ' : ''}goal leaf matches "${target}".`);
    if (branchFallback) console.log(`    (branch names are not registered as leaves — check the done-move filename too)`);
    console.log(`    Goal Registration Law: every authored master registers a leaf in ${GOALS}.`);
    console.log(`    A missing leaf is a bookkeeping finding, not a clearance.`);
    process.exit(strict ? 2 : 0);
  }

  if (queue && TERMINAL_SHIPPED_STATUSES.has(leaf.status)) {
    console.log(`  ⛔ ALREADY SHIPPED — DO NOT QUEUE: ${leaf.taskFile} [${leaf.id}]`);
    console.log(`    mergeHash="${leaf.mergeHash || '(not recorded)'}"`);
    process.exit(1);
  }
  console.log(`  ✅ CLEAR — ${leaf.taskFile} [${leaf.id}] status="${leaf.status}"`);
  if (hits.length > 1) {
    console.log(`    (${hits.length} leaves matched; longest wins. Others: ${hits.slice(1).map((l) => l.id).join(', ')})`);
  }
  process.exit(0);
}

main();
