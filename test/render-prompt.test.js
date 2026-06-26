import { test, expect } from "bun:test";
import { renderPromptInfo } from "../terminal.js";

test("renderPromptInfo shows user, home directory, and git branch", () => {
  const html = renderPromptInfo("atalariq", []);
  expect(html).toContain("atalariq");
  expect(html).toContain("seg-dir");
  expect(html).toContain("~");
  expect(html).toContain("main");
});

test("renderPromptInfo reflects a nested cwd", () => {
  expect(renderPromptInfo("atalariq", ["projects"])).toContain("~/projects");
});

test("renderPromptInfo escapes the user", () => {
  expect(renderPromptInfo("<b>x</b>", [])).toContain("&lt;b&gt;");
});
