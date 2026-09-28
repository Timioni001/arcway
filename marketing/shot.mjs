import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const [n, w, h] of [["land", 1600, 900], ["portrait", 1080, 1350]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/post-${n}.html`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `arcway-coming-soon-${n}.png` });
}
await b.close();
