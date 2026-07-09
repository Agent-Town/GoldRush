import sys
p = "STATUS.md"
lines = open(p, encoding="utf-8").read().split("\n")
old_line1 = lines[0]
mode = sys.argv[1]
if mode == "lock":
    new1 = ("ACTIVE 2026-07-09T22:10:00Z (s268 fire) — RECON + VERIFY-DON'T-INHERIT on the inherited "
            "lane b/c/d \"content-dupe\" claim. No CODEX-WALL; assayer pending EMPTY; no new real failed runs; "
            "art slot LIVE (runner pid 408 executing 03-jumper; queue fed 04-baron + 05-town-cast); runner alive. "
            "No new drainable output: 060 owner-parked (recap-card fork, OWNER'S DESK); lanes b/c/d checked below. "
            "Doing: git-verify the dupe claim, then bookkeeping handoff. No merges this fire.")
    label = "s267 handoff (line-1 archive)"
else:
    new1 = open("tasks/_s268_handoff.txt", encoding="utf-8").read().strip()
    label = "s268 lock (line-1 archive)"
archive = "- **%s:** %s" % (label, old_line1)
lines[0] = new1
assert lines[1].strip() == "", repr(lines[1][:40])
lines.insert(2, archive)
lines.insert(3, "")
open(p, "w", encoding="utf-8").write("\n".join(lines))
print("OK", mode, "| line1:", lines[0][:70])
