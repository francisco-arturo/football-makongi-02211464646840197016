# Session Handoff — Prototype: football-club-022114646468401970169

## Last Updated

- 2026-10-26 — delivered to Vercel, pushed to GitHub, proposal drafted in chat.

## Current State

- **Live:** https://football-club-022114646468401970169.vercel.app (HTTP 200)
- **Repository:** https://github.com/francisco-arturo/football-makongi-02211464646840197016 (pushed, commit `352f0ff`)
- **Deployment:** `dpl_5JH79HarAUQL5nJTqmnYjUWrykFw`, READY in 5s
- Admin: `admin@makongifc.com` / `Makongi2026!`
- Verification: `node .\scripts\verify.mjs` — **44 checks passed**.
- Core prototype status: **done**. Production backend is `proto-006` (`todo`).

## Recommended Next Step

1. Review the proposal draft in chat and send it if it reads right.
2. Log the sent proposal in `upwork-kit/TRACKER.csv` with the hook type.
3. If the client wants production, start `proto-006` (database, server auth, cloud photos, automatic table calculation).
4. Optional: rename the GitHub repository to the canonical slug `football-club-022114646468401970169`.

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

- Do not create a second prototype directory for this work.
- Do not treat the browser-side demo login as production auth.
- Do not commit browser profiles, screenshots or test-only `node_modules`.
- Do not change the live Vercel project name without also updating `DEMO.md` and the proposal.
