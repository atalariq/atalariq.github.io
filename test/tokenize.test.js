// test/tokenize.test.js
import { test, expect } from "bun:test";
import { tokenize } from "../commands.js";

test("empty / whitespace input tokenizes to null", () => {
  expect(tokenize("")).toBeNull();
  expect(tokenize("   ")).toBeNull();
});

test("a bare word tokenizes to a command with no args", () => {
  expect(tokenize("about")).toEqual({ cmd: "about", args: [], raw: "about" });
});

test("the command is lowercased; whitespace trimmed/collapsed", () => {
  expect(tokenize("  CAT   about.md ")).toEqual({
    cmd: "cat",
    args: ["about.md"],
    raw: "CAT   about.md",
  });
});
