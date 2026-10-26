# Makongi FC — Club Management Web App

A modern, mobile-first football club website and admin dashboard for **Makongi FC**, built around the club's red, black and white identity and the slogan **“The Pride of Great Makongi FC.”**

This repository is a fully working, deployable prototype. It runs in any modern browser, needs no build step, and includes a seeded 2026/27 season so every screen has something to show on first load.

## What is included

| Area | What works |
|---|---|
| Public home page | Next-match countdown, latest result, league snapshot, season stats, featured players, news and fixture previews |
| Squad | 24 seeded players, portrait cards, jersey numbers, positions, filters and individual player profiles |
| Starting XI | 4-3-3, 4-2-3-1 and 3-5-2 formations, pitch view, substitutes, coach and XI summary |
| Fixtures & results | Upcoming matches, past results, scores, venues, kickoff times, match detail dialogs |
| Player statistics | Sortable table for appearances, goals, assists, clean sheets and cards, plus leader cards |
| League table | 10-club standings with played, won, drawn, lost, goals, goal difference, points and form |
| Poster studio | Matchday and birthday posters rendered on canvas at 1080 × 1350, PNG download and copyable caption |
| Club news | Filterable news grid and full article reader |
| Admin dashboard | Hashed-password demo login, player CRUD with photo upload, fixture/result CRUD, news CRUD, lineup builder, club information editor, demo reset |
| Branding | Custom Makongi FC crest, Barlow Condensed + Inter typography, responsive red/black/white design |

## Run it locally

Requirements: **Node.js 18 or newer** (this project was verified on Node 24).

```powershell
node dev-server.mjs
```

The server prints a local URL such as `http://127.0.0.1:49671`. If port 4173 is busy it automatically selects a free port. Open that URL in Chrome, Edge, Firefox or Safari.

There is no `npm install` step and no build step. The app is plain HTML, CSS and ES modules.

## Demo administrator access

- **Email:** `admin@makongifc.com`
- **Password:** `Makongi2026!`

The login uses a SHA-256 hash of the demo password, a 30-minute session and a five-attempt lockout. This is a **browser-side demo**, not production authentication. See “Production path” below.

## Project structure

```text
index.html                 App shell, header, footer, ticker and nav
assets/
  app.mjs                  Router, public views, admin dashboard and interactions
  data.mjs                 Seeded club, players, fixtures, table, news and formations
  media.mjs                Generated player portraits, image loading, photo compression
  poster.mjs               Canvas matchday and birthday poster artwork
  styles.css               Brand system, layout, components and responsive rules
  crest.svg                Makongi FC crest
dev-server.mjs             Zero-dependency static preview server
scripts/verify.mjs         Data integrity, artifact and HTTP verification
init.ps1 / init.sh         Verification entrypoints
vercel.json                Static hosting config and cache headers
DEMO.md                    Walkthrough, demo limits and handover notes
```

## Data and persistence

The seed data lives in `assets/data.mjs`. On first load it is copied into the browser's `localStorage` under `makongi_fc_state_v1`. Admin edits are saved there immediately. **Reset demo data** in the admin overview restores the original seed.

Player photos are compressed in the browser to 600 × 720 JPEG before being stored, which keeps the demo inside normal browser storage limits. Players without a photo get a generated club-portrait illustration, so the squad never looks empty.

The league table is seeded for the prototype. In production it would be calculated from all league results, not edited by hand.

## Verification

```powershell
# Windows (execution policy blocks a bare .\init.ps1)
powershell -ExecutionPolicy Bypass -File .\init.ps1

# Node-only, works in any shell
node .\scripts\verify.mjs
```

```bash
./init.sh
```

The suite checks:

- seed version, unique player IDs and jersey numbers
- upcoming and finished fixtures, league table, news articles
- all three formations have 11 unique starters and a bench
- required artifacts exist
- the HTML shell and all nine routes are wired
- `/`, `index.html`, CSS, JS and the crest return HTTP 200 with correct content types

## Deploy

The repository is already Vercel-shaped: static files at the root, no long-running server, no build command. `dev-server.mjs` and the verification files are excluded through `.vercelignore`.

From the workspace root:

```powershell
node .harness/deploy.mjs football-club-022114646468401970169
```

The deployment URL is added to `DEMO.md` after the build is approved.

## Production path

This prototype deliberately keeps the demo simple. A production build for Makongi FC should add:

1. **Database:** PostgreSQL or Supabase for players, fixtures, results, news, lineups, league table and audit history.
2. **Authentication:** server-side sessions, password reset, Argon2/bcrypt hashing, role-based access (admin, coach, media officer).
3. **Image storage:** S3/Supabase Storage with signed uploads instead of base64 in `localStorage`.
4. **Server APIs:** validated CRUD endpoints, optimistic locks and an audit trail for every result change.
5. **Automation:** league table calculated from results; matchday reminders and news notifications.
6. **Backups and monitoring:** automated database backups, uptime checks and error reporting.

The current front end is structured so those seams can be added without changing the public page design.

## Brand and content notes

- All player names, statistics, fixtures and news are sample data for the demo.
- The crest is an original SVG built for this prototype.
- The club slogan is used throughout the site and poster studio.
- The design uses Barlow Condensed and Inter from Google Fonts, with system-font fallbacks if the network is unavailable.

## Maintenance

- Add or edit the starting squad in the admin dashboard, or update the seed in `assets/data.mjs` and reset demo data.
- Add fixtures and results in the admin dashboard. Finished matches appear automatically in results.
- Build a new starting XI and bench under **Admin → Lineup**.
- Update club details under **Admin → Club info**; the header, footer and posters follow.
- Run verification after any data or view change.

---

**Makongi FC** · Founded 1998 · Makongi Ground, Tanzania · *The Pride of Great Makongi FC*
