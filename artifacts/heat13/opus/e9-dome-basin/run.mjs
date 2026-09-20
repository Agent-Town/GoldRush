import { ride, noteScored, writeOutcome } from './runner.mjs';
import { makeController } from './ctrl.mjs';
const label = process.argv[2] || 'tune-1';
if (/^attempt/.test(label)) noteScored();
const r = await ride({ label, controller: makeController() });
console.log('OUTCOME', JSON.stringify(r.outcome));
console.log('ENV', JSON.stringify(r.env));
const rows = r.rows.filter((x) => !x.err);
const step = Math.max(1, Math.ceil(rows.length / 22));
for (let i = 0; i < rows.length; i += step) {
  const x = rows[i];
  console.log(`v${x.v} t=${x.t} w=${x.w} hp=${x.hp}/${x.mx} @(${x.hx},${x.hz}) g=${x.g} pan=${x.pan} alive=${x.alive}(wr${x.wr}/th${x.th}) works=${x.st}/wk${x.wk} ${x.kinds} ${x.fails}`);
}
const last = rows[rows.length - 1];
if (last) console.log('LAST', JSON.stringify(last));
const errs = r.rows.filter((x) => x.err);
if (errs.length) console.log('CTRL ERRORS', errs.length, errs[0].err.slice(0, 400));
writeOutcome();
