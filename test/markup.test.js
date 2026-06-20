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
  const tabs = ["about", "linktree", "projects", "vision", "contact"];
  for (const t of tabs) {
    expect(doc.querySelector(`[data-tab="${t}"]`)).not.toBeNull();
  }
});

test("has a content pane for each of the five tabs", () => {
  const doc = dom();
  const tabs = ["about", "linktree", "projects", "vision", "contact"];
  for (const t of tabs) {
    expect(doc.querySelector(`[data-pane="${t}"]`)).not.toBeNull();
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

test("linktree pane contains the real outbound links", () => {
  expect(html).toContain("github.com/atalariq");
  expect(html).toContain("linkedin.com/in/atalariq");
});

test("each pane's aria-labelledby resolves to an existing tab button id", () => {
  const doc = dom();
  for (const t of ["about", "linktree", "projects", "vision", "contact"]) {
    const pane = doc.querySelector(`[data-pane="${t}"]`);
    const labelledBy = pane.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    // the referenced id must exist in the document (no dangling ARIA reference)
    expect(doc.getElementById(labelledBy)).not.toBeNull();
  }
});
