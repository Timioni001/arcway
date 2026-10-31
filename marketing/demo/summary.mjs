// Renders marketing/demo/summary/arcway-build-summary.png: how Arcway was built with Arc Studio, one image.
//   node marketing/demo/summary.mjs
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const b64 = (f) => readFileSync(f).toString("base64");
const font = (f) => `data:font/woff2;base64,${b64(join(root, "node_modules/geist/dist/fonts", f))}`;
const logo = readFileSync(join(root, "app/icon.svg"), "utf8");
const arcLogo = readFileSync(join(root, "public/brand/arc/arc-logo-light.svg"), "utf8").replace(/<\?xml[^>]*>/, "");
const studioMark = `<svg viewBox="0 0 24 24"><path d="M12 3 3.5 20h4.2L12 11.2 16.3 20h4.2L12 3Z" fill="currentColor"/></svg>`;

const steps = [
  { tag: "Arc Studio", studio: true, title: "Wrote the contract", lines: ["ArcwayBounties.sol and its deploy script", "Written inside our repo, against our interface"] },
  { tag: "Arc Studio", studio: true, title: "Tested and audited", lines: ["Ran the Foundry suite, 71 of 71 passing", "Reviewed all three Arcway contracts"] },
  { tag: "Arc Studio", studio: true, title: "Deployed to testnet", lines: ["Mock USDC, mock passport and the bounty contract", "A full rehearsal before real money"] },
  { tag: "Arc Studio", studio: true, title: "Built the sponsor tools", lines: ["The \"Your bounties\" panel", "Top up, and close and refund"] },
  { tag: "Timi Labs", title: "Reviewed and hardened", lines: ["Every finding checked, 3 bugs fixed", "46 tests, 128,000-call escrow invariant"] },
  { tag: "Arc mainnet", live: true, title: "Live with real USDC", lines: ["Sponsor escrowed 0.5 USDC for 5 people", "Contract paid 0.1 USDC on a claim"] }
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; src: url(${font("geist-sans/Geist-Variable.woff2")}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url(${font("geist-mono/GeistMono-Variable.woff2")}) format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1920px; height: 1080px; overflow: hidden; }
body { font-family: Geist, sans-serif; color: #F4FAFF; padding: 80px 96px; background:
  radial-gradient(1100px 650px at 88% 0%, rgba(61,145,190,.38), transparent 60%),
  radial-gradient(900px 600px at 0% 100%, rgba(36,100,165,.35), transparent 60%),
  linear-gradient(135deg, #07152a, #0b1f3a 55%, #10305a); }
header { display: flex; justify-content: space-between; align-items: flex-start; }
.brand { display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 700; letter-spacing: -.02em; }
.brand svg { width: 56px; height: 56px; }
.studio { display: inline-flex; align-items: center; gap: 12px; padding: 12px 22px 12px 14px; border-radius: 999px; font-size: 22px; font-weight: 650;
  background: linear-gradient(135deg, #1d4e89, #3D91BE); box-shadow: 0 0 0 1px rgba(255,255,255,.18), 0 10px 40px rgba(61,145,190,.35); }
.studio svg { width: 30px; height: 30px; padding: 4px; border-radius: 9px; background: rgba(255,255,255,.18); }
h1 { margin-top: 44px; font-size: 76px; line-height: 1.04; letter-spacing: -.04em; font-weight: 750; max-width: 1400px; }
h1 em { font-style: normal; color: #7cc4e8; }
.lead { margin-top: 22px; font-size: 28px; color: #b9cfe2; max-width: 1380px; line-height: 1.4; }
.flow { margin-top: 52px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 22px; position: relative; }
.flow::before { content: ""; position: absolute; left: 40px; right: 40px; top: 31px; height: 3px; background: linear-gradient(90deg, #3D91BE 0%, #3D91BE 62%, #9fd3ee 80%, #34d399 100%); opacity: .7; }
.step { position: relative; display: flex; flex-direction: column; }
.dot { position: relative; width: 64px; height: 64px; border-radius: 20px; display: grid; place-items: center; font-family: GeistMono; font-size: 24px; font-weight: 600;
  background: #0b1f3a; box-shadow: 0 0 0 3px #3D91BE, 0 0 0 10px rgba(61,145,190,.15); }
.step.studio-step .dot { background: linear-gradient(135deg, #1d4e89, #3D91BE); }
.step.live .dot { box-shadow: 0 0 0 3px #34d399, 0 0 0 10px rgba(52,211,153,.18); color: #34d399; }
.card { flex: 1; margin-top: 26px; padding: 24px 22px; border-radius: 22px; background: rgba(255,255,255,.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); }
.step.studio-step .card { background: rgba(61,145,190,.12); box-shadow: inset 0 0 0 1px rgba(124,196,232,.35); }
.step.live .card { background: rgba(52,211,153,.08); box-shadow: inset 0 0 0 1px rgba(52,211,153,.35); }
.tag { font-family: GeistMono; font-size: 15px; letter-spacing: .12em; text-transform: uppercase; color: #9fd3ee; display: flex; align-items: center; gap: 8px; }
.tag svg { width: 18px; height: 18px; }
.step.live .tag { color: #6ee7b7; }
.card h3 { margin-top: 14px; font-size: 27px; line-height: 1.15; letter-spacing: -.02em; font-weight: 700; }
.card p { margin-top: 12px; font-size: 19px; line-height: 1.4; color: #c9dbea; }
footer { position: absolute; left: 96px; right: 96px; bottom: 56px; display: flex; justify-content: space-between; align-items: center; font-size: 21px; color: #9fb6cc; }
footer .mono { font-family: GeistMono; color: #dbe8f3; }
footer .arc { display: flex; align-items: center; gap: 14px; letter-spacing: .08em; text-transform: uppercase; font-size: 18px; }
footer .arc svg { height: 28px; width: auto; }
.links { display: flex; gap: 34px; }
</style></head><body>
<header><div class="brand">${logo}arcway</div><span class="studio">${studioMark} Built with Arc Studio</span></header>
<h1>Sponsored quests on Arc,<br><em>built with Arc Studio.</em></h1>
<p class="lead">Apps put USDC behind real first steps on Arc. The ArcwayBounties contract pays each person who completes one. Arc Studio wrote, tested, audited and rehearsed it, then built the tools sponsors use.</p>
<section class="flow">${steps.map((s, i) => `
  <div class="step${s.studio ? " studio-step" : ""}${s.live ? " live" : ""}">
    <div class="dot">${s.live ? "✓" : i + 1}</div>
    <div class="card"><div class="tag">${s.studio ? studioMark : ""}${s.tag}</div><h3>${s.title}</h3>${s.lines.map((l) => `<p>${l}</p>`).join("")}</div>
  </div>`).join("")}
</section>
<footer>
  <div class="links"><span>arcway.world</span><span>ArcwayBounties <span class="mono">0xd73b…21cf</span></span><span>github.com/Timioni001/arcway</span></div>
  <div class="arc">Built on ${arcLogo}</div>
</footer>
</body></html>`;

const browser = await chromium.launch({ executablePath: existsSync("/opt/pw-browsers/chromium-1243/chrome-linux64/chrome") ? "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" : undefined });
const tab = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await tab.setContent(html, { waitUntil: "load" });
await tab.evaluate(() => document.fonts.ready);
mkdirSync(join(here, "summary"), { recursive: true });
await tab.screenshot({ path: join(here, "summary/arcway-build-summary.png") });
await browser.close();
console.log("summary/arcway-build-summary.png");
