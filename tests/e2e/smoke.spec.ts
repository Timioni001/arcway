import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/", "/overview", "/apps", "/apps/uniswap", "/quests", "/quests/first-tx", "/builders", "/passport",
  "/passport/0x7a00000000000000000000000000000000092f1a", "/terms", "/privacy"
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
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, "no sideways scrolling").toBe(false);
    expect(errors).toEqual([]);
  });
}

test("search pop-up finds an app and opens it", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut is a desktop feature");
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox");
  await expect(input).toBeFocused();
  await input.fill("uniswap");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/apps\/uniswap$/);
  await expect(page.getByRole("heading", { level: 1, name: "Uniswap" })).toBeVisible();
});

test("category links open Discover filtered", async ({ page }) => {
  await page.goto("/apps?category=Lend%20%26%20Earn");
  await expect(page.getByRole("button", { name: /Lend & Earn/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /Aave/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Uniswap/ })).toHaveCount(0);
});

test("dark theme toggles and persists", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"));
  await page.getByRole("button", { name: /Switch to (dark|light) theme/ }).click();
  await expect(html).toHaveClass(wasDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
  await page.reload();
  expect(await html.evaluate((el) => el.classList.contains("dark"))).toBe(!wasDark);
});

test("quest page asks to connect when no wallet", async ({ page }) => {
  await page.goto("/quests/first-tx");
  await expect(page.getByRole("heading", { level: 1, name: "First transaction" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect wallet" }).last()).toBeVisible();
});

test("connecting with no wallet installed explains what to do", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/passport");
  await page.locator(".next-bar, .card").getByRole("button", { name: /Connect wallet/ }).first().click();
  await expect(page.getByText("0x7A00…2f1A").first()).toBeVisible();
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
  await page.goto("/");
  const legal = page.getByRole("navigation", { name: "Legal" });
  await legal.getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  await page.getByRole("navigation", { name: "Legal" }).getByRole("link", { name: "Terms of Use" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeVisible();
});

test("saving an app shows it under Saved and survives a reload", async ({ page }) => {
  await page.goto("/apps");
  await page.getByRole("button", { name: "Save Aave" }).click();
  await expect(page.getByRole("button", { name: "Remove Aave" })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page.getByRole("button", { name: /^Saved/ }).click();
  await expect(page.getByRole("link", { name: /Aave/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Uniswap/ })).toHaveCount(0);
});

test("sorting A–Z orders apps by name", async ({ page }) => {
  await page.goto("/apps");
  await page.getByLabel("Sort apps").selectOption("az");
  const names = await page.locator(".app-card h3").allTextContents();
  expect(names.length).toBeGreaterThan(3);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
});

test("passport lookup validates the address", async ({ page }) => {
  await page.goto("/passport");
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
  await page.goto("/overview");
  await expect(page.getByRole("heading", { name: "What things cost on Arc" })).toBeVisible();
  await page.getByLabel("How many times").fill("500");
  await expect(page.getByText("500 times")).toBeVisible();
});

test("share images render", async ({ request }) => {
  const home = await request.get("/opengraph-image");
  expect(home.status()).toBe(200);
  expect(home.headers()["content-type"]).toContain("image/png");
});
