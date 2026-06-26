// End-to-end: drive the real site in a real browser. Runs at desktop and
// mobile viewports (see playwright.config.js) so the same assertions double as
// responsiveness checks.
import { test, expect } from "@playwright/test";

const NAME = "Atalariq Barra Hadinugraha";

/** Type a command into the live prompt and submit it. */
async function run(page, cmd) {
  const input = page.locator("#prompt-input");
  await input.click();
  await input.fill(cmd);
  await input.press("Enter");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
  // Boot runs `whoami`; wait for its output before asserting anything.
  await expect(page.locator("#output")).toContainText(NAME);
});

test("there is exactly one prompt, and it lives inside the scroll log", async ({
  page,
}) => {
  await expect(page.locator("#prompt-input")).toHaveCount(1);
  await expect(page.locator("#screen #prompt-form")).toHaveCount(1);
});

test("the prompt follows the output instead of being pinned to the bottom", async ({
  page,
}) => {
  const outputBox = await page.locator("#output").boundingBox();
  const promptBox = await page.locator("#prompt-form").boundingBox();
  // The prompt sits just below the output, not floating far beneath it.
  const gap = promptBox.y - (outputBox.y + outputBox.height);
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThan(40);
});

test("running a command appends output and the prompt drops below it", async ({
  page,
}) => {
  const before = (await page.locator("#prompt-form").boundingBox()).y;
  await run(page, "help");
  await expect(page.locator("#output")).toContainText("available commands");
  const after = (await page.locator("#prompt-form").boundingBox()).y;
  expect(after).toBeGreaterThan(before);
});

test("linktree renders a tree with clickable links", async ({ page }) => {
  await run(page, "linktree");
  const tree = page.locator("pre.tree");
  await expect(tree).toBeVisible();
  await expect(tree).toContainText("├──");
  await expect(tree).toContainText("└──");
  const gh = tree.locator('a[href="https://github.com/atalariq"]');
  await expect(gh).toBeVisible();
  await expect(gh).toHaveText("github.com/atalariq");
  await expect(page.locator('[data-tab="linktree"]')).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("projects renders a long listing with descriptions", async ({ page }) => {
  await run(page, "projects");
  const long = page.locator("pre.long");
  await expect(long).toBeVisible();
  await expect(long).toContainText("-rw-r--r--");
  await expect(long).toContainText("dotfiles");
  await expect(long).toContainText("symlink script");
});

test("clicking a tab prints its section and highlights it", async ({
  page,
}) => {
  await page.locator('[data-tab="vision"]').click();
  await expect(page.locator("#output")).toContainText("vision");
  await expect(page.locator('[data-tab="vision"]')).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("wide output never forces horizontal page scroll", async ({ page }) => {
  // Exercise the widest views, then assert the page itself doesn't scroll
  // sideways at whatever viewport this project runs.
  for (const cmd of ["linktree", "projects", "neofetch"]) {
    await run(page, cmd);
  }
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement;
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
});

test("the prompt is a two-line starship prompt that tracks cwd", async ({
  page,
}) => {
  await expect(page.locator("#prompt-char")).toHaveText("❯");
  await expect(page.locator("#prompt-info")).toContainText("atalariq");
  await expect(page.locator("#prompt-info")).toContainText("main");
  await run(page, "cd projects");
  await expect(page.locator("#prompt-info .seg-dir")).toHaveText("~/projects");
});

test("the prompt caret turns red after an error, green after success", async ({
  page,
}) => {
  await run(page, "definitely-not-a-command");
  await expect(page.locator("#prompt-char")).toHaveClass(/is-error/);
  await run(page, "help");
  await expect(page.locator("#prompt-char")).not.toHaveClass(/is-error/);
});

test("the theme toggle flips and persists across reload", async ({ page }) => {
  await page.locator("#theme-toggle").click();
  const after = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
  await page.reload();
  await expect(page.locator("#output")).toContainText("Atalariq");
  const persisted = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
  expect(persisted).toBe(after);
});
