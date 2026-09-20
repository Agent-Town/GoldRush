// s1278 — append the F-1278-2 regression test to law-pointer-guard.test.mjs
import fs from 'node:fs'

const P = 'scripts/law-pointer-guard.test.mjs'
let c = fs.readFileSync(P, 'utf8')
if (c.includes('F-1278-2')) throw new Error('already applied')

const BT = String.fromCharCode(96)
const test = [
  '',
  '// s1278 (F-1278-2): law surfaces cite EACH OTHER by coordinate — ' + BT + 'scripts/fire.md' + BT + ' points at',
  '// ' + BT + '.claude/skills/drain/SKILL.md:33' + BT + ', the --workers=1 command §3.1 calls load-bearing. Until s1278',
  '// the pattern matched code extensions only, so those pointers were invisible and had to be checked',
  '// by hand (s1275 did exactly that — for the guard that exists to make hand checks unnecessary).',
  "test('MARKDOWN TARGET: a law surface citing another .md by coordinate is checked, not skipped (F-1278-2)', (t) => {",
  "  const dir = fixture(t, { law: 'The flag lives at " + BT + "docs/target.md:3" + BT + " — go LOOK.\\n', target: TARGET });",
  "  const md = ['# doc', 'intro', 'THE FLAG: --workers=1 is load-bearing', 'tail', ''].join('\\n');",
  "  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });",
  "  fs.writeFileSync(path.join(dir, 'docs', 'target.md'), md);",
  "  assert.equal(run(dir, '--update').status, 0);",
  "  assert.equal(run(dir).status, 0, 'a baselined .md pointer must pass');",
  '  // Move the cited line: an .md pointer must rot-detect exactly like a code pointer does.',
  "  const moved = md.split('\\n');",
  "  moved.splice(1, 0, 'inserted');",
  "  fs.writeFileSync(path.join(dir, 'docs', 'target.md'), moved.join('\\n'));",
  '  const r = run(dir);',
  "  assert.equal(r.status, 1, 'a .md pointer must red when its line moves');",
  '  assert.match(r.stdout, /POINTER DRIFT/);',
  '});',
  '',
].join('\n')

fs.writeFileSync(P, c + test)
console.log('appended, bytes now', fs.statSync(P).size)
