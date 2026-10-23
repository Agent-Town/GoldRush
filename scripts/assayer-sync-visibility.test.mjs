import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
function block(file, name) {
  const source = fs.readFileSync(new URL(file, root), 'utf8');
  const match = source.match(new RegExp(`# ${name}_BEGIN[^\\n]*\\n([\\s\\S]*?)\\s*# ${name}_END`));
  assert.ok(match, `${name} production block exists`);
  return match[1];
}
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-assayer-visibility-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'bin'));
  fs.mkdirSync(path.join(dir, '.goldrush'));
  const stub = (name, body) => fs.writeFileSync(path.join(dir, 'bin', name), `#!/bin/bash\n${body}\n`, { mode: 0o755 });
  stub('rsync', 'for i in {1..12}; do echo "diagnostic-$i 192.0.2.10 2001:db8::1 ::ffff:192.0.2.11" >&2; done\nexit "$RSYNC_RC"');
  stub('ssh', 'echo called >> "$HOME/ssh-calls"\necho "remote diagnostic 192.0.2.10 [2001:db8::2]" >&2\nexit "$SSH_RC"');
  stub('osascript', 'exit 0');
  stub('date', 'if [ "$1" = +%s ]; then echo "$NOW"; else echo 2026-10-23T02:00:00Z; fi');
  const env = { ...process.env, HOME: dir, TMPDIR: dir, PATH: `${dir}/bin:${process.env.PATH}`, RSYNC_RC: '0', SSH_RC: '0', NOW: '10000', GR_DROPLET_HOST: 'root@192.0.2.10' };
  const run = (body, extra = {}) => {
    const result = spawnSync('bash', ['-uc', body], { cwd: dir, env: { ...env, ...extra }, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    return result.stdout;
  };
  const marker = path.join(dir, '.goldrush/assayer-drift');
  const sync = extra => run('note() { printf "%s\\n" "$*"; }; PUBLISHED_BUILD=abcdef12; MIRROR_FILTERS=("--filter=-s *");\n' + block('scripts/deploy.sh', 'ASSAYER_SYNC_CAPTURE'), extra);
  const healthSource = fs.readFileSync(new URL('scripts/health-watch.sh', root), 'utf8');
  const notifier = healthSource.slice(healthSource.indexOf('ts() {'), healthSource.indexOf('runner_alive()'));
  assert.match(notifier, /osascript/);
  const health = now => run('STATE="$HOME/state"; LOG="$HOME/health.log"; touch "$STATE"; : > "$LOG";\n' + notifier + block('scripts/health-watch.sh', 'ASSAYER_DRIFT_CHECK') + '\ncat "$LOG"', { NOW: String(now) });
  return { dir, marker, sync, health };
}

test('rsync failure prints only its last ten scrubbed diagnostics and records drift', t => {
  const fx = fixture(t);
  const output = fx.sync({ RSYNC_RC: '23' });
  t.diagnostic(output);
  assert.match(output, /FAILED mid-step: half=rsync rsync exit=23 step exit=23/);
  assert.doesNotMatch(output, /diagnostic-[12] /);
  assert.equal(output.split('\n').filter(l => l.includes('diagnostic-')).length, 10);
  assert.match(output, /diagnostic-12 <ip> <ip> <ip>/);
  assert.doesNotMatch(output, /\d{1,3}(?:\.\d{1,3}){3}|2001:|::ffff/);
  assert.equal(fs.readFileSync(fx.marker, 'utf8'), 'abcdef12 2026-10-23T02:00:00Z\n');
  assert.equal(fs.existsSync(path.join(fx.dir, 'ssh-calls')), false);
  assert.equal(fs.readdirSync(fx.dir).some(n => n.startsWith('gold-rush-assayer.')), false);
});

test('remote sed/restart failure identifies its half and preserves rsync exit zero', t => {
  const fx = fixture(t);
  const output = fx.sync({ SSH_RC: '255' });
  assert.match(output, /half=remote-sed\/restart rsync exit=0 step exit=255/);
  assert.match(output, /remote diagnostic <ip> \[<ip>\]/);
  assert.doesNotMatch(output, /\d{1,3}(?:\.\d{1,3}){3}|2001:/);
  assert.ok(fs.existsSync(fx.marker));
});

test('successful sync removes an earlier drift marker', t => {
  const fx = fixture(t);
  fx.sync({ RSYNC_RC: '23' });
  assert.match(fx.sync(), /ASSAYER SYNCED/);
  assert.equal(fs.existsSync(fx.marker), false);
});

test('health alerts immediately, hourly, and resets after recovery', t => {
  const fx = fixture(t);
  assert.equal(fx.health(10000), '');
  fx.sync({ RSYNC_RC: '23' });
  assert.match(fx.health(10000), /ASSAYER BEHIND:.*build abcdef12 at 2026-10-23T02:00:00Z; run bash scripts\/attended\/droplet-maintenance.sh status and the runbook sync/);
  assert.equal(fx.health(13599), '');
  assert.match(fx.health(13600), /ASSAYER BEHIND/);
  fx.sync();
  assert.equal(fx.health(13601), '');
  fx.sync({ RSYNC_RC: '23' });
  assert.match(fx.health(13602), /ASSAYER BEHIND/);
});
