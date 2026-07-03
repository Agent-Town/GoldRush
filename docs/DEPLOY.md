# Deploy — Gold Rush

`vite.config.ts` uses `base: './'`, so `dist/` works on any static host or straight from disk-served preview.

## Play it locally (Robin, M0 checkpoint)
```bash
cd "~/Claude/Projects/Gold Rush"   # the project folder
npm install
npm run preview                     # builds nothing — run `npm run build` first if dist/ is missing
# or: npm run dev                   # dev server with HMR
```
Controls: WASD/arrows move, P pause. `?debug`, `?seed=`, `?timescale=` params available.

## Host options (pick later, nothing provisioned)
- **Cloudflare Pages** (recommended: fast, free tier, `wrangler pages deploy dist`)
- **Netlify drop** (drag `dist/` into the browser — zero setup)
- **GitHub Pages** (needs repo on GitHub + actions workflow)

Playwright has a `preview` project (`npm run test:preview`) that runs the e2e suite against the production bundle.
