#!/bin/bash
# ppr1 cure (in the chain after the merge, cwd = the chain): the first per-landing evidence offload under the owner's
# 2026-09-24 ruling 14(a). The sealed run-11 record (230 files, 86,011,222 bytes) moves into the PRIVATE archive's
# `evidence` branch through scripts/evidence-offload.mjs (index + pointers + previews stay in the tree, the tool
# commits both sides), every SHA-256 is verified, the landing's added evidence is re-measured under 40,000,000 bytes,
# PRIVATE is re-checked, and the archive branch is pushed and its remote tip verified. Any failure -> needs hands.
G=$1; set -u
A="$HOME/.goldrush/archive/GoldRush-archive"; SLUG="Agent-Town/GoldRush-archive"
say() { echo "cure ppr1: $*" >> "$G"; }
fail() { say "FAILED — $*"; exit 1; }
BASE=$(git rev-parse HEAD^1 2>/dev/null) || fail "no merge parent"
[ "$(git -C "$A" branch --show-current 2>/dev/null || git -C "$A" symbolic-ref --short HEAD)" = "evidence" ] || fail "archive checkout not on evidence"
[ -z "$(git -C "$A" status --porcelain)" ] || fail "archive checkout dirty"
[ "$(gh repo view "$SLUG" --json visibility --jq .visibility 2>/dev/null)" = "PRIVATE" ] || fail "archive repo not PRIVATE (or gh unreachable)"
python3 - "$A" "$SLUG" <<'PY' || exit 1
import subprocess,sys,re
work,slug=sys.argv[1:]
def remote(cwd,name): return subprocess.check_output(['git','-C',cwd,'remote','get-url',name],text=True).strip()
def identity(url):
    m=re.fullmatch(r'(?:git@github\.com:|https://github\.com/)([^/]+/[^/]+?)(?:\.git)?',url); assert m, 'remote must be a credential-free GitHub URL'; return m[1].lower()
assert identity(remote('.','archive'))==slug.lower(), 'repo archive remote is not the private archive'
assert identity(remote(work,'origin'))==slug.lower(), 'archive checkout origin is not the private archive'
PY
say "archive checkout verified: evidence branch, clean, PRIVATE, identity ok; base $BASE"
node scripts/evidence-offload.mjs --plan --json > /tmp/ppr1-plan.json 2>>"$G" || fail "plan"
node -e 'const p=require("/tmp/ppr1-plan.json");const c=p.candidates.find(x=>x.subtree==="artifacts/sol-play-proofs-7-record");if(!c){console.error("no candidate subtree");process.exit(1)};console.log("plan: movable",c.movableFiles,"files",c.movableBytes,"bytes, keep",c.keep.length,"oversize",(c.oversize||[]).length);if(c.movableFiles!==230||c.movableBytes!==86011222||c.keep.length)process.exit(1)' >> "$G" 2>&1 || fail "plan numbers differ from the report (230 files / 86,011,222 bytes / keep 0)"
node scripts/evidence-offload.mjs --apply artifacts/sol-play-proofs-7-record --archive-worktree "$A" --drain-authorized >> "$G" 2>&1 || fail "offload apply"
[ -z "$(git status --porcelain --untracked-files=no)" ] || fail "chain dirty after the tool's commit"
python3 artifacts/play-proofs-evidence-retention-1/verify-archive.py "$(pwd)" "$A" >> "$G" 2>&1 || fail "verify-archive (hashes)"
node scripts/review-evidence-audit.mjs --all >> "$G" 2>&1 || fail "review-evidence-audit"
node scripts/evidence-budget.mjs "$BASE" HEAD >> "$G" 2>&1 || fail "evidence budget over the ceiling"
say "offload applied and verified; budget under the ceiling (see lines above)"
[ "$(gh repo view "$SLUG" --json visibility --jq .visibility 2>/dev/null)" = "PRIVATE" ] || fail "archive repo not PRIVATE at push time"
git -C "$A" push -q origin refs/heads/evidence:refs/heads/evidence >> "$G" 2>&1 || fail "archive push"
LOCAL=$(git -C "$A" rev-parse HEAD); REMOTE=$(git -C "$A" ls-remote origin refs/heads/evidence | cut -f1); [ "$LOCAL" = "$REMOTE" ] || fail "archive remote tip $REMOTE != local $LOCAL"
python3 artifacts/play-proofs-evidence-retention-1/verify-archive.py "$(pwd)" "$A" >> "$G" 2>&1 || fail "verify-archive after push"
say "archive evidence branch pushed and verified at $LOCAL; repo commit $(git rev-parse --short HEAD)"
