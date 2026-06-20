import { test, expect } from "bun:test";
import { resolveCommand } from "../terminal.js";

const cfg = {
  tabs: ["about", "linktree", "projects", "vision", "contact"],
  builtins: ["help", "clear", "neofetch", "fastfetch"],
};

test("empty / whitespace input resolves to empty", () => {
  expect(resolveCommand("", cfg)).toEqual({ type: "empty" });
  expect(resolveCommand("   ", cfg)).toEqual({ type: "empty" });
});

test("a tab name resolves to a tab action", () => {
  expect(resolveCommand("projects", cfg)).toEqual({
    type: "tab",
    name: "projects",
  });
});

test("resolution is case-insensitive and trims whitespace", () => {
  expect(resolveCommand("  ABOUT ", cfg)).toEqual({
    type: "tab",
    name: "about",
  });
});

test("a builtin resolves to a builtin action", () => {
  expect(resolveCommand("help", cfg)).toEqual({
    type: "builtin",
    name: "help",
  });
  expect(resolveCommand("neofetch", cfg)).toEqual({
    type: "builtin",
    name: "neofetch",
  });
});

test("anything else resolves to unknown with the trimmed original input", () => {
  expect(resolveCommand("  sudo rm ", cfg)).toEqual({
    type: "unknown",
    input: "sudo rm",
  });
});
