import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const positiveControlPassed = args.includes('--positive-control-passed');
const [input = 'logs/suite-red-inventory-raw.json', output = 'logs/suite-red-inventory.md'] =
  args.filter((arg) => !arg.startsWith('--'));
const report = JSON.parse(fs.readFileSync(input, 'utf8'));
const recordedRoot = report.config?.rootDir;
const recordedRootIsE2e = recordedRoot && path.basename(recordedRoot) === 'e2e';
const runRoot = recordedRoot
  ? path.resolve(recordedRoot, recordedRootIsE2e ? '..' : '.')
  : ROOT;
const runTreePresent = recordedRoot ? fs.existsSync(recordedRoot) : true;
const projects = new Set(['desktop-chrome', 'mobile-chrome']);
const executions = [];
const otherExecutions = [];

function walk(suites, parents = []) {
  for (const suite of suites ?? []) {
    const titles = suite.title && !suite.title.endsWith('.spec.ts') ? [...parents, suite.title] : parents;
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const result = test.results?.at(-1);
        if (!result) continue;
        const execution = {
          file: relative(spec.file ?? suite.file),
          title: [...titles, spec.title].filter(Boolean).join(' › '),
          project: test.projectName,
          declarationLine: spec.line,
          outcome: test.status,
          expectedStatus: test.expectedStatus ?? 'passed',
          status: result.status,
          isFailure: isFailure(test, result),
          duration: result.duration ?? 0,
          error: mergeError(result),
        };
        (projects.has(test.projectName) ? executions : otherExecutions).push(execution);
      }
    }
    walk(suite.suites, titles);
  }
}

function isFailure(test, result) {
  if (test.status) return test.status === 'unexpected';
  return result.status !== 'skipped' && result.status !== (test.expectedStatus ?? 'passed');
}

function mergeError(result) {
  const raw = result.error ?? {};
  const formatted = result.errors?.[0] ?? {};
  return {
    ...raw,
    ...formatted,
    stack: raw.stack ?? formatted.stack ?? formatted.message,
  };
}

function relative(file) {
  if (!file) return 'unknown';
  if (path.isAbsolute(file)) return path.relative(runRoot, file).replaceAll(path.sep, '/');
  if (recordedRoot) {
    const normalized = file.replaceAll(path.sep, '/');
    return recordedRootIsE2e && !normalized.startsWith('e2e/') ? `e2e/${normalized}` : normalized;
  }
  if (fs.existsSync(path.join(ROOT, file))) return file.replaceAll(path.sep, '/');
  const e2eFile = path.join('e2e', file);
  return (fs.existsSync(path.join(ROOT, e2eFile)) ? e2eFile : file).replaceAll(path.sep, '/');
}

function failed(execution) {
  return execution.isFailure;
}

function passed(execution) {
  if (!execution) return false;
  if (execution.outcome) return execution.outcome === 'expected';
  return execution.status === execution.expectedStatus;
}

function clean(text = '') {
  return text.replace(/\u001b\[[0-9;]*m/g, '').trim();
}

function stackLocations(execution) {
  return clean(execution.error?.stack)
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/(?:\(|\bat\s+)(.+?\.spec\.ts):(\d+):\d+\)?$/);
      return match ? [{ file: relative(match[1]), line: Number(match[2]) }] : [];
    });
}

function errorLocation(execution) {
  const location = execution.error?.location;
  if (location?.line) return `${relative(location.file ?? execution.file)}:${location.line}`;
  const frame = stackLocations(execution)[0];
  return frame ? `${frame.file}:${frame.line}` : `${execution.file}:${execution.declarationLine ?? '?'}`;
}

function firstErrorLine(execution) {
  if (failed(execution) && execution.status === 'passed') return 'Expected failure passed unexpectedly';
  return clean(execution.error?.message ?? execution.error?.value ?? execution.status)
    .split(/\r?\n/)
    .find(Boolean) ?? execution.status;
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

function duration(ms) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function testBody(execution, failureLocation) {
  const sourcePath = path.join(runRoot, execution.file);
  if (recordedRoot && (!runTreePresent || !fs.existsSync(sourcePath))) return undefined;
  const source = fs.readFileSync(sourcePath, 'utf8');
  const sourceFile = ts.createSourceFile(execution.file, source, ts.ScriptTarget.Latest, true);
  let best;
  function visit(node) {
    if (ts.isCallExpression(node) && isTestCall(node.expression)) {
      const body = node.arguments.find((argument) =>
        (ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)) && ts.isBlock(argument.body)
      )?.body;
      if (body) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
        if (line === execution.declarationLine) best = body;
      }
    }
    if (!best) ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  if (!best) return undefined;
  const open = sourceFile.getLineAndCharacterOfPosition(best.getStart(sourceFile)).line + 1;
  const close = sourceFile.getLineAndCharacterOfPosition(best.getEnd()).line + 1;
  const total = Math.max(1, close - open - 1);
  const direct = failureLocation.match(/^(.*):(\d+)$/);
  const directLine = direct && direct[1] === execution.file ? Number(direct[2]) : undefined;
  const stackLines = stackLocations(execution)
    .filter(({ file }) => file === execution.file)
    .map(({ line }) => line)
    .filter((line) => line > open && line < close);
  const bodyLine = directLine && directLine > open && directLine < close ? directLine : stackLines[0];
  if (!bodyLine) return { total, open, close };
  const offset = bodyLine - open;
  return { offset, total, percent: (offset / total) * 100, open, close };
}

function isTestCall(expression) {
  if (ts.isIdentifier(expression)) return expression.text === 'test';
  return ts.isPropertyAccessExpression(expression)
    && ts.isIdentifier(expression.expression)
    && expression.expression.text === 'test'
    && expression.name.text !== 'describe';
}

function failureKind(execution) {
  if (execution.status === 'timedOut') return 'TIMEOUT';
  const message = `${firstErrorLine(execution)} ${execution.error?.stack ?? ''}`;
  return /page crashed|browser.*(?:closed|crash)|target (?:page|context|browser).*closed/i.test(message)
    ? 'CRASH'
    : 'ASSERTION';
}

function countRawFailures(suites) {
  let count = 0;
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const result = test.results?.at(-1);
        if (result && isFailure(test, result)) count += 1;
      }
    }
    count += countRawFailures(suite.suites);
  }
  return count;
}

walk(report.suites);

const byTest = new Map();
for (const execution of executions) {
  const key = `${execution.file}\0${execution.title}`;
  const pair = byTest.get(key) ?? new Map();
  pair.set(execution.project, execution);
  byTest.set(key, pair);
}

for (const pair of byTest.values()) {
  const desktop = pair.get('desktop-chrome');
  const mobile = pair.get('mobile-chrome');
  const desktopFailed = desktop && failed(desktop);
  const mobileFailed = mobile && failed(mobile);
  const bucket = desktopFailed && mobileFailed ? 'BOTH'
    : desktopFailed && passed(mobile) ? 'DESKTOP-ONLY'
      : mobileFailed && passed(desktop) ? 'MOBILE-ONLY'
        : desktopFailed || mobileFailed ? 'INCOMPLETE'
          : undefined;
  for (const execution of pair.values()) execution.bucket = bucket;
}

const failures = executions.filter(failed);
const otherFailures = otherExecutions.filter(failed);
const rawFailureCount = countRawFailures(report.suites);
const bucketCounts = { BOTH: 0, 'MOBILE-ONLY': 0, 'DESKTOP-ONLY': 0 };
for (const pair of byTest.values()) {
  const bucket = [...pair.values()][0].bucket;
  if (bucket in bucketCounts) bucketCounts[bucket] += 1;
}
const incompleteCount = [...byTest.values()]
  .filter((pair) => [...pair.values()][0].bucket === 'INCOMPLETE')
  .length;

const masking = [];
for (const pair of byTest.values()) {
  const values = [...pair.values()];
  if (values[0].bucket !== 'BOTH') continue;
  const ratios = values.map((execution) => {
    const location = errorLocation(execution);
    return { execution, location, body: testBody(execution, location) };
  });
  const measured = ratios.flatMap(({ body }) => body?.percent === undefined ? [] : [body.percent]);
  masking.push({ values, ratios, risk: measured.length ? Math.min(...measured) : undefined });
}
masking.sort((a, b) =>
  (a.risk === undefined) - (b.risk === undefined)
  || (a.risk ?? 0) - (b.risk ?? 0)
  || a.values[0].title.localeCompare(b.values[0].title)
);
const rankedMaskingCount = masking.filter(({ risk }) => risk !== undefined).length;
const resolvedBodyCount = masking
  .flatMap(({ ratios }) => ratios)
  .filter(({ body }) => body !== undefined)
  .length;
const totalBodyCount = masking.reduce((total, { ratios }) => total + ratios.length, 0);

const targetFailureRows = failures
  .sort((a, b) => a.file.localeCompare(b.file) || a.title.localeCompare(b.title) || a.project.localeCompare(b.project))
  .map((execution) => `| ${escapeCell(execution.file)} | ${escapeCell(execution.title)} | ${execution.project} | ${escapeCell(errorLocation(execution))} | ${escapeCell(firstErrorLine(execution))} | ${duration(execution.duration)} | ${execution.bucket} |`);
const otherFailureRows = otherFailures
  .map((execution) => `| ${escapeCell(execution.file)} | ${escapeCell(execution.title)} | ${execution.project} | ${escapeCell(errorLocation(execution))} | ${escapeCell(firstErrorLine(execution))} | ${duration(execution.duration)} |`);
const emittedFailureRowCount = targetFailureRows.length + otherFailureRows.length;
if (rawFailureCount !== emittedFailureRowCount) {
  throw new Error(`Raw failure count ${rawFailureCount} does not match emitted rows ${emittedFailureRowCount}`);
}

const lines = [
  '# Suite Red Inventory',
  '',
  `- Total tests run: **${executions.length}**`,
  `- Total passed: **${executions.filter(passed).length}**`,
  `- Total failed: **${failures.length}**`,
  `- BOTH: **${bucketCounts.BOTH}**`,
  `- MOBILE-ONLY: **${bucketCounts['MOBILE-ONLY']}**`,
  `- DESKTOP-ONLY: **${bucketCounts['DESKTOP-ONLY']}**`,
  `- Harness: configured workers **${report.config?.workers ?? 'unrecorded'}**; actual workers **${report.config?.metadata?.actualWorkers ?? 'unrecorded'}**; fully parallel **${report.config?.fullyParallel ?? 'unrecorded'}**; shard **${report.config?.shard === undefined ? 'unrecorded' : JSON.stringify(report.config.shard)}**; Playwright **${report.config?.version ?? 'unrecorded'}**`,
  `- Run tree: **${recordedRoot ?? 'unrecorded'}**; status **${recordedRoot && !runTreePresent ? 'unavailable' : 'present'}**; resolved test bodies **${resolvedBodyCount}/${totalBodyCount}**`,
  '',
  '_Bucket sizes count logical tests; totals count desktop/mobile project executions._',
  `_The exact command also ran ${otherExecutions.length} configured non-target project cases; they are reported separately._`,
  incompleteCount
    ? `_Classification incomplete for ${incompleteCount} logical test${incompleteCount === 1 ? '' : 's'} because the opposite project was skipped or missing; these are listed separately instead of being called passes._`
    : '_Every target failure has a completed opposite-project result._',
  '',
  `Reduction check: **${rawFailureCount}** failing project results in raw JSON; **${emittedFailureRowCount}** rows across the target and other-project failure tables.`,
  positiveControlPassed
    ? 'Positive control: **PASSED** — one synthetic mobile failure produced one MOBILE-ONLY row with its injected error marker.'
    : 'Positive control: **NOT RECORDED** — rerun with `--positive-control-passed` only after verifying a synthetic failing raw report.',
  '',
  '## Failing tests',
  '',
  '| Spec file | Test title | Project | Failing file:line | First error line | Duration | Bucket |',
  '|---|---|---|---|---|---:|---|',
  ...targetFailureRows,
  '',
  '## Other configured projects',
  '',
  ...(otherFailures.length
    ? [
        '| Spec file | Test title | Project | Failing file:line | First error line | Duration |',
        '|---|---|---|---|---|---:|',
        ...otherFailureRows,
      ]
    : ['None.']),
  '',
  '## Incomplete comparisons',
  '',
  ...(incompleteCount
    ? [
        '| Spec file | Test title | Failed project | Opposite-project status |',
        '|---|---|---|---|',
        ...[...byTest.values()]
          .filter((pair) => [...pair.values()][0].bucket === 'INCOMPLETE')
          .map((pair) => {
            const failedExecution = [...pair.values()].find(failed);
            const oppositeProject = failedExecution.project === 'desktop-chrome' ? 'mobile-chrome' : 'desktop-chrome';
            return `| ${escapeCell(failedExecution.file)} | ${escapeCell(failedExecution.title)} | ${failedExecution.project} | ${pair.get(oppositeProject)?.status ?? 'missing'} |`;
          }),
      ]
    : ['None.']),
  '',
  '## Mobile-only failures',
  '',
  '| Spec file | Test title | Failing file:line | First error line | Duration |',
  '|---|---|---|---|---:|',
  ...failures
    .filter(({ bucket }) => bucket === 'MOBILE-ONLY')
    .sort((a, b) => a.file.localeCompare(b.file) || a.title.localeCompare(b.title))
    .map((execution) => `| ${escapeCell(execution.file)} | ${escapeCell(execution.title)} | ${escapeCell(errorLocation(execution))} | ${escapeCell(firstErrorLine(execution))} | ${duration(execution.duration)} |`),
  '',
  '## Masking candidates',
  '',
  ...(rankedMaskingCount
    ? [
        'Ranked by the earliest failing line within the test body. Lower ratios leave more of the test unexercised.',
        `${rankedMaskingCount} of ${masking.length} rows ranked; ${masking.length - rankedMaskingCount} unresolved rows are marked — and listed after them.`,
      ]
    : [`No masking candidates could be ranked; all ${masking.length} ${masking.length === 1 ? 'row is' : 'rows are'} unresolved and marked —.`]),
  '',
  '| Rank | Spec file | Test title | Failing-line / body-lines ratio |',
  '|---:|---|---|---|',
  ...masking.map(({ values, ratios }, index) => {
    const ratio = ratios.map(({ execution, location, body }) =>
      body
        ? body.offset
          ? `${execution.project}: ${location} — ${body.offset}/${body.total} (${body.percent.toFixed(1)}%)`
          : `${execution.project}: ${location} — ?/${body.total} (callsite outside body)`
        : `${execution.project}: ${location} — body unavailable`
    ).join('<br>');
    return `| ${index < rankedMaskingCount ? index + 1 : '—'} | ${escapeCell(values[0].file)} | ${escapeCell(values[0].title)} | ${ratio} |`;
  }),
  '',
  '## Crashes and timeouts',
  '',
];

const abnormal = failures.filter((execution) => failureKind(execution) !== 'ASSERTION');
if (abnormal.length) {
  lines.push(
    '| Spec file | Test title | Project | Kind | Failing file:line | First error line |',
    '|---|---|---|---|---|---|',
    ...abnormal.map((execution) => `| ${escapeCell(execution.file)} | ${escapeCell(execution.title)} | ${execution.project} | ${failureKind(execution)} | ${escapeCell(errorLocation(execution))} | ${escapeCell(firstErrorLine(execution))} |`),
  );
} else {
  lines.push('None.');
}

fs.writeFileSync(output, `${lines.join('\n')}\n`);
