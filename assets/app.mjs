// Makongi FC — application shell, public site, admin dashboard and poster studio.

import { SEED, FORMATIONS, POSITIONS, DATA_VERSION } from "./data.mjs";
import { avatarDataUri, portraitSrc, playerInitials, compressImage } from "./media.mjs";
import { drawPoster, posterCaption } from "./poster.mjs";

const TZ = "Africa/Dar_es_Salaam";
const STORE_KEY = "makongi_fc_state_v1";
const SESSION_KEY = "makongi_fc_admin_session";
const ADMIN_EMAIL = "admin@makongifc.com";
const ADMIN_HASH = "3fff9f4f6c9cd819d5be881e6524d2d63e426ebabea2356d9c95b64c9465b806";
const SESSION_MINUTES = 30;
const ROUTES = ["home", "squad", "lineup", "fixtures", "stats", "table", "posters", "news", "admin"];

const POSITION_NAMES = {
  GK: "Goalkeeper",
  RB: "Right back",
  CB: "Centre back",
  LB: "Left back",
  CDM: "Defensive midfielder",
  CM: "Central midfielder",
  CAM: "Attacking midfielder",
  LW: "Left winger",
  RW: "Right winger",
  ST: "Striker"
};

const POSITION_GROUPS_BY_CODE = {
  GK: "Goalkeepers",
  RB: "Defenders", CB: "Defenders", LB: "Defenders",
  CDM: "Midfielders", CM: "Midfielders", CAM: "Midfielders",
  LW: "Forwards", RW: "Forwards", ST: "Forwards"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const view = $("#view");
const modalRoot = $("#modal-root");
const toastStack = $("#toast-stack");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const base = clone(SEED);
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (parsed.version !== DATA_VERSION) return base;
    return {
      ...base,
      ...parsed,
      club: { ...base.club, ...(parsed.club || {}) },
      players: Array.isArray(parsed.players) ? parsed.players : base.players,
      fixtures: Array.isArray(parsed.fixtures) ? parsed.fixtures : base.fixtures,
      table: Array.isArray(parsed.table) ? parsed.table : base.table,
      news: Array.isArray(parsed.news) ? parsed.news : base.news,
      lineups: { ...base.lineups, ...(parsed.lineups || {}) }
    };
  } catch {
    return base;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch {
    toast("Not saved", "Browser storage is full. Try a smaller player photo.");
    return false;
  }
}

let state = loadState();

function freshPosterData() {
  const next = getNextFixture();
  return {
    matchday: {
      opponent: next ? next.opponent : "Simba SC",
      date: next ? next.date.slice(0, 10) : "2026-11-02",
      time: next ? time24(next.date) : "16:00",
      venue: next ? next.venue : state.club.stadium,
      competition: next ? next.competition : state.club.league,
      tagline: state.club.slogan.toUpperCase(),
      theme: "red"
    },
    birthday: {
      playerId: (topScorer() || {}).id || (state.players[0] || {}).id || "",
      age: "27",
      message: `Wishing you a brilliant day from all of us at ${state.club.name}.`,
      theme: "red"
    }
  };
}

const ui = {
  formationPreview: state.formation,
  squadFilter: "ALL",
  fixtureTab: "upcoming",
  statsSort: { key: "goals", direction: "desc" },
  newsFilter: "All",
  posterMode: "matchday",
  posterData: freshPosterData(),
  adminTab: "overview",
  adminFormation: state.formation,
  loginAttempts: 0,
  lockUntil: 0
};

let countdownTimer = null;

/* ---------- Dates and data helpers ---------- */

function dateValue(iso) {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDate(iso, options = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, day: "2-digit", month: "short", year: "numeric", ...options
  }).format(dateValue(iso));
}

function formatLongDate(iso) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, weekday: "short", day: "2-digit", month: "short", year: "numeric"
  }).format(dateValue(iso));
}

function time24(iso) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false
  }).format(dateValue(iso));
}

function dateParts(iso) {
  const date = dateValue(iso);
  return {
    day: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" }).format(date).toUpperCase(),
    weekday: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" }).format(date).toUpperCase(),
    year: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" }).format(date)
  };
}

function playerById(id) {
  return state.players.find((player) => player.id === id);
}

function playerName(id) {
  const player = playerById(id);
  return player ? player.name : "Unassigned";
}

function positionName(code) {
  return POSITION_NAMES[code] || code || "Player";
}

function positionGroup(code) {
  return POSITION_GROUPS_BY_CODE[code] || "Squad";
}

function sortedPlayers() {
  return [...state.players].sort((a, b) => Number(a.number) - Number(b.number));
}

function getNextFixture() {
  return [...state.fixtures]
    .filter((fixture) => fixture.status === "upcoming")
    .sort((a, b) => dateValue(a.date) - dateValue(b.date))[0] || null;
}

function getUpcomingFixtures() {
  return [...state.fixtures]
    .filter((fixture) => fixture.status === "upcoming")
    .sort((a, b) => dateValue(a.date) - dateValue(b.date));
}

function getResults() {
  return [...state.fixtures]
    .filter((fixture) => fixture.status === "finished")
    .sort((a, b) => dateValue(b.date) - dateValue(a.date));
}

function getLastResult() {
  return getResults()[0] || null;
}

function scoreFor(fixture) {
  const home = Number(fixture.homeScore ?? 0);
  const away = Number(fixture.awayScore ?? 0);
  return fixture.home
    ? { mfc: home, opponent: away }
    : { mfc: away, opponent: home };
}

function resultLetter(fixture) {
  const score = scoreFor(fixture);
  if (score.mfc > score.opponent) return "W";
  if (score.mfc < score.opponent) return "L";
  return "D";
}

function leagueRows() {
  return [...state.table]
    .map((row) => ({
      ...row,
      points: Number(row.points ?? Number(row.won) * 3 + Number(row.drawn)),
      gf: Number(row.gf),
      ga: Number(row.ga),
      gd: Number(row.gf) - Number(row.ga)
    }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
}

function leaguePosition() {
  const index = leagueRows().findIndex((row) => row.isMakongi);
  return index >= 0 ? index + 1 : "—";
}

function topScorer() {
  return [...state.players].sort((a, b) => (Number(b.goals) - Number(a.goals)) || (Number(b.assists) - Number(a.assists)))[0] || null;
}

function topAssists() {
  return [...state.players].sort((a, b) => (Number(b.assists) - Number(a.assists)) || (Number(b.goals) - Number(a.goals)))[0] || null;
}

function mostAppearances() {
  return [...state.players].sort((a, b) => Number(b.appearances) - Number(a.appearances))[0] || null;
}

function topKeeper() {
  return [...state.players]
    .filter((player) => player.position === "GK")
    .sort((a, b) => Number(b.cleanSheets) - Number(a.cleanSheets))[0] || null;
}

function fixtureTeams(fixture) {
  return fixture.home
    ? { home: state.club.name, away: fixture.opponent }
    : { home: fixture.opponent, away: state.club.name };
}

function scoreLabel(fixture) {
  if (fixture.status !== "finished") return "vs";
  return fixture.home
    ? `${fixture.homeScore}–${fixture.awayScore}`
    : `${fixture.awayScore}–${fixture.homeScore}`;
}

function recordSummary() {
  const results = getResults();
  return {
    wins: results.filter((match) => resultLetter(match) === "W").length,
    draws: results.filter((match) => resultLetter(match) === "D").length,
    losses: results.filter((match) => resultLetter(match) === "L").length
  };
}

/* ---------- Session ---------- */

function sessionValid() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (session.email !== ADMIN_EMAIL) return false;
    if (Date.now() - Number(session.at) > SESSION_MINUTES * 60 * 1000) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: ADMIN_EMAIL, at: Date.now() }));
  } catch {
    /* sessionStorage can be unavailable; the in-memory view still works for this page. */
  }
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* no-op */ }
}

async function sha256(value) {
  if (!window.crypto || !window.crypto.subtle) throw new Error("Secure login needs HTTPS or localhost.");
  const data = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/* ---------- Shell ---------- */

function currentRoute() {
  const raw = location.hash.replace(/^#\/?/, "").split("/")[0];
  return ROUTES.includes(raw) ? raw : "home";
}

function setActiveNav(route) {
  $$("[data-nav]").forEach((link) => {
    const target = link.dataset.nav;
    link.classList.toggle("active", target === route || (route === "home" && target === "home"));
  });
}

function pageTitle(route) {
  const titles = {
    home: "Makongi FC — The Pride of Great Makongi FC",
    squad: "First Team — Makongi FC",
    lineup: "Starting XI & Formation — Makongi FC",
    fixtures: "Fixtures & Results — Makongi FC",
    stats: "Player Statistics — Makongi FC",
    table: "League Table — Makongi FC",
    posters: "Matchday Poster Studio — Makongi FC",
    news: "Club News — Makongi FC",
    admin: "Admin Dashboard — Makongi FC"
  };
  return titles[route] || titles.home;
}

function render(options = {}) {
  closeModal();
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  const route = currentRoute();
  const builders = {
    home: homeView,
    squad: squadView,
    lineup: lineupView,
    fixtures: fixturesView,
    stats: statsView,
    table: tableView,
    posters: postersView,
    news: newsView,
    admin: adminView
  };
  view.innerHTML = builders[route]();
  document.title = pageTitle(route);
  setActiveNav(route);
  renderTicker();
  renderFooter();
  afterRender(route);
  if (options.scroll !== false) window.scrollTo(0, 0);
}

function afterRender(route) {
  if (route === "home") startCountdown();
  if (route === "posters") initPoster();
  if (route === "admin") bindAdminEvents();
}

function renderTicker() {
  const next = getNextFixture();
  const last = getLastResult();
  const scorer = topScorer();
  const items = [];
  if (last) {
    items.push(`<span><b>Full time:</b> Makongi ${resultLetter(last) === "W" ? "win" : resultLetter(last) === "D" ? "draw" : "defeat"} ${scoreFor(last).mfc}–${scoreFor(last).opponent} ${last.home ? "vs" : "at"} ${esc(last.opponent)}</span>`);
  }
  if (next) {
    items.push(`<span><b>Next:</b> ${esc(next.opponent)} · ${formatLongDate(next.date)} · ${time24(next.date)}</span>`);
  }
  if (scorer) {
    items.push(`<span><b>${esc(scorer.name)}</b> leads the scoring charts with ${esc(scorer.goals)} goals</span>`);
  }
  items.push(`<span><b>${esc(state.club.league)}</b> · Makongi FC sit ${leaguePosition()}${leaguePosition() === 1 ? "st" : "th"} after Matchday ${getResults().length}</span>`);
  const group = items.join('<span class="sep">/</span>');
  $("#ticker-track").innerHTML = `${group}<span class="sep">/</span>${group}`;
}

function renderFooter() {
  $("#footer-address").textContent = state.club.address;
  $("#footer-email").textContent = state.club.email;
  $("#footer-phone").textContent = state.club.phone;
  $("#footer-year").textContent = new Date().getFullYear();
}

/* ---------- Shared components ---------- */

function pageIntro(title, word, description) {
  return `
    <section class="page-intro" data-word="${esc(word)}">
      <div class="container">
        <div class="crumbs"><a href="#/">Home</a> <span>/</span> <span>${esc(title)}</span></div>
        <span class="eyebrow light">${esc(state.club.name)} · ${esc(state.club.league)}</span>
        <h1>${esc(title)}</h1>
        <p>${esc(description)}</p>
      </div>
    </section>`;
}

function playerCard(player) {
  const captain = state.club.captain === player.name;
  return `
    <button class="player-card" type="button" data-action="open-player" data-id="${esc(player.id)}" aria-label="View ${esc(player.name)}">
      <div class="portrait">
        <img src="${portraitSrc(player)}" alt="${esc(player.name)} portrait" loading="lazy">
        <span class="shirt-num">${esc(player.number)}</span>
        ${captain ? '<span class="captain" title="Club captain">C</span>' : ""}
        <span class="pos-pill">${esc(player.position)}</span>
      </div>
      <div class="p-info">
        <h3>${esc(player.name)}</h3>
        <div class="p-meta"><span>${esc(positionName(player.position))}</span><span>${esc(player.nationality)}</span></div>
        <div class="p-stats">
          <span><b>${esc(player.appearances)}</b>Apps</span>
          <span><b>${esc(player.goals)}</b>Goals</span>
          <span><b>${esc(player.assists)}</b>Assists</span>
        </div>
      </div>
    </button>`;
}

function miniPlayer(player) {
  return `
    <a class="mini-player" href="#/squad" data-action="open-player" data-id="${esc(player.id)}">
      <div class="portrait">
        <img src="${portraitSrc(player)}" alt="${esc(player.name)} portrait" loading="lazy">
        <span class="num">${esc(player.number)}</span>
      </div>
      <div class="info">
        <strong>${esc(player.name)}</strong>
        <span>${esc(positionName(player.position))}</span>
      </div>
    </a>`;
}

function newsCard(article, featured = false) {
  return `
    <button class="news-card ${featured ? "featured" : ""}" type="button" data-action="open-article" data-id="${esc(article.id)}">
      <div class="news-cover" data-letter="${esc((article.category || "M").slice(0, 1))}">
        <div class="cover-top">
          <span class="cover-cat">${esc(article.category)}</span>
          <img class="cover-crest" src="assets/crest.svg" alt="">
        </div>
        <span class="cover-title">${esc(article.category)}</span>
      </div>
      <div class="news-body">
        <span class="date">${formatDate(article.date)}</span>
        <h3>${esc(article.title)}</h3>
        <p>${esc(article.excerpt)}</p>
        <span class="link-arrow">Read the story</span>
      </div>
    </button>`;
}

function newsListCard(article) {
  return `
    <a class="news-list-card" href="#/news" data-action="open-article" data-id="${esc(article.id)}">
      <span class="thumb"><img src="assets/crest.svg" alt=""></span>
      <span class="copy">
        <span class="meta">${esc(article.category)} <span>${formatDate(article.date)}</span></span>
        <h3>${esc(article.title)}</h3>
      </span>
    </a>`;
}

function fixtureCard(fixture) {
  const parts = dateParts(fixture.date);
  const result = resultLetter(fixture);
  const teams = fixtureTeams(fixture);
  const isFinished = fixture.status === "finished";
  const shownScore = fixture.home
    ? `${fixture.homeScore}–${fixture.awayScore}`
    : `${fixture.awayScore}–${fixture.homeScore}`;
  return `
    <article class="fixture-card">
      <div class="fixture-date">
        <span class="day">${esc(parts.day)}</span>
        <span class="month">${esc(parts.month)} · ${esc(parts.year)}</span>
        <span class="time">${esc(parts.weekday)} · ${time24(fixture.date)}</span>
      </div>
      <div class="fixture-body">
        <div class="fixture-comp"><span class="tag ${isFinished ? "soft" : "dark"}">${isFinished ? "Full time" : "Upcoming"}</span> ${esc(fixture.competition)}</div>
        <div class="fixture-teams">
          <span>${esc(teams.home)}</span>
          ${isFinished ? "" : '<span class="at">vs</span>'}
          <span>${esc(teams.away)}</span>
        </div>
        <div class="fixture-venue">${esc(fixture.venue)}${fixture.note ? ` · ${esc(fixture.note)}` : ""}</div>
      </div>
      <div class="fixture-side">
        ${isFinished
          ? `<span class="score">${esc(shownScore)}</span><span class="res-badge ${result === "L" ? "loss" : result === "D" ? "draw" : ""}">${result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"}</span>`
          : `<span class="count">Kick-off</span><span class="score">${time24(fixture.date)}</span><button class="icon-btn" type="button" data-action="open-fixture" data-id="${esc(fixture.id)}">Details</button>`}
        ${isFinished ? `<button class="icon-btn" type="button" data-action="open-fixture" data-id="${esc(fixture.id)}">Match detail</button>` : ""}
      </div>
    </article>`;
}

function emptyState(title, text) {
  return `<div class="empty-state"><b>${esc(title)}</b>${esc(text)}</div>`;
}

/* ---------- Home ---------- */

function homeView() {
  const next = getNextFixture();
  const last = getLastResult();
  const top = topScorer();
  const scorer = top || state.players[0];
  const featured = state.news.find((article) => article.featured) || state.news[0];
  const secondary = state.news.filter((article) => article.id !== featured.id).slice(0, 2);
  const table = leagueRows().slice(0, 4);
  const record = recordSummary();
  const homePlayers = ["p9", "p8", "p11", "p1"].map(playerById).filter(Boolean);
  const upcoming = getUpcomingFixtures().slice(0, 3);
  const nextTarget = next ? dateValue(next.date).getTime() : 0;

  return `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <div class="hero-kicker"><span class="badge">${next ? `Matchday ${getResults().length + 1}` : "Season update"}</span> ${esc(state.club.league)} · 2026/27</div>
          <h1>The Pride of <span>Great Makongi</span> <span class="outline">Football Club</span></h1>
          <p class="hero-lede">One club, one badge, one standard. Follow the first team, build the XI, relive every result and take the Makongi story with you.</p>
          <div class="hero-actions">
            <a class="btn" href="#/fixtures">Match centre <span aria-hidden="true">→</span></a>
            <a class="btn secondary" href="#/posters">Create a poster</a>
          </div>
          <div class="hero-meta">
            <div><b>${esc(state.club.founded)}</b><span>Founded</span></div>
            <div><b>${(Number(state.club.capacity) / 1000).toFixed(0)}K</b><span>Capacity</span></div>
            <div><b>${leaguePosition()}${leaguePosition() === 1 ? "st" : "th"}</b><span>League position</span></div>
            <div><b>${esc(scorer ? scorer.goals : 0)}</b><span>Top scorer goals</span></div>
          </div>
        </div>
        ${next ? nextMatchCard(next, nextTarget) : emptyNextCard()}
      </div>
    </section>

    <div class="container">
      <div class="snapshot-grid">
        ${last ? lastResultCard(last) : ""}
        <div class="snapshot-table">
          <h3>League snapshot <a class="link-arrow" href="#/table">Full table</a></h3>
          ${table.map((row, index) => `
            <div class="snapshot-row ${row.isMakongi ? "mfc" : ""}">
              <span class="pos">${index + 1}</span>
              <span class="team">${esc(row.team)}</span>
              <b>${esc(row.points)}</b>
            </div>`).join("")}
        </div>
      </div>

      <div class="quick-stats">
        <div class="quick-stat"><b>${record.wins}<em>W</em> ${record.draws}<em>D</em> ${record.losses}<em>L</em></b><span>Season record</span></div>
        <div class="quick-stat"><b>${state.table.find((row) => row.isMakongi)?.gf ?? 0}</b><span>Goals scored</span></div>
        <div class="quick-stat"><b>${state.table.find((row) => row.isMakongi)?.ga ?? 0}</b><span>Goals conceded</span></div>
        <div class="quick-stat"><b>${topKeeper() ? topKeeper().cleanSheets : 0}</b><span>Clean sheets</span></div>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">The first team</span>
            <h2>Built on Makongi</h2>
            <p>Homegrown heart, senior leadership and the next generation. Meet the players carrying the badge this season.</p>
          </div>
          <a class="link-arrow" href="#/squad">View full squad</a>
        </div>
        <div class="players-strip">
          ${homePlayers.map(miniPlayer).join("")}
        </div>
      </div>
    </section>

    <section class="section dark">
      <div class="container">
        <div class="section-head light">
          <div>
            <span class="eyebrow light">Around the club</span>
            <h2>News from the Ground</h2>
            <p>Match reports, ticketing, academy pathways and the people who make Makongi FC more than a football club.</p>
          </div>
          <a class="link-arrow" href="#/news">All club news</a>
        </div>
        <div class="home-news">
          ${featureNews(featured)}
          <div class="news-stack">${secondary.map(newsListCard).join("")}</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">Match centre</span>
            <h2>Next at the Ground</h2>
            <p>Three fixtures, one badge. Every kick-off time is East Africa Time.</p>
          </div>
          <a class="link-arrow" href="#/fixtures">All fixtures</a>
        </div>
        <div class="fixture-list">
          ${upcoming.length ? upcoming.map(fixtureCard).join("") : emptyState("No fixtures scheduled", "The admin dashboard can add the next fixture.")}
        </div>
      </div>
    </section>

    <section class="section tight">
      <div class="container">
        <div class="poster-promo">
          <div>
            <span class="eyebrow" style="color:#ffe1e4">Poster studio</span>
            <h2>Matchday, made for sharing.</h2>
            <p>Build a professional matchday or birthday poster with the crest, the colors and the players. Download a ready-to-post PNG in seconds.</p>
            <div class="hero-actions">
              <a class="btn dark" href="#/posters">Open poster studio <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <div class="poster-mini" aria-hidden="true">
            <img class="crest" src="assets/crest.svg" alt="">
            <div class="kicker">NBC Premier League</div>
            <h3>Matchday</h3>
            <div class="teams"><b>MFC</b><i>vs</i><b>${next ? esc(next.opponent.split(" ")[0].toUpperCase()) : "SIM"}</b></div>
            <div class="bottom"><span>${next ? formatDate(next.date) : "02 Nov 2026"}</span><span>${next ? time24(next.date) : "16:00"}</span></div>
          </div>
        </div>
      </div>
    </section>`;
}

function nextMatchCard(fixture, target) {
  return `
    <aside class="next-card" aria-label="Next match">
      <div class="next-card-head"><span>Next fixture</span><span class="live-dot">Countdown</span></div>
      <div class="next-teams">
        <div class="next-team">
          <span class="team-crest red">MFC</span>
          <b>Makongi FC</b>
          <small>${fixture.home ? "Home" : "Away"}</small>
        </div>
        <div class="next-vs">VS</div>
        <div class="next-team">
          <span class="team-crest outline">${esc(fixture.opponentShort || fixture.opponent.slice(0, 3).toUpperCase())}</span>
          <b>${esc(fixture.opponent)}</b>
          <small>${fixture.home ? "Away" : "Home"}</small>
        </div>
      </div>
      <div class="next-info">
        <span>${esc(fixture.venue)}</span>
        <span>${formatLongDate(fixture.date)} · ${time24(fixture.date)} EAT</span>
      </div>
      <div class="countdown" data-countdown="${target}">
        <div><b data-unit="days">00</b><span>Days</span></div>
        <div><b data-unit="hours">00</b><span>Hours</span></div>
        <div><b data-unit="minutes">00</b><span>Mins</span></div>
        <div><b data-unit="seconds">00</b><span>Secs</span></div>
      </div>
      <div class="next-card-foot"><span>${esc(fixture.competition)}</span><a href="#/fixtures">Match centre →</a></div>
    </aside>`;
}

function emptyNextCard() {
  return `
    <aside class="next-card">
      <div class="next-card-head"><span>Next fixture</span><span>To be confirmed</span></div>
      <div style="padding:44px 24px;text-align:center;color:#a7a29a">
        <p style="font-family:var(--display);font-size:30px;text-transform:uppercase;color:#fff">No fixture scheduled</p>
        <p style="font-size:12px;margin-top:8px">The admin dashboard can add the next match.</p>
      </div>
      <div class="next-card-foot"><span>Check back soon</span><a href="#/admin">Admin →</a></div>
    </aside>`;
}

function lastResultCard(fixture) {
  const score = scoreFor(fixture);
  const outcome = resultLetter(fixture);
  return `
    <div class="snapshot-result">
      <div>
        <span class="eyebrow">Latest result</span>
        <div class="result-line">
          <span>Makongi</span>
          <span class="score-block">${esc(score.mfc)}<i>–</i>${esc(score.opponent)}</span>
          <span>${esc(fixture.opponent)}</span>
        </div>
        <div class="result-meta">${fixture.home ? "Home" : "Away"} · ${esc(fixture.venue)} · ${formatDate(fixture.date)} · ${outcome === "W" ? "Win" : outcome === "D" ? "Draw" : "Loss"}</div>
      </div>
      <a class="btn secondary" href="#/fixtures">Match detail</a>
    </div>`;
}

function featureNews(article) {
  return `
    <article class="feature-news">
      <div class="feature-copy">
        <span class="tag">${esc(article.category)}</span>
        <h3>${esc(article.title)}</h3>
        <p>${esc(article.excerpt)}</p>
        <a class="link-arrow" href="#/news" data-action="open-article" data-id="${esc(article.id)}">Read the story</a>
      </div>
    </article>`;
}

function startCountdown() {
  const block = $("[data-countdown]");
  if (!block) return;
  const target = Number(block.dataset.countdown);
  const update = () => {
    const remaining = Math.max(0, target - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const values = { days, hours, minutes, seconds };
    Object.entries(values).forEach(([key, value]) => {
      const node = $(`[data-unit="${key}"]`, block);
      if (node) node.textContent = String(value).padStart(2, "0");
    });
  };
  update();
  countdownTimer = setInterval(update, 1000);
}

/* ---------- Squad ---------- */

function squadView() {
  const filter = ui.squadFilter;
  const filtered = sortedPlayers().filter((player) => filter === "ALL" || positionGroup(player.position) === filter);
  return `
    ${pageIntro("The First Team", "SQUAD", "Every player, every position, every number. Select a player for their season profile and stats.")}
    <section class="section">
      <div class="container">
        <div class="filter-bar" role="group" aria-label="Filter squad by position">
          ${["ALL", "Goalkeepers", "Defenders", "Midfielders", "Forwards"].map((group) => `
            <button class="chip ${filter === group ? "active" : ""}" type="button" data-action="filter-squad" data-filter="${esc(group)}">${group === "ALL" ? "Full squad" : group}</button>`).join("")}
          <span class="squad-count">${filtered.length} of ${state.players.length} players</span>
        </div>
        <div class="squad-grid">
          ${filtered.length ? filtered.map(playerCard).join("") : emptyState("No players here yet", "Add players from the admin dashboard.")}
        </div>
      </div>
    </section>`;
}

/* ---------- Lineup ---------- */

function lineupView() {
  const formationKey = FORMATIONS[ui.formationPreview] ? ui.formationPreview : state.formation;
  const formation = FORMATIONS[formationKey];
  const lineup = state.lineups[formationKey] || { slots: {}, bench: [] };
  const players = formation.slots.map((slot) => ({ slot, player: playerById(lineup.slots[slot.key]) }));
  const bench = (lineup.bench || []).map(playerById).filter(Boolean);
  const selected = players.map((entry) => entry.player).filter(Boolean);
  const averageAge = selected.length ? Math.round(selected.reduce((sum, player) => sum + Number(player.age || 0), 0) / selected.length) : 0;
  const nations = new Set(selected.map((player) => player.nationality)).size;
  const goals = selected.reduce((sum, player) => sum + Number(player.goals || 0), 0);

  return `
    ${pageIntro("Starting XI", "LINEUP", "The shape, the personnel and the bench. Switch formations to preview how Makongi line up on matchday.")}
    <section class="section">
      <div class="container">
        <div class="lineup-toolbar">
          <div class="formation-tabs" role="group" aria-label="Formation">
            ${Object.entries(FORMATIONS).map(([key, item]) => `
              <button class="formation-tab ${key === formationKey ? "active" : ""}" type="button" data-action="formation" data-formation="${esc(key)}">${esc(item.label)}</button>`).join("")}
          </div>
          <span class="lineup-meta">${selected.length} selected · ${bench.length} on the bench</span>
        </div>
        <div class="lineup-layout">
          <div class="pitch-panel">
            <div class="pitch">
              <img class="pitch-watermark" src="assets/crest.svg" alt="">
              <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
              <span class="box-bottom"></span><span class="goal-bottom"></span>
              ${players.map(({ slot, player }) => `
                <div class="pitch-slot" style="left:${slot.x}%;top:${slot.y}%">
                  <span class="shirt ${slot.short === "GK" ? "gk" : ""}">${player ? esc(player.number) : "–"}</span>
                  <span class="slot-name">${player ? esc(player.name) : "Select player"}</span>
                  <span class="slot-role">${esc(slot.short)}</span>
                </div>`).join("")}
            </div>
          </div>
          <aside class="lineup-side">
            <div class="side-card">
              <h3>Bench <span>${bench.length} players</span></h3>
              ${bench.length ? bench.map((player) => `
                <div class="bench-row">
                  <span class="num">${esc(player.number)}</span>
                  <span>${esc(player.name)}</span>
                  <span class="pos">${esc(player.position)}</span>
                </div>`).join("") : '<p class="formation-note">No substitutes selected. Use the admin dashboard to build the bench.</p>'}
            </div>
            <div class="side-card">
              <h3>The shape</h3>
              <p class="formation-note">${esc(formation.description)}</p>
              <div class="coach" style="margin-top:16px;padding-top:14px;padding-bottom:0;border-top:1px solid #eee9df;border-bottom:0">
                <span class="av">${esc(playerInitials(state.club.coach))}</span>
                <div><b>${esc(state.club.coach)}</b><span>Head coach</span></div>
              </div>
              <div class="bench-row" style="margin-top:8px"><span class="num">${averageAge}</span><span>Average age of the XI</span><span class="pos">Years</span></div>
              <div class="bench-row"><span class="num">${nations}</span><span>Nationalities in the XI</span><span class="pos">Nations</span></div>
              <div class="bench-row"><span class="num">${goals}</span><span>League goals in the XI</span><span class="pos">Goals</span></div>
            </div>
            <a class="btn full" href="#/admin" data-action="admin-lineup-link">Manage lineup in admin</a>
          </aside>
        </div>
      </div>
    </section>`;
}

/* ---------- Fixtures ---------- */

function fixturesView() {
  const upcoming = getUpcomingFixtures();
  const results = getResults();
  const list = ui.fixtureTab === "results" ? results : upcoming;
  return `
    ${pageIntro("Fixtures & Results", "MATCHES", "Kick-off times, venues, scores and the moments that decide the season. All times are East Africa Time.")}
    <section class="section">
      <div class="container">
        <div class="tab-bar" role="tablist">
          <button class="tab-button ${ui.fixtureTab === "upcoming" ? "active" : ""}" type="button" data-action="fixture-tab" data-tab="upcoming">Upcoming (${upcoming.length})</button>
          <button class="tab-button ${ui.fixtureTab === "results" ? "active" : ""}" type="button" data-action="fixture-tab" data-tab="results">Results (${results.length})</button>
        </div>
        <div class="fixture-list">
          ${list.length ? list.map(fixtureCard).join("") : emptyState(ui.fixtureTab === "results" ? "No results yet" : "No fixtures scheduled", "The admin dashboard can add the next match.")}
        </div>
        <div class="table-note"><span>Home fixtures at ${esc(state.club.stadium)}</span><span>League: ${esc(state.club.league)}</span><span>Season 2026/27</span></div>
      </div>
    </section>`;
}

/* ---------- Stats ---------- */

function statsView() {
  const key = ui.statsSort.key;
  const direction = ui.statsSort.direction === "asc" ? 1 : -1;
  const players = [...state.players].sort((a, b) => {
    const first = Number(a[key] || 0);
    const second = Number(b[key] || 0);
    if (first === second) return Number(b.goals) - Number(a.goals);
    return (first - second) * direction;
  });
  const columns = [
    { key: "appearances", label: "Apps" },
    { key: "goals", label: "Goals" },
    { key: "assists", label: "Assists" },
    { key: "cleanSheets", label: "Clean sheets" },
    { key: "yellow", label: "Yellow" },
    { key: "red", label: "Red" }
  ];
  const scorer = topScorer();
  const creator = topAssists();
  const keeper = topKeeper();
  return `
    ${pageIntro("Player Statistics", "STATS", "Goals, assists, appearances and discipline. Sort the table to find the numbers behind the season.")}
    <section class="section">
      <div class="container">
        <div class="leader-grid">
          ${leaderCard("Golden boot", scorer, "goals", "Goals", 1)}
          ${leaderCard("Chief creator", creator, "assists", "Assists", 2)}
          ${leaderCard("Clean sheets", keeper, "cleanSheets", "Clean sheets", 3)}
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                ${columns.map((column) => `<th class="${key === column.key ? "sorted" : ""}" data-action="stats-sort" data-key="${column.key}">${column.label}${key === column.key ? (direction === -1 ? " ↓" : " ↑") : ""}</th>`).join("")}
                <th>G + A</th>
              </tr>
            </thead>
            <tbody>
              ${players.map((player) => `
                <tr data-action="open-player" data-id="${esc(player.id)}">
                  <td><span class="player-cell"><span class="avatar"><img src="${portraitSrc(player)}" alt="" loading="lazy"></span>${esc(player.name)}</span></td>
                  <td class="num-cell">${esc(player.position)}</td>
                  <td>${esc(player.appearances)}</td>
                  <td class="goals-cell">${esc(player.goals)}</td>
                  <td>${esc(player.assists)}</td>
                  <td>${esc(player.cleanSheets)}</td>
                  <td>${esc(player.yellow)}</td>
                  <td>${esc(player.red)}</td>
                  <td><b>${Number(player.goals || 0) + Number(player.assists || 0)}</b></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="table-legend"><span><i class="legend-dot red"></i> Click a player for their full profile</span><span>Stats update live from the admin dashboard</span></div>
      </div>
    </section>`;
}

function leaderCard(label, player, key, unit, rank) {
  if (!player) return "";
  return `
    <div class="leader-card" data-rank="0${rank}">
      <span class="leader-label">${esc(label)}</span>
      <div class="leader-name">${esc(player.name)}</div>
      <div class="leader-value"><b>${esc(player[key])}</b><span>${esc(unit)}</span></div>
    </div>`;
}

/* ---------- League table ---------- */

function tableView() {
  const rows = leagueRows();
  const mfc = rows.find((row) => row.isMakongi);
  return `
    ${pageIntro("League Table", "TABLE", `The ${state.club.league} standings after Matchday ${getResults().length}. Position, form and goal difference at a glance.`)}
    <section class="section">
      <div class="container">
        <div class="quick-stats" style="margin-bottom:24px">
          <div class="quick-stat"><b>${rows.findIndex((row) => row.isMakongi) + 1}</b><span>Current position</span></div>
          <div class="quick-stat"><b>${mfc ? mfc.points : 0}</b><span>Points</span></div>
          <div class="quick-stat"><b>${mfc ? mfc.gd > 0 ? `+${mfc.gd}` : mfc.gd : 0}</b><span>Goal difference</span></div>
          <div class="quick-stat"><b>${mfc ? mfc.form.filter((item) => item === "W").length : 0}/5</b><span>Wins in last five</span></div>
        </div>
        <div class="table-wrap">
          <table class="league-table">
            <thead>
              <tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Form</th></tr>
            </thead>
            <tbody>
              ${rows.map((row, index) => `
                <tr class="${row.isMakongi ? "mfc" : ""}">
                  <td class="pos ${index < 3 ? "qual" : ""}">${index + 1}</td>
                  <td><span class="team-name"><span class="team-badge">${esc(row.short || row.team.slice(0, 3).toUpperCase())}</span>${esc(row.team)}</span></td>
                  <td>${esc(row.played)}</td>
                  <td>${esc(row.won)}</td>
                  <td>${esc(row.drawn)}</td>
                  <td>${esc(row.lost)}</td>
                  <td>${esc(row.gf)}</td>
                  <td>${esc(row.ga)}</td>
                  <td>${row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td class="pts">${esc(row.points)}</td>
                  <td><span class="form-pills">${(row.form || []).map((item) => `<span class="form-pill ${esc(item)}">${esc(item)}</span>`).join("")}</span></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="table-note">
          <span><i class="legend-dot red"></i> CAF Champions League places</span>
          <span>P = played · W = won · D = drawn · L = lost · GD = goal difference · Pts = points</span>
          <span>Updated ${formatDate(new Date().toISOString())}</span>
        </div>
      </div>
    </section>`;
}

/* ---------- News ---------- */

function newsView() {
  const categories = ["All", ...new Set(state.news.map((article) => article.category))];
  const filtered = state.news.filter((article) => ui.newsFilter === "All" || article.category === ui.newsFilter);
  return `
    ${pageIntro("Club News", "NEWS", "Match reports, announcements and stories from the people who make Makongi FC. Every headline in one place.")}
    <section class="section">
      <div class="container">
        <div class="news-toolbar" role="group" aria-label="Filter news">
          ${categories.map((category) => `<button class="chip ${ui.newsFilter === category ? "active" : ""}" type="button" data-action="news-filter" data-filter="${esc(category)}">${esc(category)}</button>`).join("")}
        </div>
        <div class="news-page-grid">
          ${filtered.length ? filtered.map((article, index) => newsCard(article, index === 0 && ui.newsFilter === "All")).join("") : emptyState("No stories yet", "Club news added in the admin dashboard will appear here.")}
        </div>
      </div>
    </section>`;
}

/* ---------- Poster studio ---------- */

function postersView() {
  const mode = ui.posterMode;
  const data = ui.posterData[mode];
  const players = sortedPlayers();
  return `
    ${pageIntro("Poster Studio", "POSTERS", "Create a professional matchday or birthday poster, then download a 1080 × 1350 PNG ready for Instagram, WhatsApp and Facebook.")}
    <section class="section">
      <div class="container">
        <div class="poster-layout">
          <div class="poster-stage">
            <canvas id="poster-canvas" width="1080" height="1350" aria-label="Poster preview"></canvas>
          </div>
          <div class="poster-controls">
            <h2>${mode === "matchday" ? "Matchday poster" : "Birthday poster"}</h2>
            <p>Pick a theme, edit the details and the preview updates as you type.</p>
            <div class="segmented" role="group" aria-label="Poster type">
              <button class="${mode === "matchday" ? "active" : ""}" type="button" data-action="poster-mode" data-mode="matchday">Matchday</button>
              <button class="${mode === "birthday" ? "active" : ""}" type="button" data-action="poster-mode" data-mode="birthday">Birthday</button>
            </div>
            <form id="poster-form" onsubmit="return false">
              ${mode === "matchday" ? matchdayFields(data) : birthdayFields(data, players)}
            </form>
            <div class="field">
              <label>Color theme</label>
              <div class="segmented" style="margin-bottom:0">
                <button class="${data.theme === "red" ? "active" : ""}" type="button" data-action="poster-theme" data-theme="red">Makongi red</button>
                <button class="${data.theme === "black" ? "active" : ""}" type="button" data-action="poster-theme" data-theme="black">Midnight black</button>
              </div>
            </div>
            <div class="poster-actions">
              <button class="btn" type="button" data-action="download-poster">Download PNG</button>
              <button class="btn ghost" type="button" data-action="copy-poster">Copy caption</button>
            </div>
            <div class="notice" style="margin-top:16px"><span>i</span><div><b>Print-ready output.</b> The downloaded file is 1080 × 1350 pixels, sized for a social post or a printed A5 flyer.</div></div>
          </div>
        </div>
      </div>
    </section>`;
}

function matchdayFields(data) {
  return `
    <div class="field"><label for="poster-opponent">Opponent</label><input id="poster-opponent" data-poster-field="opponent" value="${esc(data.opponent)}" placeholder="Simba SC"></div>
    <div class="field-row">
      <div class="field"><label for="poster-date">Match date</label><input id="poster-date" type="date" data-poster-field="date" value="${esc(data.date)}"></div>
      <div class="field"><label for="poster-time">Kick-off</label><input id="poster-time" type="time" data-poster-field="time" value="${esc(data.time)}"></div>
    </div>
    <div class="field"><label for="poster-venue">Venue</label><input id="poster-venue" data-poster-field="venue" value="${esc(data.venue)}"></div>
    <div class="field"><label for="poster-competition">Competition</label><input id="poster-competition" data-poster-field="competition" value="${esc(data.competition)}"></div>
    <div class="field"><label for="poster-tagline">Bottom line</label><input id="poster-tagline" data-poster-field="tagline" value="${esc(data.tagline)}"></div>`;
}

function birthdayFields(data, players) {
  return `
    <div class="field"><label for="poster-player">Player</label>
      <select id="poster-player" data-poster-field="playerId">
        ${players.map((player) => `<option value="${esc(player.id)}" ${player.id === data.playerId ? "selected" : ""}>${esc(player.name)} · #${esc(player.number)}</option>`).join("")}
      </select>
    </div>
    <div class="field"><label for="poster-age">Age (optional)</label><input id="poster-age" data-poster-field="age" value="${esc(data.age)}" placeholder="27"></div>
    <div class="field"><label for="poster-message">Message</label><textarea id="poster-message" data-poster-field="message">${esc(data.message)}</textarea></div>`;
}

function initPoster() {
  const canvas = $("#poster-canvas");
  if (!canvas) return;
  const redraw = () => {
    const mode = ui.posterMode;
    const data = ui.posterData[mode];
    const player = mode === "birthday" ? playerById(data.playerId) : null;
    drawPoster(canvas, { mode, theme: data.theme, data, player, club: state.club });
  };
  $$("[data-poster-field]").forEach((field) => {
    field.addEventListener("input", () => {
      ui.posterData[ui.posterMode][field.dataset.posterField] = field.value;
      redraw();
    });
    field.addEventListener("change", () => {
      ui.posterData[ui.posterMode][field.dataset.posterField] = field.value;
      redraw();
    });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  else redraw();
}

function downloadPoster() {
  const canvas = $("#poster-canvas");
  if (!canvas) return;
  const mode = ui.posterMode;
  const data = ui.posterData[mode];
  const name = mode === "matchday" ? `makongi-matchday-${(data.opponent || "fixture").toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : `makongi-birthday-${(playerById(data.playerId)?.name || "player").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const link = document.createElement("a");
  link.download = `${name}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  toast("Download ready", "Your 1080 × 1350 PNG has been generated.");
}

async function copyPosterCaption() {
  const mode = ui.posterMode;
  const data = ui.posterData[mode];
  const player = mode === "birthday" ? playerById(data.playerId) : null;
  const text = posterCaption({ mode, data, player, club: state.club });
  try {
    await navigator.clipboard.writeText(text);
    toast("Caption copied", "Paste it alongside the poster on social media.");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("Caption copied", "Paste it alongside the poster on social media.");
  }
}

/* ---------- Admin ---------- */

function adminView() {
  if (!sessionValid()) return adminLoginView();
  return adminDashboardView();
}

function adminLoginView() {
  const locked = ui.lockUntil > Date.now();
  return `
    <div class="admin-shell">
      <div class="container admin-login-wrap">
        <div class="admin-login">
          <div class="login-brand">
            <img src="assets/crest.svg" alt="Makongi FC crest">
            <div>
              <div class="quote">The pride of <span>Great Makongi</span> runs the club.</div>
              <div class="small">Secure club administration · 2026/27</div>
            </div>
          </div>
          <div class="login-form">
            <span class="eyebrow">Control room</span>
            <h1>Admin sign in</h1>
            <p>Manage players, fixtures, results, lineups, news and club information from one dashboard.</p>
            <form id="admin-login-form" novalidate>
              <div class="field"><label for="admin-email">Email</label><input id="admin-email" name="email" type="email" autocomplete="username" placeholder="admin@makongifc.com" required></div>
              <div class="field"><label for="admin-password">Password</label><input id="admin-password" name="password" type="password" autocomplete="current-password" placeholder="Your password" required></div>
              <div class="demo-access">Demo access: <code>admin@makongifc.com</code> / <code>Makongi2026!</code></div>
              <button class="btn" type="submit" ${locked ? "disabled" : ""}>${locked ? "Locked for a moment" : "Sign in to dashboard"}</button>
              <button class="btn secondary" type="button" data-action="fill-demo" style="margin-top:8px">Use demo credentials</button>
              <div class="form-error" id="login-error" role="alert">${locked ? "Too many attempts. Try again in 30 seconds." : ""}</div>
            </form>
            <div class="login-foot"><span>30-minute session</span><span>Demo authentication</span></div>
            <div class="admin-note" style="margin-top:18px"><b>Prototype note:</b> this login runs in the browser with a hashed demo password and a session timeout. Production would use server-side sessions, a real database and role-based permissions.</div>
          </div>
        </div>
      </div>
    </div>`;
}

function adminDashboardView() {
  const tabs = [
    ["overview", "Overview", "◈"],
    ["players", "Players", "◉"],
    ["fixtures", "Fixtures", "▣"],
    ["news", "News", "▤"],
    ["lineup", "Lineup", "▥"],
    ["club", "Club info", "⚙"]
  ];
  const content = {
    overview: adminOverviewView,
    players: adminPlayersView,
    fixtures: adminFixturesView,
    news: adminNewsView,
    lineup: adminLineupView,
    club: adminClubView
  }[ui.adminTab] || adminOverviewView;
  return `
    <div class="admin-shell">
      <div class="container">
        <div class="admin-topbar">
          <div>
            <span class="eyebrow">Makongi FC control room</span>
            <h1>${ui.adminTab === "overview" ? "Dashboard" : esc(tabs.find((tab) => tab[0] === ui.adminTab)?.[1] || "Dashboard")}</h1>
            <p>Signed in as ${esc(ADMIN_EMAIL)} · session expires after ${SESSION_MINUTES} minutes</p>
          </div>
          <div class="admin-user">
            <div class="who"><b>Club administrator</b><span>Full access</span></div>
            <span class="admin-avatar">AD</span>
            <button class="icon-btn" type="button" data-action="admin-logout">Sign out</button>
          </div>
        </div>
        <div class="admin-layout">
          <nav class="admin-nav" aria-label="Admin sections">
            ${tabs.map(([key, label, icon]) => `<button class="${ui.adminTab === key ? "active" : ""}" type="button" data-action="admin-tab" data-tab="${key}"><span class="nav-icon">${icon}</span>${label}</button>`).join("")}
            <div class="nav-sep"></div>
            <button type="button" data-action="view-site"><span class="nav-icon">↗</span>View public site</button>
          </nav>
          <div class="admin-content">${content()}</div>
        </div>
      </div>
    </div>`;
}

function adminOverviewView() {
  const next = getNextFixture();
  const last = getLastResult();
  const scorer = topScorer();
  const record = recordSummary();
  return `
    <div class="admin-panel">
      <div class="admin-panel-head"><div><h2>Season at a glance</h2><p>Everything the club needs to keep the site current.</p></div><a class="btn small" href="#/fixtures">Public match centre</a></div>
      <div class="admin-stat-grid">
        <div class="admin-stat"><span>Squad</span><b>${state.players.length}</b><em>registered players</em></div>
        <div class="admin-stat"><span>League position</span><b>${leaguePosition()}</b><em>${state.club.league}</em></div>
        <div class="admin-stat"><span>Record</span><b>${record.wins}-${record.draws}-${record.losses}</b><em>W-D-L this season</em></div>
        <div class="admin-stat"><span>Next fixture</span><b>${next ? dateParts(next.date).day : "—"}</b><em>${next ? `${dateParts(next.date).month} · ${esc(next.opponent)}` : "none scheduled"}</em></div>
      </div>
      <div class="admin-grid-2">
        <div class="admin-card">
          <h3>Next fixture</h3>
          ${next ? `<div class="big-fixture"><div><b>Makongi FC vs ${esc(next.opponent)}</b><span>${esc(next.venue)}</span></div><div class="score">${time24(next.date)}</div></div>
          <div class="big-fixture"><div><b>${formatLongDate(next.date)}</b><span>${esc(next.competition)}</span></div><span class="tag">Upcoming</span></div>` : '<div class="admin-empty">No fixture scheduled.</div>'}
        </div>
        <div class="admin-card">
          <h3>Latest result</h3>
          ${last ? `<div class="big-fixture"><div><b>Makongi ${scoreFor(last).mfc}–${scoreFor(last).opponent} ${esc(last.opponent)}</b><span>${formatDate(last.date)} · ${esc(last.venue)}</span></div><span class="score">${resultLetter(last)}</span></div>
          <div class="big-fixture"><div><b>${esc(last.scorers || "No scorers recorded")}</b><span>Goalscorers</span></div><a class="icon-btn" href="#/fixtures">View</a></div>` : '<div class="admin-empty">No result recorded.</div>'}
        </div>
      </div>
      <div class="admin-card" style="margin-top:14px">
        <h3>Top scorers</h3>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Apps</th><th>Goals</th><th>Assists</th></tr></thead>
            <tbody>
              ${[...state.players].sort((a, b) => b.goals - a.goals).slice(0, 5).map((player) => `<tr><td>${esc(player.number)}</td><td class="name">${esc(player.name)}</td><td>${esc(player.position)}</td><td>${esc(player.appearances)}</td><td>${esc(player.goals)}</td><td>${esc(player.assists)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
      <div class="admin-note"><b>Demo state.</b> Changes are saved in this browser only. Use “Reset demo data” to return to the seeded club. <button class="icon-btn danger" type="button" data-action="reset-demo" style="margin-left:8px">Reset demo data</button></div>
    </div>`;
}

function adminPlayersView() {
  const players = sortedPlayers();
  return `
    <div class="admin-panel">
      <div class="admin-panel-head"><div><h2>Players</h2><p>Register players, upload portraits and keep season stats current.</p></div><button class="btn small" type="button" data-action="add-player">+ Add player</button></div>
      <div class="field" style="max-width:320px"><label for="admin-player-search">Search squad</label><input id="admin-player-search" type="search" placeholder="Name or position" autocomplete="off"></div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Apps</th><th>G</th><th>A</th><th>CS</th><th>Cards</th><th style="text-align:right">Actions</th></tr></thead>
          <tbody id="admin-player-rows">
            ${players.map((player) => `
              <tr data-search="${esc(`${player.name} ${player.position} ${player.nationality}`.toLowerCase())}">
                <td>${esc(player.number)}</td>
                <td class="name">${esc(player.name)}</td>
                <td>${esc(player.position)}</td>
                <td>${esc(player.appearances)}</td>
                <td>${esc(player.goals)}</td>
                <td>${esc(player.assists)}</td>
                <td>${esc(player.cleanSheets)}</td>
                <td>${esc(player.yellow)}Y ${esc(player.red)}R</td>
                <td><div class="row-actions"><button class="icon-btn" type="button" data-action="edit-player" data-id="${esc(player.id)}">Edit</button><button class="icon-btn danger" type="button" data-action="delete-player" data-id="${esc(player.id)}">Delete</button></div></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="admin-note">Player photos are compressed to 600 × 720 in the browser before saving, so the demo stays fast and fits in browser storage.</div>
    </div>`;
}

function adminFixturesView() {
  const fixtures = [...state.fixtures].sort((a, b) => dateValue(b.date) - dateValue(a.date));
  return `
    <div class="admin-panel">
      <div class="admin-panel-head"><div><h2>Fixtures & results</h2><p>Publish the next match or record a final score.</p></div><button class="btn small" type="button" data-action="add-fixture">+ Add fixture</button></div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Date</th><th>Opponent</th><th>H/A</th><th>Competition</th><th>Status</th><th>Score</th><th style="text-align:right">Actions</th></tr></thead>
          <tbody>
            ${fixtures.map((fixture) => `
              <tr>
                <td>${formatDate(fixture.date)}</td>
                <td class="name">${esc(fixture.opponent)}</td>
                <td>${fixture.home ? "Home" : "Away"}</td>
                <td>${esc(fixture.competition)}</td>
                <td><span class="tag ${fixture.status === "finished" ? "soft" : ""}">${fixture.status === "finished" ? "Full time" : "Upcoming"}</span></td>
                <td>${fixture.status === "finished" ? `${esc(fixture.homeScore)}–${esc(fixture.awayScore)}` : "—"}</td>
                <td><div class="row-actions"><button class="icon-btn" type="button" data-action="edit-fixture" data-id="${esc(fixture.id)}">Edit</button><button class="icon-btn danger" type="button" data-action="delete-fixture" data-id="${esc(fixture.id)}">Delete</button></div></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="admin-note">Upcoming fixtures appear in the next-match countdown. Finished fixtures automatically appear in the results list. For this prototype, the public league table is seeded in <b>assets/data.mjs</b>.</div>
    </div>`;
}

function adminNewsView() {
  const news = [...state.news].sort((a, b) => b.date.localeCompare(a.date));
  return `
    <div class="admin-panel">
      <div class="admin-panel-head"><div><h2>Club news</h2><p>Publish match reports, announcements and academy stories.</p></div><button class="btn small" type="button" data-action="add-news">+ Add article</button></div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Featured</th><th style="text-align:right">Actions</th></tr></thead>
          <tbody>
            ${news.map((article) => `
              <tr>
                <td>${formatDate(article.date)}</td>
                <td class="name">${esc(article.title)}</td>
                <td>${esc(article.category)}</td>
                <td>${article.featured ? "Yes" : "—"}</td>
                <td><div class="row-actions"><button class="icon-btn" type="button" data-action="edit-news" data-id="${esc(article.id)}">Edit</button><button class="icon-btn danger" type="button" data-action="delete-news" data-id="${esc(article.id)}">Delete</button></div></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

function adminLineupView() {
  const formationKey = FORMATIONS[ui.adminFormation] ? ui.adminFormation : state.formation;
  const formation = FORMATIONS[formationKey];
  const lineup = state.lineups[formationKey] || { slots: {}, bench: [] };
  const players = sortedPlayers();
  const bench = new Set(lineup.bench || []);
  return `
    <div class="admin-panel">
      <div class="admin-panel-head"><div><h2>Starting XI</h2><p>Choose a formation, fill all 11 slots and select the bench.</p></div><button class="btn small ghost" type="button" data-action="auto-lineup">Auto-fill best XI</button></div>
      <form id="admin-lineup-form">
        <div class="admin-form-grid" style="margin-bottom:14px">
          <div><label for="lineup-formation">Formation</label><select id="lineup-formation">${Object.keys(FORMATIONS).map((key) => `<option value="${esc(key)}" ${key === formationKey ? "selected" : ""}>${esc(FORMATIONS[key].label)}</option>`).join("")}</select></div>
          <div><label>Shape notes</label><div style="padding:9px 0;color:#8b867e;font-size:11px">${esc(formation.description)}</div></div>
        </div>
        <div class="lineup-editor">
          ${formation.slots.map((slot) => `
            <div class="slot-edit">
              <span>${esc(slot.short)}</span>
              <select data-slot="${esc(slot.key)}" aria-label="${esc(slot.label)}">
                <option value="">Select player</option>
                ${players.map((player) => `<option value="${esc(player.id)}" ${lineup.slots[slot.key] === player.id ? "selected" : ""}>${esc(player.number)} · ${esc(player.name)} (${esc(player.position)})</option>`).join("")}
              </select>
            </div>`).join("")}
        </div>
        <div style="margin-top:16px"><label style="display:block;margin-bottom:6px;color:#8b867e;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Bench</label>
          <div class="bench-edit">
            ${players.map((player) => `<label class="bench-check"><input type="checkbox" name="bench" value="${esc(player.id)}" ${bench.has(player.id) ? "checked" : ""}> ${esc(player.number)} ${esc(player.name)}</label>`).join("")}
          </div>
        </div>
        <div class="admin-actions"><button class="btn small" type="submit">Save lineup</button></div>
      </form>
      <div class="admin-note">The public lineup page previews every formation. Saving here sets the formation shown first and the 11 players used across the site.</div>
    </div>`;
}

function adminClubView() {
  return `
    <div class="admin-panel">
      <div class="admin-panel-head"><div><h2>Club information</h2><p>These details appear across the site header, footer and posters.</p></div></div>
      <form id="admin-club-form">
        <div class="admin-form-grid">
          <div><label for="club-name">Club name</label><input id="club-name" name="name" value="${esc(state.club.name)}" required></div>
          <div><label for="club-slogan">Slogan</label><input id="club-slogan" name="slogan" value="${esc(state.club.slogan)}" required></div>
          <div><label for="club-founded">Founded</label><input id="club-founded" name="founded" type="number" value="${esc(state.club.founded)}"></div>
          <div><label for="club-stadium">Stadium</label><input id="club-stadium" name="stadium" value="${esc(state.club.stadium)}"></div>
          <div><label for="club-city">City</label><input id="club-city" name="city" value="${esc(state.club.city)}"></div>
          <div><label for="club-country">Country</label><input id="club-country" name="country" value="${esc(state.club.country)}"></div>
          <div><label for="club-league">League</label><input id="club-league" name="league" value="${esc(state.club.league)}"></div>
          <div><label for="club-capacity">Capacity</label><input id="club-capacity" name="capacity" type="number" value="${esc(state.club.capacity)}"></div>
          <div><label for="club-coach">Head coach</label><input id="club-coach" name="coach" value="${esc(state.club.coach)}"></div>
          <div><label for="club-captain">Captain</label><input id="club-captain" name="captain" value="${esc(state.club.captain)}"></div>
          <div><label for="club-email">Email</label><input id="club-email" name="email" type="email" value="${esc(state.club.email)}"></div>
          <div><label for="club-phone">Phone</label><input id="club-phone" name="phone" value="${esc(state.club.phone)}"></div>
          <div class="full"><label for="club-address">Address</label><input id="club-address" name="address" value="${esc(state.club.address)}"></div>
        </div>
        <div class="admin-actions"><button class="btn small" type="submit">Save club info</button></div>
      </form>
      <div class="admin-note"><b>Branding.</b> The crest, red, black and white palette and the slogan are used throughout the public site and the poster studio.</div>
    </div>`;
}

/* ---------- Modals ---------- */

function openModal(content, size = "") {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal ${size}" role="dialog" aria-modal="true" aria-label="Dialog">
        <button class="modal-close" type="button" data-action="close-modal" aria-label="Close dialog">×</button>
        <div class="modal-body">${content}</div>
      </div>
    </div>`;
  document.body.classList.add("modal-open");
  setTimeout(() => $(".modal-close")?.focus(), 30);
}

function closeModal() {
  modalRoot.innerHTML = "";
  document.body.classList.remove("modal-open");
}

function openPlayerModal(id) {
  const player = playerById(id);
  if (!player) return;
  openModal(`
    <div class="player-profile">
      <div class="profile-photo"><img src="${portraitSrc(player)}" alt="${esc(player.name)} portrait"></div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
          <div><span class="tag">${esc(positionName(player.position))}</span><h2 style="margin-top:9px">${esc(player.name)}</h2></div>
          <div style="text-align:right"><div class="profile-no">${esc(player.number)}</div><div class="profile-pos">Squad number</div></div>
        </div>
        <div class="modal-meta"><span>${esc(player.nationality)}</span><span>·</span><span>${esc(player.age)} years</span><span>·</span><span>${esc(player.height)}</span><span>·</span><span>${esc(player.foot)} footed</span>${state.club.captain === player.name ? '<span class="tag dark">Club captain</span>' : ""}</div>
        <div class="profile-stats">
          <div class="profile-stat"><b>${esc(player.appearances)}</b><span>Apps</span></div>
          <div class="profile-stat"><b>${esc(player.goals)}</b><span>Goals</span></div>
          <div class="profile-stat"><b>${esc(player.assists)}</b><span>Assists</span></div>
          <div class="profile-stat"><b>${esc(player.cleanSheets)}</b><span>Clean sheets</span></div>
          <div class="profile-stat"><b>${esc(player.yellow)}</b><span>Yellow</span></div>
          <div class="profile-stat"><b>${esc(player.red)}</b><span>Red</span></div>
          <div class="profile-stat"><b>${Number(player.goals || 0) + Number(player.assists || 0)}</b><span>G + A</span></div>
          <div class="profile-stat"><b>${esc(player.number)}</b><span>Shirt</span></div>
        </div>
        <div class="bio-label">Player profile</div>
        <p>${esc(player.bio || "Season profile coming soon.")}</p>
        <div style="display:flex;gap:8px;margin-top:22px;flex-wrap:wrap"><a class="btn small ghost" href="#/stats" data-action="close-modal">Full season stats</a><a class="btn small ghost" href="#/lineup" data-action="close-modal">View the XI</a></div>
      </div>
    </div>`, "wide");
}

function openArticleModal(id) {
  const article = state.news.find((entry) => entry.id === id);
  if (!article) return;
  openModal(`
    <div class="article-banner">
      <div><span class="tag">${esc(article.category)}</span><div class="article-banner-title">${esc(article.category)}</div></div>
      <img src="assets/crest.svg" alt="">
    </div>
    <h2>${esc(article.title)}</h2>
    <div class="modal-meta"><span>${formatDate(article.date)}</span><span>·</span><span>${esc(state.club.name)}</span></div>
    ${(article.body || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
    <div style="display:flex;gap:8px;margin-top:24px;flex-wrap:wrap"><a class="btn small dark" href="#/news" data-action="close-modal">All club news</a><a class="btn small ghost" href="#/posters" data-action="close-modal">Make a poster</a></div>`, "slim");
}

function openFixtureModal(id) {
  const fixture = state.fixtures.find((entry) => entry.id === id);
  if (!fixture) return;
  const finished = fixture.status === "finished";
  const teams = fixtureTeams(fixture);
  const shownScore = fixture.home
    ? `${fixture.homeScore}–${fixture.awayScore}`
    : `${fixture.awayScore}–${fixture.homeScore}`;
  openModal(`
    <span class="tag">${esc(fixture.competition)}</span>
    <h2 style="margin-top:10px">${esc(teams.home)} <span style="color:#b9b2a7">vs</span> ${esc(teams.away)}</h2>
    <div class="modal-meta"><span>${formatLongDate(fixture.date)}</span><span>·</span><span>${time24(fixture.date)} EAT</span><span>·</span><span>${esc(fixture.venue)}</span></div>
    ${finished ? `
      <div class="fixture-detail-score"><span>${esc(shownScore)}</span><small>${resultLetter(fixture) === "W" ? "Makongi win" : resultLetter(fixture) === "D" ? "Draw" : "Makongi defeat"}</small></div>
      <p><b>Goalscorers:</b> ${esc(fixture.scorers || "Not recorded")}</p>
    ` : `<p>Kick-off is at ${time24(fixture.date)} EAT at ${esc(fixture.venue)}. The matchday squad and lineup will be published here.</p>`}
    ${fixture.note ? `<p>${esc(fixture.note)}</p>` : ""}
    <div style="display:flex;gap:8px;margin-top:22px;flex-wrap:wrap"><a class="btn small" href="#/fixtures" data-action="close-modal">All fixtures</a><a class="btn small ghost" href="#/posters" data-action="close-modal">Matchday poster</a></div>`, "slim");
}

/* ---------- Admin forms ---------- */

function field(label, name, value, type = "text", extra = "") {
  return `<div><label for="form-${name}">${label}</label><input id="form-${name}" name="${name}" type="${type}" value="${esc(value ?? "")}" ${extra}></div>`;
}

function openPlayerForm(id) {
  const player = id ? playerById(id) : null;
  const newId = !player;
  openModal(`
    <h2>${newId ? "Register a player" : "Edit player"}</h2>
    <p style="color:#6d6a65;margin:6px 0 18px">${newId ? "Add a new member of the Makongi FC squad." : "Update the player profile, portrait and season numbers."}</p>
    <form id="admin-player-form" data-id="${esc(id || "")}">
      <div class="admin-form-grid">
        <div class="full"><label for="photo-input">Player photo</label>
          <div style="display:flex;gap:14px;align-items:center">
            <img id="photo-preview" src="${player ? portraitSrc(player) : avatarDataUri({ id: "new", name: "New Player", number: 0 })}" alt="" style="width:64px;height:76px;object-fit:cover;border:1px solid var(--line)">
            <div style="flex:1"><input id="photo-input" name="photo" type="file" accept="image/*"><div style="font-size:10px;color:#8b867e;margin-top:4px">JPG, PNG or WebP. Compressed automatically.</div>${player && player.photo ? '<label style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:10px;color:#6d6a65"><input type="checkbox" name="removePhoto" style="width:auto"> Remove current photo</label>' : ""}</div>
          </div>
        </div>
        <div><label for="form-name">Full name</label><input id="form-name" name="name" value="${esc(player?.name || "")}" required></div>
        ${field("Jersey number", "number", player?.number ?? "", "number", "min=1 max=99 required")}
        <div><label for="form-position">Position</label><select id="form-position" name="position">${POSITIONS.map((code) => `<option value="${code}" ${player?.position === code ? "selected" : ""}>${code} · ${positionName(code)}</option>`).join("")}</select></div>
        ${field("Age", "age", player?.age ?? 24, "number", "min=15 max=45")}
        ${field("Nationality", "nationality", player?.nationality ?? "Tanzania")}
        ${field("Height", "height", player?.height ?? "1.80 m")}
        <div><label for="form-foot">Strong foot</label><select id="form-foot" name="foot"><option ${player?.foot === "Right" ? "selected" : ""}>Right</option><option ${player?.foot === "Left" ? "selected" : ""}>Left</option><option ${player?.foot === "Both" ? "selected" : ""}>Both</option></select></div>
        ${field("Appearances", "appearances", player?.appearances ?? 0, "number", "min=0")}
        ${field("Goals", "goals", player?.goals ?? 0, "number", "min=0")}
        ${field("Assists", "assists", player?.assists ?? 0, "number", "min=0")}
        ${field("Clean sheets", "cleanSheets", player?.cleanSheets ?? 0, "number", "min=0")}
        ${field("Yellow cards", "yellow", player?.yellow ?? 0, "number", "min=0")}
        ${field("Red cards", "red", player?.red ?? 0, "number", "min=0")}
        <div class="full"><label for="form-bio">Player profile</label><textarea id="form-bio" name="bio">${esc(player?.bio || "")}</textarea></div>
      </div>
      <div class="admin-actions"><button class="btn small ghost" type="button" data-action="close-modal">Cancel</button><button class="btn small" type="submit">${newId ? "Add player" : "Save changes"}</button></div>
    </form>`, "wide");
  const photoInput = $("#photo-input");
  photoInput?.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;
    const preview = $("#photo-preview");
    const reader = new FileReader();
    reader.onload = () => { preview.src = reader.result; };
    reader.readAsDataURL(file);
  });
  $("#admin-player-form")?.addEventListener("submit", savePlayerForm);
}

async function savePlayerForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    const data = new FormData(form);
    const id = form.dataset.id || `p_${Date.now()}`;
    const existing = form.dataset.id ? playerById(form.dataset.id) : null;
    let photo = existing?.photo || "";
    const file = data.get("photo");
    if (file && file.size > 0) photo = await compressImage(file);
    if (data.get("removePhoto")) photo = "";
    const player = {
      id,
      name: String(data.get("name") || "").trim(),
      number: Number(data.get("number")),
      position: String(data.get("position")),
      foot: String(data.get("foot")),
      age: Number(data.get("age")),
      nationality: String(data.get("nationality") || "").trim() || "Tanzania",
      height: String(data.get("height") || "").trim() || "1.80 m",
      appearances: Number(data.get("appearances")) || 0,
      goals: Number(data.get("goals")) || 0,
      assists: Number(data.get("assists")) || 0,
      cleanSheets: Number(data.get("cleanSheets")) || 0,
      yellow: Number(data.get("yellow")) || 0,
      red: Number(data.get("red")) || 0,
      bio: String(data.get("bio") || "").trim(),
      photo
    };
    if (!player.name || !player.number) throw new Error("A name and jersey number are required.");
    if (state.players.some((entry) => entry.number === player.number && entry.id !== id)) {
      throw new Error(`Jersey number ${player.number} is already taken.`);
    }
    if (existing) {
      state.players = state.players.map((entry) => entry.id === id ? player : entry);
    } else {
      state.players.push(player);
    }
    saveState();
    closeModal();
    render({ scroll: false });
    toast("Squad updated", `${player.name} is now in the Makongi FC squad.`);
  } catch (error) {
    toast("Could not save player", error.message || "Check the form and try again.");
  } finally {
    if (submit) submit.disabled = false;
  }
}

function openFixtureForm(id) {
  const fixture = id ? state.fixtures.find((entry) => entry.id === id) : null;
  const newId = !fixture;
  const localDate = fixture ? fixture.date.slice(0, 16) : "2026-11-02T16:00";
  openModal(`
    <h2>${newId ? "Add a fixture" : "Edit fixture"}</h2>
    <p style="color:#6d6a65;margin:6px 0 18px">Publish the next match or update a final score. Times are East Africa Time.</p>
    <form id="admin-fixture-form" data-id="${esc(id || "")}">
      <div class="admin-form-grid">
        <div><label for="form-opponent">Opponent</label><input id="form-opponent" name="opponent" value="${esc(fixture?.opponent || "")}" required></div>
        ${field("Short code", "opponentShort", fixture?.opponentShort || "", "text", "maxlength=4")}
        ${field("Competition", "competition", fixture?.competition || state.club.league)}
        ${field("Venue", "venue", fixture?.venue || state.club.stadium)}
        <div><label for="form-date">Kick-off</label><input id="form-date" name="date" type="datetime-local" value="${esc(localDate)}" required></div>
        <div><label for="form-home">Home or away</label><select id="form-home" name="home"><option value="true" ${fixture?.home !== false ? "selected" : ""}>Home</option><option value="false" ${fixture?.home === false ? "selected" : ""}>Away</option></select></div>
        <div><label for="form-status">Status</label><select id="form-status" name="status"><option value="upcoming" ${fixture?.status !== "finished" ? "selected" : ""}>Upcoming</option><option value="finished" ${fixture?.status === "finished" ? "selected" : ""}>Finished</option></select></div>
        ${field("Home score", "homeScore", fixture?.homeScore ?? "", "number", "min=0")}
        ${field("Away score", "awayScore", fixture?.awayScore ?? "", "number", "min=0")}
        <div class="full">${field("Goalscorers", "scorers", fixture?.scorers || "")}</div>
        <div class="full">${field("Match note", "note", fixture?.note || "")}</div>
      </div>
      <div class="admin-actions"><button class="btn small ghost" type="button" data-action="close-modal">Cancel</button><button class="btn small" type="submit">${newId ? "Add fixture" : "Save fixture"}</button></div>
    </form>`, "wide");
  $("#admin-fixture-form")?.addEventListener("submit", saveFixtureForm);
}

function saveFixtureForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const id = form.dataset.id || `f_${Date.now()}`;
  const rawDate = String(data.get("date") || "");
  const date = rawDate.length === 16 ? `${rawDate}:00+03:00` : rawDate;
  const status = String(data.get("status"));
  const fixture = {
    id,
    opponent: String(data.get("opponent") || "").trim(),
    opponentShort: String(data.get("opponentShort") || "").trim() || String(data.get("opponent") || "").slice(0, 3).toUpperCase(),
    competition: String(data.get("competition") || "").trim() || state.club.league,
    venue: String(data.get("venue") || "").trim() || state.club.stadium,
    home: String(data.get("home")) === "true",
    date,
    status,
    homeScore: status === "finished" ? Number(data.get("homeScore")) : null,
    awayScore: status === "finished" ? Number(data.get("awayScore")) : null,
    scorers: String(data.get("scorers") || "").trim(),
    note: String(data.get("note") || "").trim()
  };
  if (!fixture.opponent) {
    toast("Could not save fixture", "Add the opponent name.");
    return;
  }
  if (status === "finished" && (!Number.isFinite(fixture.homeScore) || !Number.isFinite(fixture.awayScore))) {
    toast("Could not save fixture", "A finished match needs both scores.");
    return;
  }
  const exists = state.fixtures.some((entry) => entry.id === id);
  state.fixtures = exists ? state.fixtures.map((entry) => entry.id === id ? fixture : entry) : [...state.fixtures, fixture];
  saveState();
  closeModal();
  render({ scroll: false });
  toast("Fixture saved", `${fixture.opponent} · ${formatDate(fixture.date)}`);
}

function openNewsForm(id) {
  const article = id ? state.news.find((entry) => entry.id === id) : null;
  const newId = !article;
  openModal(`
    <h2>${newId ? "Publish an article" : "Edit article"}</h2>
    <p style="color:#6d6a65;margin:6px 0 18px">Write in plain English. Leave a blank line between paragraphs.</p>
    <form id="admin-news-form" data-id="${esc(id || "")}">
      <div class="admin-form-grid">
        <div class="full"><label for="form-title">Headline</label><input id="form-title" name="title" value="${esc(article?.title || "")}" required></div>
        <div><label for="form-category">Category</label><input id="form-category" name="category" value="${esc(article?.category || "Club News")}" list="news-categories" required><datalist id="news-categories"><option>Match Report</option><option>Club News</option><option>Awards</option><option>Academy</option><option>Community</option><option>Tickets</option></datalist></div>
        <div><label for="form-news-date">Date</label><input id="form-news-date" name="date" type="date" value="${esc(article?.date || new Date().toISOString().slice(0, 10))}" required></div>
        <div class="full"><label for="form-excerpt">Short summary</label><textarea id="form-excerpt" name="excerpt" style="min-height:60px" required>${esc(article?.excerpt || "")}</textarea></div>
        <div class="full"><label for="form-body">Article body</label><textarea id="form-body" name="body" style="min-height:180px" required>${esc((article?.body || []).join("\n\n"))}</textarea></div>
        <div class="full"><label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:12px;color:#4d4a45"><input type="checkbox" name="featured" style="width:auto" ${article?.featured ? "checked" : ""}> Feature this story on the home page</label></div>
      </div>
      <div class="admin-actions"><button class="btn small ghost" type="button" data-action="close-modal">Cancel</button><button class="btn small" type="submit">${newId ? "Publish article" : "Save changes"}</button></div>
    </form>`, "wide");
  $("#admin-news-form")?.addEventListener("submit", saveNewsForm);
}

function saveNewsForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const id = form.dataset.id || `n_${Date.now()}`;
  const body = String(data.get("body") || "").split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  if (!body.length) {
    toast("Could not publish", "Add at least one paragraph to the article.");
    return;
  }
  const article = {
    id,
    title: String(data.get("title") || "").trim(),
    category: String(data.get("category") || "Club News").trim(),
    date: String(data.get("date")),
    excerpt: String(data.get("excerpt") || "").trim(),
    featured: Boolean(data.get("featured")),
    body
  };
  if (!article.title || !article.excerpt) {
    toast("Could not publish", "A headline and short summary are required.");
    return;
  }
  if (article.featured) {
    state.news = state.news.map((entry) => ({ ...entry, featured: false }));
  }
  const exists = state.news.some((entry) => entry.id === id);
  state.news = exists ? state.news.map((entry) => entry.id === id ? article : entry) : [article, ...state.news];
  saveState();
  closeModal();
  render({ scroll: false });
  toast("Article saved", "The story is live on the club news page.");
}

function deletePlayer(id) {
  const player = playerById(id);
  if (!player) return;
  if (!window.confirm(`Remove ${player.name} from the squad?`)) return;
  state.players = state.players.filter((entry) => entry.id !== id);
  Object.values(state.lineups).forEach((lineup) => {
    Object.keys(lineup.slots || {}).forEach((key) => { if (lineup.slots[key] === id) lineup.slots[key] = ""; });
    lineup.bench = (lineup.bench || []).filter((entry) => entry !== id);
  });
  saveState();
  render({ scroll: false });
  toast("Player removed", `${player.name} is no longer in the squad.`);
}

function deleteFixture(id) {
  const fixture = state.fixtures.find((entry) => entry.id === id);
  if (!fixture) return;
  if (!window.confirm(`Delete the fixture against ${fixture.opponent}?`)) return;
  state.fixtures = state.fixtures.filter((entry) => entry.id !== id);
  saveState();
  render({ scroll: false });
  toast("Fixture removed", "The match has been deleted.");
}

function deleteNews(id) {
  const article = state.news.find((entry) => entry.id === id);
  if (!article) return;
  if (!window.confirm(`Delete “${article.title}”?`)) return;
  state.news = state.news.filter((entry) => entry.id !== id);
  saveState();
  render({ scroll: false });
  toast("Article removed", "The story has been deleted.");
}

/* ---------- Admin bindings ---------- */

function bindAdminEvents() {
  const loginForm = $("#admin-login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  const search = $("#admin-player-search");
  if (search) {
    search.addEventListener("input", () => {
      const term = search.value.trim().toLowerCase();
      $$("#admin-player-rows tr").forEach((row) => {
        row.style.display = row.dataset.search.includes(term) ? "" : "none";
      });
    });
  }
  const formationSelect = $("#lineup-formation");
  if (formationSelect) {
    formationSelect.addEventListener("change", () => {
      ui.adminFormation = formationSelect.value;
      render({ scroll: false });
    });
  }
  $("#admin-lineup-form")?.addEventListener("submit", saveLineupForm);
  $("#admin-club-form")?.addEventListener("submit", saveClubForm);
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = $("#login-error");
  if (ui.lockUntil > Date.now()) {
    errorBox.textContent = "Too many attempts. Try again in 30 seconds.";
    return;
  }
  const email = String(new FormData(form).get("email") || "").trim().toLowerCase();
  const password = String(new FormData(form).get("password") || "");
  if (errorBox) errorBox.textContent = "Checking credentials...";
  try {
    const hash = await sha256(password);
    if (email === ADMIN_EMAIL && hash === ADMIN_HASH) {
      setSession();
      ui.loginAttempts = 0;
      ui.lockUntil = 0;
      ui.adminTab = "overview";
      render({ scroll: false });
      toast("Welcome back", "You are signed in to the Makongi FC control room.");
      return;
    }
    ui.loginAttempts += 1;
    if (ui.loginAttempts >= 5) {
      ui.lockUntil = Date.now() + 30000;
      ui.loginAttempts = 0;
      render({ scroll: false });
      toast("Sign-in locked", "Five failed attempts. Try again in 30 seconds.");
      return;
    }
    if (errorBox) errorBox.textContent = `Those credentials do not match. ${5 - ui.loginAttempts} attempts remaining.`;
  } catch (error) {
    if (errorBox) errorBox.textContent = error.message;
  }
}

function saveLineupForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formation = ui.adminFormation;
  const slots = {};
  FORMATIONS[formation].slots.forEach((slot) => {
    slots[slot.key] = form.querySelector(`[data-slot="${slot.key}"]`)?.value || "";
  });
  const ids = Object.values(slots).filter(Boolean);
  if (new Set(ids).size !== ids.length) {
    toast("Could not save lineup", "The same player is selected in more than one position.");
    return;
  }
  if (ids.length !== FORMATIONS[formation].slots.length) {
    toast("Could not save lineup", "Fill all 11 starting positions first.");
    return;
  }
  const bench = [...form.querySelectorAll('input[name="bench"]:checked')].map((input) => input.value).filter((id) => !ids.includes(id));
  state.lineups[formation] = { slots, bench };
  state.formation = formation;
  ui.formationPreview = formation;
  saveState();
  render({ scroll: false });
  toast("Lineup saved", `The ${formation} starting XI and bench are live.`);
}

function saveClubForm(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.club = {
    ...state.club,
    name: String(data.get("name") || "").trim() || state.club.name,
    slogan: String(data.get("slogan") || "").trim() || state.club.slogan,
    founded: Number(data.get("founded")) || state.club.founded,
    stadium: String(data.get("stadium") || "").trim() || state.club.stadium,
    city: String(data.get("city") || "").trim() || state.club.city,
    country: String(data.get("country") || "").trim() || state.club.country,
    league: String(data.get("league") || "").trim() || state.club.league,
    capacity: Number(data.get("capacity")) || state.club.capacity,
    coach: String(data.get("coach") || "").trim() || state.club.coach,
    captain: String(data.get("captain") || "").trim() || state.club.captain,
    email: String(data.get("email") || "").trim() || state.club.email,
    phone: String(data.get("phone") || "").trim() || state.club.phone,
    address: String(data.get("address") || "").trim() || state.club.address
  };
  saveState();
  render({ scroll: false });
  toast("Club info saved", "The header, footer and posters now use the updated details.");
}

function autoFillLineup() {
  const form = $("#admin-lineup-form");
  if (!form) return;
  const formation = FORMATIONS[ui.adminFormation];
  const used = new Set();
  const pick = (short) => {
    const exact = {
      GK: ["GK"], RB: ["RB"], RWB: ["RB"], CB: ["CB"], LB: ["LB"], LWB: ["LB"],
      CDM: ["CDM"], CM: ["CM"], CAM: ["CAM"], RW: ["RW"], LW: ["LW"], ST: ["ST"]
    }[short] || [short];
    const pool = state.players.filter((player) => !used.has(player.id)).sort((a, b) => {
      const score = (player) => {
        const pos = exact.includes(player.position) ? 60 : positionGroup(player.position) === positionGroup(exact[0]) ? 25 : 0;
        return pos + Number(player.appearances) * 2 + Number(player.goals) * 3 + Number(player.assists) * 2;
      };
      return score(b) - score(a);
    });
    const choice = pool[0];
    if (choice) used.add(choice.id);
    return choice;
  };
  formation.slots.forEach((slot) => {
    const player = pick(slot.short);
    const select = form.querySelector(`[data-slot="${slot.key}"]`);
    if (select) select.value = player ? player.id : "";
  });
  const benchPool = state.players.filter((player) => !used.has(player.id)).sort((a, b) => Number(b.appearances) - Number(a.appearances)).slice(0, 7);
  const benchIds = new Set(benchPool.map((player) => player.id));
  $$('input[name="bench"]', form).forEach((input) => { input.checked = benchIds.has(input.value); });
  toast("Best XI selected", "Review the picks, then save the lineup.");
}

/* ---------- Actions ---------- */

document.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const action = actionElement.dataset.action;
  if (action === "close-modal" && actionElement.classList.contains("modal-backdrop") && event.target !== actionElement) return;
  if (action !== "view-site") event.preventDefault();

  switch (action) {
    case "close-modal": {
      const href = actionElement.getAttribute("href");
      closeModal();
      if (href) location.hash = href;
      break;
    }
    case "toggle-menu": {
      const nav = $("#mobile-nav");
      const open = nav.classList.toggle("open");
      $("#menu-toggle").setAttribute("aria-expanded", String(open));
      break;
    }
    case "filter-squad":
      ui.squadFilter = actionElement.dataset.filter;
      render({ scroll: false });
      break;
    case "open-player":
      openPlayerModal(actionElement.dataset.id);
      break;
    case "formation":
      ui.formationPreview = actionElement.dataset.formation;
      render({ scroll: false });
      break;
    case "fixture-tab":
      ui.fixtureTab = actionElement.dataset.tab;
      render({ scroll: false });
      break;
    case "stats-sort": {
      const key = actionElement.dataset.key;
      ui.statsSort = { key, direction: ui.statsSort.key === key && ui.statsSort.direction === "desc" ? "asc" : "desc" };
      render({ scroll: false });
      break;
    }
    case "news-filter":
      ui.newsFilter = actionElement.dataset.filter;
      render({ scroll: false });
      break;
    case "poster-mode":
      ui.posterMode = actionElement.dataset.mode;
      render({ scroll: false });
      break;
    case "poster-theme":
      ui.posterData[ui.posterMode].theme = actionElement.dataset.theme;
      render({ scroll: false });
      break;
    case "download-poster":
      downloadPoster();
      break;
    case "copy-poster":
      copyPosterCaption();
      break;
    case "open-article":
      openArticleModal(actionElement.dataset.id);
      break;
    case "open-fixture":
      openFixtureModal(actionElement.dataset.id);
      break;
    case "admin-tab":
      ui.adminTab = actionElement.dataset.tab;
      render({ scroll: false });
      break;
    case "admin-logout":
      clearSession();
      ui.adminTab = "overview";
      render();
      toast("Signed out", "The dashboard is locked again.");
      break;
    case "view-site":
      location.hash = "#/";
      break;
    case "fill-demo":
      $("#admin-email").value = ADMIN_EMAIL;
      $("#admin-password").value = "Makongi2026!";
      $("#admin-password").focus();
      break;
    case "reset-demo":
      if (!window.confirm("Reset all demo changes and return to the seeded club data?")) return;
      try { localStorage.removeItem(STORE_KEY); } catch { /* no-op */ }
      state = clone(SEED);
      ui.formationPreview = state.formation;
      ui.adminFormation = state.formation;
      ui.posterData = freshPosterData();
      ui.squadFilter = "ALL";
      ui.fixtureTab = "upcoming";
      ui.newsFilter = "All";
      render();
      toast("Demo reset", "The seeded Makongi FC data is back.");
      break;
    case "add-player":
      openPlayerForm();
      break;
    case "edit-player":
      openPlayerForm(actionElement.dataset.id);
      break;
    case "delete-player":
      deletePlayer(actionElement.dataset.id);
      break;
    case "add-fixture":
      openFixtureForm();
      break;
    case "edit-fixture":
      openFixtureForm(actionElement.dataset.id);
      break;
    case "delete-fixture":
      deleteFixture(actionElement.dataset.id);
      break;
    case "add-news":
      openNewsForm();
      break;
    case "edit-news":
      openNewsForm(actionElement.dataset.id);
      break;
    case "delete-news":
      deleteNews(actionElement.dataset.id);
      break;
    case "auto-lineup":
      autoFillLineup();
      break;
    case "admin-lineup-link":
      ui.adminTab = "lineup";
      location.hash = "#/admin";
      break;
    default:
      break;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    const nav = $("#mobile-nav");
    if (nav?.classList.contains("open")) {
      nav.classList.remove("open");
      $("#menu-toggle")?.setAttribute("aria-expanded", "false");
    }
  }
});

window.addEventListener("hashchange", () => {
  const nav = $("#mobile-nav");
  if (nav?.classList.contains("open")) {
    nav.classList.remove("open");
    $("#menu-toggle")?.setAttribute("aria-expanded", "false");
  }
  render();
});

function toast(title, message) {
  const element = document.createElement("div");
  element.className = "toast";
  element.innerHTML = `<strong>${esc(title)}</strong>${esc(message)}`;
  toastStack.appendChild(element);
  setTimeout(() => {
    element.style.opacity = "0";
    element.style.transform = "translateY(8px)";
    element.style.transition = "opacity .25s ease, transform .25s ease";
    setTimeout(() => element.remove(), 260);
  }, 4200);
}

render();

// Small debug/testing handle. The demo data is already client-side, so this exposes
// nothing the browser does not already hold.
window.__MFC_APP__ = {
  ui,
  render,
  get state() { return state; }
};
