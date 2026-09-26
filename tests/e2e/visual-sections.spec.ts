import { test } from "@playwright/test";
import { mockIntel } from "./intelFixtures";

/** Section-by-section captures (full-page shots cap out on tall mobile pages). VISUAL=1 only. */
const OUT = process.env.VISUAL_OUT ?? "test-results/visual";
test.skip(!process.env.VISUAL, "visual review only");

test("home sections", async ({ page }, info) => {
  await mockIntel(page);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  const ids = ["paths-title", "now-title", "new-title", "apps-title", "builders-title", "pulse-title", "passport-title", "quests-title"];
  for (const id of ids) {
    const section = page.locator(`section[aria-labelledby="${id}"]`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await section.screenshot({ path: `${OUT}/${info.project.name}-section-${id}.png` });
  }
});
