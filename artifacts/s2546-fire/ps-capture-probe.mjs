import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const node = process.execPath;
const dir = mkdtempSync(join(tmpdir(), 's2546-capture-'));
const testSrc = readFileSync('scripts/node-guards-contention.test.mjs', 'utf8');
const harnessSrc = readFileSync('scripts/run-node-guards.mjs', 'utf8');
const wait = testSrc.slice(testSrc.indexOf('async function waitForQuietBoard()'), testSrc.indexOf('async function waitForReady('));
const stamp = harnessSrc.slice(harnessSrc.indexOf('function contentionStamp()'), harnessSrc.indexOf('const concurrency ='));
assert.ok(wait.includes("spawnSync('ps'"));
assert.ok(stamp.includes("spawnSync('ps'"));
const marker = 'encoding: \'utf8\'';
const result = [];
try {
  writeFileSync(join(dir, 'pgrep'), `#!${node}\nprocess.stdout.write('1\\n2\\n');\n`);
  writeFileSync(join(dir, 'ps'), `#!${node}\nconst long = process.env.PROBE_LONG === '1' ? 'x'.repeat(1200000) : 'short';\nconst commands = ['observer '+long, 'node /example/scripts/run-node-guards.mjs fixture.test.mjs'];\nconst wantsPids = process.argv.includes('pid=,ppid=,command=');\nprocess.stdout.write(commands.map((s,i)=>wantsPids?(i+1)+' 0 '+s:s).join('\\n')+'\\n');\n`);
  for (const n of ['pgrep','ps']) chmodSync(join(dir,n),0o755);
  for (const mode of ['wait','stamp']) {
    for (const large of [false,true]) {
      for (const fixed of [false,true]) {
        let fn = mode === 'wait' ? wait : stamp;
        // Patch only ps capture, preserving the pgrep options and all decisions.
        const site = fn.indexOf("spawnSync('ps'");
        const at = fn.indexOf(marker,site); assert.ok(at>site);
        if(fixed) fn=fn.slice(0,at)+fn.slice(at).replace(marker, marker+', maxBuffer: 64 << 20');
        const script = join(dir, `${mode}-${large}-${fixed}.mjs`);
        const invocation = mode === 'wait'
          ? "try { await waitForQuietBoard(); console.log('QUIET'); } catch(e) { console.log(e.message); process.exitCode=1; }"
          : "console.log(contentionStamp() ?? 'NO_STAMP');";
        // wait's busy control uses observers only; stamp proves true sibling counting as well.
        const importLine = mode === 'wait'
          ? "const runsNodeGuardsBattery = () => false;"
          : `import { runsNodeGuardsBattery } from ${JSON.stringify(pathToFileURL(join(root,'scripts/node-guards-concurrency.mjs')).href)};`;
        writeFileSync(script, `import assert from 'node:assert/strict';\nimport { spawnSync } from 'node:child_process';\n${importLine}\n${fn}\n${invocation}\n`);
        const r=spawnSync(node,[script],{encoding:'utf8',env:{...process.env,PATH:dir+':'+process.env.PATH,PROBE_LONG:large?'1':'0'},timeout:15000});
        assert.equal(r.error,undefined); assert.equal(r.stderr,'');
        result.push({mode,large,fixed,status:r.status,stdout:r.stdout.trim()});
      }
    }
  }
  const row=(mode,large,fixed)=>result.find(r=>r.mode===mode&&r.large===large&&r.fixed===fixed);
  assert.equal(row('wait',false,false).stdout,'QUIET');
  assert.match(row('wait',true,false).stdout,/spawnSync ps ENOBUFS/);
  assert.equal(row('wait',true,true).stdout,'QUIET');
  assert.equal(row('stamp',false,false).stdout,'CONTENDED — 2 concurrent batteries');
  assert.equal(row('stamp',true,false).stdout,'NO_STAMP');
  assert.equal(row('stamp',true,true).stdout,'CONTENDED — 2 concurrent batteries');
  const record={kind:'manufactured process-list capture; no real process census or battery launched',node,bytesOfLongArgument:1200000,results:result,note:'The wait arm fixes classification to false to isolate capture; it is not evidence about quiet-board classification. The stamp arm uses the repository classifier and a true sibling row.'};
  writeFileSync('artifacts/s2546-fire/ps-capture-probe.json',JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify(record,null,2));
} finally { rmSync(dir,{recursive:true,force:true}); }
