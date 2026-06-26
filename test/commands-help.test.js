import { test, expect } from "bun:test";
import { runCommand } from "../commands.js";
import { tree } from "../content.js";
import { profile, systemInfo, helpText } from "../data.js";

function env(cwd = []) {
  return {
    root: tree,
    cwd,
    profile,
    systemInfo,
    helpText,
    history: { entries: [], add() {} },
    now: () => new Date(),
    rand: () => 0,
  };
}

test("man prints usage and summary for a known command", () => {
  const d = runCommand("man ls", env());
  expect(d.html).toContain("ls");
  expect(d.html).toContain("list directory contents");
  expect(d.html).toContain("ls [-l] [path]");
});

test("man with no arg hints the usage", () => {
  expect(runCommand("man", env()).html).toContain("man");
});

test("man of an unknown command errors", () => {
  expect(runCommand("man zzz", env()).error).toContain("No manual entry");
});

test("whatis gives a one-line summary", () => {
  expect(runCommand("whatis tree", env()).html).toContain(
    "list a directory as a tree",
  );
});

test("whatis of an unknown command errors", () => {
  expect(runCommand("whatis zzz", env()).error).toContain(
    "nothing appropriate",
  );
});

test("repo links to the site source", () => {
  expect(runCommand("repo", env()).html).toContain(
    "github.com/atalariq/atalariq.github.io",
  );
});
