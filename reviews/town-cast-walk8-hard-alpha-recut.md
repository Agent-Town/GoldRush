# Drain review — `town-cast-walk8-hard-alpha-recut` (A19 stage 2): the town-cast walk sheets re-cut with a hard alpha edge, landed with 6.3 MB of first-town headroom (attended drain, 2026-09-14)

**Slice/branch/tip:** `feat/town-cast-walk8-hard-alpha-recut` @ `c983388f0` — five commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `c3f068fad`; master `tasks/town-cast-walk8-hard-alpha-recut.md`; the implementer's full report, per-family census and instruments: `artifacts/town-cast-walk8-hard-alpha-recut/report.md`.
**Merged as** `059a72399` onto main `5dd950cc5` (`git merge --no-ff`, zero conflicts, zero file overlap with the fires' bookkeeping), gated there, landed by fast-forward at the hash the ledger row names. Engine hash unchanged (`f3a347a9…`, era-6 pin #2): nothing landed is in `ENGINE_SOURCE_INPUTS`.
**Owner words, verbatim:** 2026-09-13 "A19 - that is ok" · "I like the new sprites I saw, I think there is still a lot of work to do" · 2026-09-14 "lets do: the town-cast re-cut".

## VERDICT: LANDED — nine of the ten families, every one below main's bytes; the schoolteacher held on art

## 1. What landed (the implementer's measurements; the drain re-ran the gates on the merged tree)
| family | cells | dist bytes main → branch → re-cut | vs main | partial-alpha px main → cut | violet px | verdict |
|---|--:|---|--:|---|---|---|
| youngster-m walk8 | 32 | 1,674,779 → 4,418,482 → 1,408,964 | −15.9 % | 21,962 → 0 | 20,126 → 0 | landed |
| youngster-f walk8 | 32 | 1,697,838 → 4,381,720 → 1,364,531 | −19.6 % | 20,793 → 0 | 19,606 → 0 | landed |
| storekeeper walk8 | 32 | 1,799,846 → 4,374,551 → 1,534,605 | −14.7 % | 19,907 → 0 | 18,261 → 0 | landed (F-RECUT-3) |
| tavernkeeper walk8 | 32 | 2,346,127 → 4,778,815 → 1,731,569 | −26.2 % | 18,817 → 0 | 0 | landed |
| newsie-mei walk8 | 32 | 1,518,573 → 3,765,969 → 1,265,510 | −16.7 % | 17,873 → 0 | 16,416 → 0 | landed |
| assay-clerk walk8-a | 16 | 1,273,681 → 2,027,962 → 847,090 | −33.5 % | 12,394 → 0 | 0 | landed |
| schoolteacher walk8-a | 16 | 1,265,989 → 1,994,668 → (772,136) | — | — | 2 | **HELD** (F-RECUT-2) |
| preacher walk8-a | 16 | 1,089,959 → 1,807,904 → 716,302 | −34.3 % | 13,249 → 0 | 0 | landed |
| elder walk8 | 32 | 4,083,354 → 4,391,203 → 1,728,499 | −57.7 % | 18,258 → 0 | 0 | landed |
| hero walk8 | 32 | 547,067 → 1,259,338 → 399,586 | −27.0 % | 18,365 → 0 | 14,029 → 0 | landed |
| **landed, nine families** | **256** | **16,031,224 → 31,205,944 → 10,996,656** | **−31.4 %** | **161,618 → 0** | **88,438 → 0** | |

The lossless pass over the review's 93 pixel-identical families recovered a further 2,266,847 B (101 files shrank, each verified identical on all four channels). The halo guard is re-pinned to **395 cured / 0 held / 680 regenerated-and-cured / 1,401 scanned** with `expectedResidual` at zero: the sweep now asserts no halo suspect anywhere. The Elder's height pin in `e2e/elder-walk8-woman.spec.ts` was re-measured (296–328 → 298–326). Eyes-on at the drain: the youngster-m and storekeeper contact sheets (main / branch / re-cut rows plus the difference row) read as the same figures and the same eight-frame walks with no halo.

## 2. Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| `GR_RELEASE=e1 npm run build` + `node scripts/first-town-payload.mjs` | **28,670,172 B of 35,000,000 — headroom 6,329,829 B** (main: 33,947,377 B, headroom 1,052,623) | 28670172 bytes (rc 0) |
| `scripts/halo-reextraction-check.mjs` | PASS 395 / 0 / 680 / 1,401 | halo re-extraction PASS: 395 cured, 0 held, 680 regenerated-and-cured, 1401 scanned; alpha and opaque RGB unchanged |
| `deploy-budget`, `first-town-request-families`, `character-direction-assets`, `hero-clip-groups` | 40 / 0 | ℹ pass 40 ℹ fail 0 |
| `npx tsc --noEmit`; plain build | clean; rc=0 | tsc rc 0; release build rc 0 |
| e2e (`elder-walk8-woman`, `town-cast-wiring`, `m1-01`, `m2-01`), both projects, one worker | 32 passed / 0 failed; plain boot 0 console/page/request errors desktop + 390 px | reused (the branch's e2e ran on the same cells; the battery covers the guards) |
| full `test:node-guards`, Node 26 | not run (the drainer's) | ℹ tests 796 ℹ pass 792 ℹ fail 2 ℹ skipped 2 ℹ duration_ms 364709.255209  rc rc=1 — 796 tests / 792 pass / 2 fail / 2 skipped, all seven stages ran; the two reds are the desk-declaration guard REFUSING to judge a linked worktree ("a self-consistent reading of the WRONG handoff") and the fixture sweep reporting that same child; re-run on the primary checkout after the fast-forward: desk-declaration-guard PASS on the real tree and task-guard-audit 0 invisible masters (`attended-main-postff-*.log`). **Deploy:** DEPLOYED and VERIFIED at `19f67c6b` on `https://gold-rush-3in.pages.dev` (Cloudflare `b5ce13d1`), assayer synced and restarted, first-town payload 28,670,083 / 35,000,000 B (headroom 6,329,917 B); the browser tripwire probe did not run (playwright rc=1, does not gate) and `docs/release/verdict-19f67c6b.md` is missing (WARN), both owed to the next fire · ✖ all 140 scripts/*.test.mjs fixture owners remove their temp directories (203331.256875ms) · ✖ failing tests: · ✖ the live board is green under this guard (baseline is honest) (264.236583ms) · stages: 10 |

## 3. Findings
- **F-RECUT-1 (the one deliberate compromise, owner's eye optional):** the branch's byte growth was NOT the feathering the 2026-09-12 review blamed but the transparent field: main's holds 2 distinct colours, the branch's 6,363 (its full `bleedEdges`), +26,451 B per cell ≈ +7.19 MB across this group. The re-cut ships a flat transparent field (a binary alpha lets zopflipng write colour-type 2 + `tRNS`). Simulated the way three.js samples (non-premultiplied box filter to 48 px over the town's sand): main's rim reads magenta (174,34,140), the branch's 113,76,52, the re-cut's 53,37,22 — eyes-on, the branch and the re-cut are indistinguishable and main draws a pink outline. A one-pixel bleed would cost ≈ +2.7 MB and breach the storekeeper's per-family bound; one owner word buys it back.
- **F-RECUT-2 (held on art):** the schoolteacher's branch row 2 is a different generation of the character (plain skirt where her other rows and all of main wear a tiered one, a different hand prop, row-mean height 336 → 311). F-SPRDR-10's class; main's sheet carries 2 visible violet pixels, so the cure buys nothing. Worth 493,853 B if row 2 is re-taken.
- **F-RECUT-3 (landed, reversible):** the storekeeper's rows 2/3 change scale by about 4 % (r2 −11.8 px, r3 +9.1 px) — a re-extraction framing shift on the same man and apron, landed because that family carried 18,261 violet pixels. Smaller jitter (≤ 6.8 px row mean) on youngster-f, preacher, assay-clerk and tavernkeeper.
- **F-RECUT-4 (cosmetic):** frame phase moves within some rows (newsie r2c1 self-IoU 0.416 vs 0.954 at c5); direction rows and eight-frame cycles intact, nothing indexes an absolute phase.
- **F-RECUT-5 (corrective owed):** `assets/master-divergent.json` is stale for nine `char-hero-sheet-walk8` cells ("Cutout-pocket alpha mend … after master extraction", `21dc8739`); outside this firewall.
- **F-RECUT-6:** `assets/processed-full` masters for the hero walk8 left as main's (nothing reads them; outside the payload).
- **F-RECUT-7 (corrective, cheap and worth it):** the 2.27 MB lossless recovery is a floor — the Elder was 40 % over-encoded on main before this land; a repo-wide lossless pass would very likely recover several MB more for zero visual change.

## 4. What was touched
`assets/processed/**` (the nine families and the 101 re-encoded files), `assets/LEDGER.md` (one batch row), `scripts/halo-reextraction-check.mjs` (declarations and re-pins), `e2e/elder-walk8-woman.spec.ts` (the height pin), `artifacts/town-cast-walk8-hard-alpha-recut/**`; at the drain this review, the goal leaf and the ledger row. `BUDGET_LIMIT`, `demandPaged`, `assets/first-town-payload.json`, `scripts/deploy.sh`, `scripts/first-town-payload.mjs` and `src/**` untouched.
