// Canvas poster studio: matchday and birthday artwork at 1080x1350.

import { loadImage, portraitSrc } from "./media.mjs";

const W = 1080;
const H = 1350;
const DISPLAY = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
const BODY = '"Inter", "Segoe UI", Arial, sans-serif';
const RED = "#e11d2e";
const BLACK = "#0a0a0c";
const PAPER = "#f4f1ea";

function monthShort(isoDate) {
  const date = new Date(`${isoDate || "2026-01-01"}T12:00:00+03:00`);
  return new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Africa/Dar_es_Salaam" })
    .format(date)
    .toUpperCase();
}

function weekdayLong(isoDate) {
  const date = new Date(`${isoDate || "2026-01-01"}T12:00:00+03:00`);
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Africa/Dar_es_Salaam" })
    .format(date)
    .toUpperCase();
}

function dayNumber(isoDate) {
  const date = new Date(`${isoDate || "2026-01-01"}T12:00:00+03:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "Africa/Dar_es_Salaam" }).format(date);
}

function yearNumber(isoDate) {
  const date = new Date(`${isoDate || "2026-01-01"}T12:00:00+03:00`);
  return new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Africa/Dar_es_Salaam" }).format(date);
}

function setFittedFont(ctx, text, maxWidth, startSize, weight = "800") {
  let size = startSize;
  while (size > 22) {
    ctx.font = `${weight} ${size}px ${DISPLAY}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

function drawTracked(ctx, text, x, y, tracking, align = "left") {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + tracking * Math.max(0, chars.length - 1);
  let cursor = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  ctx.save();
  ctx.textAlign = "left";
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[index] + tracking;
  });
  ctx.restore();
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((entry, index) => {
    ctx.fillText(entry, x, y + index * lineHeight);
  });
  return y + Math.min(lines.length, maxLines) * lineHeight;
}

function paintBackground(ctx, theme) {
  ctx.fillStyle = theme === "black" ? BLACK : RED;
  ctx.fillRect(0, 0, W, H);

  const radial = ctx.createRadialGradient(W * 0.82, H * 0.15, 20, W * 0.82, H * 0.15, 780);
  radial.addColorStop(0, theme === "black" ? "#e11d2e55" : "#ff6b76aa");
  radial.addColorStop(1, "transparent");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = theme === "black" ? 1 : 0.92;
  ctx.fillStyle = theme === "black" ? "#16161b" : BLACK;
  ctx.beginPath();
  if (theme === "black") {
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, 250);
    ctx.lineTo(0, 690);
  } else {
    ctx.moveTo(0, 0);
    ctx.lineTo(W * 0.64, 0);
    ctx.lineTo(0, 510);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  for (let x = -H; x < W + H; x += 76) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + H, H);
    ctx.stroke();
  }
  ctx.restore();

  const dotSeed = 17;
  ctx.save();
  for (let i = 0; i < 240; i += 1) {
    const x = ((Math.sin(i * 12.9898 + dotSeed) * 43758.5453) % 1 + 1) % 1 * W;
    const y = ((Math.sin(i * 78.233 + dotSeed) * 12543.213) % 1 + 1) % 1 * H;
    const radius = i % 5 === 0 ? 2.4 : 1.3;
    ctx.fillStyle = i % 7 === 0 ? "#ffffff26" : "#ffffff12";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = "#ffffff33";
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, W - 68, H - 68);
}

function drawCrest(ctx, image, x, y, width, alpha = 1) {
  if (!image) return;
  const height = (image.height / image.width) * width;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
}

function drawTopLine(ctx, crest, club, theme) {
  drawCrest(ctx, crest, 72, 66, 120);
  ctx.fillStyle = theme === "red" ? "#0a0a0c" : "#ffffff";
  ctx.font = `700 17px ${BODY}`;
  ctx.textAlign = "right";
  drawTracked(ctx, "THE PRIDE OF GREAT MAKONGI", 1008, 92, 2.4, "right");
  ctx.font = `700 14px ${BODY}`;
  ctx.fillStyle = theme === "red" ? "#5c0009" : "#8c877f";
  drawTracked(ctx, `EST. ${club.founded || 1998}  ·  ${String(club.country || "TANZANIA").toUpperCase()}`, 1008, 122, 2.2, "right");
  ctx.textAlign = "left";
}

function drawBottomBand(ctx, club, theme, caption) {
  ctx.fillStyle = theme === "red" ? BLACK : "#101014";
  ctx.fillRect(0, 1152, W, H - 1152);
  ctx.fillStyle = RED;
  ctx.fillRect(0, 1152, W, 10);

  ctx.fillStyle = "#ffffff";
  ctx.font = `800 30px ${DISPLAY}`;
  ctx.textAlign = "left";
  drawTracked(ctx, String(caption || "THE PRIDE OF GREAT MAKONGI FC").toUpperCase(), 72, 1232, 1.4);

  ctx.fillStyle = "#9a958d";
  ctx.font = `600 15px ${BODY}`;
  drawTracked(ctx, `${club.stadium || "MAKONGI GROUND"}  ·  ${club.email || "INFO@MAKONGIFC.COM"}`, 72, 1270, 1.2);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 15px ${BODY}`;
  ctx.textAlign = "right";
  drawTracked(ctx, String(club.instagram || "@MAKONGIFC").toUpperCase(), 1008, 1232, 1.8, "right");
  ctx.fillStyle = "#ff8b94";
  drawTracked(ctx, "MAKONGIFC.COM", 1008, 1270, 1.8, "right");
  ctx.textAlign = "left";
}

function drawMatchday(ctx, crest, club, data) {
  const theme = data.theme === "black" ? "black" : "red";
  paintBackground(ctx, theme);
  drawTopLine(ctx, crest, club, theme);

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.font = `800 190px ${DISPLAY}`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("MATCHDAY", W / 2, 438);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 23px ${BODY}`;
  drawTracked(ctx, String(data.competition || "NBC PREMIER LEAGUE").toUpperCase(), W / 2, 338, 5.4, "center");

  ctx.fillStyle = "#ffffff";
  setFittedFont(ctx, "MAKONGI FC", 900, 148);
  drawTracked(ctx, "MAKONGI FC", W / 2, 552, 1.5, "center");

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, 642, 47, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 31px ${DISPLAY}`;
  ctx.fillText("VS", W / 2, 654);

  setFittedFont(ctx, String(data.opponent || "SIMBA SC").toUpperCase(), 900, 112);
  drawTracked(ctx, String(data.opponent || "SIMBA SC").toUpperCase(), W / 2, 790, 0.6, "center");

  ctx.fillStyle = "rgba(255,255,255,.56)";
  ctx.font = `600 17px ${BODY}`;
  drawTracked(ctx, "NBC PREMIER LEAGUE  ·  MATCHDAY", W / 2, 830, 2.4, "center");

  ctx.fillStyle = PAPER;
  ctx.fillRect(72, 878, W - 144, 202);
  ctx.fillStyle = BLACK;
  ctx.textAlign = "left";
  ctx.font = `800 128px ${DISPLAY}`;
  ctx.fillText(dayNumber(data.date), 108, 1002);
  ctx.font = `700 25px ${DISPLAY}`;
  ctx.fillText(monthShort(data.date), 114, 1042);
  ctx.font = `600 15px ${BODY}`;
  ctx.fillStyle = "#6d6a65";
  drawTracked(ctx, yearNumber(data.date), 114, 1065, 1.4);

  ctx.fillStyle = "#c9c2b6";
  ctx.fillRect(290, 912, 1, 134);
  ctx.fillStyle = BLACK;
  ctx.font = `700 19px ${BODY}`;
  drawTracked(ctx, "KICK-OFF", 324, 946, 2.2);
  ctx.font = `800 58px ${DISPLAY}`;
  ctx.fillText(data.time || "16:00", 320, 1008);
  ctx.fillStyle = "#6d6a65";
  ctx.font = `600 15px ${BODY}`;
  drawTracked(ctx, weekdayLong(data.date), 324, 1042, 1.6);

  ctx.fillStyle = BLACK;
  ctx.font = `700 17px ${BODY}`;
  drawTracked(ctx, "VENUE", 664, 946, 2.2);
  ctx.fillStyle = "#141417";
  setFittedFont(ctx, String(data.venue || "MAKONGI GROUND").toUpperCase(), 320, 29, "700");
  drawWrapped(ctx, String(data.venue || "MAKONGI GROUND").toUpperCase(), 664, 991, 320, 34, 2);

  drawBottomBand(ctx, club, theme, data.tagline || "THE PRIDE OF GREAT MAKONGI FC");
}

function drawBirthday(ctx, crest, club, data, player, portrait) {
  const theme = data.theme === "black" ? "black" : "red";
  paintBackground(ctx, theme);
  drawTopLine(ctx, crest, club, theme);

  const confetti = ["#ffffff", "#ffd5d9", "#f0b429", "#ffffff"];
  ctx.save();
  for (let i = 0; i < 38; i += 1) {
    const x = ((Math.sin(i * 41.37) * 9371.1) % 1 + 1) % 1 * W;
    const y = 170 + ((Math.sin(i * 13.77) * 4137.7) % 1 + 1) % 1 * 760;
    ctx.translate(x, y);
    ctx.rotate((i * 27 * Math.PI) / 180);
    ctx.fillStyle = confetti[i % confetti.length];
    ctx.globalAlpha = 0.48;
    ctx.fillRect(0, 0, i % 3 === 0 ? 5 : 10, 3);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 35px ${BODY}`;
  drawTracked(ctx, "HAPPY BIRTHDAY", W / 2, 300, 9, "center");

  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, 584, 216, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#202027";
  ctx.fillRect(W / 2 - 216, 368, 432, 432);
  if (portrait) {
    const scale = Math.max(432 / portrait.width, 432 / portrait.height);
    const width = portrait.width * scale;
    const height = portrait.height * scale;
    ctx.drawImage(portrait, W / 2 - width / 2, 584 - height / 2, width, height);
  }
  ctx.restore();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(W / 2, 584, 221, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = RED;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(W / 2, 584, 236, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 20px ${BODY}`;
  drawTracked(ctx, `${String(player.position || "PLAYER").toUpperCase()}  ·  ${String(player.nationality || "TANZANIA").toUpperCase()}`, W / 2, 854, 3, "center");

  ctx.fillStyle = "#ffffff";
  setFittedFont(ctx, String(player.name || "MAKONGI PLAYER").toUpperCase(), 900, 106);
  drawTracked(ctx, String(player.name || "MAKONGI PLAYER").toUpperCase(), W / 2, 950, 0.5, "center");

  ctx.fillStyle = theme === "red" ? "#0a0a0c" : "#ff8b94";
  ctx.font = `800 31px ${BODY}`;
  const ageLine = data.age ? `TURNS ${String(data.age).toUpperCase()}` : "FROM ALL OF US AT MAKONGI FC";
  drawTracked(ctx, ageLine, W / 2, 1000, 4.4, "center");

  ctx.fillStyle = "#ffffff";
  ctx.font = `500 27px ${BODY}`;
  drawWrapped(
    ctx,
    data.message || `Wishing you a brilliant day from all of us at ${club.name || "Makongi FC"}.`,
    W / 2,
    1072,
    780,
    39,
    3
  );

  drawBottomBand(ctx, club, theme, `FROM ALL AT ${String(club.name || "MAKONGI FC").toUpperCase()}`);
}

export async function drawPoster(canvas, options) {
  const { mode, theme, data, player, club } = options;
  if (!canvas) return;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  let crest = null;
  let portrait = null;
  try {
    crest = await loadImage("assets/crest.svg");
  } catch {
    crest = null;
  }
  if (mode === "birthday" && player) {
    try {
      portrait = await loadImage(portraitSrc(player));
    } catch {
      portrait = null;
    }
  }

  if (mode === "birthday") {
    drawBirthday(ctx, crest, club, { ...data, theme }, player || {}, portrait);
  } else {
    drawMatchday(ctx, crest, club, { ...data, theme });
  }
}

export function posterCaption(options) {
  const { mode, data, player, club } = options;
  if (mode === "birthday") {
    return [
      `Happy birthday, ${player ? player.name : "Makongi family"}!`,
      data.age ? `${data.age} years of greatness.` : "",
      "From all of us at Makongi FC.",
      club.slogan,
      "#MakongiFC #ThePrideOfGreatMakongiFC"
    ].filter(Boolean).join("\n");
  }
  return [
    "MATCHDAY",
    `Makongi FC vs ${data.opponent || "our next opponent"}`,
    `${weekdayLong(data.date)} ${dayNumber(data.date)} ${monthShort(data.date)} ${yearNumber(data.date)} · ${data.time || "16:00"} · ${data.venue || "Makongi Ground"}`,
    club.slogan,
    "#MakongiFC #ThePrideOfGreatMakongiFC"
  ].join("\n");
}
