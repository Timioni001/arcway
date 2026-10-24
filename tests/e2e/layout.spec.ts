import { expect, test, type Page } from "@playwright/test";
import { mockIntel } from "./intelFixtures";

/** Layout guard: nothing scrolls sideways and no cards, buttons or headings overlap, on phone and desktop. */
const ROUTES = [
  "/", "/more", "/apps", "/apps/uniswap", "/quests", "/quests/first-tx", "/passport", "/builders", "/builders/uniswap-labs",
  "/ecosystem", "/pulse", "/radar", "/signals", "/digest", "/leaderboard", "/submit", "/widgets", "/watchlist", "/settings",
  "/search?q=circle", "/wallet", "/campaigns", "/launch", "/sponsor", "/overview", "/activity", "/pay", "/trails/get-started",
  "/assets", "/assets/0x3600000000000000000000000000000000000000"
];

const BLOCKS = [
  ".card", ".panel", ".dpath", ".step3", ".hub-tile", ".dapp", ".bchip", ".now__item", ".pillar", ".metric", ".app-card",
  ".ppromo", ".proof", ".buildcta", ".stabs__tab", ".btn", ".chip", ".phead__title", ".ohead__title", "h1", "h2", "h3"
].join(",");

async function settle(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  // Reveal everything and let entrance animations finish so boxes are final.
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in")));
  await page.waitForTimeout(900);
}

async function problems(page: Page) {
  return page.evaluate((sel) => {
    const out: string[] = [];
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1) out.push(`page scrolls sideways: ${doc.scrollWidth} > ${doc.clientWidth}`);
    const name = (el: Element) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join(".")} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
    const els = [...document.querySelectorAll(sel)].filter((el) => {
      if (el.closest("[aria-hidden='true'], .rail, .topbar, .mtop, .bottombar, .search-palette, dialog")) return false;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4;
    });
    const boxes = els.map((el) => ({ el, r: el.getBoundingClientRect() }));
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i];
      // Swipe rows scroll sideways on purpose (their container scrolls, the page does not).
      if (a.r.right > doc.clientWidth + 1 && !a.el.closest(".swipe") && getComputedStyle(a.el.parentElement!).overflowX === "visible") out.push(`off-screen right: ${name(a.el)}`);
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (x > 2 && y > 2) out.push(`overlap: ${name(a.el)} × ${name(b.el)}`);
      }
    }
    return out;
  }, BLOCKS);
}

for (const route of ROUTES) {
  test(`layout holds together: ${route}`, async ({ page }) => {
    await mockIntel(page);
    await settle(page, route);
    expect(await problems(page)).toEqual([]);
  });
}
