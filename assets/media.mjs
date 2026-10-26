// Portrait illustration, image loading and photo compression helpers.

const SKIN = ["#8d5524", "#a86b3c", "#c68642", "#6b3f1f", "#d9a066", "#7a4a26"];
const HAIR = ["#17120f", "#221912", "#0f0d0c", "#2c1d13"];
const BG = [
  ["#202027", "#0d0d10"],
  ["#2a1116", "#0d0d10"],
  ["#13261e", "#0d0d10"],
  ["#222018", "#0d0d10"],
  ["#1e1726", "#0d0d10"],
  ["#2b1c14", "#0d0d10"]
];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function playerInitials(name) {
  return String(name || "MFC")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function avatarDataUri(player) {
  const seed = hashString(player.id || player.name || "mfc");
  const skin = SKIN[seed % SKIN.length];
  const hair = HAIR[(seed >> 2) % HAIR.length];
  const [bg1, bg2] = BG[(seed >> 3) % BG.length];
  const hairStyle = seed % 3;
  const facialHair = (seed >> 5) % 3;
  const number = String(player.number || 0).padStart(2, "0");
  const safeNumber = number.replace(/[^0-9]/g, "");
  const collar = "#f4f1ea";
  const jersey = "#d8172a";
  const jerseyDark = "#8e0a16";

  const hairPaths = [
    `<path d="M201 309c-3-76 38-129 99-129s102 53 99 129c-12-47-44-72-99-72s-87 25-99 72Z" fill="${hair}"/>`,
    `<path d="M204 309c-5-84 41-133 96-133 57 0 102 49 96 133-14-31-23-53-48-64-19 23-76 29-107 12-16 9-28 26-37 52Z" fill="${hair}"/>`,
    `<path d="M206 306c-6-74 38-126 94-126 57 0 101 52 94 126-11-38-29-58-55-66-21 13-58 18-90 9-18 10-32 29-43 57Z" fill="${hair}"/>`
  ];

  const beard = facialHair === 1
    ? `<path d="M228 354c12 41 39 63 72 63s60-22 72-63c-8 58-35 87-72 87s-64-29-72-87Z" fill="${hair}" opacity=".72"/>`
    : facialHair === 2
      ? `<path d="M244 382c14 21 34 32 56 32s42-11 56-32c-4 34-25 53-56 53s-52-19-56-53Z" fill="${hair}" opacity=".8"/>`
      : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
      </linearGradient>
      <linearGradient id="kit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${jersey}"/><stop offset="1" stop-color="${jerseyDark}"/>
      </linearGradient>
      <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${skin}"/><stop offset="1" stop-color="${skin}" stop-opacity=".72"/>
      </linearGradient>
    </defs>
    <rect width="600" height="720" fill="url(#bg)"/>
    <path d="M0 560 600 320v400H0Z" fill="#ffffff" opacity=".025"/>
    <g opacity=".08" stroke="#ffffff" stroke-width="1">
      <path d="M0 80h600M0 160h600M0 240h600M0 320h600M0 400h600M0 480h600M0 560h600M0 640h600"/>
      <path d="M80 0v720M160 0v720M240 0v720M320 0v720M400 0v720M480 0v720M560 0v720"/>
    </g>
    <text x="535" y="585" text-anchor="end" fill="#ffffff" opacity=".055" font-family="Arial Narrow, Arial" font-weight="700" font-size="390">${safeNumber}</text>
    <ellipse cx="300" cy="710" rx="210" ry="32" fill="#000000" opacity=".35"/>
    <path d="M80 720c8-144 92-235 220-235s212 91 220 235Z" fill="url(#kit)"/>
    <path d="M224 492c23 24 49 36 76 36s53-12 76-36l28 28-44 200H240l-44-200Z" fill="#ffffff" opacity=".05"/>
    <path d="M240 466c18 34 37 50 60 50s42-16 60-50l16 10-18 58H242l-18-58Z" fill="${collar}"/>
    <path d="M257 472c9 19 25 30 43 30s34-11 43-30l-9-7c-9 14-20 21-34 21s-25-7-34-21Z" fill="#0a0a0c" opacity=".55"/>
    <path d="M255 410h90v86h-90Z" fill="${skin}"/>
    <path d="M255 410h90v28c-25 20-65 20-90 0Z" fill="#000" opacity=".12"/>
    <ellipse cx="202" cy="316" rx="17" ry="25" fill="${skin}"/>
    <ellipse cx="398" cy="316" rx="17" ry="25" fill="${skin}"/>
    <ellipse cx="300" cy="315" rx="98" ry="112" fill="url(#skin)"/>
    <path d="M215 292c4-58 37-91 85-91s81 33 85 91c-18-35-47-51-85-51s-67 16-85 51Z" fill="#000" opacity=".12"/>
    ${hairPaths[hairStyle]}
    <path d="M245 316c11-7 24-7 34 0" fill="none" stroke="#2a1b12" stroke-width="5" stroke-linecap="round"/>
    <path d="M321 316c11-7 24-7 34 0" fill="none" stroke="#2a1b12" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="263" cy="333" rx="10" ry="7" fill="#ffffff"/>
    <ellipse cx="337" cy="333" rx="10" ry="7" fill="#ffffff"/>
    <circle cx="265" cy="334" r="4.2" fill="#1c1510"/>
    <circle cx="335" cy="334" r="4.2" fill="#1c1510"/>
    <path d="M300 338v22c0 3 2 6 5 6" fill="none" stroke="#000" stroke-width="3" opacity=".25" stroke-linecap="round"/>
    <path d="M278 389c13 9 31 9 44 0" fill="none" stroke="#2a1511" stroke-width="4" opacity=".7" stroke-linecap="round"/>
    ${beard}
    <path d="M300 508v96" stroke="#000" stroke-width="1" opacity=".15"/>
    <g transform="translate(356 520)">
      <path d="M0 0h38v22c0 17-10 25-19 29C10 47 0 39 0 22Z" fill="#f4f1ea"/>
      <path d="M5 5h28v17c0 12-8 19-14 22-6-3-14-10-14-22Z" fill="${jersey}"/>
      <text x="19" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#fff">M</text>
    </g>
    <text x="300" y="585" text-anchor="middle" fill="#ffffff" opacity=".8" font-family="Arial" font-size="13" font-weight="700" letter-spacing="5">MAKONGI</text>
    <text x="300" y="614" text-anchor="middle" fill="#ffffff" opacity=".38" font-family="Arial" font-size="8" font-weight="700" letter-spacing="3">THE PRIDE OF GREAT MAKONGI</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function portraitSrc(player) {
  return player && player.photo ? player.photo : avatarDataUri(player || {});
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src.slice(0, 60)}`));
    image.src = src;
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file (JPG, PNG or WebP).");
  if (file.size > 8 * 1024 * 1024) throw new Error("That image is larger than 8 MB. Choose a smaller file.");
  const source = await fileToDataUrl(file);
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
