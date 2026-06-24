// test/theme.test.js
import { test, expect } from "bun:test";
import { executeCommand, CommandHistory } from "../terminal.js";
import { systemInfo, helpText } from "../data.js";

function makeCtx() {
  document.body.innerHTML = `<span class="prompt-label">x</span><div id="output"></div>`;
  document.documentElement.setAttribute("data-theme", "dark");
  const store = {};
  return {
    doc: document,
    cwd: [],
    history: new CommandHistory(),
    systemInfo,
    helpText,
    storage: {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => (store[k] = v),
    },
    setHash: () => {},
    _store: store,
  };
}

test("theme light sets data-theme and persists", () => {
  const ctx = makeCtx();
  executeCommand(ctx, "theme light");
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(ctx._store.theme).toBe("light");
});

test("theme toggle flips dark→light", () => {
  const ctx = makeCtx();
  executeCommand(ctx, "theme toggle");
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
});

test("theme with a bad mode prints an error and does not change the theme", () => {
  const ctx = makeCtx();
  executeCommand(ctx, "theme banana");
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(document.querySelector("#output .err").textContent).toContain("usage");
});
