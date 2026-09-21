# Existing Orbital plain-profile failure

Story/profile batch: six pass and two failures. Exact base rerun reproduces both failures, desktop and mobile.

`e2e/e8-roster.spec.ts:183` expects `e8Arsenal.available === true` after seeding only the active-epoch key and opening ordinary Mare Claim; observed `false` on both base and candidate. This test does not boot Low Orbit. Base code `5d96ac7f22d3103a41436b543a04dbc186b4b274`, store `d134d7607cda6b995a9421c5727fbd11f9a69230`, engine `37a425e8df7634b36005ac5712ccee589eba59ab7aac41f7033a2949d203c146`.

[Exact byte/hash restoration receipt](base-orbital-roster.json) confirms candidate source and all four changed tracked store files were restored before timing. Profile/era activation owner via Claude; no assertion, profile, sim or activation code changed.
