import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
let h = lines[0];

const wrong = 'so **do not go looking for it**: `main..lane/m3` is empty and its done-move is `drained-s1238-032eca5a-…`.';
const right =
  'so **do not go looking for it** — and mind the shape it leaves behind, because I wrote the wrong version of this sentence first and caught it by running the command: **`lane/m3` reads `+1 ahead` (`4b1638a6`) and that is a TIP-GRAFT PHANTOM, not undrained work.** I merged the *file*, not the commit, so the branch keeps a tip main will never contain. **Proof, not assertion:** `scripts/subject-tree.test.mjs` is **ABSENT** from `git diff main..lane/m3` (its content is byte-identical on main), and every line the two-dot diff *does* show is **main’s NEWER content reading as a deletion** — `reviews/guard-fx-02.md` **−62**, `tasks/goals.json`, `tasks/BACKLOG.md`, this fire’s `logs/session-scratch/*`. **MAIN-MOVED-ONLY, all of it.** Its done-move is `drained-s1238-032eca5a-…`.';

if (!h.includes(wrong)) { console.error('TARGET SENTENCE NOT FOUND VERBATIM'); process.exit(9); }
h = h.replace(wrong, right);

// Also fold the lesson into the through-line, since it is the third instrument failure of the fire.
const jOld = 'And the fire’s own two instrument failures — a grep that returned false-empty about the very file it read, a done-count dominated by dead history — were both caught the same way s1236 caught its ghost: **stop reading the sentence about the thing and go measure the thing.***';
const jNew = 'And the fire’s own **four** instrument failures — a grep that returned false-empty about the very file it read · a done-count dominated by dead history · a mutation parser reading TAP out of a spec reporter · and a handoff sentence claiming `main..lane/m3` was empty when it carries a tip-graft phantom — were every one of them caught the same way s1236 caught its ghost: **stop reading the sentence about the thing and go run the command.** Three of the four were in MY tools rather than in the work under review, which is the fire’s actual finding: **when a factory gets good at auditing its subjects, the unaudited branch moves into the instruments.***';
if (h.includes(jOld)) h = h.replace(jOld, jNew);
else console.error('WARNING: through-line anchor not found; (J) left as drafted');

lines[0] = h;
writeFileSync(P, lines.join('\n'));
console.log('phantom claim corrected; line-1 chars:', h.length);
