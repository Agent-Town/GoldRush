// s1542 — CONTROL before touching tasks/goals.json.
// A naive JSON.stringify(...,2) reformats this file by ~10 KB, because the file
// ASCII-escapes every non-ASCII character (— for the em dash, etc.) and
// stringify does not. Adding two leaves through a serializer that does not match
// would bury a 2-line change in an 850-line diff — noise that hides the edit and
// rots every review that tries to read it.
//
// NOTE: the file has NO trailing newline either — measured, not assumed.
// So: prove the serializer reproduces the UNTOUCHED file byte-for-byte first.
// If this control does not print `identical: true`, do not write the file.
import fs from 'node:fs';

export const serialize = (obj) =>
  JSON.stringify(obj, null, 2).replace(/[-￿]/g, (c) =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
  );

if (process.argv[1] && process.argv[1].endsWith('goals-serialize-control.mjs')) {
  const raw = fs.readFileSync('tasks/goals.json', 'utf8');
  const out = serialize(JSON.parse(raw));
  console.log('CONTROL round-trip identical: ' + (out === raw));
  console.log('  raw bytes=' + raw.length + '  serialized=' + out.length);
  if (out !== raw) {
    for (let i = 0; i < Math.min(out.length, raw.length); i++) {
      if (out[i] !== raw[i]) {
        console.log('  first diff at ' + i);
        console.log('    mine: ' + JSON.stringify(out.slice(Math.max(0, i - 50), i + 50)));
        console.log('    file: ' + JSON.stringify(raw.slice(Math.max(0, i - 50), i + 50)));
        break;
      }
    }
    process.exit(1);
  }
}
