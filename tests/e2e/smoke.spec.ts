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
  "/ecosystem", "/pulse", "/radar", "/signals", "/watchlist", "/settings", "/apps/aave"
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
  await open(page, "/");
  const html = page.locator("html");
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"));
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
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
  const names = await page.locator(".app-card h3").allTextContents();
  expect(names.length).toBeGreaterThan(3);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
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
  for (const label of ["Overview", "Ecosystem", "Pulse", "Radar", "Builders", "Signals", "Apps", "Quests"]) {
    await expect(main.getByRole("link", { name: label })).toBeVisible();
  }
  await expect(main.getByRole("link", { name: "Pulse" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "More" }).getByRole("link", { name: "Watchlist" })).toBeVisible();
  const rail = page.locator(".rail");
  expect((await rail.boundingBox())!.x).toBeLessThan(5);
  // Collapse, and the choice survives a reload.
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await expect.poll(async () => (await rail.boundingBox())!.width).toBeLessThan(100);
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
  expect((await rail.boundingBox())!.width).toBeLessThan(100);
  await expect(main.getByRole("link", { name: "Radar" })).toBeAttached();
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

test("mobile uses a top dropdown and a five-item bottom bar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout");
  await open(page, "/");
  await expect(page.locator(".rail")).toBeHidden();
  const quick = page.getByRole("navigation", { name: "Quick" });
  await expect(quick.getByRole("link")).toHaveCount(5);
  await page.getByRole("button", { name: /Current section: Overview/ }).click();
  const menu = page.getByRole("navigation", { name: "Main menu" });
  for (const label of ["Ecosystem", "Pulse", "Radar", "Builders", "Signals", "Apps", "Quests", "Watchlist", "Settings"]) {
    await expect(menu.getByRole("link", { name: new RegExp(`^${label}`) })).toBeVisible();
  }
  const box = (await menu.getByRole("link", { name: /^Signals/ }).boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  await menu.getByRole("link", { name: /^Signals/ }).click();
  await expect(page).toHaveURL(/\/signals$/);
  await expect(menu).toBeHidden();
});

test("overview shows sourced network metrics, pulse and signals", async ({ page }) => {
  await open(page, "/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Understand what’s happening on Arc.");
  const snapshot = page.locator(".metrics");
  await expect(snapshot.locator(".metric")).toHaveCount(INTEL.snapshot.data.metrics.length);
  // Every metric states its source and period.
  expect(await snapshot.locator(".metric .src").count()).toBe(INTEL.snapshot.data.metrics.length);
  await expect(page.locator(".pulse-row").first()).toBeVisible();
  await expect(page.locator(".signal").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore ecosystem" })).toHaveAttribute("href", "/ecosystem");
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
  await expect(page.getByRole("table", { name: "Published contracts" }).or(page.getByText("Not measurable yet"))).toBeVisible();
  await open(page, "/apps/aave");
  await expect(page.getByText("Not measurable yet")).toBeVisible();
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
  const panel = page.getByRole("dialog", { name: "Latest signals" });
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
