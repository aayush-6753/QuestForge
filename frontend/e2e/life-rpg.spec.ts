import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test("authenticated journey persists through refresh and relogin", async ({ page }) => {
  test.skip(!email || !password, "E2E_EMAIL and E2E_PASSWORD are required.");
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/auth");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Adventurer Dashboard" })).toBeVisible();

  const displayName = `E2E ${Date.now()}`;
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByLabel("Display name").fill(displayName);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: displayName })).toBeVisible();

  const questTitle = `E2E quest ${Date.now()}`;
  await page.getByRole("button", { name: "New quest" }).click();
  await page.getByLabel("Title").fill(questTitle);
  await page.getByLabel("Difficulty").selectOption("EPIC");
  await page.getByRole("button", { name: "Save quest" }).click();
  const quest = page.getByRole("heading", { name: questTitle }).locator("..").locator("..");
  await expect(page.getByRole("heading", { name: questTitle })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await quest.getByRole("button", { name: "Complete" }).click();
  await expect(page.getByRole("status")).toContainText("Quest complete");
  await expect(page.getByText("Quest completed").first()).toBeVisible();

  const shopItem = page.getByRole("listitem").filter({ hasText: "Wanderer's Cloak" });
  const buy = shopItem.getByRole("button", { name: "20 gold" });
  if (await buy.isVisible().catch(() => false)) {
    await buy.click();
    await expect(shopItem.getByRole("button", { name: "Equip", exact: true })).toBeVisible();
  }
  const equip = shopItem.getByRole("button", { name: "Equip", exact: true });
  if (await equip.isVisible().catch(() => false)) await equip.click();
  await expect(shopItem.getByRole("button", { name: "Unequip" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: displayName })).toBeVisible();
  await page.getByRole("button", { name: "Inventory" }).click();
  const inventoryItem = page.locator("#shop").getByRole("listitem").filter({ hasText: "Wanderer's Cloak" });
  await expect(inventoryItem).toBeVisible();
  await expect(inventoryItem.getByRole("button", { name: "Unequip" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/auth/);
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: displayName })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
