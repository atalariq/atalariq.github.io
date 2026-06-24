// test/complete.test.js
import { test, expect } from "bun:test";
import { complete, commandNames } from "../commands.js";
import { tree } from "../content.js";

const env = (cwd = []) => ({ root: tree, cwd });

test("commandNames includes core commands and section aliases", () => {
  const names = commandNames();
  expect(names).toContain("ls");
  expect(names).toContain("neofetch");
  expect(names).toContain("about");
});

test("single unique command prefix completes with a trailing space", () => {
  expect(complete("neo", env()).value).toBe("neofetch ");
});

test("ambiguous command prefix completes the common prefix + lists candidates", () => {
  const r = complete("c", env());
  expect(r.candidates.length).toBeGreaterThan(1);
  expect(r.candidates).toContain("cat");
});

test("argument completion lists entries in the cwd", () => {
  const r = complete("cat ab", env());
  expect(r.value).toBe("cat about.md ");
});

test("argument completion descends a dir prefix", () => {
  const r = complete("cat projects/dot", env());
  expect(r.value).toBe("cat projects/dotfiles ");
});

test("a directory candidate completes with a trailing slash, no space", () => {
  const r = complete("ls proj", env());
  expect(r.value).toBe("ls projects/");
});

test("no match leaves the input unchanged", () => {
  expect(complete("zzz", env()).value).toBe("zzz");
});
