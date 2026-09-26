import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["/", "/overview", "/apps", "/apps/uniswap", "/quests", "/quests/first-tx", "/builders", "/passport"];

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
