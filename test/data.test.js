import { test, expect } from "bun:test";
import {
  profile,
  tabs,
  sectionCommands,
  helpText,
  systemInfo,
} from "../data.js";

test("profile has user and host for the prompt", () => {
  expect(profile.user).toBe("atalariq");
  expect(profile.host).toBe("portfolio");
  expect(typeof profile.name).toBe("string");
});

test("tabs are exactly the five spec tabs in order", () => {
  expect(tabs).toEqual(["about", "linktree", "projects", "vision", "contact"]);
});

test("every tab has a canonical section command", () => {
  for (const t of tabs) {
    expect(typeof sectionCommands[t]).toBe("string");
    expect(sectionCommands[t].length).toBeGreaterThan(0);
  }
});

test("helpText is a non-empty array of strings", () => {
  expect(Array.isArray(helpText)).toBe(true);
  expect(helpText.length).toBeGreaterThan(0);
  for (const line of helpText) expect(typeof line).toBe("string");
});

test("systemInfo is a non-empty key/value object", () => {
  expect(Object.keys(systemInfo).length).toBeGreaterThan(0);
});
