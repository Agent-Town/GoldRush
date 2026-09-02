import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const LABELS = ['com.goldrush.dashboard', 'com.goldrush.health', 'com.goldrush.fire'];

function run(loaded, passes = 1) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-health-agents-'));
  try {
    fs.mkdirSync(path.join(root, 'logs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    fs.copyFileSync(path.join(ROOT, 'scripts/runner-processes.sh'), path.join(root, 'scripts/runner-processes.sh'));
    const source = fs.readFileSync(path.join(ROOT, 'scripts/health-watch.sh'), 'utf8');
    const watcher = source.replace(/^ROOT=.*$/m, `ROOT=${JSON.stringify(root)}`);
    assert.notEqual(watcher, source, 'fixture ROOT rewrite failed');
    fs.writeFileSync(path.join(root, 'scripts/health-watch.sh'), watcher);

    const bin = path.join(root, 'bin');
    fs.mkdirSync(bin);
    const stub = (name, body) => {
      const target = path.join(bin, name);
      fs.writeFileSync(target, `#!/bin/bash\n${body}\n`);
      fs.chmodSync(target, 0o755);
    };
    stub('launchctl', loaded.map((label) => `echo '- 0 ${label}'`).join('\n'));
    stub('curl', 'echo -n 200');
    stub('ps', "echo '123 bash'");
    stub('lsof', "echo 'n/tmp/lane-runner-v3.sh'");
    stub('pgrep', 'exit 1');
    stub('osascript', 'exit 0');

    for (let pass = 0; pass < passes; pass += 1) {
      const result = spawnSync('bash', [path.join(root, 'scripts/health-watch.sh')], {
        encoding: 'utf8',
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      });
      assert.equal(result.status, 0, result.stderr);
    }
    return {
      log: fs.readFileSync(path.join(root, 'logs/health.log'), 'utf8'),
      state: fs.readFileSync(path.join(root, 'logs/.health-state'), 'utf8'),
    };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('loaded launch agents keep the pass green', () => {
  const { log } = run(LABELS);
  assert.match(log, /\[health\].* ok .*agents=com\.goldrush\.dashboard:LOADED,com\.goldrush\.health:LOADED,com\.goldrush\.fire:LOADED /);
  assert.doesNotMatch(log, /AGENT MISSING:/);
});

test('a missing launch agent fails the pass and records the exact remedy', () => {
  const { log, state } = run([LABELS[0], LABELS[2]], 2);
  const failed = log.split('\n').filter((line) => line.includes(' FAIL '));
  assert.equal(failed.length, 2, 'every missing-agent pass must fail');
  assert.match(failed[0], /com\.goldrush\.health:MISSING.* AGENT MISSING: com\.goldrush\.health/);
  assert.equal(log.split('\n').filter((line) => line.includes(' ALERT: Launch agent(s) missing:')).length, 1);
  assert.match(state, /^agentmissing=com\.goldrush\.health$/m);
  assert.match(
    state,
    /^agentremedy=com\.goldrush\.health: launchctl bootstrap gui\/\d+ ~\/Library\/LaunchAgents\/com\.goldrush\.health\.plist$/m,
  );
});
