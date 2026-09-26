import { test } from "@playwright/test";
import { mockIntel } from "./intelFixtures";

/** Screenshots for design review. Run with VISUAL=1; skipped in CI. */
const OUT = process.env.VISUAL_OUT ?? "test-results/visual";
const PAGES = ["/", "/ecosystem", "/pulse", "/radar", "/signals", "/apps/uniswap", "/builders", "/watchlist", "/settings", "/apps", "/leaderboard", "/submit", "/widgets", "/digest"];

test.describe("visual", () => {
  test.skip(!process.env.VISUAL, "visual review only");
  for (const dark of [false, true]) {
    for (const path of PAGES) {
      test(`${path} ${dark ? "dark" : "light"}`, async ({ page }, info) => {
        await mockIntel(page);
        if (dark) await page.addInitScript(() => localStorage.setItem("arcway:theme", "dark"));
        await page.goto(path);
        await page.waitForTimeout(800);
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(900);
        const name = `${info.project.name}-${dark ? "dark" : "light"}-${path === "/" ? "home" : path.slice(1).replace(/\//g, "_")}`;
        await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
      });
    }
  }
});
