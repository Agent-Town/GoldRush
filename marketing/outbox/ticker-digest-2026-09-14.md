# Ticker digest — 2026-09-14 (TK-01, compiled s2572 fire 2026-09-15 06:40 local)

Micro-headlines from yesterday's ACTUAL merges, classified by **touched paths on main** and never by
commit messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, stated because it is the half that goes wrong.** The day's commits were bucketed on their own
`%cs` with **no `--since`/`--until` window at all** (F-2562-2: git fills a bare date with the *current
time-of-day*, so a windowed query slides through the day and confidently answers about a neighbouring one).
Control asserted before any count was believed — 11,783 first-parent commits in the whole history — so a
zero here would have been an answer and not a failed read. Merges were diffed **against their first
parent**, because `git log --name-only` prints no paths at all for a merge and would otherwise score this
day's three largest landings as empty.

**The shape of the day: 60 first-parent commits** — the factory's first full working day after a five-day
fire outage. **Six commits touched player-visible paths**, collapsing to **four distinct pieces of work**
once each implementer's branch is paired with the drain that landed it. **Seventeen** touched the factory's
own tools and nets. **Thirty-seven were bookkeeping** — the ledger talking to itself.

## The county's news

**A sixth age is declared over the county: "the Re-surveyed Claims."** The owner gave the word on the 13th
and 14th, and the land itself was re-drawn under it — Astra's map campaign landed the same morning, the
largest single change of ground the county has seen.

- `c010f5f69` — Era 6 is declared: **the Re-surveyed Claims**. The county's ages now number six.
- `9d851aa7a` — The map campaign lands: 437 player-visible files re-drawn across the era-6 ground.
- `09ecd13f9` — The landmark source ledger is re-run; the era's seal moves with it, as an era's seal should.

**The town's people come back twice in one day, and come back cleaner.** Two waves of the cast re-cut
landed between the morning and the evening, the second one tightening the edges of the first.

- `3ed0e2b5f` — The town cast is re-cut into **thirty families** (stage one); the payload grows by 89 bytes.
- `69b5ad864` — **366 sheets** re-cut against a hard alpha (stage two); nine families come in under the old weight.

**And the claim board turns over.** A fresh week's rotation was minted and opened, so the county has new
ground to be worked and a closing date to work it against.

- `c2342df0a` — Rotation **r2026w38** opens: a fresh claim for the week, closing on the 21st.

## Not player-visible

The remaining 54 commits changed nothing a player can see. Seventeen were the factory sharpening its own
instruments — a worktree sweep that learned to declare how many trees it had actually read (`5a3e3b94a`), a
date window that was found to slide with the clock (`4fb65ff3e`), a ledger deadline retired after it was
shown to name a fuse that could not fire (`feb948a23`), and a quiet-age reading found to be mixing two
clocks seven hours apart (`75052cbe4`). Thirty-seven were locks, handoffs, goal leaves and pointer
re-pins. The five-day backlog of the outage was also closed on this day: the ledger mirror was pulled
whole and backfilled (`6008630fe (archive: pruned by the A3 rewrite)`), and three missing ticker digests were compiled and filed (`b9e21bacf (archive: pruned by the A3 rewrite)`).

**Owner choice, carried not buried:** rotation r2026w38 is open but **unannounced** — the deploy that
would announce it is publish-gated and a fire may not run it (`fe7a19ff1`). It opened on the 14th and
closes on the 21st; if it is to be announced at all, that word is the owner's.
