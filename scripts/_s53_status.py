import io

path = "/Users/robin/Claude/Projects/Gold Rush/STATUS.md"
with io.open(path, "r", encoding="utf-8") as f:
    lines = f.read().split("\n")

old_line1 = lines[0]

new_line1 = (
    "Last updated: 2026-07-06T07:56+07:00 s53 handoff, lock CLEARED (native Mac, bookkeeping-only fire) "
    "— **VM-BRICK SAGA CLOSED: it was a Cowork sandbox problem and we are NATIVE now — verified this fire: "
    "disk `/` = 2.1Ti free, real git/node/playwright, runner alive. s51/s52 'Robin owes: VM recycle' is VOID (no VM exists); struck from owes.** "
    "**RUNNER LIVE THIS FIRE** — lane-runner-v3.sh pid 72752 actively running main-slot task **031 animation-roundness-code** "
    "(its log grew at fire time 07:54; no 031 done-marker yet). Main working tree is therefore DIRTY with 031's in-flight output "
    "(src/assets/SpriteAnimator.ts, src/entities/Hero.ts, src/entities/pools.ts, src/game/Balance.ts + Balance.ts.orig backup + e2e/task-031-anim-roundness.spec.ts) "
    "— so EVERY drain is BLOCKED this fire (law: merge onto CLEAN main only). I touched NO src/lane/art files. "
    "**This fire's one act = host-side bookkeeping commit ONLY** (path-scoped, no `-A`; secret-scanned clean): "
    "CLAUDE.md §12 migration note, docs/HANDOVER-2026-07-06.md, scripts/{fire.md,fire-runner.sh,com.goldrush.fire.plist} (native fire infra), "
    "tasks/031+032+033 master specs, and this STATUS handoff. "
    "LEDGER.md + assets/raw/* + assets/crafting-queue/pending/* + assets/requests/codex-art-run-00{3,4}.md were LEFT UNCOMMITTED on purpose — "
    "they are a referential unit with their art/crafting DRAINS (committing LEDGER without its raws = inconsistency). "
    "**NEXT-FIRE PRIORITIES (all gated on the runner freeing main / one drain per fire, serial, oldest-first):** "
    "(A) drain **031 anim-roundness** the moment the runner done-moves it (watch tasks/done + main dirty from a finished MAIN task) — gate tsc+build+spec+e2e/task-031+boot probe; "
    "(B) **lane-a demo-profiles** (done-marker 20260705-230328) — BIND-CHECK gr.difficultyPreset vs 024's gr.difficultyPreset.v1; crafting-fork likely EMPTY (no src/crafting in lane, verify in diff); scope=gr.profile.v2 named profiles/suspend/scoreboard/hints, install() only, no Game.ts; "
    "(C) **art-029 town raws** (done-marker 20260705-230328; 5 buildings + 8 townsfolk + tavern interior in assets/raw) — extract-alpha + contracts + LEDGER; "
    "(D) **art-032 walk4 sheets** (done-marker 20260706-071823; 4 raws char-{hero,jumper}-sheet-walk4-{a,b}.png, GENERATED/PENDING-PROCESSING per LEDGER) — extract 4x4 `--key ff00ff --grid 4x4`, measured height bands, contracts; "
    "(E) **lane-d m6-actors** (done-marker 20260705-230329) — note Robin still owes attempt-3 verdict (3a recommended) before integrating; "
    "(F) **task 033 crafting-pipeline-first-run** (queued in tasks/queue/main, runs after 031) — 2 pending crafting orders sit in assets/crafting-queue/pending (both steady-brass-pan, 18s apart = double-post/dedupe nit for the pipeline). "
    "After all drains land: unpause `mv tasks/queue-paused/* tasks/queue/main/` (021/026/027/030), serial. "
    "tasks/failed/ holds 4 STALE rc1 entries (029, lane-c, lane-d, 028) from 22:4x–22:5x — all superseded by later 23:0x done-markers / 028 integrated at 6c356bc — NO re-queue owed. "
    "**Robin owes (native-era, nag politely, never block):** lane-d attempt-3 verdict (3a rec), turret-feel + water-feel playtests, Mac full-regression evidence, favicon 16px eyeball. "
    "Canon always: brief §9 (frontier-tech weapons not firearms; illustrated never gory; no Native American enemies; naming §9.4; the agent is 'the Prospector')."
)

archive_bullet = "- **s52 handoff (line-1 archive):** " + old_line1

lines[0] = new_line1

# insert the s52 archive right after the s9at binding law bullet
insert_at = None
for i, ln in enumerate(lines):
    if ln.startswith("- **s9at"):
        insert_at = i + 1
        break
if insert_at is None:
    insert_at = 1
lines.insert(insert_at, archive_bullet)

with io.open(path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("OK new-line1-len=%d old-archived-len=%d insert_at=%d total_lines=%d" % (
    len(new_line1), len(old_line1), insert_at, len(lines)))
