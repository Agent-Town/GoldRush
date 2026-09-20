# test:node-guards — per-test name list, s2147 2026-08-22

Banked so a future fire can DIFF a count instead of guessing at one (F-2147-2).
A tally cannot be diffed; these names can. s2146 reported 492 tests and s2147 490,
both 0-fail — and nobody can say which two moved, because only tallies were ever kept.

Commit gated: 0dde52f23 (detached worktree ctl-s2147, run ALONE, fire shell)
Wall: 458.5s · EXIT=0 · node v26.4.0 · CLAUDE_CONFIG_DIR set · load avg ~4.0

## Tally
    ℹ tests 490
    ℹ suites 0
    ℹ pass 485
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 5
    ℹ todo 0
    ℹ duration_ms 457103.58025

## Names (490 lines; ✔ pass · ﹣ skip · ✖ fail)
✔ agent reel validation reuses the door bounds and CLI tapes are byte deterministic
✔ agent consent keeps the ruled pan and build rungs plus shipped repair rung
✔ tool surface keeps auto-pan and place-building at their ruled rungs
✔ standing orders keep harvest at rung 2 and build at rung 3
✔ a wire act crosses into the sim and changes it
✔ agent_orders validates the standing-order grammar and wire bounds
✔ two independently booted sims agree tick for tick
✔ the seat carries BUILD and refuses to stretch for the rest
✔ the seat carries the facing, and refuses a facing the county does not keep
✔ the throttle ceiling is the relay rate limit, not a taste
✔ rob's v1 live reel is retained but reported as unverifiable legacy
✔ once processes verified, mismatch, crash, and legacy rows fail-honestly
✔ dry-run prints the verdict without posting it
✔ API failures back off before polling again
✔ a missing dist/ is refused, not cleared
✔ CONTROL: the same fixture with one benign dist file passes — it is the emptiness, not the fixture
✔ an empty later-asset blacklist is refused — the leak check would otherwise pass vacuously
✔ the success line reports the denominator, so a vacuous clearance would be legible
✔ POSITIVE CONTROL: a later-epoch manifest id in dist still fails
✔ POSITIVE CONTROL: a leaked later-epoch plate asset in dist still fails
✔ POSITIVE CONTROL: the GR_RELEASE=e1 precondition still refuses a bare invocation
✔ an E1 asset whose content hash reads like an era tag is NOT a leak
✔ POSITIVE CONTROL: a genuine later-era asset in dist still fails
✔ POSITIVE CONTROL: a later-era tag ENDING the module name still fails (the `$` anchor)
✔ contract ids are globally unique across the ten epoch bundles
✔ bench seed sets cover Frontier and contain only valid known-contract seeds
✔ reds on the pre-strike ledger that manufactured the owner directive, greens on the struck one
✔ a closure APPENDED below the panel row does not clear the panel — which is the whole defect
✔ striking the ORIGINAL line clears the panel — the fix the guard prescribes actually works
✔ an open finding on the panel is left alone
✔ REFUSES rather than passes when the panel moves out from under it
✔ the wide closure vocabulary is opt-in and does not leak into the default census
✔ campaign harness URL binds Terrain to its selected contract
✔ Canyon Works alone publishes its live connection objective
✔ every destructured ssrLoadModule symbol is exported by its source module
✔ contract direction files exist under assets/processed
✔ contract direction aliases do not overwrite explicit directions
✔ a bare spec:line citation fails the guard
✔ a citation carrying an exact test title passes
✔ a short code span cannot consume the following quoted title
✔ a bare apostrophe cannot consume the following quoted title
✔ an odd same-kind delimiter cannot consume the following quoted title
✔ a test helper string is not harvested as a title
✔ chained describe modifiers remain title declarations
✔ a citation carrying an ELIDED test title passes
✔ a quoted title that does not exist in the spec still fails
✔ a grandfathered bare citation passes, and a second copy of it does not
✔ --report never gates
✔ REFUSES when no tracked task markdown exists (denominator 0 docs)
✔ REFUSES when task docs exist but carry zero citations
✔ REFUSES when the baseline it ratchets against is missing
✔ a citation quoting a real NON-TEST source line is carried, not a violation
✔ a quote matching NEITHER a title nor any source line still fails
✔ the verdict names the citations it did NOT gate
✔ --report still never gates, even on a denominator it could not read
✔ the claimed-spec -> owning-config map is DERIVED, not tabulated
✔ derivation REFUSES rather than silently measuring nothing if the array is renamed
✔ MANUFACTURED: a claimed spec whose owning config has NO npm caller is named
✔ a runnerless harness WARNS and never changes the exit code
✔ NO package.json is not the same as no caller — a synthetic root must stay silent
✔ MANUFACTURED: a bare playwright command naming a claimed spec FAILS the guard
✔ MANUFACTURED: a CHECKLIST-form adjacent-suite line FAILS the guard (why arm (b), not (a))
✔ MANUFACTURED: a mention inside the SELF-CHECK region FAILS the guard
✔ a DESCRIPTIVE mention outside any gate region is NOT an offender (why not arm (c))
✔ naming the owning CONFIG clears the master
✔ naming the npm ALIAS clears the master
✔ the guard actually RUNS when invoked as a script (entrypoint is not a silent no-op)
✔ the live board has no LIVE offender
✔ every grandfathered file is still a real offender (no stale excuses)
✔ the guard sets process.exitCode and never force-exits (F-2098-1)
✔ the agent view publishes declared pressure-contract coal seams only
✔ whole-suite collection guard is cwd-invariant
✔ town-spec collection guard is cwd-invariant
✔ E2 default railcar group secures only when its last component dies
✔ E2 default railcar group rejects a wrong group id
✔ E3 variant uses the component-boss group suffix, not railcar
✔ E1 plain Baron accepts no group id and rejects a defined one
✔ E6 Homemaker secures on its CORE only, never on the authored VAC+RACK group
✔ elite kind must match even when the component group is fully down
✔ console error watching stays in one literal-prefix source
✔ fire shell SKIPS the cross-engine guard, with a reason a reader can act on
✔ lane and attended shells RUN the cross-engine guard
✔ a missing second interpreter still outranks the shell question
✔ the SELECTOR admits an owner ACT and refuses a gate that merely says the word
✔ a NEGATED owner gate is a disclaimer and must NOT flag (F-1551-4)
✔ negation handling does not disarm the guard — every positive still flags
✔ a negation is scoped to its own sentence, so a mixed gate keeps its owner half
✔ the selector reads the other real owner-gate phrasings on the board
✔ and refuses the fire-actionable phrasings that sit beside them
✔ a row is keyed by the id it INTRODUCES, not one its prose cites
✔ gateOf takes the LAST gate clause, since row prose quotes earlier ones
✔ MANUFACTURED DEFECT — an owner-gated row filed with no desk mention is named
✔ THE REAL s1540->s1541 EVENT: both undesked owner rows are caught, the six others are not
✔ ...and once they are ON the desk, the same window passes
✔ the desk is the LAST desk word, so an upstream PROSE mention does not satisfy it
✔ DESK-NOT-OWED excuses an id, and is scoped so it cannot cover an unrelated one
✔ SKIPS mid-fire on an ACTIVE lock, so drain batteries are unaffected
✔ REFUSES rather than greening when line-1 carries no desk at all
✔ the backtick header is readable here too — the three desk parsers stay in step
✔ addedRows reads the ledger glyphs and ignores diff noise
✔ a desk item WITH a declaring row passes
✔ MANUFACTURED: a desk item with NO row anywhere exits 1 and names the id
✔ MANUFACTURED: the F-1328-3 shape — MENTIONED inside another finding row is NOT declared
✔ a row whose id sits past the 90-char subject zone does NOT declare it
✔ the leading GLYPH is irrelevant — F-1334-1 refuted marker equality
✔ the markdown list bullet is stripped: bulleted and unbulleted rows read alike
✔ GROUND TRUTH — the real s1529 backtick header must NOT read as "no desk"
✔ REFUSES (exit 2) rather than greening when there is no OWNER DESK segment
✔ REFUSES (exit 2) when the desk segment holds zero keyed items
✔ REFUSES (exit 2) when BACKLOG.md is missing
✔ the entrypoint actually RUNS — a space in the repo path must not no-op it
✔ the live board is green under this guard (baseline is honest)
✔ MANUFACTURED F-1471-3: an ARCHIVED desk never satisfies the guard
✔ MANUFACTURED F-1471-3: an archived desk must not MASK an undeclared LIVE item
✔ all five desk spellings are read — the majority form was invisible
✔ an ACTIVE lock line SKIPs (exit 0) — the desk is written at handoff time
✔ a lock line that MENTIONS the desk in prose is still a lock, not a desk
✔ MANUFACTURED: a prose mention upstream loses to the REAL desk in the tail
✔ a handoff whose desk header has no F-IDs after it REFUSES (exit 2)
✔ a SLUG-keyed desk item WITH a declaring row passes
✔ MANUFACTURED F-1534-2: a SLUG desk item with NO row exits 1 and names the slug
✔ the F-1328-3 shape on the SLUG axis: a slug CITED in another row is not declared
✔ F-1535-1: a backtick in an item's PROSE is not a desk item (the flat-scan trap)
✔ F-1535-1: an item keyed by an F-ID that also cites its slug is ONE F-keyed item
✔ a desk of ONLY slug items does not trip the zero-keyed-items refusal
✔ the grandfather list may only SHRINK — never grows past the s1334 baseline
✔ every grandfathered id is still on the desk — the list must not rot
✔ MANUFACTURED: with the list EMPTY the guard is strict — no id is excused
✔ derived door matches the fixed admission baseline
✔ drain path REFUSES a terminal-closed leaf (F-1248-1) — and clears the same fixture when live
✔ every TERMINAL_CLOSED word is refused on the drain path, and no other word is
✔ an owner BLOCK still outranks everything and still names the owner (unchanged by F-1248-1)
✔ --queue keeps its own wording and its own reason line
✔ F-1311-2: --queue refuses a fresh bare citation and names the repair
✔ F-1311-2: --queue accepts the same citation with its test title
✔ F-1311-2: --queue respects the grandfathered baseline
✔ F-1311-2: the drain arm remains unchanged for a fresh bare citation
✔ a closed leaf whose reason sits under a session-stamped key is still explained
✔ F-1249-1: a session-stamped reason key that varies the STEM is explained, and non-reason keys are not
✔ F-1249-1: a stale blockedReason is never printed as the CLOSURE cause
✔ F-1249-1: the leaf TITLE is printed on both refusal arms, even when a reason key exists
✔ --all reports terminal-closed leaves but its exit code still tracks BLOCKED alone
✔ F-1250-1: an EXACT taskFile match outranks a longer-named sibling (no false CLEAR)
✔ F-1250-1: the reverse — a lawful merged drain is not reddened by a longer closed predecessor
✔ F-1250-1: with NO exact match, longest-wins still decides (the tie-break is kept, not replaced)
✔ F-1250-1 rider: a blocked SIBLING still refuses, but now says which leaf you actually named
✔ a missing leaf is still UNKNOWN-not-a-clearance, and --strict still escalates it
✔ --queue REFUSES a master a runner already holds (F-1322-1) — and clears it once the slot frees
✔ the live-run match is the runner's exact shape, not a name suffix
✔ an UNDRAINED done-move WARNS but never refuses — s1320's lawful §7.5 re-dispatch must pass
✔ F-2097-1: an UNREGISTERED master is still refused when a runner holds it
✔ the DRAIN path is untouched by both arms — a done-move is what a drain is FOR
✔ published mask tables exactly track authored contract data
✔ published Moth Season mask stays inside bounds and agrees with authored water
✔ e2-trestle mask stays inside bounds and agrees with authored water
✔ e2-pressure-garden mask stays inside bounds and agrees with authored water
✔ e2-incline mask stays inside bounds and agrees with authored water
✔ e3-canyon-works mask stays inside bounds and agrees with authored water
✔ e3-blackout-ridge mask stays inside bounds and agrees with authored water
✔ e3-moth-season mask stays inside bounds and agrees with authored water
✔ e3-fairground mask stays inside bounds and agrees with authored water
✔ e4-dust-flats mask stays inside bounds and agrees with authored water
✔ e4-long-road mask stays inside bounds and agrees with authored water
✔ e4-gusher-county mask stays inside bounds and agrees with authored water
✔ e4-boneyard mask stays inside bounds and agrees with authored water
✔ e5-regatta mask stays inside bounds and agrees with authored water
✔ e5-stillwater mask stays inside bounds and agrees with authored water
✔ e5-flotilla mask stays inside bounds and agrees with authored water
✔ e6-glow-mesa mask stays inside bounds and agrees with authored water
✔ e6-showroom mask stays inside bounds and agrees with authored water
✔ e6-half-life-hollow mask stays inside bounds and agrees with authored water
✔ e6-picnic mask stays inside bounds and agrees with authored water
✔ e7-relay-valley mask stays inside bounds and agrees with authored water
✔ e7-echo-canyon mask stays inside bounds and agrees with authored water
✔ e7-dead-band mask stays inside bounds and agrees with authored water
✔ e7-relay-rush mask stays inside bounds and agrees with authored water
✔ e8-mare-claim mask stays inside bounds and agrees with authored water
✔ e9-dome-basin mask stays inside bounds and agrees with authored water
✔ e9-seed-run mask stays inside bounds and agrees with authored water
✔ e9-devils-alley mask stays inside bounds and agrees with authored water
✔ e9-old-canal mask stays inside bounds and agrees with authored water
✔ e10-ember-shore mask stays inside bounds and agrees with authored water
✔ entry damage tables include both E1 contracts
✔ night shift wave 3 has reduced entry damage
✔ night shift wave 12 has no entry damage scale
✔ entry damage scaling ends after wave 10
✔ entry damage scales are finite reductions
✔ E1 entry damage tables agree
✔ a dev server classifies as dev
✔ a preview server classifies as not-dev — status 200 must NOT exonerate it
✔ a dead port classifies as unreachable
✔ a trailing slash on baseURL does not break the probe
✔ the not-dev message names the actual fix, not just the fault
✔ globalSetup THROWS on a preview server — the violation path actually runs
✔ globalSetup RESOLVES on a dev server — the guard is not one that always fires
✔ globalSetup is INERT when the flag is unset — lanes and ordinary runs pay nothing
✔ real history has exactly the four former double-state findings and current BACKLOG has none
✔ prose citations are not declarations, only struck declarations close, and duplicate opens stay open
✔ regression arm: narrow open vocabulary is byte-identical when explicitly selected
✔ wide open vocabulary admits an explicit 🟠 OPEN declaration
✔ 🟢 RULING without a state word is not an open declaration
✔ wide open vocabulary exposes a ✅ plus separate 🔬 OPEN conflict without reddening narrow
✔ wide-open advisory reports skipped rows, hidden open IDs, and narrow closed-only IDs
✔ fire shell (CLAUDE_CONFIG_DIR present) resolves playwright workers to 1
✔ non-fire shell (CLAUDE_CONFIG_DIR absent) keeps playwright parallelism
✔ all 34 scripts/*.test.mjs fixture owners remove their temp directories
✔ every worker CORS allowlist admits both agenttown origins
✔ no worker leaves the allowlist subject by deleting its declaration
✔ a second battery APPENDS — it never destroys the first arm evidence
✔ playwright jobs get --workers=1 injected
✔ an explicit --workers is respected, so a deliberate parallelism control is not overridden
✔ non-playwright jobs are left exactly as given
✔ a failing job produces a non-zero overall verdict
✔ a command that cannot spawn is recorded as a failure, not a pass
✔ misuse exits 2 rather than reporting a vacuous green
✔ a bare build:release job is refused as misuse, not run and reported as a red leaf
✔ --env GR_RELEASE=e1 satisfies the precondition, so the lawful form is not refused
✔ an inherited GR_RELEASE=e1 also satisfies it — the check reads the RESOLVED environment
✔ a battery with no release job is untouched by the precondition
✔ --cwd actually runs the job in that directory
✔ --env reaches the child process
✔ --env is merged over the inherited environment, not a replacement
✔ a non-existent --cwd exits 2 rather than falling back to the repo root
✔ a malformed --env exits 2 rather than dropping the variable silently
✔ the jobs spec is still found when the new flags precede it
✔ a gate nothing calls is reported as a NEW orphan and exits 1
✔ a tracked test file nothing calls is reported as a NEW orphan and exits 1
✔ grandfathering that orphan with a reason turns the gate green
✔ a gate whose only caller is a *.config.ts webServer command counts as REACHED
✔ a guard named only in a COMMENT is not reached — prose is not a caller
✔ putting it in the GUARDS array clears it — the control for the arm above
✔ a non-gate script (dev, preview, census) is never ratcheted on
✔ an orphan that GAINED a caller is reported so the baseline can tighten
✔ --report never gates, even with a fresh orphan present
✔ REGRESSION: an untracked guard-shaped file is byte-invisible by default
✔ --include-untracked reports an untracked guard-shaped file as NEW with no caller
✔ a tracked baselined orphan stays known under --include-untracked
✔ --include-untracked still excludes untracked SCRATCH_FILE probes
✔ --include-untracked excludes gitignored guard-shaped files
✔ --update-baseline --include-untracked REFUSES without writing baseline bytes
✔ REFUSES (rc=2) when package.json has no scripts block
✔ REFUSES (rc=2) when no scripts/*.mjs is tracked
✔ REFUSES (rc=2) when the resolver cannot reach its own anchors
✔ REFUSES (rc=2) when the baseline file is missing — not read as {}
✔ REFUSES (rc=2) when the baseline is unreadable
✔ REFUSES (rc=2) when no subject matches the gate patterns
✔ an owner escalation whose cited F-ID has no ledger row exits 1
✔ the SAME escalation goes green once the F-ID has a ledger row -- the control
✔ escalating with NO F-ID cited at all exits 1 -- it can never be found
✔ all five desk spellings are matched, so the check cannot be dodged by an apostrophe
✔ POSITIVE CONTROL: the real repo passes, with a non-empty measured subject
✔ classifies citation purpose with paragraph scope
✔ date-only sweep windows start at midnight instead of the current clock time
✔ node glob fallbacks match every on-disk manifest (non-release branches)
✔ every terminal-closed goal leaf can state why it closed
✔ the mirrored resolver vocabulary still matches drain-block-check.mjs
✔ goal tree schema is valid
✔ ten sampled merged leaves have a done receipt and ancestral merge
✔ FakeStorage threads research into the headless sim without moving the cold hash
✔ campaign walks E1 legally, persists each leg, and hashes deterministically
✔ a killed campaign resumes from its last profile checkpoint
✔ --contract selects exactly one named contract
✔ --contract refuses unknown, unseeded, and locked contracts loudly
✔ --contract refuses an empty selector instead of falling back
✔ gr-sim replays the same contract, seed, and orders byte-for-byte
✔ a reactive client can recover from rejected orders
✔ headless landmark starts release before enemies can stall at the perimeter
✔ a distant HARVEST walks before it pays
✔ gr-sim keeps standing orders through free blank and null turns
✔ gr-sim hashes a fractional-yield run identically twice
✔ gr-sim deterministically runs the Claim objective
✔ overtime banks the Claim secure and measures the homestead on both Node engines
✔ runtime rush and --overtime use the same CLI ceiling and terminal stream
✔ the CLI science input reaches and funds the published megaproject cost
✔ gr-sim boots escort mode from data instead of URL state
✔ the Claim driver consumes declared water and posts RunManager secure at wave 10
✔ Twin Banks consumes its declared crossings and build zones before securing at wave 20
✔ the frozen Claim environment rows equal the five pinned bench seeds
✔ gr-sim places Night Shift fixtures from the contract
✔ Night Shift wreckers outrun lantern light headlessly
﹣ gr-sim ends an idle Baron run at its grace ceiling (0.077ms)
✔ the Baron driver runs the declared fight and keeps medal writes off headless
﹣ the E2 Baron fights keep their pinned outcomes (0.093875ms)
✔ identical order failures coalesce across submissions without hiding a new failure
✔ all added lines present in main are absorbed
✔ one absent line is returned as residue
✔ token-rich lane lines can be absorbed by a main superset line
✔ token-poor lane lines are not absorbed by unrelated main text
✔ token fallback starts at exactly eight qualifying tokens
✔ binary diffs are never counted
✔ blank and whitespace-only additions are ignored
✔ missing text is undecidable and never counted
✔ a lane-only new file reports every added line absent from main
✔ a lane-only new binary file remains binary and uncounted
✔ an unreadable lane-tip path remains undecidable
✔ zero residue remains HELD rather than changing the verdict
✔ absorbed-lines counts a lane-created text file missing in main
✔ absorbed-lines keeps a lane-created binary file binary
✔ absorbed-lines narrows undecidable to an unreadable lane tip
✔ no pidfile: the slot is free
✔ our OWN dispatcher does not count as busy (the F-1418-1 cure)
✔ a FOREIGN runner IS busy — the direction that must never regress
✔ pid 1 is an ancestor of EVERY process and must still read busy
✔ fail safe: anything we cannot establish reads busy
✔ an unrelated pid that is merely NUMERIC is not trusted
✔ bookkeeping reassurance narrows only when tasks are behind
✔ the FIRST line keeps its leading space — no character is eaten (F-1416-1)
✔ a churn path on the FIRST line is still recognised as churn (the false DIRTY)
✔ every CHURN constant is recognised in first position
✔ a churn DIRECTORY matches by prefix, not by equality
✔ untracked debris and tracked dirt stay in separate buckets (s1299)
✔ staged and staged+unstaged prefixes parse identically
✔ a trailing newline produces no phantom entry
✔ empty porcelain is a clean tree
✔ a correctly-pointed law passes once baselined
✔ CODE-SIDE ROT: the cited line moves under a fixed coordinate -> POINTER DRIFT (the fire.md :315 shape)
✔ LAW-SIDE ROT: the law is edited to a stale coordinate -> red until re-verified (the F-1276-2 shape)
✔ a pointer past EOF is caught as OUT OF RANGE, not silently skipped
✔ a pointer to a file that does not exist fails rather than being ignored
✔ prose that is not a file:line is not mistaken for a pointer
✔ a MISSING law surface is itself a red — the law cannot be checked if it is gone
✔ THE REAL TREE: every law-surface pointer in this repo currently holds
✔ MARKDOWN TARGET: a law surface citing another .md by coordinate is checked, not skipped (F-1278-2)
✔ GOAL LEDGER ROT: a live non-terminal blockedReason pointer moves -> red names the leaf
✔ BACKLOG COORDINATE BAN: live leaves red, --update cannot bury it, terminal history stays out
✔ a drained done-move ships the master and names its hash
✔ a slot-stripped review ships the master and manufactures F-1569-1
✔ a failed trace is ran but unmerged
✔ a master with no trace and no banner is a candidate
✔ a no-trace master records its DO NOT QUEUE banner and is not a candidate
✔ archive-CODEX-WALL real NEVER QUEUE wording is a banner
✔ art-era-motion real NOT QUEUEABLE wording is a banner
✔ 058b real NOT FIRE-QUEUEABLE wording is a banner
✔ regression: DO NOT QUEUE and DO-NOT-QUEUE remain banners
✔ queue this after the drain mentions queueing without refusing it
✔ the banner window ends after line six
✔ a merged goal leaf ships its exact task file with its hash
✔ Moth Season rejects idle darkness while lantern, turret, and harvest play secures
✔ fire shell bounds node-guard file concurrency and explains the reduced run
✔ lane and attended shells keep Node's default file concurrency
✔ launcher propagates a non-zero node:test child exit code exactly
✔ contention is advisory, correctly counted, and absent when alone
✔ the harness gives the battery a finite default per-test timeout
✔ a per-test timeout still overrides the default, so declared budgets are untouched
✔ null-floor artifact exactly covers every door-servable bench seed
✔ Picnic hold is enabled only for e6-picnic across every epoch contract
✔ rejects an unset PROBE_BASE before launching a browser
✔ rejects an unset PROBE_BASE before checking the browser executable
✔ rejects a positional base URL with a PROBE_BASE directive
✔ title lookup finds a red even when its recorded coordinate has rotted
✔ matching file:line never substitutes for an exact title match
✔ clean and absent specs have distinct words and exit codes
✔ json output still names the outcome and denominator
✔ strict mode makes a known red actionable without changing its word
✔ skipped-only tests are not called clean
✔ literal backslashes survive markdown parsing
✔ absent and malformed inventories fail loudly
✔ bare names are misuse and verdict dates track the compact snapshot
✔ a correction is printed above the snapshot row it outranks
✔ a stale snapshot warns and a fresh one does not
✔ the staleness warning names the direction of the error, which differs by outcome
✔ the staleness warning prints above the snapshot rows and corrections it qualifies
✔ an uncomputable age is treated as STALE, never as fresh
✔ a bad threshold or clock override fails loudly instead of disabling the warning
✔ staleness is advisory and changes no exit code
✔ json carries the staleness fields so a caller need not parse prose
✔ a malformed corrections table fails loudly instead of dropping the warning
✔ rejects an unset base before probing ownership
✔ accepts a listener owned by this checkout
✔ rejects a listener owned by another checkout
✔ rejects a port with no listener
✔ rejects an unusable ownership probe
✔ a review citing a tracked file is TRACKED
✔ 274-vs-13 regression: a review citing a tracked directory is TRACKED
✔ an ignored on-disk log is ON-DISK-UNTRACKED and strict exits non-zero
✔ a brace range is SKIPPED rather than a violation
✔ a line suffix resolves against the tracked file without it
✔ default mode exits zero with ON-DISK-UNTRACKED evidence
✔ a blocked leaf citing a RULED finding is stale
✔ a blocked leaf citing an UNRULED finding is not stale
✔ "RULING REQUIRED" prose does not count as a ruling — only "<id> RULED" does
✔ terminal-closed statuses refuse work too, so their reasons are checked
✔ a merged leaf is not a refusal, however its reason reads
✔ a leaf is any node carrying taskFile — NOT a childless node
✔ denominator agrees with drain-block-check on the live tree
✔ the live tree carries no stale refusal
✔ runner exit follows guard exit codes
✔ --only rejects unknown guards and runs one known guard
✔ --only accepts a comma-separated subset in canonical order
✔ --only rejects a list containing an unknown guard rather than narrowing
✔ power-budget rows include p95 only when printed
✔ --changed-since runs the base gate when no path rule matches
✔ --changed-since adds the worker guards when functions/ moved
✔ --changed-since exits 2 on a bad ref rather than narrowing to the base gate
✔ --changed-since exits 2 when the untracked listing fails rather than reporting a green
✔ guards run with GR_GUARD_NO_ARTIFACT so a gate cannot dirty its own tree
✔ a signal-killed guard is never a pass
✔ each guard gets a 15-minute outer timeout
✔ every recorded run log remains recoverable
✔ same-game audit runs over every contract and keeps its row schema
✔ same-game audit follows the door grammar through the final AP-16 verbs
✔ same-game audit also emits a complete markdown table
✔ same-game report exemption prose matches its table
✔ same-game report exemption table matches source
✔ same-game report exemption reasons and citations match source
✔ every scripts/**/*.mjs parses
✔ every scripts/**/*.sh parses
✔ every rehearsal/**/*.mjs parses
✔ every foundry/**/*.mjs parses
✔ every foundry/**/*.sh parses
✔ registry turns from Season 1 to Season 2 at the half-open boundary
✔ season resolver leaves dates before all seasons unlabelled
✔ season resolver leaves missing timestamps unlabelled
✔ season resolver treats null endsAt as open-ended
✔ site: every local <script src> the pages load actually exists
✔ site: each loaded script parses under the grammar its tag requests
✔ site: each inline <script> parses under the grammar its tag requests
✔ site: every local href/src resolves to a file that exists
✔ site: the denominator still contains a data-* reference and an escaping path
✔ site: every in-page anchor targets an element that exists
✔ site: assay-office duration vocabulary matches functions/api/stats.ts
✔ skill.md grammar matches every StandingOrder source form
✔ skill.md buildables match BuildableId
✔ skill.md bench seeds match the source registry
✔ skill.md door-contracts match SUPPORTED_CONTRACTS in HeadlessContractSim
✔ the guard BITES a drifted skill.md (positive control, manufactured defect)
✔ reds on the s1461 incident row that motivated the finding
✔ reds on the live e3-moth-socket ghost line
✔ stays silent on a leaf mentioned in the body as an aside
✔ does not red on an open 🟡 finding whose slice merged (arm (a) is rejected)
✔ treats a backticked mention as a quotation, not a claim
✔ stays silent on a row already marked closed
✔ stays silent while the leaf has not landed
✔ reports a claim it cannot resolve rather than guessing
✔ rows without the claim are not classified at all
✔ resolves a leaf by taskFile as well as by id
✔ headline is the leading bold span, and falls back when there is none
✔ the guard RUNS when invoked as a script (entrypoint is not a silent no-op)
✔ the live ledger carries no stale READY-FOR-GATES claim
✔ a shipped leaf counts as landed, not only a merged one
✔ curation is deterministic, interleaved, and never repeats thin-pool items
✔ intake rejects headless captures and explicit banned files
✔ OBS v5 authentication, scene discovery, and switch request use one websocket
✔ failed preconditions are silent no-ops
✔ missing spec, websocket, or required scenes never enter FACTORY
✔ offline stream leaves FACTORY untouched
✔ green showcase switches FACTORY, dwells, and always restores AUTOPILOT
✔ red showcase skips dwell and restores AUTOPILOT
✔ append is hash-idempotent and keeps one JSON line per entry
✔ downtime accumulates and catch-up shows oldest first without double-show
✔ concurrent appenders preserve every entry and concurrent consumers show once
✔ missing subject directory fires the actionable existence message
✔ subject below its floor reports expected and walked counts
✔ subject exactly at its floor passes
✔ empty present subject fires the floor instead of passing silently
✔ ignoreReadErrors returns only readable paths
✔ default walk fails closed on an unreadable subtree
✔ floor catches files hidden by an ignored read error
✔ reducer output is cwd-invariant
✔ reducer reports configured and actual workers distinctly
✔ reducer reports absent harness config as unrecorded
✔ reducer reports the captured revision
✔ reducer reports an absent revision as unrecorded
✔ reducer reports a dirty captured revision
✔ reducer output is script-root-invariant
✔ reducer renders absolute raw paths relative to the recorded tree
✔ reducer refuses body statistics when the recorded tree is unavailable
✔ an unresolved masking row never outranks a resolved row
✔ reducer preserves an appended tail section byte-for-byte
✔ reducer preserves corrections before failing tests
✔ reducer replaces generated sections instead of duplicating them
✔ reducer keeps fresh-output behavior when output is absent
✔ reducer loss guard fails closed without touching output
✔ terrain contract scope report matches a fresh SSR measurement
✔ Terrain still resolves DEFAULT_CONTRACT_ID under SSR
✔ Terrain seam census excludes its declaration and fallback
✔ the F-A10-1 Terrain consumption and override seams have not moved
✔ townEraProps resolves its manifests under plain node, not only under Vite
✔ town specs collect without loading Vite-only modules
﹣ e1-dry-gulch hash is identical across installed Node engines (0.317833ms)
﹣ the-claim hash is identical across installed Node engines (0.051625ms)
﹣ e1-night-shift hash is identical across installed Node engines (0.039791ms)
✔ whole suite collects without loading Vite-only modules
✔ every functions/**/*.ts is type-checked
✔ positive arm accepts the expected Wrangler version
✔ violation arm rejects Wrangler version drift
✔ missing arm reports Wrangler absent from PATH
✔ escape arm warns loudly and permits explicit drift
✔ county stack directory matches the live rig names by whole normalized words
✔ county stack directory links public mind ids without guessing bare unknowns
