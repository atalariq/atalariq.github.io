import { test, expect } from "bun:test";
import { renderNeofetch } from "../terminal.js";
import { profile, systemInfo } from "../data.js";

test("output contains the user@host title", () => {
  const html = renderNeofetch(profile, systemInfo);
  expect(html).toContain("atalariq@portfolio");
});

test("output includes every systemInfo value", () => {
  const html = renderNeofetch(profile, systemInfo);
  for (const value of Object.values(systemInfo)) {
    expect(html).toContain(value);
  }
});

test("output escapes html in values", () => {
  const html = renderNeofetch(profile, { evil: "<b>x</b>" });
  expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
  expect(html).not.toContain("<b>x</b>");
});

test("returns a single html string", () => {
  expect(typeof renderNeofetch(profile, systemInfo)).toBe("string");
});
