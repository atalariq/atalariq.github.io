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

test("resume assembles a CV from profile, bio, projects, and links", () => {
  const d = runCommand("resume", env());
  expect(d.html).toContain("Atalariq Barra Hadinugraha");
  expect(d.html).toContain("UGM Sekolah Vokasi");
  expect(d.html).toContain("wana");
  expect(d.html).toContain("hi@atalariq.dev");
  expect(d.html).toContain("github.com/atalariq");
});

test("cv is an alias for resume", () => {
  expect(runCommand("cv", env()).html).toContain("Atalariq Barra Hadinugraha");
});

test("cheat git renders a local cheatsheet", () => {
  const d = runCommand("cheat git", env());
  expect(d.html).toContain("git status");
  expect(d.html).toContain("<pre");
});

test("cheat with no topic lists the local topics", () => {
  expect(runCommand("cheat", env()).html).toContain("git");
});

test("cheat for an unknown topic links out to cht.sh", () => {
  const d = runCommand("cheat kubernetes", env());
  expect(d.html).toContain("cht.sh/kubernetes");
  expect(d.html).toContain('target="_blank"');
});
