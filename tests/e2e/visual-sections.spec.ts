import { test } from "@playwright/test";
import { mockIntel } from "./intelFixtures";

/** Section-by-section captures (full-page shots cap out on tall mobile pages). VISUAL=1 only. */
const OUT = process.env.VISUAL_OUT ?? "test-results/visual";
test.skip(!process.env.VISUAL, "visual review only");

test("home sections", async ({ page }, info) => {
  await mockIntel(page);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  const ids = ["hero-title", "popular-title", "rewards-title", "explore-title", "new-title", "lb-home-title", "build-title", "how-title"];
  for (const id of ids) {
    const section = page.locator(`section[aria-labelledby="${id}"]`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await section.screenshot({ path: `${OUT}/${info.project.name}-section-${id}.png` });
  }
});

test("more hub", async ({ page }, info) => {
  await mockIntel(page);
  await page.goto("/more");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${info.project.name}-more.png`, fullPage: true });
});
