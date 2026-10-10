// Renders every still in the kit. Run from marketing/kit: node src/render.mjs
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
const src = new URL(".", import.meta.url).pathname;
const out = new URL("../png/", import.meta.url).pathname;
const jobs = [
  ["post.html?v=launch&f=land", 1600, 900, "arcway-launch-1600x900.png"],
  ["post.html?v=launch&f=square", 1080, 1080, "arcway-launch-1080x1080.png"],
  ["post.html?v=launch&f=tall", 1080, 1350, "arcway-launch-1080x1350.png"],
  ["avatar.html", 1000, 1000, "arcway-avatar-1000.png"],
  ["post.html?v=how&f=land", 1600, 900, "arcway-how-1600x900.png"],
  ["post.html?v=how&f=square", 1080, 1080, "arcway-how-1080x1080.png"],
  ["post.html?v=trust&f=land", 1600, 900, "arcway-trust-1600x900.png"],
  ["post.html?v=trust&f=square", 1080, 1080, "arcway-trust-1080x1080.png"],
  ["post.html?v=free&f=land", 1600, 900, "arcway-free-1600x900.png"],
  ["post.html?v=free&f=square", 1080, 1080, "arcway-free-1080x1080.png"],
  ["post.html?v=arch&f=land", 1600, 900, "arcway-architecture-1600x900.png"],
];
const b = await chromium.launch();
for (const [file, w, h, name] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: name.includes("avatar") ? 1 : 1.5 });
  await p.goto(`file://${src}${file}`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(150);
  await p.screenshot({ path: out + name });
  await p.close();
}
await b.close();
// Exact sizes for profile and listing uploads.
const conv = (a, s, o) => execFileSync("convert", [out + a, "-resize", `${s}x${s}`, "-strip", out + o]);
conv("arcway-avatar-1000.png", 400, "arcway-avatar-400.png");
conv("arcway-avatar-1000.png", 480, "arcway-logo-480.png");
console.log("done");
