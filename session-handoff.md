# Session Handoff — Prototype: football-club-022114646468401970169

## Last Updated

- 2026-10-26 — core prototype built and verified; local review handover.

## Current State

- **Review build ready.** Nothing pushed or deployed. No proposal written.
- Local URL: **http://127.0.0.1:49671** (`node dev-server.mjs`; auto-selects a free port).
- Admin: `admin@makongifc.com` / `Makongi2026!`
- Verification: `node .\scripts\verify.mjs` — **44 checks passed**.
- Core prototype status: **done**. Production backend is `proto-006` (`todo`).

## Recommended Next Step

1. Open the local URL and follow `DEMO.md` → “The 60-second path”.
2. If approved, get the GitHub repository URL from the user, confirm it matches `football-club-022114646468401970169`, add it to `github.json` → `approved_remotes`, push, then deploy:
   `node .harness/deploy.mjs football-club-022114646468401970169`
3. Record the deployment URL in `DEMO.md` and send it back.
4. Do **not** write a proposal unless the user explicitly asks.

## Files

- `index.html` — app shell and public chrome.
- `assets/styles.css` — brand, components, responsive rules.
- `assets/data.mjs` — seed club, players, fixtures, table, news, formations.
- `assets/app.mjs` — router, public views, admin dashboard, state and CRUD.
- `assets/media.mjs` — portraits, photo compression, image loading.
- `assets/poster.mjs` — matchday and birthday canvas posters.
- `assets/crest.svg` — club crest.
- `dev-server.mjs` — local preview server.
- `scripts/verify.mjs` / `scripts/render-smoke.mjs` — verification and DOM render smoke.
- `init.ps1` / `init.sh` — verification entrypoints.
- `README.md`, `DEMO.md` — maintenance and review docs.

## Blockers

- None for review.
- Headless Chrome/Edge cannot launch inside the agent sandbox, so no screenshot QA. Use the DOM render smoke plus manual review in a normal browser.
- `.ps1` files must stay ASCII. `init.ps1` is ASCII.

## State / Persistence

- Demo state key: `makongi_fc_state_v1` in `localStorage`.
- Session key: `makongi_fc_admin_session` in `sessionStorage`, 30-minute expiry.
- Admin → Overview → **Reset demo data** restores the seed.
- If seed data changes in `assets/data.mjs`, bump `DATA_VERSION` or reset localStorage.

## Do Not

- Do not push or deploy before the user approves and provides a repository URL.
- Do not create a second prototype directory for this work.
- Do not treat the browser-side demo login as production auth.
- Do not commit browser profiles, screenshots or test-only `node_modules`.
