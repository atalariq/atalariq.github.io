import { test, expect } from "bun:test";
import { escapeHtml } from "../terminal.js";

test("escapes angle brackets and ampersands", () => {
  expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  expect(escapeHtml("a & b")).toBe("a &amp; b");
});

test("escapes quotes", () => {
  expect(escapeHtml(`"x" 'y'`)).toBe("&quot;x&quot; &#39;y&#39;");
});

test("leaves plain text untouched", () => {
  expect(escapeHtml("hello world")).toBe("hello world");
});
