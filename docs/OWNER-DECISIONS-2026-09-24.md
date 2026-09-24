# Your decisions, 2026-09-24: what each one is, the options, and what I would do

Written for the owner on 2026-09-24 after the outside review and the day's landings. Every item here is on the desk (STATUS line 1 and `docs/OWNER-DESK-2026-09-19.md`); this page is the readable version. One word per item is enough ("1a", "2 rotation", "5 keep"). Nothing here is done without it, and nothing is blocked by it: the factory keeps landing the queued work meanwhile.

## At a glance

| # | Decision | Recommendation | Your effort |
|---|---|---|---|
| 1 | Rotate three credentials with no record since 2026-08-25 | Do it this week | 20 minutes, only you can |
| 2 | Which seed humans play on | The weekly rotation seed per contract | one word |
| 3 | Compact your 48 KB of global rules | Yes, with a dated backup | one word |
| 4 | Night Shift: the lantern start state and the river | Three lit, four cold; keep the river for now | one word, then a look at the preview |
| 5 | Twin Banks: the braid mask that reached production without a ruling | Ratify the braid and land its water surface | one word |
| 6 | The Last Claim: square playable area vs the plate's circle | Keep the square | one word |
| 7 | The Workers Paid plan for the KV budget | Yes, about $5 a month | a card and one word |
| 8 | A droplet evening (non-root services, sandboxing, real client IP, the verify rate limit) | Yes, one evening with me | one evening |
| 9 | The account-registry deploy day | Name an evening | one evening |
| 10 | The ten-minute phone measurement (B1) | When the family is around | ten minutes |
| 11 | Rewrite history to remove a personal address from nine commits | Your call; cheapest now (zero forks) | one word, then a quiet evening |
| 12 | CI on your GitHub account | Yes, a three-step workflow | one click on GitHub |
| 13 | The shape of the ledgers under the retention law | Approve the split; I execute | one word |
| 14 | Evidence offload from the public tree | Archive repo plus a size budget | one word |
| 15 | The county ledger mirror must stay out of the public tree | Adopt (it costs nothing) | one word |
| 16 | The fire memory's home | Mirror it into the private archive | one word |
| 17 | The era-bump day for seeding the browser's harvest from the run seed | The next quiet day, bundled with Night Shift's landing | a date |

## 1. Rotate three credentials (F-2299-1, open since 2026-08-25)
**What is true.** On 2026-08-25 five live credentials were found synced to a place they should not have been. Two are closed (the LLM-router key was rotated on 2026-09-06 and its stray plaintext copy deleted; one item was only an account identifier). Three have no rotation record: the edge API token (it carries DNS edit, Pages edit, Workers and KV edit on the live zone), the coding-agent subscription token, and the voice-synthesis key. The worst case for the first one is somebody else serving the game's domain.
**Options.** (a) Rotate the three now and write the date on the F-2299-1 row. (b) Leave them.
**Recommendation.** (a), this week. Steps: one `ls` on the droplet for stray copies, then each provider's dashboard, then the new values into `.env.local` and the droplet's env file, then tell me and I write the closure. I cannot touch credentials; I can sit beside you for the file edits.

## 2. Which seed humans play on (review SIM-2)
**What is true.** Every human on the public build plays every contract on one constant seed, `gold-rush`: the waves, the upgrade offers and the gold seams repeat run after run, in a roguelite. The weekly rotation seeds exist (minted every Sunday, enforced by the county door, r2026w39 is live), but nothing in the client reads them, so no human has ever ridden one; only agents and the bench do.
**Options.** (a) Humans ride the open rotation's seed per contract: everyone in a week plays the same map, the board compares like with like, and the seed changes every Monday. (b) A random seed per run: maximum variety, no two runs comparable. (c) Both: the rotation for ranked runs, random for practice.
**Recommendation.** (a). It is one helper behind three string literals and the machinery already exists. (c) is the natural second step if practice runs feel samey.

## 3. Compact your global rules (48 KB in `~/.claude/rules`)
**What is true.** Nineteen files, 48 KB, are loaded into every Claude Code session of every project (the agent matrix, auto-skill activation, the QA loop, the tldr CLI notes, the handoff templates and so on). That is about 12k tokens before any work starts, in every project.
**Options.** (a) I compact them to about a third, keeping every rule you rely on, with a dated backup directory beside them. (b) Leave them.
**Recommendation.** (a). They are yours and they shape other projects, which is why I did not touch them with the repo's law files today.

## 4. Night Shift: the lantern start state and the river (F-HM-1)
**What is true.** The plate leads with lanterns burning along a night road; the game starts with all seven posts wrecked at 0 HP, 8 gold each to relight, so the map's own picture never appears. The river band is 10 m wide by the E1 shared-geometry law (the Claim, Night Shift and the Baron share it); the plate shows a working stream.
**Options for the lanterns.** (a) The three posts on the home bank (around the Lampworks yard and the stake) start lit, the four across the ford stay cold at 8 gold; contract data only, no new rule; the map gets easier by three free pools and the wreckers can still put them out. (b) All seven lit and a scripted snuff at dusk puts four out: plate-faithful, a new mechanic to keep. (c) As recorded.
**Options for the river.** Keep the band (the crossing the map is built around, and the shared law) or narrow it to a stream (a code exception to the shared-geometry law plus an art re-sculpt, about three hours of Astra).
**Recommendation.** (a) for the lanterns; keep the band until you have seen (a) on the preview. The master for (a) is written and parked; your word queues it.

## 5. Twin Banks: the braid mask that reached production without a ruling (F-TB-1)
**What is true.** On 2026-09-12 a retention commit landed Astra's uncommitted campaign "not yet gated"; among its changes the braid water mask went into the production Twin Banks contract, which the braid's own review had said must not happen alone. Since then the simulation sees two channels with a dry plait between them while the water still renders as one band; two tests that pin the ratified band are red, and the centre of the river is dry ground to the sim.
**Options.** (a) Revert the mask to its dev tile: the reviewed band is back, floors re-recorded, one pin. (b) Ratify the braid and land its water surface (contract plus render), re-pin the two tests, floors, one pin, as a held-maps slice.
**Recommendation.** (b): the plate and the art are braided and the simulation already is; the render is the missing half. (a) only if you want the reviewed state back today.

## 6. The Last Claim: square vs circle (F-FID1-4)
**What is true.** The plate's memorial deck has a circular perimeter; the playable area is a square, contract-owned (mask tables, collisions, every tape). Art rebuilt the deck and rim inside the square.
**Options.** Keep the square (art rounds the rim's ornament inside it) or make the playable area circular (a new contract, a new census row, every Last Claim tape re-pinned).
**Recommendation.** Keep the square.

## 7. The Workers Paid plan (review SEC-2)
**What is true.** Telemetry, the multiplayer rate limits, bug reports and prize codes share one free-tier KV namespace with 1,000 writes a day; one visitor can use that up in about two and a half hours and break co-op, bug reports and prizes for everyone. The code side (batching telemetry, wrapping the room connect in the error path) is authorable without money.
**Options.** (a) The Workers Paid plan (about $5 a month) plus separate namespaces. (b) Move the remaining counters to the droplet ledger instead (no money, more work).
**Recommendation.** (a). The code half lands either way.

## 8. A droplet evening (review SEC-4, BUILD-6)
**What is true.** The droplet's services run as root with no systemd sandboxing; the assay worker replays untrusted reels in Chromium with its sandbox off next to the accounts database; the real client IP is not restored behind the edge, so the per-IP limits key on the edge's address; the `limit_req` lines for `/api/verify` are written and waiting in the repo's nginx mirror.
**Options.** (a) One evening on the box with me: a service user, the unit-file lines, two nginx lines, then the sign-in rate limit. (b) Leave it until the release.
**Recommendation.** (a), before any announcement.

## 9. The account-registry deploy day (F-2642-3)
**What is true.** The code landed on 2026-09-19 behind a closed gate; the deploy is five steps in one evening (quiesce the old writers, the verified KV export, the worker with a secret, bootstrap, the Pages binding). The trigger condition is met.
**Recommendation.** Name an evening; nothing else is needed.

## 10. The ten-minute phone measurement (B1)
**What is true.** Every frame-time number in the repo comes from your Mac, including the rows labelled mobile. The device verdict rows have been on your desk since the release spec.
**Recommendation.** Ten minutes on your phone when the family is around, two maps, the numbers into the rows I hand you.

## 11. Rewrite history for a personal address (review REPO-3)
**What is true.** A personal gmail address was in nine tracked files (redacted today) and is the author of nine commits on `main` (three from 2026-09-20, six from July). The repository went public on 2026-09-20 with zero forks, which makes a rewrite cheapest now. A rewrite changes every commit hash after the earliest such commit; the last rewrite (A3) took a quiet evening and re-pointing of every cited id.
**Options.** (a) Rewrite now, in the next quiet window. (b) Accept the author fields as they are.
**Recommendation.** Your call; if you want it gone, now is the moment.

## 12. CI on your GitHub account (review TEST-1, BUILD-4)
**What is true.** Nothing runs on a push; every gate runs on your Mac. A three-step workflow (install, type-check, build) on every push is enough to turn "works on the Mac" into "works from any clone". The parked draft names a script that does not exist and pins the wrong Node; I correct it first.
**Recommendation.** Yes. You enable Actions for the repository; I supply the file.

## 13. The shape of the ledgers under the retention law (review D)
**What is true.** STATUS.md is 20.5 MB, 97% of it archived line-1s in one file; BACKLOG is 9.2 MB with the findings above its own title; the law files were 1 MB until today. Nothing is deleted under the law, but the shape makes them unreadable.
**Options.** (a) Rotate old line-1s into dated archive files, split BACKLOG into a short index plus per-epic files, and replace line-number pointers with stable anchors; every byte kept, in git and in the archives. (b) Leave the shape.
**Recommendation.** (a); it is retention-compliant and I execute it with the guards adjusted.

## 14. Evidence offload (review REPO-1)
**What is true.** 7.4 GB of the 8.4 GB tracked tree is evidence (screenshots, transcripts), growing about 1 GB a day during art campaigns; GitHub reports about 10 GB.
**Options.** (a) Evidence goes to the existing archive repository with an index and small previews in the tree, plus a size budget per landing. (b) A bucket (R2) with an index; small monthly cost. (c) Only the size budget.
**Recommendation.** (a) plus the budget.

## 15. The county ledger mirror stays out of the public tree (F-2661-1)
**What is true.** A standing duty still says to commit the daily ledger mirror; the private archive already holds the whole series (28 mirrors). Account rows are refused by a rooted guard; the question was whether county standings may live in plaintext in a public repository.
**Recommendation.** Keep the mirror out of the public tree and point the duty at the private archive; it costs nothing and is being written into the hygiene master.

## 16. The fire memory's home (F-2660-1)
**What is true.** The fires' distilled memory (815 files, 2.4 MB, no secrets) lives only on this Mac, outside every repository.
**Recommendation.** Mirror it into the private archive repository, the same carve-out the run logs got.

## 17. The era-bump day (review SIM-1)
**What is true.** The browser seeds the harvest from the debug seed and the headless engine from the run seed, so a human and an agent on the same seed see different gold seams (three against two, demonstrated). Your ruling of 2026-09-07 says they must see the same world. The one-line cure re-hashes every human tape, so it needs an era bump on a day you name.
**Recommendation.** Bundle it with the Night Shift lantern landing (which re-records floors anyway) on the next quiet day.
