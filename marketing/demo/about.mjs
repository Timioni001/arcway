// Renders marketing/demo/summary/arcway-about.png: what Arcway is, who it's for, and how a sponsored quest pays.
//   node marketing/demo/about.mjs
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const font = (f) => `data:font/woff2;base64,${readFileSync(join(root, "node_modules/geist/dist/fonts", f)).toString("base64")}`;
const logo = readFileSync(join(root, "app/icon.svg"), "utf8");
const arcLogo = readFileSync(join(root, "public/brand/arc/arc-logo-light.svg"), "utf8").replace(/<\?xml[^>]*>/, "");
const studioMark = `<svg viewBox="0 0 24 24"><path d="M12 3 3.5 20h4.2L12 11.2 16.3 20h4.2L12 3Z" fill="currentColor"/></svg>`;

/** The same Lucide icons the app uses, as inline SVG. */
async function icon(name) {
  const { __iconData } = await import(pathToFileURL(join(root, `node_modules/lucide-react/dist/esm/icons/${name}.mjs`)).href);
  const inner = __iconData.node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const features = [
  { icon: await icon("compass"), title: "Explore", text: "Every Arc app by category, with the contracts each team publishes and how active they are on chain." },
  { icon: await icon("target"), title: "Quests", text: "17 quests in 4 tiers take you from holding USDC to using apps regularly. Each step is checked against your onchain activity." },
  { icon: await icon("hand-coins"), title: "Sponsored quests", text: "Apps and communities put USDC behind a quest. The contract pays everyone who completes it.", hot: true }
];
const flow = [
  { icon: await icon("hand-coins"), who: "Sponsor", text: "Escrows USDC: a reward per person, a number of people, an end date" },
  { icon: await icon("target"), who: "New user", text: "Completes the quest on a real Arc app" },
  { icon: await icon("id-card"), who: "Arcway", text: "Checks the activity and records the quest on their passport" },
  { icon: await icon("badge-check"), who: "Contract", text: "Checks the passport and pays the reward in USDC", live: true },
  { icon: await icon("wallet"), who: "Sponsor", text: "Gets back whatever nobody claimed when it ends" }
];
const users = await icon("users");
const rocket = await icon("rocket");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; src: url(${font("geist-sans/Geist-Variable.woff2")}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url(${font("geist-mono/GeistMono-Variable.woff2")}) format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1920px; height: 1080px; overflow: hidden; }
body { font-family: Geist, sans-serif; color: #F4FAFF; padding: 72px 96px; background:
  radial-gradient(1100px 650px at 88% 0%, rgba(61,145,190,.38), transparent 60%),
  radial-gradient(900px 600px at 0% 100%, rgba(36,100,165,.35), transparent 60%),
  linear-gradient(135deg, #07152a, #0b1f3a 55%, #10305a); }
header { display: flex; justify-content: space-between; align-items: center; }
.brand { display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 700; letter-spacing: -.02em; }
.brand svg { width: 56px; height: 56px; }
.live { display: inline-flex; align-items: center; gap: 12px; padding: 12px 22px; border-radius: 999px; font-size: 21px; font-weight: 600; background: rgba(52,211,153,.12); box-shadow: inset 0 0 0 1px rgba(52,211,153,.4); color: #a7f3d0; }
.live i { width: 11px; height: 11px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 6px rgba(52,211,153,.2); }
main { margin-top: 44px; display: grid; grid-template-columns: 1fr 640px; gap: 64px; }
h1 { font-size: 76px; line-height: 1.04; letter-spacing: -.04em; font-weight: 750; }
h1 em { display: block; margin-top: 8px; font-size: 52px; letter-spacing: -.03em; font-style: normal; color: #7cc4e8; }
.lead { margin-top: 20px; font-size: 26px; line-height: 1.42; color: #b9cfe2; max-width: 980px; }
.features { margin-top: 36px; display: grid; gap: 16px; }
.feature { display: grid; grid-template-columns: 64px 1fr; gap: 20px; align-items: center; padding: 20px 24px; border-radius: 22px; background: rgba(255,255,255,.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); }
.feature.hot { background: rgba(61,145,190,.14); box-shadow: inset 0 0 0 1px rgba(124,196,232,.4); }
.ico { width: 64px; height: 64px; border-radius: 18px; display: grid; place-items: center; background: linear-gradient(135deg, #1d4e89, #3D91BE); }
.ico svg { width: 32px; height: 32px; color: #fff; }
.feature h3 { font-size: 27px; letter-spacing: -.02em; display: flex; align-items: center; gap: 12px; }
.feature h3 span { font-family: GeistMono; font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #9fd3ee; padding: 4px 10px; border-radius: 999px; background: rgba(61,145,190,.25); font-weight: 500; }
.feature p { margin-top: 6px; font-size: 20px; line-height: 1.4; color: #c9dbea; }
aside { display: flex; flex-direction: column; height: 770px; padding: 30px 32px; border-radius: 28px; background: rgba(7,21,42,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.12), 0 30px 80px rgba(0,0,0,.3); }
aside h2 { font-family: GeistMono; font-size: 16px; letter-spacing: .14em; text-transform: uppercase; color: #9fd3ee; font-weight: 500; }
aside h3 { margin-top: 10px; font-size: 32px; letter-spacing: -.02em; }
ol { list-style: none; padding: 0; margin-top: 24px; display: grid; gap: 0; }
li { display: grid; grid-template-columns: 52px 1fr; gap: 18px; position: relative; padding-bottom: 16px; }
li:not(:last-child)::after { content: ""; position: absolute; left: 25px; top: 54px; bottom: 2px; width: 2px; background: linear-gradient(#3D91BE, rgba(61,145,190,.25)); }
.n { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; background: #0b1f3a; box-shadow: 0 0 0 2px #3D91BE; }
.n svg { width: 24px; height: 24px; color: #9fd3ee; }
li.live-step .n { box-shadow: 0 0 0 2px #34d399; } li.live-step .n svg { color: #6ee7b7; }
li b { display: block; font-family: GeistMono; font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #9fd3ee; font-weight: 500; margin-top: 2px; }
li.live-step b { color: #6ee7b7; }
li p { margin-top: 4px; font-size: 20px; line-height: 1.35; color: #e3eef7; }
.who { margin-top: 8px; display: grid; gap: 12px; }
.who div { display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px; border-radius: 18px; background: rgba(255,255,255,.04); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
.who svg { flex: none; width: 26px; height: 26px; color: #7cc4e8; margin-top: 2px; }
.who p { font-size: 19px; line-height: 1.38; color: #c9dbea; } .who p strong { color: #fff; font-weight: 650; }
footer { position: absolute; left: 96px; right: 96px; bottom: 52px; display: flex; justify-content: space-between; align-items: center; font-size: 21px; color: #9fb6cc; }
.links { display: flex; gap: 34px; align-items: center; }
.studio { display: inline-flex; align-items: center; gap: 10px; padding: 9px 18px 9px 10px; border-radius: 999px; font-size: 18px; font-weight: 650; color: #fff; background: linear-gradient(135deg, #1d4e89, #3D91BE); }
.studio svg { width: 24px; height: 24px; padding: 3px; border-radius: 7px; background: rgba(255,255,255,.18); }
.arc { display: flex; align-items: center; gap: 14px; letter-spacing: .08em; text-transform: uppercase; font-size: 18px; }
.arc svg { height: 28px; width: auto; }
</style></head><body>
<header><div class="brand">${logo}arcway</div><span class="live"><i></i>Live on Arc mainnet</span></header>
<main>
  <section>
    <h1>The front door to Arc.<em>Find apps. Take first steps. Get paid.</em></h1>
    <p class="lead">Arcway helps new people get started on Arc. It shows them which apps to try, walks them through real first steps, and lets apps pay them in USDC for doing it.</p>
    <div class="features">${features.map((f) => `
      <div class="feature${f.hot ? " hot" : ""}"><div class="ico">${f.icon}</div><div><h3>${f.title}${f.hot ? "<span>New</span>" : ""}</h3><p>${f.text}</p></div></div>`).join("")}
    </div>
</div>
  </section>
  <aside>
    <h2>How a sponsored quest pays</h2>
    <h3>No middleman between the sponsor and the user</h3>
    <ol>${flow.map((s) => `<li class="${s.live ? "live-step" : ""}"><span class="n">${s.icon}</span><div><b>${s.who}</b><p>${s.text}</p></div></li>`).join("")}</ol>
    <div class="who" style="margin-top:auto">
      <div>${users}<p><strong>For new users.</strong> A clear first step on Arc, and USDC for taking it.</p></div>
      <div>${rocket}<p><strong>For app teams.</strong> An onboarding budget that pays only for people who used the app.</p></div>
    </div>
  </aside>
</main>
<footer>
  <div class="links"><span>arcway.world</span><span class="studio">${studioMark} Built with Arc Studio</span><span>Timi Labs</span></div>
  <div class="arc">Built on ${arcLogo}</div>
</footer>
</body></html>`;

const browser = await chromium.launch({ executablePath: existsSync("/opt/pw-browsers/chromium-1243/chrome-linux64/chrome") ? "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" : undefined });
const tab = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await tab.setContent(html, { waitUntil: "load" });
await tab.evaluate(() => document.fonts.ready);
mkdirSync(join(here, "summary"), { recursive: true });
await tab.screenshot({ path: join(here, "summary/arcway-about.png") });
await browser.close();
console.log("summary/arcway-about.png");
