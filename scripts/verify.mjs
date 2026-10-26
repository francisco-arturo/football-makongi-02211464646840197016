import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED, FORMATIONS, DATA_VERSION } from "../assets/data.mjs";
import { avatarDataUri } from "../assets/media.mjs";
import { posterCaption } from "../assets/poster.mjs";
import { createServer } from "../dev-server.mjs";
import { runRenderSmoke } from "./render-smoke.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const checks = [];

function pass(label, detail = "") {
  checks.push({ label, detail });
  console.log(`PASS  ${label}${detail ? ` — ${detail}` : ""}`);
}

async function fileExists(relative) {
  await access(resolve(ROOT, relative));
}

/* ---------- Data integrity ---------- */

assert.equal(SEED.version, DATA_VERSION, "seed data version must match DATA_VERSION");
pass("Seed version", `v${DATA_VERSION}`);

const ids = new Set(SEED.players.map((player) => player.id));
const numbers = new Set(SEED.players.map((player) => Number(player.number)));
assert.ok(SEED.players.length >= 20, "squad should have at least 20 players");
assert.equal(ids.size, SEED.players.length, "player ids must be unique");
assert.equal(numbers.size, SEED.players.length, "jersey numbers must be unique");
pass("Squad data", `${SEED.players.length} players, unique ids and numbers`);

assert.ok(SEED.fixtures.filter((fixture) => fixture.status === "upcoming").length >= 3, "need upcoming fixtures");
assert.ok(SEED.fixtures.filter((fixture) => fixture.status === "finished").length >= 5, "need finished results");
pass("Match data", `${SEED.fixtures.length} fixtures with both upcoming and finished states`);

assert.ok(SEED.table.length >= 8, "league table needs at least 8 clubs");
assert.ok(SEED.table.some((row) => row.isMakongi), "league table must contain Makongi FC");
pass("League table", `${SEED.table.length} clubs`);

assert.ok(SEED.news.length >= 5, "news needs at least 5 articles");
assert.ok(SEED.news.every((article) => article.title && Array.isArray(article.body) && article.body.length), "each article needs a title and body");
pass("Club news", `${SEED.news.length} articles`);

const squadGoals = SEED.players.reduce((sum, player) => sum + Number(player.goals || 0), 0);
const makongiRow = SEED.table.find((row) => row.isMakongi);
assert.equal(squadGoals, makongiRow.gf, "player goals must add up to the team's league goals");
pass("Stats consistency", `${squadGoals} player goals match ${makongiRow.gf} team goals`);

const results = SEED.fixtures.filter((fixture) => fixture.status === "finished");
const recorded = results.reduce((summary, fixture) => {
  const mfc = fixture.home ? fixture.homeScore : fixture.awayScore;
  const opponent = fixture.home ? fixture.awayScore : fixture.homeScore;
  if (mfc > opponent) summary.won += 1;
  else if (mfc < opponent) summary.lost += 1;
  else summary.drawn += 1;
  return summary;
}, { won: 0, drawn: 0, lost: 0 });
assert.equal(recorded.won, makongiRow.won, "recorded wins must match the league table");
assert.equal(recorded.drawn, makongiRow.drawn, "recorded draws must match the league table");
assert.equal(recorded.lost, makongiRow.lost, "recorded losses must match the league table");
pass("Record consistency", `${recorded.won}W ${recorded.drawn}D ${recorded.lost}L from ${results.length} results`);

const demoHash = createHash("sha256").update("Makongi2026!").digest("hex");
assert.ok(demoHash.startsWith("3fff9f4f"), "demo password hash should be stable");
const portrait = avatarDataUri(SEED.players[0]);
assert.ok(portrait.startsWith("data:image/svg+xml"), "generated player portrait should be an SVG data URI");
const caption = posterCaption({ mode: "matchday", data: { opponent: "Simba SC", date: "2026-11-02", time: "16:00", venue: "Makongi Ground" }, club: SEED.club });
assert.ok(caption.includes("Makongi FC vs Simba SC"), "poster caption should include the fixture");
pass("Media helpers", "portrait data URI and poster caption generated");

for (const [key, formation] of Object.entries(FORMATIONS)) {
  assert.equal(formation.slots.length, 11, `${key} must define 11 slots`);
  const lineup = SEED.lineups[key];
  assert.ok(lineup, `${key} needs a seeded lineup`);
  assert.equal(Object.keys(lineup.slots).length, 11, `${key} lineup needs 11 players`);
  assert.equal(new Set(Object.values(lineup.slots)).size, 11, `${key} cannot start the same player twice`);
  for (const playerId of Object.values(lineup.slots)) {
    assert.ok(ids.has(playerId), `${key} references a missing player: ${playerId}`);
  }
  for (const playerId of lineup.bench) {
    assert.ok(ids.has(playerId), `${key} bench references a missing player: ${playerId}`);
  }
  pass(`Formation ${key}`, `${formation.slots.length} slots, ${lineup.bench.length} substitutes`);
}

/* ---------- Required artifacts ---------- */

for (const file of ["index.html", "assets/styles.css", "assets/app.mjs", "assets/crest.svg", "assets/data.mjs", "assets/media.mjs", "assets/poster.mjs", "dev-server.mjs", "README.md", "DEMO.md"]) {
  await fileExists(file);
  pass(`Artifact ${file}`);
}

const html = await readFile(resolve(ROOT, "index.html"), "utf8");
assert.ok(html.includes('id="view"'), "index.html needs the app mount point");
assert.ok(html.includes("assets/app.mjs"), "index.html needs the module entrypoint");
assert.ok(html.includes("The Pride of Great Makongi FC"), "index.html needs the club slogan");
pass("HTML shell", "mount point, module entrypoint and slogan present");

const app = await readFile(resolve(ROOT, "assets/app.mjs"), "utf8");
for (const route of ["home", "squad", "lineup", "fixtures", "stats", "table", "posters", "news", "admin"]) {
  assert.ok(app.includes(route), `app should reference the ${route} route`);
}
assert.ok(app.includes("Admin sign in"), "admin login view present");
assert.ok(app.includes("download-poster"), "poster download action present");
assert.ok(app.includes(demoHash), "demo password hash must match the documented credentials");
pass("Application routes", "all nine views and the admin login are wired");
pass("Demo login hash", "documented password matches the client-side hash");

/* ---------- Headless render smoke ---------- */

const rendered = await runRenderSmoke();
for (const page of rendered) {
  pass(`Render ${page.route}`, `${page.length.toLocaleString("en-GB")} characters, marker "${page.marker}"`);
}

/* ---------- HTTP smoke test ---------- */

const server = createServer();
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

try {
  for (const [route, expectedType] of [
    ["/", "text/html"],
    ["/index.html", "text/html"],
    ["/assets/styles.css", "text/css"],
    ["/assets/app.mjs", "text/javascript"],
    ["/assets/crest.svg", "image/svg+xml"]
  ]) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, `${route} should return 200`);
    const type = response.headers.get("content-type") || "";
    assert.ok(type.includes(expectedType), `${route} should serve ${expectedType}, got ${type}`);
    await response.arrayBuffer();
    pass(`HTTP ${route}`, `200 ${type}`);
  }
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}

console.log(`\nVerification complete: ${checks.length} checks passed.`);
