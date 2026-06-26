// test/commands.test.js
import { test, expect } from "bun:test";
import { tokenize, runCommand } from "../commands.js";
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
    now: () => new Date("2026-06-24T10:00:00Z"),
    rand: () => 0,
  };
}

test("tokenize splits cmd + args, lowercases the command, null on empty", () => {
  expect(tokenize("  Ls projects ")).toEqual({
    cmd: "ls",
    args: ["projects"],
    raw: "Ls projects",
  });
  expect(tokenize("   ")).toBeNull();
});

test("empty input runs to null (no echo / history)", () => {
  expect(runCommand("", env())).toBeNull();
});

test("ls lists the cwd; dirs get a trailing slash", () => {
  const d = runCommand("ls", env());
  expect(d.html).toContain("about.md");
  expect(d.html).toContain("projects/");
});

test("ls projects sets the projects tab", () => {
  const d = runCommand("ls projects", env());
  expect(d.tab).toBe("projects");
  expect(d.html).toContain("dotfiles");
});

test("ls -l projects shows a long listing with a mode and description", () => {
  const d = runCommand("ls -l projects", env());
  expect(d.tab).toBe("projects");
  expect(d.html).toContain("-rw-r--r--");
  expect(d.html).toContain("dotfiles");
  expect(d.html).toContain("symlink script");
});

test("tree links draws branches with clickable urls and the linktree tab", () => {
  const d = runCommand("tree links", env());
  expect(d.tab).toBe("linktree");
  expect(d.html).toContain("├──");
  expect(d.html).toContain("└──");
  expect(d.html).toContain('href="https://github.com/atalariq"');
  expect(d.html).toContain("9 files");
});

test("tree of a file errors", () => {
  expect(runCommand("tree about.md", env()).error).toContain("Not a directory");
});

test("ls of a missing path errors", () => {
  expect(runCommand("ls nope", env()).error).toContain("no such file");
});

test("cat about.md prints content and sets the about tab", () => {
  const d = runCommand("cat about.md", env());
  expect(d.html).toContain("Atalariq Barra Hadinugraha");
  expect(d.tab).toBe("about");
});

test("cat of a directory errors", () => {
  expect(runCommand("cat projects", env()).error).toContain("Is a directory");
});

test("cd changes cwd and reflects in pwd", () => {
  const d = runCommand("cd projects", env());
  expect(d.cd).toEqual(["projects"]);
  expect(d.tab).toBe("projects");
  expect(runCommand("pwd", env(["projects"])).html).toContain("~/projects");
});

test("cd into a file errors", () => {
  expect(runCommand("cd about.md", env()).error).toContain("not a directory");
});

test("a section alias resolves to its canonical command", () => {
  const d = runCommand("linktree", env());
  expect(d.tab).toBe("linktree");
  expect(d.html).toContain("github");
});

test("unknown command reports the command word", () => {
  expect(runCommand("banana split", env()).error).toBe(
    "command not found: banana",
  );
});
