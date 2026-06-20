import { test, expect } from "bun:test";
import {
  profile,
  links,
  projects,
  tabs,
  builtins,
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

test("builtins include help, clear, neofetch, fastfetch", () => {
  for (const b of ["help", "clear", "neofetch", "fastfetch"]) {
    expect(builtins).toContain(b);
  }
});

test("links each have a name and an absolute url", () => {
  expect(links.length).toBeGreaterThan(0);
  for (const l of links) {
    expect(typeof l.name).toBe("string");
    expect(l.url).toMatch(/^https?:\/\//);
  }
});

test("projects each have name, desc, and tags array", () => {
  expect(projects.length).toBeGreaterThan(0);
  for (const p of projects) {
    expect(typeof p.name).toBe("string");
    expect(typeof p.desc).toBe("string");
    expect(Array.isArray(p.tags)).toBe(true);
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
