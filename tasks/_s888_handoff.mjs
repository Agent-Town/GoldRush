import fs from 'node:fs';
const p = 'STATUS.md';
const s = fs.readFileSync(p, 'utf8');
const nl = s.indexOf('\n');
const rest = s.slice(nl);
const h = [
  'Last updated: 2026-07-22T09:52Z s888 handoff, lock CLEARED -- WALL LIFTED (CONFIRMED) + BOTH owner-P1s DRAINED.',
  'The s809 CODEX-WALL was STALE: alt-shift live probe answered OK ~06:50 (12.6k tok, no quota error) AND proven by TWO real multi-minute post-lift codex runs COMPLETING (safari-swap 07:03, locked-win 07:44) -- turn-interrupts are NOT quota exhaustion; the rolling weekly window sheds usage. CODEX-RESUMED.',
  'DRAIN 1 (owner-P1, THE LOCKED-WIN LAW, first external tester ruling): locked-win merged c21d1839 (lane/m3, --no-ff, clean fresh base 1a477b66); gate GREEN (locked-win+victory 22/22, baron+bandits 22/22, tsc clean, build 1.49s; the-claim secureWave 20->10 in contracts.json + the-river.json charter [id=the-claim, kept in sync], Night-Shift/Baron secureWaves PROVEN unchanged, CLAIM SECURED chip); review reviews/locked-win.md; BACKLOG L724 SHIPPED; gazette "The Claim Is Yours At Ten".',
  'DRAIN 2 (MQ-11, first external tester Safari bug): safari-swap merged 086c9bfd (lane/m4, --no-ff; base 16h stale but ZERO hot-file conflict so clean LANE-TOUCHED); gate GREEN (safari-swap 6/6 incl REAL-WEBKIT repro + no-debug plain-boot, baron+bandits 32/32, tsc clean, build 1.18s); permanent Desktop-Safari webkit project added to playwright.scratch.config.ts; review reviews/safari-swap.md; BACKLOG L723 SHIPPED; gazette "Safari Rides Clean".',
  'Backup: git push origin main OK (67798e3d..9a16d708).',
  'DEPLOY: bash scripts/deploy.sh APPROVAL-GATED for a headless fire -- 2 gameplay merges are LIVE, so next fire/attended MUST run deploy for the family to get the Pages build.',
  'census-triage lane-c is ALIVE NOT ghost (alt-shift ruling BACKLOG L725: log wrote 06:32 today, legit 24h/41-map xhigh job) -- do NOT reap pids 42582/42589; NO PushNotification (reap moot, P1s done).',
  'Stale-signal dismissals: lane-b playwright.accounts battery HUNG since 07:02 (departed-alt-shift orphan, NOT a live gate); tty-claude 67079 idle >2h (idle-resident -- per section 2A does not block drains).',
  'tasks/CODEX-WALL flag LINGERS (git rm gated headless) but its top line reads LIFTED / resume-normal-ops; both wall-class rc1 masters remain in tasks/failed/ but are MOOT (work shipped; BACKLOG L723/724/726 all marked SHIPPED so Mistake #8-safe).',
  'REFILLS HELD this fire (thin post-lift quota: 94% baseline only shed by rolling window NOT the Jul 26 reset; the runner already burned it on 2 P1 runs + the 24h census job; re-wall risk per the flag warning).',
  'NEXT FIRE: (A) refills READY to resume -- refill ONE lane cautiously and watch for a re-wall, OR await the Jul 26 16:57 +07 reset for full 4-5-lane throughput. The SAGA REHEARSAL (recorded, E1->E10) runs on the ALT subscription = SEPARATE quota, does not touch the main lanes. (B) RUN bash scripts/deploy.sh (2 gameplay merges pending deploy). (C) Board: lane/e2-arsenal + lane/perf 0-ahead, lane/m3 + lane/m4 now merged-ancestor (safe-dupe), all queues EMPTY, lane-c live census job, assayer pending EMPTY.',
  "OWNER'S DESK: codex credits ask PARTIALLY resolved (wall lifted via rolling window + alt subscription reopened) but MAIN quota stays thin till the ~Jul 26 reset -> full throughput waits; pin the townsfolk-portrait convention (unblocks E6-E10 town-icons + pan-town); rule the 3D-C recall commission (town-variants E9/E10); hero-ages four-ages lineup review (reviews/shots-hero-ages/four-ages-lineup.png).",
].join(' ');
const arch = '- **s888 lock (line-1 archive):** 2026-07-22T09:32Z ACTIVE -- WALL LIFTED confirmed, draining owner-P1 locked-win + safari-swap.';
fs.writeFileSync(p, h + '\n' + arch + rest);
console.log('handoff written; line-1 len', h.length);
