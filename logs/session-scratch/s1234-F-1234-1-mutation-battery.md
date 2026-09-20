# s1234 — F-1234-1 / F-1234-2 mutation battery

Subject: `scripts/site-contract.test.mjs` (the site/ gate, built s1230, widened s1231).
Method: plant a realistic break, run the line a drain runs, read the rc from
`spawnSync().status` — never the printed counter (F-1125-1).

Baseline blob hashes (`git ls-files -s`), re-verified after every arm:

    site/index.html  49bbb0403d54660f3e55eb96c59e1471436f920a
    site/news.html   b6d140a8698845458c3c662f08d1849dadd31c5b

---

## 1. The measurement that started it

`localRefs()` walked a TAG WHITELIST — `link|a|img|script|source|video|audio|iframe` —
while its attribute chain was `href ?? src ?? data-feed`. Branch hit counts across
all of `site/*.html`:

| chain arm | references matched |
|---|---|
| `href` | 19 |
| `src` | 3 |
| `data-feed` | **0 — dead branch** |

The only element carrying `data-feed` is a `<div>`:

    site/news.html:  <div id="news-feed" class="news-feed" data-feed="../news/herald.json">

and it drives a real production fetch, not decoration:

    const feed   = document.querySelector('#news-feed');
    const source = feed?.dataset.feed || '../news/herald.json';
    fetch(source, { headers: { Accept: 'application/json' } })

The guard's own comment (`:166-168`) says `data-feed` was added *because* this is
"a real production fetch, so it is a real reference". The tag whitelist then
removed it from the denominator. **The attribute was added for a reference the
whitelist could not reach.**

## 2. Arm A — the defect, on the tree as it stood

`data-feed` repointed to `../news/herald-MISSING-s1234.json` (target absent):

| gate | rc |
|---|---|
| `node --test scripts/site-contract.test.mjs` | **0** |
| `npx tsc --noEmit` | **0** |
| `npm run build` | **0** |
| `node scripts/run-guards.mjs` | **0 — 8/8 PASS** |

Full guard table under the planted break, all green:

    PASS rc=0  18s  test:node-guards
    PASS rc=0   0s  test:power-budget  p95=0.318ms
    PASS rc=0   4s  test:stats
    PASS rc=0   2s  test:accounts
    PASS rc=0   4s  test:mp
    PASS rc=0  79s  test:deploy-contract
    PASS rc=0   1s  test:deploy-site-contract
    PASS rc=0   0s  test:task-guards
    guards: 8/8 passed

Note `test:deploy-site-contract` passing: it fabricates its own `site/index.html`
in a temp repo, so it gates `deploy-site.sh`'s honesty invariants, never the
site's content. The header already said so; this confirms it.

## 3. Arm B — the controls that isolate the cause

| arm | change | rc | red |
|---|---|---|---|
| B1 | a whitelisted `<link href>` → missing file | **1** | `every local href/src resolves to a file that exists` |
| B2 | **the same broken `data-feed`, moved onto an `<iframe>`** | **1** | `every local href/src resolves to a file that exists` |

B2's message:

    news.html <iframe> points at "../news/herald-MISSING-s1234.json"
    but nothing exists there

Same attribute, same missing target, same page — **only the carrier tag differs.**
That isolates the tag whitelist as the sole cause; nothing else varied.

## 4. F-1234-2 — the second defect, found by measuring the cure before writing it

Dropping the whitelist reddened a **clean** tree. Cause: `resolveRef`'s escape branch.

    function resolveRef(path) {
      const inSite = resolve(SITE, path);
      return inSite.startsWith(SITE) ? inSite : resolve(ROOT, path);   // <-- re-applies ../
    }

| input | old result | exists |
|---|---|---|
| `styles.css` | `…/Gold Rush/site/styles.css` | yes |
| `../news/herald.json` | `/Users/robin/Claude/Projects/news/herald.json` | **no — outside the repository** |

`resolve(SITE, '../news/herald.json')` already yields the correct
`…/Gold Rush/news/herald.json`; the branch **discarded that answer and applied the
`../` a second time**. Exercised by **0 of 12** whitelisted path references, so it
had never once run — hidden by exactly the whitelist of F-1234-1.

This also corrects a claim s1231 recorded in BACKLOG: *"paths escaping site/
resolved against the repo root because that is the deploy stage's real layout, not
a guess."* The intent was right; the code did the opposite, and nothing executed it.

**Two mechanisms written for one reference, neither ever executed, each concealing
the other.**

## 5. The cure

* `localRefs()` enumerates by **attribute on any element**, not by a tag roster.
  Script and style **bodies** are blanked first (opening `<script src>` tags kept,
  since those are themselves references) so a `<` inside JS/CSS cannot forge a tag.
* `resolveRef()` collapses to `resolve(SITE, path)`. The root-absolute case is
  stated as a known limit rather than coded for — writing an untested branch for a
  case that does not exist is the exact defect above.
* New assertion `site: the denominator still contains a data-* reference and an
  escaping path`, because both defects were **invisible rather than wrong-answered**:
  a reference fell out of the denominator, and a guard that checks nothing reports
  no failures. Counting is not enough, so the two lost properties are named.

## 6. Mutation proof of the cure — 3/3, each red identified by assertion NAME

| # | mutation | rc | red (by name) |
|---|---|---|---|
| M1 | **Arm A replanted** — broken production feed | **1** | `every local href/src resolves to a file that exists` |
| M2 | old `resolveRef` double-resolve restored | **1** | `every local href/src resolves…` **+** `the denominator still contains…` |
| M3 | tag whitelist reintroduced | **1** | `the denominator still contains a data-* reference and an escaping path` |

**The before/after on the identical defect:** M1 is Arm A, unchanged, same command —
**rc=0 at the start of this fire, rc=1 at the end.**

False-positive control: an `<img src="PHANTOM-nope.png">` planted **inside** the
inline JS as a string literal → **rc=0, correctly ignored**. Without the body-strip
that would have been a false red.

Clean-tree run after the cure: **7 tests, 7 pass, 0 fail, 88 ms.**

## 7. Restoration

`git status --porcelain site/news.html` empty after every arm; blob hash
`b6d140a8…` unchanged. Guard-file mutations (M2, M3) restored from an in-memory
copy and re-verified by grep. Only intended edit remains: `+90 / -6` on
`scripts/site-contract.test.mjs`.

## 8. Residual — stated so it cannot be mistaken for done

* `news.html`'s inline fetch carries `|| '../news/herald.json'` — a **second copy**
  of the same path, in a JS string literal that no assertion reads. If the file
  moves, the attribute is now caught and the literal still is not.
* CSS `url()` is not parsed. Measured, not assumed: `site/styles.css` (11 785 bytes)
  emits **0** `url()` references and both pages carry **0** inline `<style>` blocks,
  so there is no live hole here today — but a future `url()` would be unchecked.
  This narrows s1231/s1232/s1233's carried residual "`site/styles.css` is read by
  nothing": its *existence* is checked; its *contents* are not, and currently
  reference nothing.
* Root-absolute hrefs (`/news/x.json`) would read as missing. The site emits none.
* Still nothing boots the page — this is static analysis, not a render.
