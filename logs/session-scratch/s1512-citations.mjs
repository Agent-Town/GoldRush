import fs from 'node:fs';

// Every citation must carry its test title ON THE SAME LINE — the guard is line-oriented,
// which is the same wrap hazard F-1425-2 records for grep keys.

// 1) BACKLOG F-1512-1 and F-1512-2
{
  const p = 'tasks/BACKLOG.md';
  let s = fs.readFileSync(p, 'utf8');
  const a = '`e2e/landmark-collision.spec.ts:157` IS A BATCH-LOAD FLAKE';
  const aFix =
    '`e2e/landmark-collision.spec.ts:157` ("later-era modeled plaza props use their authored Town footprints") IS A BATCH-LOAD FLAKE';
  if (!s.includes(a)) throw new Error('BACKLOG anchor a missing');
  s = s.replace(a, aFix);

  const b = '`e2e/map-census.spec.ts:43` HAS A WANDERING MOBILE-CHROME FLAKE';
  const bFix =
    '`e2e/map-census.spec.ts:43` ("${contract.id} mobile spot" — the parameterised per-map spot case) HAS A WANDERING MOBILE-CHROME FLAKE';
  if (!s.includes(b)) throw new Error('BACKLOG anchor b missing');
  s = s.replace(b, bFix);
  fs.writeFileSync(p, s);
  console.log('BACKLOG citations titled');
}

// 2) the master — both citations currently wrap away from their titles
{
  const p = 'tasks/lane-f1511-2-blocker-slide-geometry-gate.md';
  let s = fs.readFileSync(p, 'utf8');

  const a = '`e2e/landmark-collision.spec.ts:68` ("enemy blocker routing is deterministic and goes around a county\nlandmark") has been RED on main since';
  const aFix = '`e2e/landmark-collision.spec.ts:68` ("enemy blocker routing is deterministic and goes around a county landmark")\nhas been RED on main since';
  if (!s.includes(a)) throw new Error('master anchor a missing');
  s = s.replace(a, aFix);

  const b = 'by `e2e/never-trap.spec.ts:88`. The cure must satisfy **both** judges.';
  const bFix = 'by `e2e/never-trap.spec.ts:88` ("Night Shift enemies always make goal progress around object footprints"). The cure must satisfy **both** judges.';
  if (!s.includes(b)) throw new Error('master anchor b missing');
  s = s.replace(b, bFix);

  fs.writeFileSync(p, s);
  console.log('master citations titled');
}
