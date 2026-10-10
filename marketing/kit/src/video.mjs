// Renders the kit's videos frame by frame (deterministic, no dropped frames).
// Needs the app running locally in mainnet mode for the demo: see marketing/kit/README.md.
// Usage, from the repo root: node marketing/kit/src/video.mjs demo|teaser-square|teaser-vertical|teaser-land
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
const which = process.argv[2] || "demo";
const APP = process.env.APP_URL || "http://localhost:3100";
const SRC = new URL(".", import.meta.url).pathname;
const OUT = new URL("../video/", import.meta.url).pathname;
const FPS = 30;
const sizes = { demo: [1920, 1080], "teaser-square": [1080, 1080], "teaser-vertical": [1080, 1920], "teaser-land": [1920, 1080] };
const [W, H] = sizes[which];

const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${OUT}arcway-${which}.mp4`], { stdio: ["pipe", "inherit", "inherit"] });
let frames = 0;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "no-preference" });
const page = await ctx.newPage();
const shot = async () => { const buf = await page.screenshot({ type: "jpeg", quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r)); frames++; };
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const n = s => Math.round(s * FPS);

// Overlay: fade layer, caption and cursor, injected into whatever page is showing.
const overlay = async () => page.evaluate(() => {
  if (document.getElementById("kfx")) return;
  const st = document.createElement("style");
  st.textContent = `#kfx{position:fixed;inset:0;background:#EEF3F8;z-index:2147483646;pointer-events:none;opacity:0}
  #kcap{position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:2147483645;display:flex;align-items:center;gap:18px;padding:16px 28px 16px 16px;border-radius:22px;
   background:rgba(11,27,51,.92);color:#fff;font:600 26px/1.2 Geist,system-ui,sans-serif;letter-spacing:-.01em;box-shadow:0 30px 60px -20px rgba(11,27,51,.6);opacity:0;white-space:nowrap;backdrop-filter:blur(12px)}
  #kcap b{font:500 18px/1 "Geist Mono",ui-monospace,monospace;color:#0B1B33;background:#A9DDF4;border-radius:12px;padding:10px 12px}
  #kcap small{display:block;font-weight:400;font-size:19px;color:#A9C3DD;margin-top:4px}
  #kcur{position:fixed;left:0;top:0;width:30px;height:30px;z-index:2147483647;pointer-events:none;opacity:0;filter:drop-shadow(0 4px 6px rgba(0,0,0,.3))}
  #kcur i{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;background:rgba(50,152,216,.35);transform:scale(0)}`;
  document.head.appendChild(st);
  document.body.insertAdjacentHTML("beforeend", `<div id="kfx"></div><div id="kcap"></div><div id="kcur"><i></i><svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6-3.6 6.9z" fill="#0B1B33" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>`);
});
const set = (js, arg) => page.evaluate(js, arg);
const fx = (o) => set(o => document.getElementById("kfx").style.opacity = o, o);
let cur = { x: W * 0.7, y: H * 0.6 };
async function caption(num, text, sub) {
  await set(([n, t, s]) => { const c = document.getElementById("kcap"); c.innerHTML = (n ? `<b>${n}</b>` : "") + `<span>${t}${s ? `<small>${s}</small>` : ""}</span>`; }, [num, text, sub]);
}
const capOpacity = (o) => set(o => { const c = document.getElementById("kcap"); c.style.opacity = o; c.style.transform = `translateX(-50%) translateY(${(1 - o) * 16}px)`; }, o);

// Every frame helper takes an optional per-frame callback.
async function hold(sec, each) { for (let i = 0; i < n(sec); i++) { if (each) await each(i / n(sec)); await shot(); } }
async function fadeIn(sec = 0.4) { await hold(sec, p => fx(1 - ease(p))); }
async function fadeOut(sec = 0.35) { await hold(sec, p => fx(ease(p))); }
async function scroll(to, sec) {
  const from = await set(() => scrollY);
  await hold(sec, p => set(y => window.scrollTo(0, y), from + (to - from) * ease(p)));
}
async function moveTo(x, y, sec = 0.7) {
  const a = { ...cur };
  await set(() => document.getElementById("kcur").style.opacity = 1);
  await hold(sec, async p => { const e = ease(p); cur = { x: a.x + (x - a.x) * e, y: a.y + (y - a.y) * e }; await set(c => document.getElementById("kcur").style.transform = `translate(${c.x}px,${c.y}px)`, cur); await page.mouse.move(cur.x, cur.y); });
}
async function moveToEl(sel, sec) { const r = await page.locator(sel).first().boundingBox(); await moveTo(r.x + Math.min(r.width / 2, 120), r.y + r.height / 2, sec); }
async function click(sel) {
  await hold(0.25, p => set(s => document.querySelector("#kcur i").style.transform = `scale(${s})`, Math.sin(p * Math.PI) * 1.4));
  await page.locator(sel).first().click({ force: true }).catch(() => {});
}
async function type(sel, text, cps = 18) {
  const l = page.locator(sel).first(); await l.focus();
  for (const ch of text) { await page.keyboard.type(ch); await hold(1 / cps); }
}
async function visit(path, opts = {}) {
  await page.goto(APP + path, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(opts.settle ?? 1600);
  await overlay(); await fx(1);
  await set(() => { document.documentElement.style.scrollBehavior = "auto"; document.getElementById("kcur").style.transform = "translate(-100px,-100px)"; });
  if (opts.y) await set(y => window.scrollTo(0, y), opts.y);
  if (opts.prep) await opts.prep();
  await page.waitForTimeout(300);
}
// Title cards from card.html, driven by setT(t).
async function card(scene, sec) {
  await page.goto(`file://${SRC}card.html?scene=${scene}`);
  await page.evaluate(() => document.fonts.ready);
  await overlay(); await fx(1);
  const total = n(sec);
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    await set(([t, o]) => { window.setT(t); document.getElementById("kfx").style.opacity = o; }, [t, i < n(0.35) ? 1 - ease(i / n(0.35)) : i > total - n(0.35) ? ease((i - (total - n(0.35))) / n(0.35)) : 0]);
    await shot();
  }
}
// One app scene: fade in, caption, run steps, fade out.
async function scene(path, num, text, sub, steps, opts) {
  await visit(path, opts);
  await caption(num, text, sub);
  await hold(0.4, p => Promise.all([fx(1 - ease(p)), capOpacity(ease(p))]));
  await steps();
  await hold(0.35, p => Promise.all([fx(ease(p)), capOpacity(1 - ease(p))]));
}

if (which === "demo") {
  await card("intro", 4.2);
  await card("problem", 5.2);
  await scene("/", "01", "Home: one path from your first app to your Passport", "Free, no sign-up to look around", async () => {
    await hold(1.2); await moveToEl("text=Start a Quest", 1); await hold(0.5); await scroll(900, 2.2); await hold(1.2); await scroll(1900, 2); await hold(1);
  });
  await scene("/apps", "02", "Explore every app on Arc, by goal or category", "Contracts are checked live against the explorer", async () => {
    await hold(1); await moveToEl("text=Earn on your USDC", 0.9); await hold(0.8); await scroll(780, 2); await hold(1.6);
  });
  await scene("/quests", "03", "Quests: do real things on Arc, earn XP", "17 quests across four tiers, each checked onchain", async () => {
    await hold(1.2); await moveToEl("text=First transaction", 0.9); await hold(0.6); await scroll(1000, 2.2); await hold(1.2); await scroll(2100, 2.2); await hold(1.2);
  });
  await scene("/quests/first-tx", "03", "Every quest says exactly what counts", "Do it in any app, come back and claim for free", async () => {
    await hold(1.6); await scroll(400, 1.6); await hold(1.2);
  });
  await scene("/passport", "04", "Your Passport: XP, levels, badges", "Seven card designs, unlocked by finishing tiers", async () => {
    await hold(1.4); await moveTo(W * 0.4, H * 0.45, 1); await hold(1); await scroll(860, 2); await hold(1.6); await scroll(1700, 2); await hold(1.2);
  });
  await scene("/pay", "05", "Pay links: get paid in USDC with a link or QR code", "Settles on Arc in about a second", async () => {
    await hold(0.6);
    await moveToEl('input[placeholder*="wallet address"]', 0.7); await click('input[placeholder*="wallet address"]');
    await type('input[placeholder*="wallet address"]', "0x7a3f9c21b4e8d05a6c1f2e9b8d4a7c3e5f0b1d29", 40);
    await moveToEl("button:has-text('25')", 0.6); await click("button:has-text('25')"); await hold(0.3);
    await moveToEl('input[placeholder*="Dinner"]', 0.5); await click('input[placeholder*="Dinner"]'); await type('input[placeholder*="Dinner"]', "Design work, thank you!", 22);
    await hold(2.4);
  });
  await scene("/submit", "06", "Builders: submit an app in about two minutes", "Contracts checked live; listed with a Community label until reviewed", async () => {
    await hold(1.4);
    await moveToEl('input[placeholder="e.g. Tipjar"]', 0.7); await click('input[placeholder="e.g. Tipjar"]'); await type('input[placeholder="e.g. Tipjar"]', "Tipjar", 12);
    await hold(1); await scroll(400, 1.6); await hold(1);
  });
  await scene("/campaigns", "06", "Launch a USDC campaign for people who try your app", "Prize pools held in escrow on Arc Mainnet", async () => {
    await hold(2); await scroll(600, 1.8); await hold(1.2);
  });
  await scene("/", "07", "Search everything with Ctrl/Cmd + K", "Apps, quests, builders, addresses and transactions", async () => {
    await hold(0.6); await moveToEl("text=Search Arc", 0.8); await click("text=Search Arc"); await hold(0.6);
    for (const ch of "usdc") { await page.keyboard.type(ch); await hold(0.14); }
    await hold(2.4); await page.keyboard.press("Escape"); await hold(0.3);
    await caption("07", "Light and dark themes, installable on your phone", "Dark mode in every page");
    await moveToEl("text=Dark theme", 0.8); await click("text=Dark theme"); await hold(1.8); await scroll(900, 1.8); await hold(1);
    await page.locator("text=Light theme").first().click({ force: true }).catch(() => {});
  });
  await card("numbers", 4.6);
  await card("mainnet", 5);
  await card("outro", 4);
} else {
  await card("hook", 3.6);
  await card("tiers", 3.8);
  await card("cards", 3.8);
  await card("numbers", 4);
  await card("outro", 3.4);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
await b.close();
console.log(which, frames, "frames", (frames / FPS).toFixed(1) + "s");
