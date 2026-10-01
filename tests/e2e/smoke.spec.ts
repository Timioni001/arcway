import { expect, test, type Page } from "@playwright/test";
import { INTEL, mockIntel } from "./intelFixtures";

// Live Arc data is served from fixtures so every test is deterministic.
test.beforeEach(async ({ page }) => { await mockIntel(page); });

/** Navigate and wait until React has hydrated, so clicks are never lost on a slow machine. */
async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
}

const ROUTES = [
  "/", "/overview", "/apps", "/apps/uniswap", "/quests", "/quests/first-tx", "/builders", "/passport",
  "/passport/0x7a00000000000000000000000000000000092f1a", "/terms", "/privacy",
  "/pay", "/pay/0x7a00000000000000000000000000000000092f1a?amount=5&note=Coffee", "/trails/get-started",
  "/activity", "/search", "/search?q=circle", "/builders/uniswap-labs",
  "/ecosystem", "/pulse", "/radar", "/signals", "/watchlist", "/settings", "/apps/aave",
  "/leaderboard", "/submit", "/widgets", "/digest", "/more", "/wallet", "/campaigns", "/launch",
  "/assets", "/assets/0x3600000000000000000000000000000000000000"
];

/** Collect uncaught errors and console errors (network failures to Arc are expected offline). */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|net::ERR|fetch/i.test(m.text())) errors.push(m.text());
  });
  return errors;
}

for (const route of ROUTES) {
  test(`${route} renders cleanly`, async ({ page }) => {
    const errors = watchErrors(page);
    await open(page, route);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, "no sideways scrolling").toBe(false);
    expect(errors).toEqual([]);
  });
}

test("search pop-up finds an app and opens it", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut is a desktop feature");
  await open(page, "/");
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox");
  await expect(input).toBeFocused();
  await input.fill("uniswap");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/apps\/uniswap$/);
  await expect(page.getByRole("heading", { level: 1, name: "Uniswap" })).toBeVisible();
});

test("category links open Discover filtered", async ({ page }) => {
  await open(page, "/apps?category=Lend%20%26%20Earn");
  await expect(page.getByRole("button", { name: /Lend & Earn/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /Aave/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Uniswap/ })).toHaveCount(0);
});

test("dark theme toggles and persists", async ({ page, isMobile }) => {
  await open(page, isMobile ? "/more" : "/");
  const html = page.locator("html");
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"));
  await page.getByRole("button", { name: /Switch to (dark|light) theme/ }).click();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
  await page.reload();
  expect(await html.evaluate((el) => el.classList.contains("dark"))).toBe(!wasDark);
});

test("quest page asks to connect when no wallet", async ({ page }) => {
  await open(page, "/quests/first-tx");
  await expect(page.getByRole("heading", { level: 1, name: "First transaction" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect wallet" }).last()).toBeVisible();
});

test("connecting with no wallet installed explains what to do", async ({ page }) => {
  await open(page, "/overview");
  await page.locator(".next-bar").getByRole("button", { name: /Connect wallet/ }).click();
  await expect(page.getByRole("alert").first()).toContainText("No browser wallet found");
});

test("a connected wallet shows its address", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { ethereum: unknown }).ethereum = {
      isMetaMask: true,
      on() {},
      removeListener() {},
      request: async ({ method }: { method: string }) => {
        if (method === "eth_requestAccounts" || method === "eth_accounts") return ["0x7a00000000000000000000000000000000092f1a"];
        if (method === "eth_chainId") return "0x4cef52";
        if (method === "wallet_requestPermissions") return [{}];
        return null;
      }
    };
  });
  await open(page, "/passport");
  await page.locator(".next-bar, .card").getByRole("button", { name: /Connect wallet/ }).first().click();
  await expect(page.getByText("0x7A00…2f1A").filter({ visible: true }).first()).toBeVisible();
});

test("unknown pages show a helpful 404", async ({ page }) => {
  const res = await page.goto("/nope");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Discover apps" })).toBeVisible();
});

test("APIs validate input and fail safely", async ({ request }) => {
  const bad = await request.get("/api/progress?address=nope");
  expect(bad.status()).toBe(400);
  const claim = await request.post("/api/quests/claim", { data: { address: "0x7a00000000000000000000000000000000092f1a", questId: "nope" } });
  expect(claim.status()).toBe(400);
});

test("footer links to Terms and Privacy", async ({ page }) => {
  await open(page, "/");
  const legal = page.getByRole("navigation", { name: "Legal" });
  await legal.getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  await page.getByRole("navigation", { name: "Legal" }).getByRole("link", { name: "Terms of Use" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeVisible();
});

test("following an app shows it under Following and survives a reload", async ({ page }) => {
  await open(page, "/apps");
  await page.getByRole("button", { name: "Follow Aave" }).click();
  await expect(page.getByRole("button", { name: "Unfollow Aave" })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page.getByRole("button", { name: /^Following/ }).click();
  await expect(page.getByRole("link", { name: /Aave/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Uniswap/ })).toHaveCount(0);
});

test("sorting A–Z orders apps by name", async ({ page }) => {
  await open(page, "/apps");
  await page.getByLabel("Sort apps").selectOption("az");
  // The list renders through a deferred value, so wait for the sorted order to settle.
  const cards = page.locator(".app-card h3");
  await expect.poll(async () => {
    const names = await cards.allTextContents();
    return names.length > 3 && names.every((n, i) => i === 0 || names[i - 1].localeCompare(n) <= 0);
  }).toBe(true);
});

test("passport lookup validates the address", async ({ page }) => {
  await open(page, "/passport");
  const input = page.getByLabel("Look up a passport");
  await input.fill("hello");
  await page.getByRole("button", { name: "View" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "wallet address" })).toBeVisible();
  await input.fill("0x7a00000000000000000000000000000000092f1a");
  await page.getByRole("button", { name: "View" }).click();
  await expect(page).toHaveURL(/\/passport\/0x7a00/i);
  await expect(page.getByRole("link", { name: /Copy link|Post on X/ }).or(page.getByRole("button", { name: "Copy link" })).first()).toBeVisible();
});

test("an invalid passport address is a 404", async ({ page }) => {
  const res = await page.goto("/passport/not-an-address");
  expect(res?.status()).toBe(404);
});

test("fee calculator responds to the slider", async ({ page }) => {
  await open(page, "/overview");
  await expect(page.getByRole("heading", { name: "What things cost on Arc" })).toBeVisible();
  await page.getByLabel("How many times").fill("500");
  await expect(page.getByText("500 times")).toBeVisible();
});

test("share images render", async ({ request }) => {
  const home = await request.get("/opengraph-image");
  expect(home.status()).toBe(200);
  expect(home.headers()["content-type"]).toContain("image/png");
});

const MOCK_WALLET = () => {
  (window as unknown as { ethereum: unknown }).ethereum = {
    isMetaMask: true,
    on() {},
    removeListener() {},
    request: async ({ method }: { method: string }) => {
      if (method === "eth_requestAccounts" || method === "eth_accounts") return ["0x1111111111111111111111111111111111111111"];
      if (method === "eth_chainId") return "0x4cef52";
      if (method === "wallet_requestPermissions") return [{}];
      if (method === "wallet_addEthereumChain") return null;
      return null;
    }
  };
};

test("create a pay link with amount, note and QR", async ({ page }) => {
  await open(page, "/pay");
  await page.getByLabel("Pay to").fill("0x7a00000000000000000000000000000000092f1a");
  await page.getByLabel(/^Amount/).fill("12.5");
  await page.getByLabel(/^Note/).fill("Lunch");
  await expect(page.getByRole("img", { name: "QR code for your pay link" }).locator("svg")).toBeVisible();
  await expect(page.locator(".pay-preview__url")).toContainText("/pay/0x7A00000000000000000000000000000000092f1A?amount=12.5&note=Lunch");
  await page.getByLabel(/^Amount/).fill("1.1234567");
  await expect(page.getByRole("alert").filter({ hasText: "6 decimal" })).toBeVisible();
});

test("pay link walks the payer through connecting", async ({ page }) => {
  await page.addInitScript(MOCK_WALLET);
  await open(page, "/pay/0x7a00000000000000000000000000000000092f1a?amount=5&note=Coffee");
  await expect(page.getByText("“Coffee”")).toBeVisible();
  await page.getByRole("button", { name: "Connect wallet to pay" }).click();
  await expect(page.getByRole("button", { name: "Send 5 USDC" }).or(page.getByRole("link", { name: /Not enough USDC/ }))).toBeVisible();
});

test("bad pay link parameters are ignored, bad addresses 404", async ({ page }) => {
  await open(page, "/pay/0x7a00000000000000000000000000000000092f1a?amount=-3");
  await expect(page.getByLabel("Amount")).toHaveValue("");
  const res = await page.goto("/pay/nope");
  expect(res?.status()).toBe(404);
});

test("trail steps can be marked done and persist", async ({ page }) => {
  await open(page, "/trails/earn");
  const progress = page.locator(".trail-head__progress");
  await expect(progress).toContainText("0/4");
  await page.getByRole("button", { name: "Mark as done" }).first().click();
  await expect(progress).toContainText("1/4");
  await page.reload();
  await expect(progress).toContainText("1/4");
  await open(page, "/apps");
  await expect(page.getByRole("link", { name: /Earn on your USDC/ })).toContainText("Continue");
});

test("search actions run commands", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut is a desktop feature");
  await open(page, "/");
  const html = page.locator("html");
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"));
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("theme");
  await page.keyboard.press("Enter");
  expect(await html.evaluate((el) => el.classList.contains("dark"))).toBe(!wasDark);
});

test("the app can be installed", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.status()).toBe(200);
  const m = await res.json();
  expect(m.name).toBe("Arcway");
  expect((await request.get("/icon-512.png")).status()).toBe(200);
});

test("health check reports launch readiness as JSON", async ({ request }) => {
  const res = await request.get("/api/health");
  expect([200, 503]).toContain(res.status());
  const h = await res.json();
  expect(h).toMatchObject({ network: expect.stringMatching(/testnet|mainnet/), passport: expect.any(Object), verifier: expect.any(Object) });
  expect(JSON.stringify(h)).not.toMatch(/private|0x[0-9a-f]{64}/i);
});

test("app marks use real logos or category icons, never initials", async ({ page }) => {
  await open(page, "/apps");
  await expect(page.locator(".app-card").first()).toBeVisible();
  const marks = page.locator(".app-card .ctile");
  expect(await marks.count()).toBeGreaterThan(10);
  // Every mark holds an image or an icon, and no bare letters.
  const texts = await marks.evaluateAll((els) => els.map((e) => (e.textContent ?? "").trim()));
  expect(texts.filter(Boolean)).toEqual([]);
  const logos = page.locator(".app-card .ctile--logo img");
  expect(await logos.count()).toBeGreaterThan(8);
  const broken = await logos.evaluateAll((imgs) => Promise.all((imgs as HTMLImageElement[]).map(async (img) => {
    img.loading = "eager";
    if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; });
    return img.naturalWidth === 0 ? img.src : null;
  })));
  expect(broken.filter(Boolean)).toEqual([]);
  await open(page, "/builders");
  const avatars = await page.locator(".avatar").evaluateAll((els) => els.map((e) => (e.textContent ?? "").trim()));
  expect(avatars.filter(Boolean)).toEqual([]);
});

test("featured card is contained and doesn't overlap what follows", async ({ page }) => {
  await open(page, "/apps");
  const card = page.locator(".featured-card").first();
  await card.scrollIntoViewIfNeeded();
  const cardBox = (await card.boundingBox())!;
  const visual = (await page.locator(".featured-visual").first().boundingBox())!;
  expect(visual.y + visual.height).toBeLessThanOrEqual(cardBox.y + cardBox.height + 1);
  const next = (await page.locator(".results .app-card").first().boundingBox())!;
  expect(next.y).toBeGreaterThan(cardBox.y + cardBox.height);
});

test("status filters narrow Discover", async ({ page }) => {
  await open(page, "/apps");
  const cards = page.locator(".app-card");
  await expect(cards.first()).toBeVisible();
  const all = await cards.count();
  const betaButton = page.getByRole("group", { name: "Filter by status" }).getByRole("button", { name: "Beta" });
  await betaButton.click();
  await expect(betaButton).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => cards.count()).toBeLessThan(all);
  const beta = await cards.count();
  expect(beta).toBeGreaterThan(0);
  await expect(page.locator(".app-card .badge", { hasText: "Beta" })).toHaveCount(beta);
});

test("search page groups results and remembers searches", async ({ page }) => {
  await open(page, "/search");
  await page.getByLabel(/Search apps, categories/).fill("circle");
  await expect(page.getByRole("region", { name: "Builders" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Apps" })).toBeVisible();
  await expect(page).toHaveURL(/q=circle/);
  await page.getByLabel(/Search apps, categories/).fill("");
  await expect(page.getByRole("button", { name: "circle" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suggested categories" })).toBeVisible();
});

test("builder pages list their apps", async ({ page }) => {
  await open(page, "/builders");
  await page.getByRole("link", { name: "Circle", exact: true }).click();
  await expect(page).toHaveURL(/\/builders\/circle$/);
  await expect(page.getByRole("heading", { level: 1, name: "Circle" })).toBeVisible();
  await expect(page.locator(".app-card")).toHaveCount(2);
});

// ---------------------------------------------------------------- intelligence layer

test("desktop uses a left rail with the full navigation", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop layout");
  await open(page, "/pulse");
  const main = page.getByRole("navigation", { name: "Main" });
  await expect(main.getByRole("link")).toHaveText(["Home", "Explore", "Quests", "Passport"]);
  // Deeper areas sit under More, which opens by itself on one of its pages.
  const more = page.getByRole("navigation", { name: "More" });
  await expect(more.getByRole("button", { name: "More" })).toHaveAttribute("aria-expanded", "true");
  await expect(more.getByRole("link")).toHaveText(["Activity", "What's New", "Insights", "Builders", "Watchlist", "For Builders", "Settings"]);
  await expect(more.getByRole("link", { name: "Activity" })).toHaveAttribute("aria-current", "page");
  const rail = page.locator(".rail");
  expect((await rail.boundingBox())!.x).toBeLessThan(5);
  // Collapse, and the choice survives a reload.
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await expect.poll(async () => (await rail.boundingBox())!.width).toBeLessThan(100);
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  expect((await rail.boundingBox())!.width).toBeLessThan(100);
  await expect(main.getByRole("link", { name: "Quests" })).toBeAttached();
});

test("tablet starts with a collapsed rail that expands on demand", async ({ page, isMobile }) => {
  test.skip(isMobile, "tablet layout");
  await page.setViewportSize({ width: 1000, height: 800 });
  await open(page, "/");
  const rail = page.locator(".rail");
  expect((await rail.boundingBox())!.width).toBeLessThan(100);
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await expect.poll(async () => (await rail.boundingBox())!.width).toBeGreaterThan(200);
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await rail.boundingBox())!.width).toBeLessThan(100);
});

test("mobile: Home, Explore, Quests, Passport and More", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout");
  await open(page, "/");
  await expect(page.locator(".rail")).toBeHidden();
  const quick = page.getByRole("navigation", { name: "Quick" });
  await expect(quick.getByRole("link")).toHaveText(["Home", "Explore", "Quests", "Passport", "More"]);
  await expect(quick.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await quick.getByRole("link", { name: "More" }).click();
  await expect(page).toHaveURL(/\/more$/);
  await expect(quick.getByRole("link", { name: "More" })).toHaveAttribute("aria-current", "page");
  for (const g of ["Understand Arc", "Explore more", "Earn more", "For Builders", "You and settings"]) {
    await expect(page.locator(".hub").getByRole("heading", { level: 2, name: g, exact: true })).toBeVisible();
  }
  const insights = page.locator(".hub").getByRole("link", { name: /^Insights/ });
  expect((await insights.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await insights.click();
  await expect(page).toHaveURL(/\/signals$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Insights");
  await expect(quick.getByRole("link", { name: "More" })).toHaveAttribute("aria-current", "page");
});

test("home speaks to people first: quests, rewards, explore, passport; no raw network data", async ({ page }) => {
  await open(page, "/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore Arc. Complete quests. Build your Passport.");
  await expect(page.locator(".hero").getByRole("link", { name: "Explore Arc" })).toHaveAttribute("href", "/apps");
  await expect(page.locator(".hero").getByRole("link", { name: "Start a Quest" })).toHaveAttribute("href", "/quests");
  const order = ["Popular right now", "What you can earn", "Explore Arc", "What's new on Arc", "Top explorers", "Built something on Arc?", "How Arc works"];
  let last = -1;
  for (const name of order) {
    const box = (await page.getByRole("region", { name, exact: true }).boundingBox())!;
    expect(box.y, name).toBeGreaterThan(last);
    last = box.y;
  }
  const popular = page.getByRole("region", { name: "Popular right now" }).locator(".qcard");
  await expect(popular).toHaveCount(3);
  await expect(popular.first()).toContainText("XP");
  await expect(page.getByRole("region", { name: "What you can earn" })).toContainText("Coming soon");
  await expect(page.getByRole("region", { name: "Explore Arc" }).locator(".xtile")).toHaveCount(6);
  await expect(page.getByRole("region", { name: "What's new on Arc" }).locator(".news__item").first()).toContainText("New app added");
  // The season leader from onchain passport data, and a way in for builders.
  await expect(page.locator(".hlb__leader")).toContainText("35");
  await expect(page.getByRole("region", { name: "Built something on Arc?" }).getByRole("link", { name: /Submit your app/ })).toHaveAttribute("href", "/submit");
  // No technical graphs, pulse rows or contract counts on the public home.
  await expect(page.locator(".pulse-row, .emap, .now__item, .spark")).toHaveCount(0);
  await expect(page.locator(".hero").getByRole("button", { name: /Connect/ })).toHaveCount(0);
});

test("features live inside their section as views", async ({ page }) => {
  await open(page, "/campaigns");
  const views = page.getByRole("navigation", { name: "Views in this section" });
  await expect(views.getByRole("link")).toHaveText(["Quests", "Campaigns", "Leaderboard"]);
  await expect(views.getByRole("link", { name: "Campaigns" })).toHaveAttribute("aria-current", "page");
  await open(page, "/pulse");
  await expect(page.getByRole("navigation", { name: "Views in this section" }).getByRole("link")).toHaveText(["Apps", "Categories", "Assets", "Builders", "What's New", "Activity"]);
  await open(page, "/launch");
  await expect(page.getByRole("navigation", { name: "Views in this section" }).getByRole("link", { name: "Submit a project" })).toHaveAttribute("href", "/submit");
});

test("quest cards say what you will do, the reward, difficulty and time", async ({ page }) => {
  await open(page, "/quests");
  const card = page.locator(".quest-card").filter({ hasText: "First transaction" });
  await expect(card).toContainText("Onchain action");
  await expect(card).toContainText("+25 XP");
  await expect(card).toContainText("First Step badge");
  await expect(card).toContainText("Beginner");
  await expect(card).toContainText("2 min");
  await expect(card.getByRole("link", { name: "Start" })).toHaveAttribute("href", "/quests/first-tx");
  await expect(page.locator(".tier")).toHaveText([/Beginner.*0\/4/, /Explorer.*opens after Arc Explorer/, /Regular.*opens after Arc Voyager/, /Advanced.*opens after Arc Regular/]);
});

test("passport: rewards gallery and styles that unlock through participation", async ({ page }) => {
  await open(page, "/passport");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Arc identity");
  const gallery = page.locator(".bgallery__item");
  await expect(gallery).toHaveCount(17);
  await expect(page.getByRole("region", { name: "Advanced badges" })).toContainText("Pathfinder");
  await expect(gallery.first()).toContainText("Not earned yet");
  await expect(gallery.filter({ hasText: "Arrival" })).toContainText("Held by 2 explorers");
  await expect(page.getByRole("region", { name: "Make it yours" })).toContainText("Connect your wallet to style your passport");
  const style = page.getByRole("region", { name: "Make it yours" });
  await expect(style.locator(".pcol__item--locked").first()).toContainText("Complete the Arc Explorer quest");
  await expect(style.getByRole("progressbar", { name: "Midnight carbon: 0 of 1" })).toBeVisible();
  await style.getByRole("tab", { name: /Titles/ }).click();
  await expect(style.locator(".pcol__item--locked")).toHaveCount(5);
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link")).toHaveText(["Style", "Badges", "Progress", "Activity"]);
});

test("assets: list ranked by holders, entity page with activity, markets and related apps", async ({ page }) => {
  await open(page, "/assets");
  const rows = page.locator(".atable__row:not(.atable__row--head)");
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText("USDC");
  await expect(rows.first()).toContainText("182,345");
  await rows.first().getByRole("link").click();
  await expect(page).toHaveURL(/\/assets\/0x36/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("USDC (USDC)");
  await expect(page.getByRole("region", { name: "Recent activity" }).locator(".pulse-row")).toHaveCount(10);
  await expect(page.getByRole("region", { name: "Markets" })).toContainText("Coming soon");
  await expect(page.getByRole("region", { name: "Related apps" }).getByRole("link", { name: "Uniswap" })).toBeVisible();
});

test("radar keeps the full network snapshot with sources", async ({ page }) => {
  await open(page, "/radar");
  const snapshot = page.locator(".metrics");
  await expect(snapshot.locator(".metric")).toHaveCount(INTEL.snapshot.data.metrics.length);
  expect(await snapshot.locator(".metric .src").count()).toBe(INTEL.snapshot.data.metrics.length);
});

test("home still works when live data is unavailable, and never guesses", async ({ page }) => {
  await page.unroute("**/api/intel/**");
  await mockIntel(page, { fail: true });
  await open(page, "/");
  const popular = page.getByRole("region", { name: "Popular right now" });
  await expect(popular.locator(".qcard")).toHaveCount(3);
  await expect(popular).not.toContainText("completed");
  const news = page.getByRole("region", { name: "What's new on Arc" }).locator(".news__item");
  await expect(news.first()).toContainText("New app added");
  await expect(news.filter({ hasText: /verified|Activity (in|de)creased/ })).toHaveCount(0);
});

test("when Arc data is unreachable, nothing is guessed", async ({ page }) => {
  await page.unroute("**/api/intel/**");
  await mockIntel(page, { fail: true });
  await open(page, "/pulse");
  await expect(page.getByRole("alert").filter({ hasText: "Arc data is unavailable right now" }).first()).toBeVisible();
  await expect(page.locator(".pulse-row")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Try again" }).first()).toBeVisible();
});

test("pulse filters by event type", async ({ page }) => {
  await open(page, "/pulse");
  const chip = page.getByRole("group", { name: "Filter activity" }).getByRole("button", { name: /^Deployment/ });
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  const kinds = await page.locator(".pulse-row").evaluateAll((rows) => rows.map((r) => r.getAttribute("data-kind")));
  expect(kinds.length).toBeGreaterThan(0);
  expect(new Set(kinds)).toEqual(new Set(["deploy"]));
});

test("ecosystem map traces relationships", async ({ page }) => {
  await open(page, "/ecosystem");
  await page.getByRole("button", { name: /^Trading, \d+ apps/ }).first().click();
  const panel = page.locator(".emap__panel");
  await expect(panel.getByRole("heading", { name: "Trading" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Uniswap" })).toBeVisible();
  await expect(page.locator(".emap__node[data-dim='true']").first()).toBeAttached();
});

test("protocol pages show identity, contracts or an honest gap", async ({ page }) => {
  await open(page, "/apps/uniswap");
  await expect(page.getByRole("heading", { level: 1, name: "Uniswap" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Onchain activity" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Published contracts" }).or(page.getByText("Activity data coming soon"))).toBeVisible();
  await open(page, "/apps/aave");
  await expect(page.getByText("Activity data coming soon")).toBeVisible();
});

test("following builds a watchlist with a live count", async ({ page, isMobile }) => {
  await open(page, "/apps/uniswap");
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(page.getByRole("button", { name: "Following", exact: true })).toHaveAttribute("aria-pressed", "true");
  await open(page, "/builders/circle");
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(page.getByRole("button", { name: "Following", exact: true })).toHaveAttribute("aria-pressed", "true");
  if (!isMobile) await expect(page.getByRole("link", { name: "Watchlist, 2 followed" })).toBeVisible();
  await open(page, "/watchlist");
  await expect(page.getByRole("region", { name: "Protocols" }).getByRole("link", { name: "Uniswap" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Builders" }).getByRole("link", { name: "Circle" })).toBeVisible();
  await open(page, "/settings");
  await page.getByRole("region", { name: "Data in this browser" }).getByRole("button", { name: "Clear" }).first().click();
  await open(page, "/watchlist");
  await expect(page.getByText("Nothing followed yet")).toBeVisible();
});

test("settings switch theme explicitly", async ({ page }) => {
  await open(page, "/settings");
  await expect(page.getByRole("radiogroup", { name: "Theme" }).getByRole("radio", { checked: true })).toHaveCount(1);
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
});

test("search understands addresses and transaction hashes", async ({ page }) => {
  await open(page, "/search?q=0x7a00000000000000000000000000000000092f1a");
  const onchain = page.getByRole("region", { name: "Onchain" });
  await expect(onchain.getByRole("link", { name: /Passport/ })).toHaveAttribute("href", "/passport/0x7a00000000000000000000000000000000092f1a");
  await open(page, `/search?q=0x${"ab".repeat(32)}`);
  await expect(page.getByRole("region", { name: "Onchain" }).getByRole("link", { name: /Transaction/ })).toHaveAttribute("href", /\/tx\/0xabab/);
});

test("notifications list the latest signals", async ({ page, isMobile }) => {
  test.skip(isMobile, "bell lives in the desktop utility bar");
  await open(page, "/radar");
  await page.getByRole("button", { name: /^Notifications/ }).click();
  const panel = page.getByRole("dialog", { name: "Latest insights" });
  await expect(panel.locator(".notif__item").first()).toBeVisible();
  await expect(panel.getByRole("link", { name: "View all" })).toHaveAttribute("href", "/signals");
});

test("intel APIs answer with data or a clean error", async ({ request }) => {
  for (const path of ["/api/intel/snapshot", "/api/intel/pulse", "/api/intel/radar", "/api/intel/signals"]) {
    const res = await request.get(path);
    expect([200, 502]).toContain(res.status());
    const body = await res.json();
    if (res.status() === 200) expect(body).toMatchObject({ data: expect.anything(), fetchedAt: expect.any(String), unavailable: expect.any(Array) });
    else expect(body).toMatchObject({ error: "arc_unavailable" });
  }
  expect((await request.get("/api/intel/protocol/not-a-protocol")).status()).toBe(404);
});

// ---------------------------------------------------------------- sections, proof and builder tools

test("intelligence keeps its routes under plain names", async ({ page }) => {
  for (const [path, h1] of [["/pulse", "What is happening on Arc"], ["/radar", "What changed on Arc"], ["/signals", "Insights"]]) {
    await open(page, path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  }
});

test("the leaderboard proves Arcway runs on Arc", async ({ page }) => {
  await open(page, "/leaderboard");
  const proof = page.locator(".proof").first();
  await expect(proof.getByRole("link", { name: /0xa8a4A8FdE3fdCe351b9b22ACc3368e3b308b0107/ })).toHaveAttribute("href", /\/address\/0xa8a4/);
  await expect(proof.getByText("passports issued")).toBeVisible();
  await expect(proof.locator(".proof__stat b").first()).toHaveText("2");
});

test("leaderboard ranks explorers by XP", async ({ page }) => {
  await open(page, "/leaderboard");
  await page.getByRole("button", { name: "All time" }).click();
  const rows = page.locator(".lb__row");
  await expect(rows).toHaveCount(2);
  await expect(rows.first().locator(".lb__xp")).toHaveText("35 XP");
  await expect(rows.first().getByRole("link")).toHaveAttribute("href", "/passport/0x7a00000000000000000000000000000000092f1a");
});

test("submitting a project checks contracts and opens a pre-filled issue", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { opened: string[] }).opened = [];
    window.open = ((url: string) => { (window as unknown as { opened: string[] }).opened.push(url); return null; }) as typeof window.open;
  });
  await open(page, "/submit");
  await page.getByRole("button", { name: "Continue on GitHub" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Fix the highlighted fields" })).toBeVisible();
  await page.getByLabel("Project name").fill("Tipjar");
  await page.getByLabel("Live app link").fill("https://tipjar.app");
  await page.getByLabel("Category").selectOption("Payments");
  await page.getByLabel("What it does, in one line").fill("Send USDC tips with a link.");
  await page.getByLabel(/Contract addresses on/).fill("0x7a00000000000000000000000000000000092f1a");
  await expect(page.locator(".check-row[data-state='ok']")).toContainText("Tipjar");
  await page.getByLabel("Public repo").fill("https://github.com/me/tipjar");
  await page.getByLabel("Builder profile").fill("https://x.com/me");
  await expect(page.locator(".submit__preview")).toContainText("Tipjar");
  await page.getByRole("button", { name: "Continue on GitHub" }).click();
  const opened = await page.evaluate(() => (window as unknown as { opened: string[] }).opened);
  expect(opened).toHaveLength(1);
  const url = new URL(opened[0]);
  expect(url.pathname).toMatch(/\/issues\/new$/);
  expect(url.searchParams.get("title")).toBe("Listing: Tipjar");
  expect(url.searchParams.get("body")).toContain("source verified");
  await expect(page.getByRole("status").filter({ hasText: "opened on GitHub" })).toBeVisible();
});

test("badges and the RSS feed are served", async ({ request }) => {
  const badge = await request.get("/api/badge/uniswap");
  expect(badge.status()).toBe(200);
  expect(badge.headers()["content-type"]).toContain("image/svg+xml");
  expect(await badge.text()).toContain("Arcway");
  expect((await request.get("/api/badge/not-an-app")).status()).toBe(404);
  const feed = await request.get("/digest/feed.xml");
  expect(feed.status()).toBe(200);
  expect(feed.headers()["content-type"]).toContain("rss");
  expect(await feed.text()).toContain("<rss");
});

test("widget builder gives copyable snippets", async ({ page }) => {
  await open(page, "/widgets");
  await page.getByLabel("App").selectOption("aave");
  await expect(page.locator(".codebox pre").first()).toContainText("/api/badge/aave");
  await expect(page.getByRole("img", { name: "Arcway badge for Aave" })).toBeVisible();
});

test("mobile glass tab bar: lens follows the page and the bar tucks away while scrolling down", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout");
  await open(page, "/apps");
  const bar = page.getByRole("navigation", { name: "Quick" });
  await expect(bar).toHaveAttribute("style", /--i:\s*1/);
  await page.mouse.wheel(0, 900);
  await expect(bar).toHaveAttribute("data-compact", "true");
  await page.mouse.wheel(0, -400);
  await expect(bar).not.toHaveAttribute("data-compact", /.*/);
  await bar.getByRole("link", { name: "Quests" }).click();
  await expect(page).toHaveURL(/\/quests$/);
  await expect(bar).toHaveAttribute("style", /--i:\s*2/);
});

test("get a wallet: passkey option explains itself when not switched on, wallet apps and safety tips are there", async ({ page }) => {
  await open(page, "/wallet");
  await expect(page.getByRole("heading", { level: 1, name: "Your first Arc wallet" })).toBeVisible();
  const passkey = page.getByRole("region", { name: "Create one here with a passkey" });
  await expect(passkey.getByText("Coming soon")).toBeVisible();
  await expect(passkey.getByRole("button", { name: "Create my wallet" })).toBeDisabled();
  const apps = page.getByRole("region", { name: "Or use a wallet app" });
  await expect(apps.getByRole("link", { name: /MetaMask/ })).toHaveAttribute("href", /metamask\.io/);
  await expect(page.getByRole("region", { name: "Keep it safe" })).toContainText("Arcway never sees it");
});

test("no wallet installed: the error points to Get a wallet", async ({ page }) => {
  await open(page, "/overview");
  await page.locator(".next-bar").getByRole("button", { name: /Connect wallet/ }).click();
  await expect(page.getByRole("alert").first()).toContainText("Create a free wallet");
  await page.locator(".next-bar").getByRole("link", { name: "Get a wallet" }).click();
  await expect(page).toHaveURL(/\/wallet$/);
});

// Static pages are built once; a visitor days later must still hydrate without mismatches.
for (const route of ROUTES) {
  test(`${route} hydrates cleanly on a later day than the build`, async ({ page }) => {
    await page.clock.install({ time: Date.now() + 3 * 24 * 60 * 60 * 1000 });
    const errors = watchErrors(page);
    await open(page, route);
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}

test("campaigns: empty state explains itself and points projects to launching", async ({ page }) => {
  await open(page, "/campaigns");
  await expect(page.getByRole("heading", { level: 1, name: "Live campaigns on Arc" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No live campaigns yet" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Ways a pool is shared" }).getByRole("listitem")).toHaveCount(3);
  await page.locator(".cpg-empty").getByRole("link", { name: "Launch a campaign" }).click();
  await expect(page).toHaveURL(/\/launch$/);
});

test("launch a campaign: the form checks the rules and previews the reward", async ({ page }) => {
  await open(page, "/launch");
  await page.getByLabel("Project", { exact: true }).fill("Tipjar");
  await page.getByLabel("Title").fill("First tip week");
  await page.getByLabel("What people get to do").fill("Send one tip on Arc and share the pool.");
  await page.getByLabel("Task 1 contract addresses").fill("0x00000000000000000000000000000000000000AB");
  await page.getByLabel("Pool (USDC)").fill("500");
  await page.getByLabel("Number of rewards").fill("100");
  const preview = page.getByRole("complementary", { name: "Summary" });
  await expect(preview).toContainText("500 USDC");
  await expect(preview).toContainText("5 USDC each for the first 100 people");
  // An uneven first-come pool is caught before any wallet step.
  await page.getByLabel("Pool (USDC)").fill("100");
  await page.getByLabel("Number of rewards").fill("3");
  await expect(preview).toContainText("—");
  // Switching to a prize draw re-labels the winners field and updates the preview.
  await page.locator(".lc-mode", { hasText: "Prize draw" }).click();
  await page.getByLabel("Pool (USDC)").fill("300");
  await page.getByLabel("Winners to draw").fill("3");
  await expect(preview).toContainText("3 winners drawn, 100 USDC each");
  await expect(page.getByText(/escrow isn.t deployed/)).toBeVisible();
});
