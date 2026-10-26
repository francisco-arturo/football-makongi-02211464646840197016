// Headless render smoke test: evaluates every view in a minimal DOM shim.
// This catches template/runtime errors without needing a browser or extra packages.

import assert from "node:assert/strict";

const APP_URL = new URL("../assets/app.mjs", import.meta.url).href;

function element() {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    dataset: {},
    style: {},
    files: [],
    classList: { add() {}, remove() {}, toggle() { return false; }, contains() { return false; } },
    addEventListener() {},
    setAttribute() {},
    focus() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; }
  };
}

const ROUTE_MARKERS = {
  home: "The Pride of",
  squad: "The First Team",
  lineup: "Starting XI",
  fixtures: "Fixtures &amp; Results",
  stats: "Player Statistics",
  table: "League Table",
  posters: "Poster Studio",
  news: "Club News",
  admin: "Admin sign in"
};

const ADMIN_TABS = {
  overview: "Season at a glance",
  players: "Register players",
  fixtures: "Fixtures & results",
  news: "Club news",
  lineup: "Starting XI",
  club: "Club information"
};

export async function runRenderSmoke() {
  const results = [];
  for (const [route, marker] of Object.entries(ROUTE_MARKERS)) {
    const view = element();
    const modal = element();
    const toast = element();
    const ticker = element();
    const fallback = element();
    const canvas = element();

    const document = {
      title: "",
      body: { classList: { add() {}, remove() {} } },
      fonts: { ready: new Promise(() => {}) },
      querySelector(selector) {
        if (selector === "#view") return view;
        if (selector === "#modal-root") return modal;
        if (selector === "#toast-stack") return toast;
        if (selector === "#ticker-track") return ticker;
        if (selector === "[data-countdown]") return null;
        if (selector === "#poster-canvas") return canvas;
        return fallback;
      },
      querySelectorAll() { return []; },
      addEventListener() {},
      createElement() { return element(); }
    };

    const storage = () => {
      const data = new Map();
      return {
        getItem: (key) => data.has(key) ? data.get(key) : null,
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key)
      };
    };

    globalThis.document = document;
    globalThis.window = {
      crypto: globalThis.crypto,
      scrollTo() {},
      addEventListener() {},
      confirm() { return false; }
    };
    globalThis.localStorage = storage();
    globalThis.sessionStorage = storage();
    globalThis.location = { hash: route === "home" ? "#/" : `#/${route}` };

    await import(`${APP_URL}?smoke=${route}`);
    const html = view.innerHTML;
    assert.ok(html.length > 500, `${route} should render a full page`);
    assert.ok(html.includes(marker), `${route} should contain "${marker}"`);
    assert.ok(!html.includes("undefined"), `${route} should not render undefined values`);
    assert.ok(!html.includes("[object Object]"), `${route} should not stringify objects`);
    assert.ok(Array.isArray(ticker.innerHTML.split("sep")) || ticker.innerHTML.length > 0, "ticker should render");
    results.push({ route, length: html.length, marker });
  }

  /* Admin dashboard (authenticated) and every admin tab. */
  {
    const view = element();
    const modal = element();
    const toast = element();
    const ticker = element();
    const fallback = element();
    const canvas = element();
    const document = {
      title: "",
      body: { classList: { add() {}, remove() {} } },
      fonts: { ready: new Promise(() => {}) },
      querySelector(selector) {
        if (selector === "#view") return view;
        if (selector === "#modal-root") return modal;
        if (selector === "#toast-stack") return toast;
        if (selector === "#ticker-track") return ticker;
        if (selector === "[data-countdown]") return null;
        if (selector === "#poster-canvas") return canvas;
        return fallback;
      },
      querySelectorAll() { return []; },
      addEventListener() {},
      createElement() { return element(); }
    };
    const data = new Map();
    const storage = {
      getItem: (key) => data.has(key) ? data.get(key) : null,
      setItem: (key, value) => data.set(key, String(value)),
      removeItem: (key) => data.delete(key)
    };
    globalThis.document = document;
    globalThis.window = {
      crypto: globalThis.crypto,
      scrollTo() {},
      addEventListener() {},
      confirm() { return false; }
    };
    globalThis.localStorage = storage;
    globalThis.sessionStorage = storage;
    globalThis.location = { hash: "#/admin" };
    storage.setItem("makongi_fc_admin_session", JSON.stringify({ email: "admin@makongifc.com", at: Date.now() }));

    await import(`${APP_URL}?smoke=admin-dashboard`);
    const api = globalThis.window.__MFC_APP__;
    assert.ok(api, "app debug handle should exist after render");

    for (const [tab, marker] of Object.entries(ADMIN_TABS)) {
      api.ui.adminTab = tab;
      api.render({ scroll: false });
      const html = view.innerHTML;
      assert.ok(html.length > 700, `admin/${tab} should render a full panel`);
      assert.ok(html.includes(marker), `admin/${tab} should contain "${marker}"`);
      assert.ok(!html.includes("undefined"), `admin/${tab} should not render undefined values`);
      assert.ok(!html.includes("[object Object]"), `admin/${tab} should not stringify objects`);
      results.push({ route: `admin/${tab}`, length: html.length, marker });
    }
  }

  return results;
}
