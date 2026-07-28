CODEX: model=gpt-5.6-sol effort=high
# lane-wardrobe-preview — see the coat before you wear it
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner 2026-07-28, verbatim: "I would like to see the different cosmetics before actually choosing them in the wardrobe"): the Wardrobe (TAILOR'S WAGON surface) offers bare <select> dropdowns; no visual of the option.
READ-FIRST: the wardrobe surface implementation (grep data-town-wardrobe / town-open-wardrobe in src/town/TownScene.ts and the module it renders) · specs/cosmetics/README.md (incl. THE WALKING LAW + "at the tailor's" state) · assets/processed + assets/raw char-prospector-*-sheet-hover8*.png (the coat sheets; a single clean frame per skin is the preview) · scripts/extract-alpha.mjs conventions if cells are needed.
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE: 1. Each wardrobe option renders a PREVIEW (one representative frame per skin — Prospector coats ×3, Partner neckerchief when its art lands; missing art shows the "at the tailor's" placeholder frame, never broken-img). 2. Selection updates the preview live; equip flow unchanged. 3. House style (parchment card, engraved border — match town-ui classes). 4. e2e: previews present for every option, placeholder path covered, zero console.
TOUCH-ONLY: the wardrobe UI module + its css + one e2e spec + (only if required) an asset-manifest entry for preview frames. NO: cosmetics logic/grants, sheets themselves, town layout.
SELF-CHECK: spec green desktop+mobile (390px: previews fit) · screenshots desktop+mobile into artifacts/wardrobe-preview/.
READY-FOR-GATES + report: screenshot pair + where the preview frame for each skin comes from.
