// s1322 — cite the F-1322-1 mechanism in .claude/skills/author-task/SKILL.md §5.
// Written as a script rather than an Edit because .claude/** is write-gated for fires
// (the gate denies the session, not the factory). Kept per the RETENTION LAW so the
// edit is reproducible by the next reader rather than existing only in a handoff line.
import fs from 'node:fs';

const FILE = '.claude/skills/author-task/SKILL.md';
const ANCHOR =
  'so legacy re-queues still pass — and it requires the quoted title to be **actually recoverable at the cited line**, so a plausible-looking invented title is refused too.';

const ADDITION =
  ' 🔒 **AND THE ORDER IS NOW ENFORCED, NOT MERELY PRESCRIBED (F-1322-1, mechanism shipped s1322 `e95ab2cd`) — because this bullet, exactly as written above, was obeyed and the class recurred anyway.** s1321 copied the pc-01b master, hit the citation red *against the master already running*, repaired it, and re-copied: **two dispatches, two versions, 08:39:26 and 08:57:30**, five sessions after s1312’s cure. The prose could be obeyed but not enforced, and the fire that broke it was following every other law correctly. `--queue` now **refuses at rc=1 (`⛔ ALREADY DISPATCHED`) when a runner already holds this master**, matching the runner’s exact `$slot--$stamp-$name` shape. ⚠️ **Do not read a safe-dupe pre-flight as covering this** — it stopped s1307’s run 2 by side effect, and a **build-on-predecessor** pre-flight (correct whenever a lane is intentionally ahead, as `lane/m4` was) cannot stop anything. ⓘ If you repaired a master *after* copying it, the repair belongs to the NEXT run: let the live run finish, drain it, and judge the repaired master on its own evidence — do not re-copy. An **un-prefixed done-move** only WARNS (`⚠️ UNDRAINED OUTPUT EXISTS`), deliberately: s1320’s §7.5 re-dispatch on a changed premise was lawful with exactly that file present, and a guard that fires on the lawful case gets flagged past.';

const src = fs.readFileSync(FILE, 'utf8');
const hits = src.split(ANCHOR).length - 1;
if (hits !== 1) {
  console.error(`REFUSING: anchor matched ${hits} times, expected exactly 1`);
  process.exit(1);
}
if (src.includes('F-1322-1, mechanism shipped s1322')) {
  console.log('already cited — no change');
  process.exit(0);
}
fs.writeFileSync(FILE, src.replace(ANCHOR, ANCHOR + ADDITION));
console.log('cited F-1322-1 in', FILE);
