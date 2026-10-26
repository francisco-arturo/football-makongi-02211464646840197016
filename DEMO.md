# Demo — Makongi FC (football-club-022114646468401970169)

This is the delivered build. The live URL and the repository are both real.

- **Live URL:** [https://football-club-022114646468401970169.vercel.app](https://football-club-022114646468401970169.vercel.app)
- **Deployment:** `dpl_5JH79HarAUQL5nJTqmnYjUWrykFw` (READY in 5s)
- **Repository:** [https://github.com/francisco-arturo/football-makongi-02211464646840197016](https://github.com/francisco-arturo/football-makongi-02211464646840197016)
- **Run locally:** `node dev-server.mjs` from this directory. If 4173 is busy, the server prints the next free port.
- **Verification:** `powershell -ExecutionPolicy Bypass -File .\init.ps1` or `node .\scripts\verify.mjs`
- **Last verified:** 2026-10-26 — 44 local checks passed, live `/` and `/assets/app.mjs` returned 200.

> Repository naming note: the user-supplied repository is `football-makongi-02211464646840197016` (37 characters and a 20-digit tail). The Vercel project uses the canonical 35-character slug so the live host stays clean and matches the prototype: `football-club-022114646468401970169`. The repository can be renamed later without changing the live site.

## The 60-second path

| # | Do this | What the visitor should see |
|---|---|---|
| 1 | Open the live URL | A finished, seeded club home page: crest, slogan, next-match countdown, latest result, league snapshot and news |
| 2 | Click **Squad**, then a player | 24-player squad with filters, portrait cards and a full player profile modal |
| 3 | Click **Lineup** and switch 4-3-3 / 4-2-3-1 / 3-5-2 | Formation-aware pitch, starting XI, bench, coach and XI summary |
| 4 | Click **Posters** | A live 1080 × 1350 matchday poster; change the opponent and download the PNG |
| 5 | Click **Admin**, use **Use demo credentials**, then **Sign in** | Club control room with overview, players, fixtures, news, lineup and club info |
| 6 | Edit a player or record a result, then visit the public page | The change is visible immediately and persists in this browser |

**Admin:** `admin@makongifc.com` / `Makongi2026!`

## The one sentence to say about it

> “This is Makongi FC's whole club operation in one place: the public face for supporters, and a control room where the club can update the squad, the XI, results, news and matchday posters without touching code.”

## What is deliberately fake

- All players, statistics, fixtures, results, league standings and news are **sample data** for the demo.
- Changes are saved in **browser localStorage**, not a shared database. Another device or browser starts from the seed.
- Login is a **browser-side demo**: SHA-256 password check, 30-minute session and five-attempt lockout. It is not server authentication and must be replaced before production.
- The league table is **seeded**, not calculated from all league results.
- The poster studio renders real PNG files locally, but nothing is posted to social media automatically.
- No email, SMS, payment or ticketing integration is connected.

## Known limits / not built yet

- A real PostgreSQL/Supabase database and server API.
- Server-side auth with roles (admin, coach, media officer) and audit history.
- Automatic league table calculation from all results.
- Cloud image upload instead of base64 in browser storage.
- Scheduling, notifications and a public ticketing flow.
- Automated browser screenshot QA. Headless Chrome/Edge cannot start inside the agent sandbox (`OpenProcess: Access is denied`), so UI verification used the DOM render smoke suite instead.

## If something fails while they look

- Use **Admin → Reset demo data** to restore the seeded club.
- Reload the page; the app is a static single-page app and all data is in `localStorage`.
- Restart the preview with `node dev-server.mjs` and use the port it prints.
- Re-run `node .\scripts\verify.mjs` to confirm data and route integrity.

## Deployment

Deployed on 2026-10-26 from the canonical project:

```powershell
node .harness/deploy.mjs football-club-022114646468401970169
```

Live: https://football-club-022114646468401970169.vercel.app
