import fs from 'fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const lockLine = lines[0]; // s185 ACTIVE line-1
const lockBullet = '- **s185 lock (line-1 archive):** ' + lockLine;

const handoff = [
'Last updated: 2026-07-08T01:58:00Z s185 handoff, lock CLEARED — **NO DRAIN (attended HOT on main).** ',
'Ground-truthed live: attended committed **056 build-menu** `f792e10` @08:53:38+0700 (~49s before lock) + a **live `npm run dev` :5231** (env `CLAUDE_EFFORT=max` = attended) against the dirty main tree + uncommitted attended src `src/ui/BuildButton.ts`(mtime 08:54:43)/`src/vite-env.d.ts`(08:55:06) = 056 follow-up hand-work, matches NO done-move ⇒ **two-writer STOP for drains** (drain needs clean main; §7.6 serialize). [[attended-idle-can-flip-live-mid-fire]]. HEAD `f792e10` stable. ',
'**BOARD DELTA vs s184 (verified via `git log main..<branch>` + `merge-base --is-ancestor`):** ',
'(1) **lane/m3 save-visibility MERGED** — `721c6bc` + attended reland `61398fd` both ancestors of main ⇒ s184 priority C is DONE, RETIRED (Ghost-Line guard). ',
'(2) **lane/perf now 2-ahead** — `b8ea870` water-depth + `734f269` stamp-site-read (surveyed-claim); s184 lane-d codex pid53072 has EXITED (only lane-b 054 pid39243 live now) ⇒ lane/perf is FULLY drainable-when-quiet, serial oldest-first. ',
'(3) **lane/polish unchanged 2-ahead** — `5642537` contract-briefings (00:16Z, OLDEST) → `66bb9f4` world-info-notes (world-info-notes overwrites `ui.announcement` but fix-025/`fa9e289` durable-DOM poll landed ⇒ gate-safe). ',
'**PILE = 4 undrained commits** across lane/polish(2)+lane/perf(2) ⇒ next quiet fire enters **PILE MODE** (budget 5 drains / ~50 min). ',
'**BOARD:** lane-b LIVE `054-baron-epic` pid39243 (queue `055`/`057`/`town-t4` = attended-authored, leave); lane-a idle+EMPTY (**PIPELINE-DRY: E2 science-socket owner-blocked**, s178); lane-c idle+EMPTY (**do NOT refill** — maps to lane/polish 2 undrained = Reset Massacre); lane-d idle+EMPTY (**do NOT refill** — maps to lane/perf 2 undrained). main queue EMPTY. art queue EMPTY. Assayer pending EMPTY. (stale `tasks/running/20260705-212757-lane-c-activations-assay-office.md` from Jul-5 sits orphaned — benign, ignored.) `tasks/CODEX-WALL` present but STALE (line-1="WALL LIFTED" s142 — ignore). ',
'**gt-04**: still DEFER (`rc1 gt-04-sightlines` = OAuth auth-fail not credit-wall; a re-queue safe-dupe-NOOPs until lane/perf drains). **ss-02-beat-table**(lane-c→lane/polish): frozen until lane/polish drains. ',
'**NEXT FIRE (priority):** A. Moment main quiet (attended idle: HEAD stable AND no uncommitted attended src AND no live `npm run dev`/`codex review`) → **PILE MODE, DRAIN oldest-first serial, full battery + review file each:** contract-briefings `5642537` → world-info-notes `66bb9f4` (lane/polish) → water-depth `b8ea870` → stamp-site-read `734f269` (lane/perf). B. After lane/polish drains → lane-c refillable + `rc1 ss-02-beat-table` re-queueable. C. After lane/perf drains → gt-04 re-queueable. D. Drain lane-b `054-baron-epic` once it done-moves AND its codex EXITS (gate-contamination law). E. Robin owes (nag, don’t block): **e2-science-socket design fork** (lane-a E2 ③ unblocker, s178); turret-feel + water-feel playtests; Mac full-regression; favicon 16px. ',
'NOTE: attended’s uncommitted src + `artifacts/*.png` + e2-rail JSONs + `scripts/_s*` scratch + `playwright.s*.config.ts` are attended’s — leave them all.'
].join('');

lines[0] = handoff;
lines.splice(1, 0, lockBullet);
fs.writeFileSync(p, lines.join('\n'));
console.log('s185 handoff written; lock line-1 archived');
