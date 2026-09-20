# Contributing to Gold Rush

Gold Rush is still preparing for its first public source release. Issues and focused pull requests are welcome once the repository is public and a project license has been added.

## Before changing the game

Read `docs/GOLD_RUSH_BRIEF.md` for the product and art direction, and `lore/README.md` for canon authority. The short version:

- the deterministic simulation is the gameplay source of truth;
- economy mutations and damage resolution each have one owner;
- weapons are frontier technology, not realistic firearms;
- the world is illustrated, warm, and never gory;
- public names belong to the fiction, not to backend tools.

## Local workflow

Use the Node version in `.nvmrc`.

```sh
npm ci
npm run build
```

Run the smallest relevant Playwright or Node check for the behavior you changed. Visual changes should include desktop and narrow-screen evidence and must introduce no page or console errors.

Keep each pull request to one concern. Explain the player-visible effect, the test that protects it, and any compatibility or migration consequence.

## Assets

Do not commit an asset unless the project has the right to redistribute it. Record its source, generation method, transformations, and runtime slot in `assets/LEDGER.md` and the relevant layer contract. Never include credentials, private conversations, local runtime state, or production data in evidence files.

## Security

Do not report vulnerabilities in a public issue. Follow [SECURITY.md](SECURITY.md).
