# Attended drain: run 11 only

Pending coordination: the attended session must select the drain window, hold fires, identify and verify the
existing private archive repository and its `evidence` branch, and prepare a clean archive checkout.
No permission to execute a real archive write or push is implied by this local fixture.
The owner-timed estate-wide offload remains separate. Never apply to `artifacts/sol/play-proofs` or another run.

Use the existing attended drain lock (`bash scripts/attended/dlock.sh …`) around this complete operation.
Use the attended fire hold and normal landing toolkit. These commands assume a clean isolated candidate already
cut from fresh main, containing this task's allowed paths and six unchanged specs, committed locally by the runner
or drain. Do not cherry-pick the original six commits on top: they reintroduce the 86 MB live record.
Record the fresh-main base before importing the candidate. Preserve source branch `sol/map-art-campaign-2` untouched.

Set these explicitly in the attended shell (no inferred remote destination):

```sh
set -eu
: "${GR_RUN11_CANDIDATE:?absolute isolated candidate checkout}"
: "${GR_RUN11_BASE:?fresh main commit before candidate import}"
: "${GR_RUN11_ARCHIVE:?clean checkout of the existing private archive}"
: "${GR_RUN11_ARCHIVE_REPO:?verified GitHub owner/repository slug}"
cd "$GR_RUN11_CANDIDATE"
test -z "$(git status --porcelain --untracked-files=no)"
test -z "$(git -C "$GR_RUN11_ARCHIVE" status --porcelain)"
test "$(git -C "$GR_RUN11_ARCHIVE" branch --show-current)" = evidence
# Verify both repository identity and PRIVATE visibility. Do not print remote URLs/credentials.
test "$(gh repo view "$GR_RUN11_ARCHIVE_REPO" --json visibility --jq .visibility)" = PRIVATE
python3 - "$GR_RUN11_ARCHIVE" "$GR_RUN11_ARCHIVE_REPO" <<'PY'
import subprocess,sys,re
work,slug=sys.argv[1:]
def remote(cwd,name):
 return subprocess.check_output(['git','-C',cwd,'remote','get-url',name],text=True).strip()
def identity(url):
 m=re.fullmatch(r'(?:git@github\.com:|https://github\.com/)([^/]+/[^/]+?)(?:\.git)?',url)
 assert m, 'Remote must be a credential-free GitHub SSH/HTTPS URL; resolve explicitly before proceeding'
 return m[1].lower()
assert identity(remote('.', 'archive')) == slug.lower()
assert identity(remote(work, 'origin')) == slug.lower()
PY
node scripts/evidence-offload.mjs --plan --json > /tmp/run11-attended-plan.json
node -e 'const p=require("/tmp/run11-attended-plan.json");const c=p.candidates.find(x=>x.subtree==="artifacts/sol-play-proofs-7-record");if(!c||c.movableFiles!==230||c.movableBytes!==86011222||c.keep.length)process.exit(1)'
node scripts/evidence-offload.mjs --apply artifacts/sol-play-proofs-7-record \
  --archive-worktree "$GR_RUN11_ARCHIVE" --drain-authorized
python3 artifacts/play-proofs-evidence-retention-1/verify-archive.py \
  "$GR_RUN11_CANDIDATE" "$GR_RUN11_ARCHIVE"
node scripts/review-evidence-audit.mjs --all
node scripts/evidence-budget.mjs "$GR_RUN11_BASE" HEAD
# Run the full normal merged-tree drain gates here. Package, guards, six unset specs,
# adjacent suites and plain boots must all be verified on the actual merged candidate.
# Recheck PRIVATE immediately before publication and push only the verified archive branch.
test "$(gh repo view "$GR_RUN11_ARCHIVE_REPO" --json visibility --jq .visibility)" = PRIVATE
git -C "$GR_RUN11_ARCHIVE" push origin refs/heads/evidence:refs/heads/evidence
test "$(git -C "$GR_RUN11_ARCHIVE" rev-parse HEAD)" = \
  "$(git -C "$GR_RUN11_ARCHIVE" ls-remote origin refs/heads/evidence | cut -f1)"
python3 artifacts/play-proofs-evidence-retention-1/verify-archive.py \
  "$GR_RUN11_CANDIDATE" "$GR_RUN11_ARCHIVE"
node scripts/evidence-budget.mjs "$GR_RUN11_BASE" HEAD
```

Only after successful archive push verification and normal gates may the attended session lift F-2704-1,
integrate the final candidate and publish main using its normal workflow. Do not claim the fixture commit as a
private archive commit. A failed push leaves the local archive and candidate intact; preserve both and report.
Keep `manifest.json` in the packaging report directory: unlike the frozen record, this report directory is not
part of the explicit offload target. The original run-note links explain pending versus completed pointers.

Tested locally: plan, apply (without `--drain-authorized`, local destination only), SHA-256 verifier, audit,
budget and preview. GitHub privacy/identity checks, remote push, merged-tree integration and full final drain
are deliberately unexecuted. Their required context is supplied only by the attended coordinator.
