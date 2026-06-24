import { test, expect, beforeAll } from "bun:test";

let html;
beforeAll(async () => {
  html = await Bun.file(new URL("../index.html", import.meta.url)).text();
});

function dom() {
  document.documentElement.innerHTML = html
    .replace(/<!DOCTYPE html>/i, "")
    .replace(/<\/?html[^>]*>/gi, "");
  return document;
}

test("has a meta description and og:image", () => {
  expect(html).toMatch(/name="description"/);
  expect(html).toMatch(/property="og:image"/);
});

test("has a tab button for each of the five tabs", () => {
  const doc = dom();
  for (const t of ["about", "linktree", "projects", "vision", "contact"]) {
    expect(doc.querySelector(`[data-tab="${t}"]`)).not.toBeNull();
  }
});

test("has the prompt input, output log, and boot-command span", () => {
  const doc = dom();
  expect(doc.getElementById("prompt-input")).not.toBeNull();
  expect(doc.getElementById("output")).not.toBeNull();
  expect(doc.getElementById("boot-command")).not.toBeNull();
});

test("tab buttons and prompt input have aria labels/roles", () => {
  const doc = dom();
  expect(doc.querySelector('[role="tablist"]')).not.toBeNull();
  expect(
    doc.getElementById("prompt-input").getAttribute("aria-label"),
  ).toBeTruthy();
});

test("ships a no-FOUC theme script and dual color-scheme", () => {
  expect(html).toMatch(/localStorage\.getItem\("theme"\)/);
  expect(html).toMatch(/content="dark light"/);
});

test("content.js exposes the real outbound links", async () => {
  const { links } = await import("../content.js");
  const urls = links.map((l) => l.url).join(" ");
  expect(urls).toContain("github.com/atalariq");
  expect(urls).toContain("linkedin.com/in/atalariq");
});
