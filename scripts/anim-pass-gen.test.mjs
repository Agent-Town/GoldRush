import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Execute the wrapper itself with a fake CLI and an isolated generated-image tree.
// Never launch Codex or change HOME: this check cannot generate or collect real art.
const source = fs.readFileSync(new URL('./anim-pass-gen.mjs', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '');
const session = '11111111-2222-3333-4444-555555555555';
const neighbour = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-gen-'));
const cases = [
  { name: 'own images only', banner: session, code: 0, own: true, ok: true },
  { name: 'missing banner', code: 0, own: true },
  { name: 'malformed banner', banner: '-'.repeat(36), code: 0, own: true },
  { name: 'ambiguous banner', banner: `${session}\nsession id: ${neighbour}`, code: 0, own: true },
  { name: 'nonzero exit', banner: session, code: 1, own: true },
  { name: 'terminated', banner: session, code: null, own: true },
  { name: 'missing own directory', banner: session, code: 0 },
  { name: 'no own images', banner: session, code: 0, empty: true },
];
try {
  for (const [index, test] of cases.entries()) {
    const dir = path.join(root, String(index));
    fs.mkdirSync(dir);
    const prompt = path.join(dir, 'prompt.txt'), out = path.join(dir, 'result.png');
    fs.writeFileSync(prompt, 'Fixture prompt with literal $() and `ticks`.');
    fs.writeFileSync(out, 'previous approved art');
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.stdin = { end: text => assert.equal(text, fs.readFileSync(prompt, 'utf8')) };
    const context = {
      fs, path, os: { homedir: () => dir }, console: { log() {}, error() {} },
      process: { argv: ['node', 'anim-pass-gen.mjs', '--prompt', prompt, '--out', out],
        exit: code => { throw Object.assign(new Error('exit'), { exitCode: code }); } },
      spawn: (command, args) => {
        assert.equal(command, 'codex');
        assert.deepEqual(Array.from(args), ['exec', '-m', 'gpt-5.6-sol', '--skip-git-repo-check', '-s', 'read-only']);
        return child;
      },
      setTimeout: () => 1, clearTimeout() {},
    };
    vm.runInNewContext(source, context, { filename: 'anim-pass-gen.mjs' });
    const generated = path.join(dir, '.codex', 'generated_images');
    const put = (relative, bytes) => {
      const file = path.join(generated, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, bytes);
    };
    put(`${neighbour}/new.png`, 'neighbour art');
    put(`${session}-other/new.png`, 'substring directory art');
    put(`${neighbour}/${session}.png`, 'substring filename art');
    if (test.own || test.empty) {
      put(`${session}/notes.txt`, 'not an image');
      fs.symlinkSync(path.join(generated, neighbour, 'new.png'), path.join(generated, session, 'link.png'));
    }
    if (test.own) { put(`${session}/call_b.png`, 'own second'); put(`${session}/call_a.png`, 'own first'); }
    child.stderr.emit('data', test.banner ? `session id: ${test.banner}\n` : 'No banner\n');
    let exitCode = 0;
    try { child.emit('close', test.code); } catch (error) {
      if (error.exitCode === undefined) throw error;
      exitCode = error.exitCode;
    }
    assert.equal(exitCode, test.ok ? 0 : 1, test.name);
    assert.equal(fs.readFileSync(out, 'utf8'), test.ok ? 'own first' : 'previous approved art', test.name);
    const alt = path.join(dir, 'result-alt1.png');
    assert.equal(fs.existsSync(alt), !!test.ok, test.name);
    if (test.ok) assert.equal(fs.readFileSync(alt, 'utf8'), 'own second');
    assert.ok(fs.existsSync(path.join(dir, 'result.codex.log')), 'retain failure diagnostics');
  }
  console.log(`Generation provenance: ${cases.length} cases passed; no real CLI or image generation.`);
  // Exercise prompt output for the actual cast, without overwriting banked prompts.
  const castFile = new URL('../reviews/eight-winds/cast.json', import.meta.url);
  const cast = JSON.parse(fs.readFileSync(castFile, 'utf8')).cast;
  const promptDir = path.join(root, 'reviews/eight-winds');
  fs.mkdirSync(promptDir, { recursive: true });
  fs.copyFileSync(castFile, path.join(promptDir, 'cast.json'));
  let prompts = 0;
  for (const [name, actor] of Object.entries(cast)) for (const wind of ['sw', 'se', 'nw', 'ne']) {
    execFileSync(process.execPath, [fileURLToPath(new URL('./anim-pass-prompt.mjs', import.meta.url)), name, wind], { cwd: root });
    const prompt = fs.readFileSync(path.join(promptDir, 'prompts', `${name}-${wind}.txt`), 'utf8');
    if (actor.gait === 'hover') assert.match(prompt, /complete hover-bob cycle/);
    else {
      const cycle = prompt.split('\n').find(line => line.startsWith('THE IMAGE'));
      assert.match(cycle, /contact \(left foot forward\).+contact \(right foot forward\)/, name);
      if (actor.frames === 4) assert.match(cycle, /left foot planted, right foot swinging forward.*right foot planted, left foot swinging forward/);
      else assert.match(cycle, /down, passing, up, contact \(right foot forward\), down, passing, up/);
    }
    prompts++;
  }
  console.log(`Factory prompts: ${prompts} cast/direction cases passed; complete walking cycles and companion hover retained.`);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
