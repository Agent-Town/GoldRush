# THE CLAIM LEDGER — the in-game encyclopedia (lore made playable)
Status: RATIFIED-BY-ORDER 2026-07-09 (owner, verbatim anchors): "a kind of encyclopedia that deducts from all of this data and shows it in a useful way… Only show what is available through the game… the user gets notified in game… not too wordy but well structured, condensed and clear… the user can pause and learn first before proceeding."

## The thesis
ONE truth, two readers: `lore/` + the game's own manifests (buildableDefs blurbs, contract briefings, enemy stat blocks, research nodes) already hold everything — the encyclopedia RENDERS it to the player. No third copy of any fact (the single-source law extends to player-facing knowledge).

## Laws
1. **DISCOVERED-ONLY**: an entry exists when the player has MET it (seen the enemy, built the building, met the character, activated the epoch). Spoilers stay in lore/ (agents read the future; players earn it).
2. **THE NEW-PAGE BEAT**: an unlock fires a story-class notification ("The ledger gains a page: the Stamp Mill") — click to open, read, resume. Pause-and-learn is a first-class flow (the game holds while the book is open).
3. **CONDENSED BY LAW**: every entry = portrait/sprite + ≤4 fact lines (legibility law: numbers, keys, effects) + one lore line (voice from the wiki). Wordiness fails review.
4. **LIVE WHERE IT LIVES**: hero entry shows HER actual keys/abilities read from input bindings + upgrade state; enemy entries show only player-observed stats (HP revealed after first kill); building entries = the buildableDef blurb + tier state. Data reads, never data copies.
5. **ANIMATED (the fancy)**: entries play their sprite-sheet idle/walk via SpriteAnimator in the card — the codex turnarounds eventually make these gorgeous.

## Home & access
The SCHOOLHOUSE (the Elder's encyclopedia — canon-perfect) + a pause-screen tab + the menu. Mobile-first-class.

## Slices (fire-authorable in order)
- **EN-01 the engine**: entry registry (data-driven: id, category, unlockSignal, factLines(read-live), loreLine, spriteRef), discovered-state per profile, the reader UI (category shelves: The People · The Deputy · The Opponents · The Buildings · The Claim · The Eras), the new-page beat + notification. 8 seed entries.
- **EN-02 full E1 coverage**: every character/enemy/building/contract entry; hero keys/abilities live-read; enemy discovered-stats model.
- **EN-03 the epoch pages**: era activation adds The Eras entries + steamworks-class unlocks notify ("the Steamworks allows building for the next Epoch — it also appears there"); animations per entry (SpriteAnimator cards).

## Integration map
Touches: new src/encyclopedia/, the Schoolhouse interior hook (T6 socket), pause tab, beat entries, per-profile discovered-state (additive). NEVER touches: sim, the manifests it reads, lore/ (read-only mirror relationship: lore feeds entry loreLines via curated data refs).
