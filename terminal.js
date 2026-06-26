// terminal.js — thin DOM layer: render, descriptor interpretation, events.
export { escapeHtml } from "./util.js";
import { escapeHtml } from "./util.js";
import {
  profile,
  tabs,
  sectionCommands,
  systemInfo,
  helpText,
} from "./data.js";
import { tree } from "./content.js";
import { runCommand } from "./commands.js";
import { formatCwd } from "./filesystem.js";
import { handleKey } from "./terminal-keys.js";

const GIT_GLYPH = ""; // Nerd Font git-branch glyph
const BRANCH = "main";

/** Starship-style info line: user, cwd (live), and git branch — as HTML. */
export function renderPromptInfo(user, cwd) {
  return (
    `<span class="seg-user">${escapeHtml(user)}</span>` +
    `<span class="seg-op"> in </span>` +
    `<span class="seg-dir">${escapeHtml(formatCwd(cwd))}</span>` +
    `<span class="seg-op"> on </span>` +
    `<span class="seg-git">${GIT_GLYPH} ${BRANCH}</span>`
  );
}

/** Map window.location.hash to a valid tab name, else defaultTab. */
export function normalizeHash(hash, tabs, defaultTab) {
  const name = (hash || "").replace(/^#\/?/, "").toLowerCase();
  return tabs.includes(name) ? name : defaultTab;
}

/** Shell-style command history with a cursor for ↑/↓ navigation. */
export class CommandHistory {
  constructor(entries = []) {
    this.entries = [...entries];
    this.cursor = this.entries.length;
  }
  add(cmd) {
    const trimmed = cmd.trim();
    if (trimmed === "") return;
    if (this.entries[this.entries.length - 1] !== trimmed)
      this.entries.push(trimmed);
    this.cursor = this.entries.length;
  }
  prev() {
    if (this.entries.length === 0) return null;
    if (this.cursor > 0) this.cursor--;
    return this.entries[this.cursor];
  }
  next() {
    if (this.cursor < this.entries.length) this.cursor++;
    return this.cursor >= this.entries.length ? "" : this.entries[this.cursor];
  }
}

/** Type `text` into `el` one char at a time. Injectable scheduler for tests. */
export function typeText(el, text, speed = 55, schedule = setTimeout) {
  return new Promise((resolve) => {
    let i = 0;
    (function tick() {
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        i++;
        schedule(tick, speed);
      } else resolve();
    })();
  });
}

/** Toggle aria-selected on the tab buttons (no panes in the scroll-log model). */
export function switchTab(doc, name) {
  doc.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.setAttribute(
      "aria-selected",
      btn.dataset.tab === name ? "true" : "false",
    );
  });
}

export function appendOutput(doc, html) {
  const out = doc.getElementById("output");
  const line = doc.createElement("div");
  line.innerHTML = html;
  out.appendChild(line);
}

export function echoPrompt(doc, user, cwd, input) {
  appendOutput(
    doc,
    `<div class="prompt-info">${renderPromptInfo(user, cwd)}</div>` +
      `<div class="prompt-line"><span class="prompt-char">❯</span> ` +
      `<span class="cmd">${escapeHtml(input)}</span></div>`,
  );
}

export function clearOutput(doc) {
  doc.getElementById("output").innerHTML = "";
}

export function focusInput(doc) {
  const input = doc.getElementById("prompt-input");
  if (input) input.focus();
}

/** Re-render the live info line and the error state of the live `❯`. */
function syncPrompt(ctx) {
  const info = ctx.doc.getElementById("prompt-info");
  if (info) info.innerHTML = renderPromptInfo(profile.user, ctx.cwd);
  const char = ctx.doc.getElementById("prompt-char");
  if (char) char.classList.toggle("is-error", !!ctx.lastError);
}

/** Set <html data-theme>, persist, and reflect in storage. */
export function applyTheme(ctx, mode) {
  const el = ctx.doc.documentElement;
  const current = el.getAttribute("data-theme") || "dark";
  const next =
    mode === "toggle" ? (current === "dark" ? "light" : "dark") : mode;
  el.setAttribute("data-theme", next);
  try {
    ctx.storage.setItem("theme", next);
  } catch {}
}

/** Apply a command descriptor to the DOM + ctx state. */
function applyDescriptor(ctx, d) {
  if (d.clear) clearOutput(ctx.doc);
  if (d.cd) ctx.cwd = d.cd;
  if (d.theme) applyTheme(ctx, d.theme);
  if (d.tab) {
    switchTab(ctx.doc, d.tab);
    ctx.setHash(d.tab);
  }
  if (d.error)
    appendOutput(ctx.doc, `<span class="err">${escapeHtml(d.error)}</span>`);
  if (d.html) appendOutput(ctx.doc, d.html);
}

function envFor(ctx) {
  return {
    root: tree,
    cwd: ctx.cwd,
    profile,
    systemInfo: ctx.systemInfo,
    helpText: ctx.helpText,
    history: ctx.history,
    now: () => new Date(),
    rand: Math.random,
  };
}

/** Resolve, echo, execute, and record a typed line. */
export function executeCommand(ctx, rawInput) {
  const desc = runCommand(rawInput, envFor(ctx));
  if (desc === null) return; // empty input
  echoPrompt(ctx.doc, profile.user, ctx.cwd, rawInput.trim());
  applyDescriptor(ctx, desc);
  ctx.lastError = !!desc.error;
  syncPrompt(ctx);
  ctx.history.add(rawInput);
}

/**
 * Boot intro: run `whoami` as the first command. With the typewriter on, the
 * command is typed into an echoed prompt line before its output is printed;
 * with it off (tests), the command runs instantly. Either way the live prompt
 * ends up below the output, like a real shell.
 */
async function playBoot(ctx, opts) {
  const doc = ctx.doc;
  const out = doc.getElementById("output");
  if (!out) return;
  if (opts.typewriter === false) {
    executeCommand(ctx, "whoami");
    return;
  }
  const line = doc.createElement("div");
  line.innerHTML =
    `<div class="prompt-info">${renderPromptInfo(profile.user, ctx.cwd)}</div>` +
    `<div class="prompt-line"><span class="prompt-char">❯</span> ` +
    `<span class="cmd" id="boot-command"></span>` +
    `<span class="cursor-inline" aria-hidden="true"></span></div>`;
  out.appendChild(line);
  const span = line.querySelector("#boot-command");
  await typeText(span, "whoami", 70, opts.schedule);
  const cursor = line.querySelector(".cursor-inline");
  if (cursor) cursor.remove();
  const desc = runCommand("whoami", envFor(ctx));
  applyDescriptor(ctx, desc);
  ctx.lastError = !!desc.error;
  syncPrompt(ctx);
  ctx.history.add("whoami");
}

export function bootstrap(opts = {}) {
  const win = opts.win || globalThis.window;
  const doc = opts.doc || globalThis.document;
  const storage = opts.storage ||
    win.localStorage || { getItem: () => null, setItem: () => {} };

  const ctx = {
    doc,
    cwd: [],
    lastError: false,
    history: new CommandHistory(),
    systemInfo: opts.systemInfo || systemInfo,
    helpText: opts.helpText || helpText,
    storage,
    setHash: (name) => win.history.replaceState(null, "", `#${name}`),
  };

  const input = doc.getElementById("prompt-input");
  const form = doc.getElementById("prompt-form");
  const scrollDown = () => {
    const s = doc.getElementById("screen");
    if (s) s.scrollTop = s.scrollHeight;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    executeCommand(ctx, input.value);
    input.value = "";
    scrollDown();
  });

  input.addEventListener("keydown", (e) => handleKey(ctx, input, e));

  doc.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      executeCommand(ctx, sectionCommands[btn.dataset.tab] || btn.dataset.tab);
      focusInput(doc);
      scrollDown();
    });
  });

  const themeBtn = doc.getElementById("theme-toggle");
  if (themeBtn) {
    const reflect = () =>
      themeBtn.setAttribute(
        "aria-pressed",
        String(doc.documentElement.getAttribute("data-theme") !== "light"),
      );
    themeBtn.addEventListener("click", () => {
      applyTheme(ctx, "toggle");
      reflect();
      focusInput(doc);
    });
    reflect();
  }

  const terminal = doc.getElementById("terminal");
  if (terminal) {
    terminal.addEventListener("click", (e) => {
      if (e.target.tagName !== "A") focusInput(doc);
    });
  }

  win.addEventListener("hashchange", () => {
    const name = normalizeHash(win.location.hash, tabs, "about");
    executeCommand(ctx, sectionCommands[name]);
  });

  const initial = normalizeHash(win.location.hash, tabs, "about");
  switchTab(doc, initial);
  syncPrompt(ctx);
  focusInput(doc);

  if (initial === "about") {
    playBoot(ctx, opts);
  } else {
    executeCommand(ctx, sectionCommands[initial]);
  }
}
