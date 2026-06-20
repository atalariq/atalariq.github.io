// Integration test: drive the REAL index.html markup through the REAL bootstrap.
// Catches wiring mismatches between markup DOM hooks and terminal.js that
// fixture-based unit tests can't (e.g. a renamed id, a missing pane).
import { test, expect, beforeEach } from "bun:test";
import { bootstrap } from "../terminal.js";

let html;

async function loadRealIndex() {
  if (!html) {
    html = await Bun.file(new URL("../index.html", import.meta.url)).text();
  }
  document.documentElement.innerHTML = html
    .replace(/<!DOCTYPE html>/i, "")
    .replace(/<\/?html[^>]*>/gi, "")
    // strip the inline bootstrap module so it doesn't double-init
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}

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

function submit(value) {
  const input = document.getElementById("prompt-input");
  input.value = value;
  document
    .getElementById("prompt-form")
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

beforeEach(async () => {
  await loadRealIndex();
});

test("boots with the about pane visible by default", () => {
  bootstrap({ win: fakeWindow(""), doc: document, typewriter: false });
  expect(document.querySelector('[data-pane="about"]').hidden).toBe(false);
  expect(document.querySelector('[data-pane="projects"]').hidden).toBe(true);
});

test("typing each tab name switches to that real pane", () => {
  bootstrap({ win: fakeWindow(""), doc: document, typewriter: false });
  for (const tab of ["linktree", "projects", "vision", "contact", "about"]) {
    submit(tab);
    expect(document.querySelector(`[data-pane="${tab}"]`).hidden).toBe(false);
  }
});

test("help, neofetch, clear, and unknown all work against the real output log", () => {
  bootstrap({ win: fakeWindow(""), doc: document, typewriter: false });
  const out = document.getElementById("output");

  submit("help");
  expect(out.textContent).toContain("available commands");

  submit("neofetch");
  expect(out.textContent).toContain("atalariq@portfolio");

  submit("clear");
  expect(out.innerHTML).toBe("");

  submit("definitely-not-a-command");
  expect(out.querySelector(".err").textContent).toContain(
    "command not found: definitely-not-a-command",
  );
});

test("clicking a real tab button switches panes", () => {
  bootstrap({ win: fakeWindow(""), doc: document, typewriter: false });
  document.querySelector('[data-tab="vision"]').click();
  expect(document.querySelector('[data-pane="vision"]').hidden).toBe(false);
});

test("deep-linking via initial hash opens the right pane", () => {
  bootstrap({ win: fakeWindow("#contact"), doc: document, typewriter: false });
  expect(document.querySelector('[data-pane="contact"]').hidden).toBe(false);
});

test("the boot typewriter fills #boot-command with 'whoami'", async () => {
  // synchronous scheduler so the typewriter completes immediately
  bootstrap({
    win: fakeWindow(""),
    doc: document,
    schedule: (fn) => fn(),
  });
  // allow the playBoot promise microtasks to flush
  await Promise.resolve();
  await Promise.resolve();
  expect(document.getElementById("boot-command").textContent).toBe("whoami");
});
