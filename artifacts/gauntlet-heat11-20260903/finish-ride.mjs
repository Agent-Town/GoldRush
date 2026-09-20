// HEAT 11 POST-RIDE COLLECTOR — operator tooling (evidence only, no strategy).
// Copies the rig's arena workspace into the evidence dir, reads its outcome/report, verifies the
// arena's tracked tree is untouched (firewall), sums CLI transcript usage for the session, and
// writes summary.json. usage: node finish-ride.mjs --arena=<dir> --rig=<opus|fable> --contract=<id> --out=<ride dir>
import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['arena', 'rig', 'contract', 'out']) if (!args[key]) throw new Error(`--${key} required`);
const workdir = join(args.arena, 'artifacts', 'heat11', args.rig, args.contract);
const meta = JSON.parse(readFileSync(join(args.out, 'ride-meta.json'), 'utf8'));

// 1. Firewall: the arena's tracked tree must be untouched (untracked artifacts/heat11/** is the rig's lawful workspace).
const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: args.arena, encoding: 'utf8' }).trim();

// 2. Copy the workspace verbatim (tapes, controllers, probes, notes).
const files = existsSync(workdir) ? readdirSync(workdir) : [];
if (files.length) cpSync(workdir, join(args.out, 'work'), { recursive: true });

// 3. Outcome + report.
let outcome = null; let report = null; let outcomeError = null;
try { outcome = JSON.parse(readFileSync(join(workdir, 'gauntlet-outcome.json'), 'utf8')); } catch (error) { outcomeError = String(error.message); }
try { report = readFileSync(join(workdir, 'gauntlet-report.md'), 'utf8'); } catch {}
const section = (name) => report?.match(new RegExp(`^## ${name}[^\n]*\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))?.[1]?.trim() ?? null;

// 4. Scored tapes present + their outcomes (the tape is the fact; the outcome file is the claim).
const tapes = files.filter((f) => /^attempt-\d+-tape\.json$/.test(f)).sort().map((f) => {
  try { const t = JSON.parse(readFileSync(join(workdir, f), 'utf8')); return { file: f, id: t.id, contract: t.contract, seed: t.seed, difficulty: t.difficulty, meta: t.meta, outcome: t.outcome, entries: t.inputLog?.entries?.length ?? null }; }
  catch (error) { return { file: f, error: String(error.message) }; }
});
const otherTapes = files.filter((f) => /\.json$/.test(f) && !/^attempt-\d+-tape\.json$/.test(f) && f !== 'gauntlet-outcome.json').map((f) => {
  try { const t = JSON.parse(readFileSync(join(workdir, f), 'utf8')); return t?.inputLog && t?.outcome ? { file: f, id: t.id, outcome: t.outcome, meta: t.meta } : null; } catch { return null; }
}).filter(Boolean);

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
  scoredTapes: tapes, otherSecuredTapes: otherTapes.filter((t) => t.outcome?.secured === true),
  report: report ? { outcome: section('Outcome'), whatTheMapAsked: section('What the map asked'), winnability: section('Winnability'), lessons: section('Lessons for my notebook') } : null,
  usage,
};
writeFileSync(join(args.out, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ rig: args.rig, contract: args.contract, wall: summary.wallClockSeconds, wallHit: summary.wallHit, rc: summary.exitCode, tracked: summary.arenaTrackedChanges, files: files.length, outcome: outcome && { secured: outcome.secured, waves: outcome.waves, gold: outcome.gold, runsSoFar: outcome.runsSoFar, scoredAttempts: outcome.scoredAttempts, tape: outcome.tape, worldModel: outcome.worldModel }, scoredTapes: tapes.map((t) => ({ file: t.file, id: t.id, secured: t.outcome?.secured, waves: t.outcome?.waves, gold: t.outcome?.gold, meta: t.meta })), otherSecured: summary.otherSecuredTapes.map((t) => t.file), reportSections: summary.report && Object.fromEntries(Object.entries(summary.report).map(([k, v]) => [k, v ? v.length : null])), usage: usage && { turns: usage.assistantTurns, toolCalls: usage.toolCalls, tokensIn: usage.tokensIn, tokensOut: usage.tokensOut } })}\n`);
