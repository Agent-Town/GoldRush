import fs from 'node:fs';

const TITLE = '("blank briefing goal fires with a briefing and noops after missing briefing")';
const targets = [
  'tasks/BACKLOG.md',
  'tasks/lane-c-f1324-3-charter-fuzz-label-addressing.md',
];

for (const f of targets) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  s = s.replace(
    /`e2e\/charter-press-totality\.spec\.ts:26,31,32`(?! \()/g,
    '`e2e/charter-press-totality.spec.ts:26,31,32` ' + TITLE
  );
  if (s === before) { console.log('NO CHANGE in', f); continue; }
  fs.writeFileSync(f, s);
  console.log('cited title in', f);
}
