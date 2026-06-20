import { test, expect, beforeEach } from "bun:test";
import { bootstrap } from "../terminal.js";

const FIXTURE = `
  <nav>
    <button data-tab="about" aria-selected="true"></button>
    <button data-tab="projects" aria-selected="false"></button>
  </nav>
  <div class="screen" id="screen">
    <section data-pane="about"><span id="boot-command"></span></section>
    <section data-pane="projects" hidden></section>
    <div id="output"></div>
  </div>
  <form id="prompt-form"><input id="prompt-input" /></form>
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

test("typing a command in the input and submitting executes it", () => {
  const win = fakeWindow("");
  bootstrap({ win, doc: document, typewriter: false });
  const input = document.getElementById("prompt-input");
  input.value = "projects";
  document
    .getElementById("prompt-form")
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  expect(document.querySelector('[data-pane="projects"]').hidden).toBe(false);
  expect(input.value).toBe(""); // input cleared after submit
});

test("initial hash routes to the matching tab on load", () => {
  const win = fakeWindow("#projects");
  bootstrap({ win, doc: document, typewriter: false });
  expect(document.querySelector('[data-pane="projects"]').hidden).toBe(false);
});

test("ArrowUp recalls the previous command into the input", () => {
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
