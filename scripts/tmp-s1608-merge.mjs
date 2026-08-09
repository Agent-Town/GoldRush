// s1608 — land f1607-1 on main. ONE act: merge AND commit together (F-1589-5 — a merge
// left staged on main was swept into an unrelated concurrent commit 90 seconds later).
import { execFileSync } from 'node:child_process'
const ROOT = '/Users/robin/Claude/Projects/Gold Rush'
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8', maxBuffer: 64e6 })

const msg = `f1607-1: the Hill Mine railcar dies sooner (F-1493-3, owner "Tune the fight shorter")

Baron hpScale 30 -> 12.5 in the e2-hill-mine twist block ONLY. Measure-first:
destruction wave 16 -> 13, arrival-to-destruction 141.67s -> 35.27s, component
damage share unchanged (30/41.67/28.33), escorts 6/6 unchanged. Named cause: the
global hpScale dominated (absorbed component HP 8374.16 -> 3489.23); 12.5 was the
largest tested value clearing the first rail pass (13 survived to wave 14, 86.97s).

Gated on the MERGED tree in a detached worktree (fire.md 3.0b), gate-s1608:
tsc clean; build green 1.07s; e2-hill-mine 10 passed / 2 failed / 2 skipped;
adjacents e2-enemies+e2-rail-entity+e2-arsenal 19 passed / 4 failed / 1 skipped;
test:node-guards rc=0 in 330.3s run ALONE (F-1460-1 - contract data is behaviour
the sim replays). ALL SIX REDS CONTROL-CONFIRMED PRE-EXISTING: same tree, same
harness, only the contract reverted to main reproduced the identical failing
MEMBERS (not merely matching counts) in both suites.

Scope firewall verified on the merged tree: main carries 3 "hpScale": 30 and the
merged tree carries 2 - Trestle Run (:418) and The Incline (:810) untouched, as
the owner ruled about Hill Mine only.`

console.log(git('merge', '--no-ff', 'lane/a', '-m', msg))
console.log('--- head ---')
console.log(git('log', '-1', '--format=%H %s'))
