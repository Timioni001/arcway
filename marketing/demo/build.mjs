// Builds the demo-video image pack (1920×1080 PNGs) into marketing/demo/.
//   node marketing/demo/build.mjs <uploads-dir> [--app]   --app also captures live arcway.world screens
// Studio and proof sources are the owner's tablet screenshots (1200×1920); crops drop browser chrome.
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const uploads = process.argv[2];
const dataUri = (file, type) => `data:${type};base64,${readFileSync(file).toString("base64")}`;
const font = (f) => dataUri(join(root, "node_modules/geist/dist/fonts", f), "font/woff2");
const logo = readFileSync(join(root, "app/icon.svg"), "utf8");
const arcLogo = readFileSync(join(root, "public/brand/arc/arc-logo-light.svg"), "utf8").replace(/<\?xml[^>]*>/, "");

const BASE = `
@font-face { font-family: Geist; src: url(${font("geist-sans/Geist-Variable.woff2")}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url(${font("geist-mono/GeistMono-Variable.woff2")}) format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1920px; height: 1080px; overflow: hidden; }
body { font-family: Geist, sans-serif; color: #F4FAFF; background:
  radial-gradient(1200px 700px at 85% 10%, rgba(61,145,190,.35), transparent 60%),
  radial-gradient(900px 600px at 0% 100%, rgba(36,100,165,.35), transparent 60%),
  linear-gradient(135deg, #07152a, #0b1f3a 55%, #10305a); }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%); }
.brand { position: absolute; left: 96px; bottom: 72px; display: flex; align-items: center; gap: 14px; font-weight: 650; font-size: 28px; letter-spacing: -.02em; }
.brand svg { width: 44px; height: 44px; }
.kicker { display: inline-flex; align-items: center; gap: 10px; font-family: GeistMono; font-size: 20px; letter-spacing: .14em; text-transform: uppercase; color: #9fd3ee; }
.kicker i { width: 10px; height: 10px; border-radius: 50%; background: #3D91BE; box-shadow: 0 0 0 6px rgba(61,145,190,.2); }
.mono { font-family: GeistMono; }
`;

const page = (body, extra = "") => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${extra}</style></head><body><div class="grid"></div>${body}</body></html>`;

/** Full-screen title card for a scene. */
function card({ kicker, title, sub, foot = true }) {
  return page(`
    <main><span class="kicker"><i></i>${kicker}</span><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</main>
    ${foot ? `<div class="brand">${logo}arcway</div><div class="arc">Built on ${arcLogo}</div>` : ""}`, `
    main { position: absolute; left: 160px; right: 160px; top: 50%; transform: translateY(-55%); }
    h1 { margin-top: 28px; font-size: 104px; line-height: 1.02; letter-spacing: -.045em; font-weight: 700; max-width: 1500px; }
    h1 em { font-style: normal; color: #7cc4e8; }
    p { margin-top: 32px; font-size: 36px; line-height: 1.35; color: #b9cfe2; max-width: 1300px; }
    .arc { position: absolute; right: 96px; bottom: 76px; display: flex; align-items: center; gap: 14px; font-size: 20px; color: #9fb6cc; letter-spacing: .08em; text-transform: uppercase; }
    .arc svg { height: 30px; width: auto; }`);
}

/** A cropped tablet screenshot in a frame, with a caption column on the left. */
function shot({ kicker, title, sub, src, top, bottom, points = [] }) {
  const h = bottom - top;
  const scale = Math.min(900 / h, 980 / 1200);
  const w = Math.round(1200 * scale), hh = Math.round(h * scale);
  return page(`
    <section class="copy"><span class="kicker"><i></i>${kicker}</span><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}
      ${points.length ? `<ul>${points.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}</section>
    <figure style="width:${w}px;height:${hh}px"><img src="${dataUri(src, "image/png")}" style="width:${w}px;top:${-Math.round(top * scale)}px"></figure>
    <div class="brand">${logo}arcway</div>`, `
    .copy { position: absolute; left: 96px; top: 50%; transform: translateY(-50%); width: ${1920 - w - 96 - 96 - 72}px; }
    h1 { margin-top: 24px; font-size: 64px; line-height: 1.05; letter-spacing: -.035em; font-weight: 700; }
    p { margin-top: 22px; font-size: 28px; line-height: 1.4; color: #b9cfe2; }
    ul { margin-top: 28px; padding: 0; list-style: none; display: grid; gap: 14px; }
    li { position: relative; padding-left: 30px; font-size: 24px; line-height: 1.35; color: #dbe8f3; }
    li::before { content: ""; position: absolute; left: 0; top: 11px; width: 12px; height: 12px; border-radius: 4px; background: #3D91BE; }
    figure { position: absolute; right: 96px; top: 50%; transform: translateY(-50%); overflow: hidden; border-radius: 28px;
      box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 40px 120px rgba(0,0,0,.55), 0 0 0 10px rgba(255,255,255,.04); }
    figure img { position: absolute; left: 0; }`);
}

/** Transparent lower third for an address or hash, laid over footage. */
function lowerThird({ label, value }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    html, body { background: transparent !important; } .grid { display: none; }
    .lt { position: absolute; left: 96px; bottom: 96px; display: grid; gap: 8px; padding: 22px 30px; border-radius: 20px; background: rgba(7,21,42,.86); box-shadow: 0 0 0 1px rgba(255,255,255,.14), 0 20px 60px rgba(0,0,0,.4); }
    .lt b { font-family: GeistMono; font-size: 18px; letter-spacing: .14em; text-transform: uppercase; color: #9fd3ee; font-weight: 500; }
    .lt span { font-family: GeistMono; font-size: 30px; color: #F4FAFF; }
  </style></head><body><div class="lt"><b>${label}</b><span>${value}</span></div></body></html>`;
}

const U = (id) => join(uploads, `${id}-image.png`);
const BOUNTIES = "0xd73b798a93497a0e45e2482ad07f7127f00521cf";
const SPONSOR_TX = "0xd0516b5fbec7016b9b9cf6907fd0c7f18e425e0637f0cb56aae1f500caf2cc6b";
const CLAIM_TX = "0x018309c1961b3f7b82f7479754a8b0fa1a61af6d8b075fff50d6aa7f848bc0a2";

const CARDS = {
  "cards/01-hook": { kicker: "Arc mainnet", title: "You just arrived on Arc.<br><em>What do you try first?</em>" },
  "cards/02-arcway": { kicker: "Arcway", title: "Find Arc apps.<br>Take <em>real first steps.</em>", sub: "17 quests in 4 tiers, each checked against your onchain activity." },
  "cards/03-sponsored": { kicker: "New · sponsored quests", title: "Put USDC behind<br>a <em>first step on Arc.</em>", sub: "The contract pays each person who completes it. Unclaimed USDC goes back to the sponsor." },
  "cards/04-mainnet": { kicker: "Live demo", title: "Arc mainnet.<br><em>Real USDC.</em>", sub: "Paid by the contract, with no one in between." },
  "cards/05-studio": { kicker: "Built with Arc Studio", title: "Written, tested, audited<br>and deployed <em>with Arc Studio.</em>" },
  "cards/06-why": { kicker: "Why it matters", title: "Apps pay for <em>real users.</em><br>New users get paid to <em>learn Arc.</em>" },
  "cards/07-close": { kicker: "arcway.world", title: "Find Arc. Try it.<br><em>Get paid.</em>", sub: "Built with Arc Studio · live on Arc mainnet" }
};

const SHOTS = {
  "studio/01-sponsor-tools-plan": { src: U("0a8d9a39"), top: 305, bottom: 1745, kicker: "Arc Studio", title: "Studio builds the sponsor tools", sub: "Working inside the Arcway repo, Studio reads the bounty code, plans five steps and writes the panel.", points: ["Reads Bounties.tsx, useBounties.ts and the sponsor page", "Plans the panel, export, styles, typecheck and push", "Writes the code into the existing component"] },
  "studio/02-merges-with-main": { src: U("a2a844a3"), top: 305, bottom: 1600, kicker: "Arc Studio", title: "Studio fits its change into the live app", sub: "Main had moved on, so Studio rewrote its version of the sponsor page to match before committing.", points: ["Diffs its branch against main", "Keeps main's new payout feed untouched", "Runs the project checks before pushing"] },
  "studio/03-pushed": { src: U("948f16a6"), top: 305, bottom: 1290, kicker: "Arc Studio", title: "Pushed to GitHub, ready to merge", sub: "Top up and close-and-refund for sponsors, on the arc-studio/sponsor-tools branch.", points: ["MyBounties panel with top up and close", "Styles added without touching other pages", "Reviewed and merged into main"] },
  "proof/01-sponsor-live": { src: U("cdb091df"), top: 262, bottom: 1430, kicker: "Arc mainnet", title: "A sponsor puts up 0.5 USDC", sub: "0.1 USDC each for 5 people, behind the quest \"Arrive on Arc\".", points: ["Escrowed in ArcwayBounties", "The bounty shows up under Live bounties", "Anyone who completed the quest can claim"] },
  "proof/02-claimed": { src: U("8b608216"), top: 215, bottom: 600, kicker: "Arc mainnet", title: "Claimed. 4 of 5 left.", sub: "The contract checked the quest record and paid 0.1 USDC to the wallet." },
  "proof/03-explorer-success": { src: U("66c4f1bc"), top: 380, bottom: 1900, kicker: "Arc explorer", title: "Success on Arc mainnet", sub: "The sponsor transaction, confirmed in under a second.", points: ["Interacted with ArcwayBounties 0xd73b…21Cf", "0.5 USDC moved into the contract", "Fee under 0.01 USDC"] }
};

const LOWER = {
  "overlays/contract-address": { label: "ArcwayBounties on Arc mainnet", value: BOUNTIES },
  "overlays/sponsor-tx": { label: "Sponsor transaction", value: SPONSOR_TX },
  "overlays/claim-tx": { label: "Claim transaction", value: CLAIM_TX },
  "overlays/studio-project": { label: "Arc Studio project", value: "studio.arc.io/app/3d0d866c-f38c-4a6a-9c6c-d7c1bbf8f9cf" }
};

const APP = [
  ["app/01-home", "/", null],
  ["app/02-explore", "/apps", null],
  ["app/03-quests-sponsored", "/quests", "#sponsored"],
  ["app/04-quests-paid-tag", "/quests", ".quest-card:has(.paid-tag)"],
  ["app/05-quest-detail", "/quests/arrive-with-usdc", null],
  ["app/06-sponsor", "/sponsor", null],
  ["app/07-sponsor-live", "/sponsor", "#live"],
  ["app/08-sponsor-payouts-studio", "/sponsor", ".bounty-feed, .studio-credit"]
];

const browser = await chromium.launch({ executablePath: existsSync("/opt/pw-browsers/chromium-1243/chrome-linux64/chrome") ? "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" : undefined });
const tab = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const render = async (name, html, transparent = false) => {
  mkdirSync(dirname(join(here, name)), { recursive: true });
  await tab.setContent(html, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: join(here, `${name}.png`), omitBackground: transparent });
  console.log(name);
};
for (const [n, c] of Object.entries(CARDS)) await render(n, card(c));
if (uploads) for (const [n, s] of Object.entries(SHOTS)) if (existsSync(s.src)) await render(n, shot(s));
for (const [n, l] of Object.entries(LOWER)) await render(n, lowerThird(l), true);

if (process.argv.includes("--app")) {
  for (const [name, path, focus] of APP) {
    await tab.goto(`https://arcway.world${path}`, { waitUntil: "load", timeout: 60000 });
    await tab.waitForTimeout(4000);
    if (focus) await tab.evaluate((sel) => { const el = document.querySelector(sel); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 140); }, focus);
    await tab.waitForTimeout(1200);
    mkdirSync(join(here, "app"), { recursive: true });
    await tab.screenshot({ path: join(here, `${name}.png`) });
    console.log(name);
  }
}
await browser.close();
