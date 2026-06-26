import { test, expect, beforeEach } from "bun:test";
import { executeCommand, CommandHistory } from "../terminal.js";
import { systemInfo, helpText } from "../data.js";

function makeCtx() {
  document.body.innerHTML = `
    <button data-tab="about" aria-selected="true"></button>
    <button data-tab="projects" aria-selected="false"></button>
    <span class="window-title">atalariq@portfolio</span>
    <div id="output"></div>
    <div id="prompt-info"></div>
    <span id="prompt-char">❯</span>
  `;
  const hashes = [];
  return {
    ctx: {
      doc: document,
      cwd: [],
      history: new CommandHistory(),
      systemInfo,
      helpText,
      storage: { getItem: () => null, setItem: () => {} },
      setHash: (name) => hashes.push(name),
    },
    hashes,
  };
}

beforeEach(() => {
  document.body.innerHTML = "";
});

test("a section command highlights its tab and sets the hash", () => {
  const { ctx, hashes } = makeCtx();
  executeCommand(ctx, "projects");
  expect(
    document
      .querySelector('[data-tab="projects"]')
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(hashes).toContain("projects");
});

test("cat about.md prints content into the log", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "cat about.md");
  expect(document.getElementById("output").textContent).toContain("Atalariq");
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

test("cd updates the prompt directory segment to the new cwd", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "cd projects");
  expect(document.querySelector("#prompt-info .seg-dir").textContent).toBe(
    "~/projects",
  );
});

test("the prompt char goes red after an error and green after success", () => {
  const { ctx } = makeCtx();
  executeCommand(ctx, "banana");
  expect(
    document.getElementById("prompt-char").classList.contains("is-error"),
  ).toBe(true);
  executeCommand(ctx, "help");
  expect(
    document.getElementById("prompt-char").classList.contains("is-error"),
  ).toBe(false);
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
