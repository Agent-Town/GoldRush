#!/bin/bash
# F-2742-1 repair — run ONLY on the owner's word. Re-cuts the clean lineage from the CURRENT main under a fire hold
# (so no candidate can be stale), verifies it (byte-identical tip tree, descends from origin's 0979de763, no blob over
# GitHub's limit), moves local main onto it, re-points every cited commit id in the ledgers (the A3 precedent), rebases
# lane-b's unlanded commits, pushes main with an ORDINARY push, and keeps the rejected lineage under
# archive/main-rejected-2026-09-28. Fires are held throughout. The stripped paths are derived from the data: every
# path under the incident dir whose directory ends in -results/ and which is ABSENT from the tip tree (Playwright
# traces, videos, failure shots of e7-tape-drawer-inheritance-1 attempt 1) — nothing the tip still holds is touched.
set -u; export PATH=/opt/homebrew/bin:$PATH; R="/Users/robin/Claude/Projects/Gold Rush"; cd "$R" || exit 1
BASE=0979de763; STAMP=$(date -u +%Y%m%d-%H%M); CLONE=~/.goldrush/repair/clone-go-$STAMP; MAP=~/.goldrush/repair/commit-map-go-$STAMP.txt; OUT=~/.goldrush/repair/repair-main.out
log() { echo "$(date -u '+%H:%M:%SZ') $*" | tee -a "$OUT"; }
command -v git-filter-repo >/dev/null || python3 -c "import git_filter_repo" 2>/dev/null || { log "git filter-repo not available"; exit 1; }
# 1. wait for a fire gap, then hold the fires; refuse under a live lane run or a dirty tracked tree
for i in $(seq 1 240); do head -1 STATUS.md | grep -qE "lock CLEARED" && [ ! -d tasks/.fire.lock ] && break; sleep 30; done
bash scripts/attended/fire-hold.sh start >> "$OUT" 2>&1 || { log "fire hold refused"; exit 1; }
trap 'bash scripts/attended/fire-hold.sh stop >> "$OUT" 2>&1; log "fire hold released"' EXIT
[ -z "$(ls tasks/running/ 2>/dev/null | grep -v pid)" ] || { log "a lane run is live; refusing to move main under it"; exit 1; }
git status --short | grep -vE '^\?\?|^ M logs/' | grep -q . && { log "main tree has tracked changes outside logs/; refusing"; exit 1; }
OLD=$(git rev-parse main); OLDTREE=$(git rev-parse "$OLD^{tree}"); log "old main $OLD ($(git rev-list --count $BASE..$OLD) commits since $BASE; kept as archive/main-rejected-2026-09-28 $(git rev-parse --short archive/main-rejected-2026-09-28))"
# 2. re-cut the clean lineage from THIS main in a scratch clone
LIST=~/.goldrush/repair/strip-paths-$STAMP.txt
comm -23 <(git log --name-only --format= "$BASE..$OLD" -- 'artifacts/e7-tape-drawer-inheritance-1/' | grep -E '\-results/' | sort -u) <(git ls-tree -r --name-only "$OLD" | sort -u) > "$LIST"
N=$(wc -l < "$LIST" | tr -d ' '); [ "$N" -gt 0 ] || { log "no stripped paths derived; nothing to repair"; exit 1; }
log "$N paths to strip (all absent from the tip tree): $(sed -E 's#(-results/).*#\1#' "$LIST" | sort -u | tr '\n' ' ')"
rm -rf "$CLONE"; git clone -q --branch main --single-branch "$R" "$CLONE" >> "$OUT" 2>&1 || { log "clone failed"; exit 1; }
[ "$(git -C "$CLONE" rev-parse main)" = "$OLD" ] || { log "clone tip is not main"; exit 1; }
( cd "$CLONE" && git filter-repo --force --invert-paths --paths-from-file "$LIST" --refs "$BASE..main" ) >> "$OUT" 2>&1 || { log "filter-repo failed"; exit 1; }
cp "$CLONE/.git/filter-repo/commit-map" "$MAP" || { log "no commit map"; exit 1; }
NEW=$(git -C "$CLONE" rev-parse main); git fetch -q "$CLONE" main || { log "fetch from the clone failed"; exit 1; }
NEWTREE=$(git rev-parse "$NEW^{tree}")
[ "$NEWTREE" = "$OLDTREE" ] || { log "the re-cut tip tree ($NEWTREE) differs from main's ($OLDTREE); refusing"; exit 1; }
git merge-base --is-ancestor "$BASE" "$NEW" || { log "re-cut does not descend from origin's tip"; exit 1; }
[ "$(git rev-list --count $BASE..$NEW)" = "$(git rev-list --count $BASE..$OLD)" ] || { log "commit count changed; refusing"; exit 1; }
BIG=$(git rev-list --objects $BASE.."$NEW" | git cat-file --batch-check='%(objecttype) %(objectsize)' | awk '$1=="blob" && $2>40000000' | wc -l | tr -d ' '); [ "$BIG" = "0" ] || { log "re-cut still carries $BIG blob(s) over 40 MB"; exit 1; }
log "re-cut $NEW verified: identical tree, descends from $BASE, same commit count, no blob over 40 MB; map $MAP ($(wc -l < "$MAP" | tr -d ' ') lines)"
git push -q origin "$NEW:refs/heads/candidate/main-repair-go-$STAMP" >> "$OUT" 2>&1 && log "backed up on origin as candidate/main-repair-go-$STAMP" || log "candidate backup push failed (continuing; main's push below is the real test)"
# 3. move main (the working tree is byte-identical, so only the ref moves)
git update-ref refs/heads/main "$NEW" "$OLD" || { log "update-ref refused (main moved?)"; exit 1; }
git reset -q --soft "$NEW" 2>/dev/null; log "main now $(git rev-parse --short main)"
# 4. re-point cited commit ids and commit
python3 scripts/attended/repoint-ids.py "$MAP" --apply | tee -a "$OUT" | head -n 3
git add -u -- tasks docs reviews STATUS.md archive scripts/attended/landings artifacts 2>/dev/null
git commit -q -m "shrink: every cited commit id re-pointed to the re-landed history (F-2742-1) — the inheritance attempt-1 traces left the unpublished lineage, the tip tree is byte-identical, the rejected lineage is archive/main-rejected-2026-09-28

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && log "re-point commit $(git rev-parse --short main)"
# 5. rebase lane-b's unlanded commits onto the new main (same content, new base), if any
if [ "$(git rev-list --count "$OLD"..sol/wave-lane-b)" -gt 0 ]; then git -C worktrees/lane-b rebase -q --onto main "$OLD" sol/wave-lane-b >> "$OUT" 2>&1 && log "lane-b rebased onto the new main ($(git rev-list --count main..sol/wave-lane-b) ahead)" || { log "lane-b rebase needs hands; aborted"; git -C worktrees/lane-b rebase --abort 2>/dev/null; }; fi
for L in lane-a:sol/open-findings-astra lane-c:sol/map-art-campaign-2 lane-d:art/portraits-e5-e10-generated; do W=${L%%:*}; B=${L##*:}; [ "$(git rev-list --count main..$B)" -gt 0 ] && [ "$(git rev-list --count "$OLD"..$B)" = "0" ] && git -C "worktrees/$W" reset -q --hard main && log "$W reset onto the new main (it held only old-lineage commits already on main)"; done
# 6. ordinary push
git push origin main 2>&1 | grep -E "error|rejected|GH0|main -> main" | tee -a "$OUT" | head -3
git ls-remote --heads origin main | cut -c1-9 | xargs -I{} echo "origin/main now {}" | tee -a "$OUT"
log "repair done; fires resume when the hold releases"
