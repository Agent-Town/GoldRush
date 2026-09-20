import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

const eras = g.goals.find((x) => x.id === 'ten-eras');
const e1 = eras.subgoals.find((s) => s.id === 'e1-frontier');
if (!e1) { console.error('e1-frontier subgoal not found'); process.exit(1); }

// where does the E2 prerequisite belong? find the E2 subgoal
const e2 = eras.subgoals.find((s) => s.id === 'e2-steamworks' || /E2/.test(s.title));
if (!e2) { console.error('E2 subgoal not found'); process.exit(1); }
console.log('E2 subgoal =', e2.id, '|', e2.title.slice(0, 70));

const NOTE_TAIL =
  ' LEAF REGISTERED s1398, NOT s1398-authored: the master was authored and queued by the live attended ' +
  'session at 96fb9059, which committed it WITHOUT a leaf and wrote "GOAL-LEAF DEBT (3 masters) next fire." ' +
  'verbatim at tasks/BACKLOG.md:2590. Status is "building" and not "queued" because the runner had already ' +
  'consumed the queue copy when I measured it: tasks/running/ held the master plus a live .pid at 18:22. ' +
  'I did not author, re-queue or alter the master, and I did not gate it — this discharges the Goal ' +
  'Registration Law bookkeeping only, so the slice is visible to drain-block-check and to every sweep that ' +
  'walks the goal tree instead of the queue directories.';

const leaves = [
  {
    parent: e1,
    leaf: {
      id: 'e1-headless-twin-banks',
      title:
        'E1 DRIVER 4 of 5 — admit e1-twin-banks to GR-SIM. The census\'s best-declared E1 map (explicit fords, buildZones ENFORCED in sim, gravel bars sim-real at Terrain.ts:258-274) needs only its driver: two-bank water, fords, gravel bars, buildZone enforcement, secureWave 20, reusing browser systems headless. Ships a two-run determinism hash proof, 5 pinned bench seeds and a waves/sec figure. Reject-don\'t-stretch is explicit in the master: a system that cannot run headless is a STOP-and-report, never fabricated logic.',
      taskFile: 'lane-headless-twin-banks.md',
      status: 'building',
      lane: 'lane-a',
      authoredBy: 'attended-2026-08-02',
      registeredBy: 's1398',
      note:
        'Part of the E1-AND-SO-ON wave (owner 2026-08-02: "How about the other maps? Are they getting updated as well?"). With this and the baron driver, the E1 bench reaches 5/5.' +
        NOTE_TAIL,
    },
  },
  {
    parent: e1,
    leaf: {
      id: 'e1-headless-baron',
      title:
        'E1 DRIVER 5 of 5 — admit e1-baron to GR-SIM, the FIRST boss driver. The entire baron block is data-declared and consumed (spawn/HP/escorts via WaveSystem.ts:750-780, tauntWaves, rocketVolley, pursuitRange, medal), so it completes the E1 bench AND sets the boss-driver pattern every later boss copies. The id-hardcoded E5/E7/E8/E9 bosses stay laddered until staging moves to data. Meta-mint asserted OFF headless.',
      taskFile: 'lane-headless-baron.md',
      status: 'building',
      lane: 'lane-c',
      authoredBy: 'attended-2026-08-02',
      registeredBy: 's1398',
      note:
        'Queued xhigh. Completes the E1 bench at 5/5 when drained.' + NOTE_TAIL,
    },
  },
  {
    parent: e2,
    leaf: {
      id: 'e2-escort-mode-as-data',
      title:
        'F-CEN-8 (promoted out of the post-launch census ladder as the E2 BENCH PREREQUISITE) — the E2 escort stops living in the URL. Escort mode activates only via ?mode=escort (Game.ts:3725-3729, WaveSystem.ts:180-184; town injects it from modes[0].id), which makes it unreachable headless and undeclarable in a mechanics manifest. The mode becomes sim-boot state instead.',
      taskFile: 'lane-escort-mode-as-data.md',
      status: 'building',
      lane: 'lane-d',
      authoredBy: 'attended-2026-08-02',
      registeredBy: 's1398',
      note:
        'This is the one F-CEN rung that is NOT parked behind launch closure: it was deliberately promoted as a prerequisite for the E2 drivers (hill-mine/trestle/pressure-garden/incline). The remaining F-CEN-1..8 content repairs stay post-launch-gated — do not author them.' +
        NOTE_TAIL,
    },
  },
];

for (const { parent, leaf } of leaves) {
  const dupe = (parent.tasks ?? []).some((t) => t.id === leaf.id);
  if (dupe) { console.error('DUPLICATE leaf id, aborting:', leaf.id); process.exit(1); }
  parent.tasks.push(leaf);
  console.log('added', leaf.id, '->', parent.id);
}

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('written');
