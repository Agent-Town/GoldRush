# Gold Rush

Gold Rush is a browser game about building a frontier settlement with an AI Prospector. It mixes survivors-style combat, tower defense, and roguelite progression in the Agent Town universe.

The game is built with TypeScript, Vite, and three.js. The simulation is deterministic; rendering, story, and optional online services sit around that core.

> **Status:** active development. Save formats, online APIs, and contributor workflows may still change.

## Run locally

The runtime art (terrain and landmark packs, panoramas, motion plates, source plates) lives in the sibling repository [Agent-Town/GoldRush-assets](https://github.com/Agent-Town/GoldRush-assets); this repository reaches it through symlinks (`assets/pilots`, `assets/motion-pilot`, `assets/raw`, `assets/processed-full` → `../../GoldRush-assets/…`). Clone both side by side, use the Node version in `.nvmrc`, then install and start the local server:

```sh
git clone https://github.com/Agent-Town/GoldRush-assets.git
git clone https://github.com/Agent-Town/GoldRush.git
cd GoldRush
npm ci
npm run dev
```

A headless benchmark run needs no browser: `node scripts/gr-sim.mjs --contract the-claim --seed e1-the-claim-01`. Git worktrees of this repo need one extra symlink so the relative art links resolve: `ln -s ../../GoldRush-assets worktrees/GoldRush-assets` (or the equivalent beside your worktree directory).

Open <http://127.0.0.1:5188>. Local play does not require an account or API key.

Create a production build with:

```sh
npm run build
```

## How the project is organized

- `src/` owns the browser game, deterministic simulation, UI, story, and asset bindings.
- `functions/` owns optional Cloudflare-backed accounts, multiplayer, telemetry, and standings APIs.
- `assets/` owns runtime art plus its provenance and integration contracts.
- `lore/` owns the Agent Town canon used by the game.
- `docs/GOLD_RUSH_BRIEF.md` explains the product, art direction, and canon guardrails.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes narrow, preserve the deterministic simulation and ownership boundaries, and include provenance for every new asset.

Security issues should be reported privately as described in [SECURITY.md](SECURITY.md).

## License

The license for the code is being chosen by the owner; until a `LICENSE` file lands, all rights are reserved. Art and audio provenance is recorded in `assets/LEDGER.md`.
