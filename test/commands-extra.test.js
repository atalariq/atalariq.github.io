// test/commands-extra.test.js
import { test, expect } from "bun:test";
import { runCommand, renderNeofetch } from "../commands.js";
import { tree } from "../content.js";
import { profile, systemInfo, helpText } from "../data.js";

function env(cwd = []) {
  return {
    root: tree,
    cwd,
    profile,
    systemInfo,
    helpText,
    history: { entries: ["about"], add() {} },
    now: () => new Date("2026-06-24T10:00:00Z"),
    rand: () => 0,
  };
}

test("whoami prints the name", () => {
  expect(runCommand("whoami", env()).html).toContain("Atalariq");
});

test("help prints the help text", () => {
  expect(runCommand("help", env()).html).toContain("available commands");
});

test("clear returns a clear descriptor", () => {
  expect(runCommand("clear", env())).toEqual({ clear: true });
});

test("neofetch / fastfetch print system info", () => {
  expect(runCommand("neofetch", env()).html).toContain("atalariq@portfolio");
  expect(runCommand("fastfetch", env()).html).toContain("atalariq@portfolio");
});

test("history prints prior commands", () => {
  expect(runCommand("history", env()).html).toContain("about");
});

test("echo prints (escaped) args", () => {
  expect(runCommand("echo hi there", env()).html).toContain("hi there");
  expect(runCommand("echo <b>x</b>", env()).html).toContain("&lt;b&gt;");
});

test("date prints a date string from env.now", () => {
  expect(runCommand("date", env()).html).toContain("2026");
});

test("uname -a is longer than bare uname", () => {
  const a = runCommand("uname", env()).html;
  const b = runCommand("uname -a", env()).html;
  expect(b.length).toBeGreaterThan(a.length);
});

test("theme returns a theme descriptor; bad mode errors", () => {
  expect(runCommand("theme light", env()).theme).toBe("light");
  expect(runCommand("theme", env()).theme).toBe("toggle");
  expect(runCommand("theme purple", env()).error).toContain("usage");
});

test("easter eggs return output", () => {
  expect(runCommand("sudo make me a sandwich", env()).html).toContain(
    "sudoers",
  );
  expect(runCommand("vim", env()).html.toLowerCase()).toContain("q");
  expect(typeof runCommand("sl", env()).html).toBe("string");
  expect(runCommand("cowsay moo", env()).html).toContain("moo");
  expect(typeof runCommand("fortune", env()).html).toBe("string");
  expect(typeof runCommand("exit", env()).html).toBe("string");
});
