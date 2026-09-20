# s1231 — F-1231-1 mutation battery (retention copy)

Retention Law: this is the raw evidence behind the F-1231-1 ledger entry, mirrored
into git rather than left on disk. Nothing here is a conclusion; the conclusions
are in `tasks/BACKLOG.md`.

Subject shas (index blobs, `git ls-files -s site/`), unchanged across the whole fire:

    site/index.html   49bbb0403d54660f3e55eb96c59e1471436f920a
    site/news.html    b6d140a8698845458c3c662f08d1849dadd31c5b
    site/styles.css   906f471f685b7785e43b73fc28b8d504911ad028
    site/assay-office.js 4408708f39550baa76728b47ab3b82755ab5b9b5

After every arm: `git checkout -- <subject>` then `git status --porcelain site/`
printed nothing and the blob hash re-read identical. No subject was left mutated.

## PART 1 — the hole, measured BEFORE any cure existed

Gate line under test: the one a drain actually runs.

    npx tsc --noEmit
    npm run build
    node scripts/run-guards.mjs --changed-since HEAD

Control, clean tree: tsc rc=0 · guards `3/3 passed` (test:node-guards 16s,
test:power-budget 0s p95=0.310ms, test:task-guards 0s).

### Arm A — hard syntax error in news.html's INLINE script

`site/news.html:60`, inside the bare `<script>` that renders the whole Gazette feed:

    const feed = document.querySelector('#news-feed');
    ->
    const feed = document.querySelector('#news-feed';

Result: `tsc` **rc=0** · `npm run build` **rc=0** (`✓ built in 1.79s`) ·
`run-guards --changed-since HEAD` **3/3 passed, rc=0**.

The significant part: `test:node-guards` contains `scripts/site-contract.test.mjs`,
shipped ONE FIRE EARLIER for this exact defect class on this exact page. It passed,
because it reads `<script src>` tags and this script has no `src`.

### Arm B — stylesheet href pointing at nothing (site ships unstyled)

`site/index.html:27`:

    <link rel="stylesheet" href="styles.css">
    ->
    <link rel="stylesheet" href="assets/styles.css">

Result: `tsc` **rc=0** · `run-guards --changed-since HEAD` **3/3 passed, rc=0**.

Six greens over two planted breaks.

## PART 2 — the cure's own mutation battery (4/4)

`scripts/site-contract.test.mjs`, now 6 tests / 82 ms on a clean tree. Each arm was
checked against the assertion it TARGETS, by name — not by exit code alone, since
any red would move the rc.

| arm | mutation | test that went red |
|-----|----------|--------------------|
| A | inline `<script>` syntax error (news.html) | `each inline <script> parses under the grammar its tag requests` |
| B | `href="assets/styles.css"` (index.html) | `every local href/src resolves to a file that exists` |
| C | `index.html#assay-offices` (news.html nav, **cross-page** fragment) | `every in-page anchor targets an element that exists` |
| D | `src="assets/gold-rush-key-art@2x.jpg"` (index.html hero `<img>`) | `every local href/src resolves to a file that exists` |

Each run: 5 pass / 1 fail. Failure messages name the page, the tag and the target,
e.g. `news.html links to "index.html#assay-offices" but index.html has no element
with id="assay-offices"`.

## PART 3 — before/after on the IDENTICAL defect

Arm A replanted, cure in place, same command a drain runs:

    node scripts/run-guards.mjs --changed-since HEAD
    -> guards: 2/3 passed -- RED: test:node-guards

Exit code read from `spawnSync().status`, never the printed counter (F-1125-1):

    RUN_GUARDS_RC=1

Start of fire: rc=0. End of fire: rc=1. Same break, same command.

## PART 4 — references resolved by hand (no casualty)

Checked before writing any test, so the guard could not be tautological against a
site that was already broken:

- `index.html`: preload `assets/gold-rush-key-art.jpg` ✓ · stylesheet `styles.css` ✓ ·
  `<img>` `assets/gold-rush-key-art.jpg` ✓ · `<img>` `assets/teaser-poster.jpg` ✓ ·
  `news.html` ✓ · fragments `#top`,`#teaser`,`#pillars`,`#assay-office`,`#devlog` all
  present as ids ✓ · `assay-office.js` ✓
- `news.html`: stylesheet ✓ · `index.html` + `index.html#teaser|#pillars|#assay-office` ✓ ·
  `news.html` ✓
- `news.html:48` `data-feed="../news/herald.json"` — escapes `site/`. **Resolves in
  production**: `scripts/deploy-site.sh:31-36` stages `site/.` at the root and then
  copies `news/` in beside it (`if [ -d news ]`), and `news/herald.json` exists.
  Read from the script, not assumed from the name.

## PART 5 — final gates

    npx tsc --noEmit            rc=0
    npm run build               rc=0  (built in 1.29s)
    node scripts/run-guards.mjs 8/8 rc=0
      test:node-guards 16s · test:power-budget 0s · test:stats 4s · test:accounts 2s
      test:mp 3s · test:deploy-contract 80s · test:deploy-site-contract 1s
      test:task-guards 0s

Re-run after the edits because the guard roster changed, and the gate set re-run
again after the BACKLOG edit because `test:task-guards` gates the `tasks/` ledger.
