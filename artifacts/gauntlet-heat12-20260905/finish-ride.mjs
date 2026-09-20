// HEAT 12 POST-RIDE COLLECTOR — operator tooling (evidence only, no strategy).
// Copies the rig's arena workspace into the evidence dir, reads its outcome/report, verifies the
// arena's tracked tree is untouched (firewall), sums CLI transcript usage for the session, and
// writes summary.json. usage: node finish-ride.mjs --arena=<dir> --rig=<opus|fable> --contract=<id> --out=<ride dir>
//
// ADAPTED FROM HEAT 11 (cited in heat12-note.md §rig):
//  (1) F-HEAT11-2 CURE — tape discovery no longer trusts the FILENAME. Every *.json in the
//      workspace that parses as a tape (inputLog + outcome) is catalogued by its OWN id, and the
//      scored/promoted tape is whatever `gauntlet-outcome.json`.tape names, unioned with the
//      attempt-N convention. Heat 11 silently reported e7-dead-band "NOT SECURED" because the rig
//      lawfully promoted a tape called tune-2-tape.json.
//  (2) Firewall check excludes the operator's own evidence dir (artifacts/gauntlet-heat12-20260905),
//      which is committed on the heat12/opus-sweep branch inside the arena; the RIG's workspace
//      (artifacts/heat12/**) stays untracked and is checked separately.
//  (3) heat11 → heat12 workspace path.
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, join, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['arena', 'rig', 'contract', 'out']) if (!args[key]) throw new Error(`--${key} required`);
const workdir = join(args.arena, 'artifacts', 'heat12', args.rig, args.contract);
const meta = JSON.parse(readFileSync(join(args.out, 'ride-meta.json'), 'utf8'));

// 1. Firewall: the arena's tracked tree must be untouched apart from the operator's own evidence dir.
const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=no', '--', '.', ':(exclude)artifacts/gauntlet-heat12-20260905'], { cwd: args.arena, encoding: 'utf8' }).trim();

// 2. Copy the workspace verbatim (tapes, controllers, probes, notes).
const files = existsSync(workdir) ? readdirSync(workdir) : [];
if (files.length) cpSync(workdir, join(args.out, 'work'), { recursive: true });

// 3. Outcome + report.
let outcome = null; let report = null; let outcomeError = null;
try { outcome = JSON.parse(readFileSync(join(workdir, 'gauntlet-outcome.json'), 'utf8')); } catch (error) { outcomeError = String(error.message); }
try { report = readFileSync(join(workdir, 'gauntlet-report.md'), 'utf8'); } catch {}
const section = (name) => report?.match(new RegExp(`^## ${name}[^\n]*\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))?.[1]?.trim() ?? null;

// 4. EVERY tape on disk, read as JSON — the tape is the fact, its own `id` is its identity, and the
//    filename is only a label. (F-HEAT11-2.)
const readTape = (f) => {
  try {
    const t = JSON.parse(readFileSync(join(workdir, f), 'utf8'));
    if (!t?.inputLog || !t?.outcome) return null;
    return { file: f, id: t.id, contract: t.contract, seed: t.seed, difficulty: t.difficulty, meta: t.meta, outcome: t.outcome, entries: t.inputLog?.entries?.length ?? null, durationTicks: t.inputLog?.durationTicks ?? null, lastEntryTick: t.inputLog?.entries?.length ? t.inputLog.entries[t.inputLog.entries.length - 1].t : null };
  } catch (error) { return { file: f, error: String(error.message) }; }
};
const allTapes = files.filter((f) => /\.json$/.test(f) && f !== 'gauntlet-outcome.json').map(readTape).filter(Boolean);

// The rig's OWN declaration is the authority on which tape it put forward.
const promotedName = outcome?.tape ? basename(String(outcome.tape)) : null;
const isAttemptName = (f) => /^attempt-\d+-tape\.json$/.test(f);
const scoredNames = new Set(allTapes.map((t) => t.file).filter(isAttemptName));
if (promotedName) scoredNames.add(promotedName);
const tapes = allTapes.filter((t) => scoredNames.has(t.file)).sort((a, b) => a.file.localeCompare(b.file))
  .map((t) => ({ ...t, promotedByRig: t.file === promotedName, discoveredBy: t.file === promotedName ? (isAttemptName(t.file) ? 'outcome-file+filename' : 'outcome-file') : 'filename' }));
const otherTapes = allTapes.filter((t) => !scoredNames.has(t.file));

// 5. CLI transcript usage (measured, when the transcript exists): sum per-assistant-message usage for this session id.
let usage = null;
try {
  const root = join(process.env.HOME, '.claude', 'projects');
  let transcript = null;
  for (const dir of readdirSync(root)) { const p = join(root, dir, `${meta.sessionId}.jsonl`); if (existsSync(p)) { transcript = p; break; } }
  if (transcript) {
    const lines = readFileSync(transcript, 'utf8').split('\n').filter(Boolean);
    let tokensIn = 0, tokensOut = 0, cacheRead = 0, cacheWrite = 0, assistantTurns = 0, toolCalls = 0;
    for (const line of lines) {
      let m; try { m = JSON.parse(line); } catch { continue; }
      const u = m?.message?.usage;
      if (m?.type === 'assistant' && u) { assistantTurns += 1; tokensIn += u.input_tokens ?? 0; tokensOut += u.output_tokens ?? 0; cacheRead += u.cache_read_input_tokens ?? 0; cacheWrite += u.cache_creation_input_tokens ?? 0; }
      if (m?.type === 'assistant' && Array.isArray(m.message?.content)) toolCalls += m.message.content.filter((c) => c?.type === 'tool_use').length;
    }
    usage = { transcript, assistantTurns, toolCalls, tokensIn, tokensOut, cacheReadTokens: cacheRead, cacheWriteTokens: cacheWrite, note: 'tokensIn excludes cache reads/writes (reported separately); summed from the CLI session transcript, not self-reported by the rig' };
  }
} catch (error) { usage = { error: String(error.message) }; }

const summary = {
  rig: args.rig, contract: args.contract, model: meta.model, sessionId: meta.sessionId,
  startedAt: meta.startedAt, endedAt: meta.endedAt ?? null, wallClockSeconds: meta.wallClockSeconds ?? null, wallHit: meta.wallHit ?? null, exitCode: meta.exitCode ?? null, signal: meta.signal ?? null,
  setupToFirstOutputSeconds: meta.setupToFirstOutputSeconds ?? null,
  arenaTrackedChanges: status ? status.split('\n') : [],
  workspaceFiles: files,
  outcome, outcomeError,
  promotedTapeName: promotedName,
  scoredTapes: tapes, otherTapes, otherSecuredTapes: otherTapes.filter((t) => t.outcome?.secured === true),
  report: report ? { outcome: section('Outcome'), whatTheMapAsked: section('What the map asked'), winnability: section('Winnability'), lessons: section('Lessons for my notebook') } : null,
  usage,
};
writeFileSync(join(args.out, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ rig: args.rig, contract: args.contract, wall: summary.wallClockSeconds, wallHit: summary.wallHit, rc: summary.exitCode, tracked: summary.arenaTrackedChanges, files: files.length, outcome: outcome && { secured: outcome.secured, waves: outcome.waves, gold: outcome.gold, runsSoFar: outcome.runsSoFar, scoredAttempts: outcome.scoredAttempts, tape: outcome.tape, worldModel: outcome.worldModel }, scoredTapes: tapes.map((t) => ({ file: t.file, id: t.id, secured: t.outcome?.secured, waves: t.outcome?.waves, gold: t.outcome?.gold, durationTicks: t.durationTicks, lastEntryTick: t.lastEntryTick, promotedByRig: t.promotedByRig, discoveredBy: t.discoveredBy })), otherSecured: summary.otherSecuredTapes.map((t) => ({ file: t.file, id: t.id, waves: t.outcome?.waves, gold: t.outcome?.gold })), reportSections: summary.report && Object.fromEntries(Object.entries(summary.report).map(([k, v]) => [k, v ? v.length : null])), usage: usage && { turns: usage.assistantTurns, toolCalls: usage.toolCalls, tokensIn: usage.tokensIn, tokensOut: usage.tokensOut } })}\n`);
