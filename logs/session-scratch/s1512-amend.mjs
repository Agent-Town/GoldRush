import fs from 'node:fs';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const anchor = '**NEXT: (A)**';
if (!lines[0].includes(anchor)) throw new Error('anchor missing');

const clause =
  '🛡️ **`test:ledger-guards` CAUGHT TWO DEFECTS IN MY OWN BOOKKEEPING, WHICH IS PRECISELY WHAT F-1300-4 EXISTS FOR — the battery runs AFTER the fire writes its own rows, so it can see what the drain-time green structurally cannot.** ' +
  '(1) `banked-master-preflight-guard` red: my master declared `git status --porcelain # expect EMPTY`, a **pre-cure pre-flight** that would STOP on the factory own `logs/**` churn (F-1407-1). The runner had already claimed the slot and passed, because I dispatched into a genuinely clean lane — so this would have bitten only on a **re-queue**, silently, later. Retro-fitted the FACTORY-CHURN EXCEPTION (`0e0f1e4`-series commit). ' +
  '(2) `test:citations` red on **four** new `spec:line` citations lacking a recoverable test title (F-1310-1). **Two of them DID carry their title — it had wrapped onto the next line**, and the guard is line-oriented: the identical hazard F-1425-2 records for grep keys, now shown to bite citations too. All four titled, chain **rc=0, 77/77**. 💡 **Worth keeping: I wrote both defects while actively following the law that forbids them.** ' +
  anchor;

lines[0] = lines[0].replace(anchor, clause);
fs.writeFileSync(p, lines.join('\n'));
console.log('handoff amended');
