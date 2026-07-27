// s1140 rate run — task-037 desktop x3, to turn "intermittent" into a measured rate
// under a STATED load condition (see the handoff; the box is not quiet, lane-b codex is live).
process.env.SPEC = 'e2e/task-037-assay-bench-ungate.spec.ts';
process.env.PROJECTS = 'desktop-chrome';
process.env.REPEAT = '3';
process.env.LOG = 'scripts/tmp-s1140-rate.log';
await import('./tmp-s1140-run.mjs');
