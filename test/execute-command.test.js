import { test, expect, beforeEach } from "bun:test";
import { executeCommand, CommandHistory } from "../terminal.js";
import { tabs, builtins, profile, helpText, systemInfo } from "../data.js";

function makeCtx() {
  document.body.innerHTML = `
    <button data-tab="about" aria-selected="true"></button>
    <button data-tab="projects" aria-selected="false"></button>
    <section data-pane="about"></section>
    <section data-pane="projects" hidden></section>
    <div id="output"></div>
  `;
  const hashes = [];
  return {
    ctx: {
      doc: document,
      tabs,
      builtins,
      profile,
      helpText,
      systemInfo,
      history: new CommandHistory(),
      promptStr: "atalariq@portfolio:~$",
      setHash: (name) => hashes.push(name),
    },
    hashes,
  };
}

beforeEach(() => {
  document.body.innerHTML = "";
});

test("a tab command switches the pane and updates the hash", () => {
  const { ctx, hashes } = makeCtx();
  executeCommand(ctx, "projects");
  expect(document.querySelector('[data-pane="projects"]').hidden).toBe(false);
  expect(hashes).toContain("projects");
});

test("help prints the help text", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "help");
  expect(document.getElementById("output").textContent).toContain(
    "available commands",
  );
});

test("neofetch prints system info", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "neofetch");
  expect(document.getElementById("output").textContent).toContain(
    "atalariq@portfolio",
  );
});

test("clear empties the output log", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "help");
  executeCommand(ctx, "clear");
  expect(document.getElementById("output").innerHTML).toBe("");
});

test("unknown command prints a red command-not-found error", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "banana");
  const err = document.querySelector("#output .err");
  expect(err).not.toBeNull();
  expect(err.textContent).toContain("command not found: banana");
});

test("an executed command is recorded in history", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "about");
  expect(ctx.history.prev()).toBe("about");
});

test("empty input is ignored (no echo, no history)", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "   ");
  expect(document.getElementById("output").innerHTML).toBe("");
  expect(ctx.history.prev()).toBe(null);
});
