import { test, expect, beforeEach } from "bun:test";
import { bootstrap } from "../terminal.js";

const FIXTURE = `
  <main id="terminal">
    <span class="window-title">atalariq@portfolio</span>
    <button id="theme-toggle" aria-pressed="true"></button>
    <nav>
      <button data-tab="about" aria-selected="true"></button>
      <button data-tab="projects" aria-selected="false"></button>
      <button data-tab="vision" aria-selected="false"></button>
    </nav>
    <div class="screen" id="screen">
      <div id="output"></div>
      <form id="prompt-form" class="promptbar">
        <div class="prompt-info" id="prompt-info"></div>
        <div class="prompt-line">
          <label class="prompt-char" id="prompt-char">❯</label>
          <input id="prompt-input" />
        </div>
      </form>
    </div>
  </main>
`;

function fakeWindow(hash = "") {
  const listeners = {};
  return {
    location: { hash },
    history: {
      replaceState: (_a, _b, url) => {
        listeners._url = url;
      },
    },
    addEventListener: (evt, fn) => {
      listeners[evt] = fn;
    },
    _listeners: listeners,
  };
}

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
});

test("submitting a command executes it and clears the input", () => {
  const win = fakeWindow("");
  bootstrap({ win, doc: document, typewriter: false });
  const input = document.getElementById("prompt-input");
  input.value = "projects";
  document
    .getElementById("prompt-form")
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  expect(
    document
      .querySelector('[data-tab="projects"]')
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(input.value).toBe("");
});

test("initial hash highlights the matching tab and prints its section", () => {
  const win = fakeWindow("#projects");
  bootstrap({ win, doc: document, typewriter: false });
  expect(
    document
      .querySelector('[data-tab="projects"]')
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(document.getElementById("output").textContent).toContain("dotfiles");
});

test("ArrowUp recalls the previous command", () => {
  const win = fakeWindow("");
  bootstrap({ win, doc: document, typewriter: false });
  const input = document.getElementById("prompt-input");
  const form = document.getElementById("prompt-form");
  input.value = "about";
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
  );
  expect(input.value).toBe("about");
});

test("ArrowDown past the newest clears the input", () => {
  const win = fakeWindow("");
  bootstrap({ win, doc: document, typewriter: false });
  const input = document.getElementById("prompt-input");
  const form = document.getElementById("prompt-form");
  input.value = "about";
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
  );
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(input.value).toBe("");
});

test("hashchange routes to the new tab", () => {
  const win = fakeWindow("");
  bootstrap({ win, doc: document, typewriter: false });
  win.location.hash = "#vision";
  win._listeners.hashchange();
  expect(
    document.querySelector('[data-tab="vision"]').getAttribute("aria-selected"),
  ).toBe("true");
});

test("clicking a tab button highlights it and sets the hash", () => {
  const win = fakeWindow("");
  bootstrap({ win, doc: document, typewriter: false });
  document.querySelector('[data-tab="projects"]').click();
  expect(
    document
      .querySelector('[data-tab="projects"]')
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(win._listeners._url).toBe("#projects");
});

test("click in #terminal focuses the prompt input", () => {
  const win = fakeWindow("");
  bootstrap({ win, doc: document, typewriter: false });
  const input = document.getElementById("prompt-input");
  let focusCalled = false;
  input.focus = () => {
    focusCalled = true;
  };
  document
    .querySelector('[data-tab="about"]')
    .dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(focusCalled).toBe(true);
});
