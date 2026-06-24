// test/keybindings.test.js
import { test, expect } from "bun:test";
import { handleKey } from "../terminal-keys.js";
import { CommandHistory } from "../terminal.js";

function setup(value = "") {
  document.body.innerHTML = `<div id="output"></div><input id="prompt-input" />`;
  const input = document.getElementById("prompt-input");
  input.value = value;
  const ctx = {
    doc: document,
    cwd: [],
    history: new CommandHistory(),
    storage: { getItem: () => null, setItem: () => {} },
    setHash: () => {},
  };
  input.addEventListener("keydown", (e) => handleKey(ctx, input, e));
  return { ctx, input };
}

function press(input, key, opts = {}) {
  const e = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...opts,
  });
  input.dispatchEvent(e);
  return e;
}

test("Tab completes a unique command prefix", () => {
  const { input } = setup("neo");
  press(input, "Tab");
  expect(input.value).toBe("neofetch ");
});

test("Ctrl+L clears the output log", () => {
  const { input } = setup("");
  document.getElementById("output").innerHTML = "<p>stuff</p>";
  press(input, "l", { ctrlKey: true });
  expect(document.getElementById("output").innerHTML).toBe("");
});

test("Ctrl+U clears the current line", () => {
  const { input } = setup("half-typed");
  press(input, "u", { ctrlKey: true });
  expect(input.value).toBe("");
});

test("Ctrl+C echoes ^C and clears the line", () => {
  const { input } = setup("oops");
  press(input, "c", { ctrlKey: true });
  expect(input.value).toBe("");
  expect(document.getElementById("output").textContent).toContain("^C");
});

test("ArrowUp recalls the previous command", () => {
  const { ctx, input } = setup("");
  ctx.history.add("about");
  press(input, "ArrowUp");
  expect(input.value).toBe("about");
});
