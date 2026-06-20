import { test, expect } from "bun:test";
import { normalizeHash } from "../terminal.js";

const tabs = ["about", "linktree", "projects", "vision", "contact"];

test("a valid '#tab' hash returns that tab", () => {
  expect(normalizeHash("#projects", tabs, "about")).toBe("projects");
});

test("a '#/tab' hash (leading slash) also works", () => {
  expect(normalizeHash("#/vision", tabs, "about")).toBe("vision");
});

test("hash matching is case-insensitive", () => {
  expect(normalizeHash("#Contact", tabs, "about")).toBe("contact");
});

test("empty or missing hash returns the default tab", () => {
  expect(normalizeHash("", tabs, "about")).toBe("about");
  expect(normalizeHash(undefined, tabs, "about")).toBe("about");
});

test("an unknown hash returns the default tab", () => {
  expect(normalizeHash("#nope", tabs, "about")).toBe("about");
});
