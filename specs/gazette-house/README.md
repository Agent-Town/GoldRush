# The Gazette House — the news comes to town (in-game newspaper)
Status: SEED 2026-07-10 (owner verbatim: "operate the news channels (they are also in game, right? is there a newspaper house in town coming up? someone selling the fresh newspaper in town?")

## The idea (one spine, another window — the Assay Office pattern extended)
The SAME content the fires author for the Ticker/Gazette (real merges, real changes, owner-approved) renders IN-WORLD as the town's newspaper: **The Claim Herald**. Marketing and game stop being separate products — the town reports its own building.

## Slices
**GZ-H1 — THE PAPERBOY (before the building):** a newsie character on the plaza (the youngster sprites exist; a cap + satchel variant) who barks the latest headline ("EXTRA! River runs past the claim edge now!") and hands the player the current Herald — a one-page parchment (the Claim Ledger reader pattern) with 3-4 real items from the shipped-news feed. Content source: a `news/herald.json` the fires append to when Ticker items are owner-approved (one spine: outbox approval = in-game publication). Offline/empty: "No fresh ink today."
**GZ-H2 — THE GAZETTE HOUSE (growth-unlocked building):** the printing house joins the town ring (T-growth stage per the town law; TS-02 facade batch adds its plate) — press sounds, ink-and-paper interior surface with the Herald ARCHIVE (past editions, discovered-only). The paperboy re-anchors to its porch.
**GZ-H3 — THE ERA VOICE:** the Herald's masthead and tone age with the epochs (E2: steam-press; E3: telegraph column "BY WIRE"; E7: the Signal era makes it a broadcast — the bundle's exchange building ties in). Persistence law: old editions never vanish from the archive.

## Laws
Owner approval stays the publication gate (outbox → approved → herald.json, same commit). In-world voice per the 063 law (a kid could overhear it; no version numbers, no repo words — the fires TRANSLATE ticker items to frontier speak: "the river now runs past the claim's edge" not "064 shipped"). Canon: the Herald is the town's paper, the newsie is a named youngster (lore/characters.md entry on ratification). NO token/price content ever (standing law).

## Ratification questions (owner)
1. "The Claim Herald" as the paper's name — or your pick?
2. The newsie: one of the existing youngsters (m or f) promoted to a named character, or a new kid?
