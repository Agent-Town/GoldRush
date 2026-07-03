# m0/05-deploy-preview

**Contract:** a production build any static host can serve, verified by the same e2e suite. M0 exit.

**Seam:** `npm run build` + `npm run preview`; Playwright gains a `preview` project pointed at the preview server (catches base-path/asset-path prod-only bugs); `docs/DEPLOY.md` listing host options (Cloudflare Pages / Netlify drop / GitHub Pages) — host choice is Robin's, non-blocking, nothing provisioned here.

**Playable checkpoint:** the M0 claim served from `dist/` — hero walk + HUD + pause, from a production bundle.

**Verification:** GATE-STD run against the **preview** build; bundle size noted in review; 60 fps snapshot; new-game definition-of-done items that apply to M0 (first screen is the game, interactive < 5 s).

**Deps:** 02 + 03 + 04.

**Firewalls:** no host provisioning, no CI/CD. Build correctness only.

**M0 exit criterion:** Robin plays the preview build and signs off (CLAUDE.md §9).
