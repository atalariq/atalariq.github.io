// terminal.js — pure logic + thin DOM wrappers. No top-level side effects.
import { profile, tabs, builtins, helpText, systemInfo } from "./data.js";

/**
 * Resolve a typed line into an action.
 * @returns {{type:"empty"}|{type:"tab",name:string}|{type:"builtin",name:string}|{type:"unknown",input:string}}
 */
export function resolveCommand(input, { tabs, builtins }) {
  const trimmed = input.trim();
  if (trimmed === "") return { type: "empty" };
  const cmd = trimmed.toLowerCase();
  if (tabs.includes(cmd)) return { type: "tab", name: cmd };
  if (builtins.includes(cmd)) return { type: "builtin", name: cmd };
  return { type: "unknown", input: trimmed };
}

/**
 * Map a window.location.hash to a valid tab name, falling back to defaultTab.
 */
export function normalizeHash(hash, tabs, defaultTab) {
  const name = (hash || "").replace(/^#\/?/, "").toLowerCase();
  return tabs.includes(name) ? name : defaultTab;
}

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape a string for safe insertion via innerHTML. */
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/** Shell-style command history with a cursor for ↑/↓ navigation. */
export class CommandHistory {
  constructor(entries = []) {
    this.entries = [...entries];
    this.cursor = this.entries.length; // points just past the newest
  }

  add(cmd) {
    const trimmed = cmd.trim();
    if (trimmed === "") return;
    if (this.entries[this.entries.length - 1] !== trimmed) {
      this.entries.push(trimmed);
    }
    this.cursor = this.entries.length;
  }

  /** Move toward older entries. Returns the entry, or null if history is empty. */
  prev() {
    if (this.entries.length === 0) return null;
    if (this.cursor > 0) this.cursor--;
    return this.entries[this.cursor];
  }

  /** Move toward newer entries. Returns "" when past the newest. */
  next() {
    if (this.cursor < this.entries.length) this.cursor++;
    return this.cursor >= this.entries.length ? "" : this.entries[this.cursor];
  }
}

/** Build the neofetch/fastfetch easter-egg output as an HTML string. */
export function renderNeofetch(profile, info) {
  const title = `${profile.user}@${profile.host}`;
  const rows = Object.entries(info)
    .map(
      ([key, value]) =>
        `<span class="nf-key">${escapeHtml(key)}</span>: ${escapeHtml(value)}`,
    )
    .join("\n");
  const logo = [
    "   ▟████▙   ",
    "  ▟██████▙  ",
    " ▟███▛▜███▙ ",
    " ▜███▙▟███▛ ",
    "  ▜██████▛  ",
    "   ▜████▛   ",
  ].join("\n");
  return (
    `<div class="neofetch">` +
    `<pre class="nf-logo">${logo}</pre>` +
    `<pre class="nf-info"><span class="nf-title">${escapeHtml(title)}</span>\n` +
    `${"-".repeat(title.length)}\n${rows}</pre>` +
    `</div>`
  );
}

/**
 * Type `text` into `el` one character at a time.
 * @param schedule injectable timer (defaults to setTimeout) for testability.
 * @returns Promise that resolves when typing finishes.
 */
export function typeText(el, text, speed = 55, schedule = setTimeout) {
  return new Promise((resolve) => {
    let i = 0;
    function tick() {
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        i++;
        schedule(tick, speed);
      } else {
        resolve();
      }
    }
    tick();
  });
}

/** Show the named pane + mark its tab selected; hide/deselect the rest. */
export function switchTab(doc, name) {
  doc.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.setAttribute(
      "aria-selected",
      btn.dataset.tab === name ? "true" : "false",
    );
  });
  doc.querySelectorAll("[data-pane]").forEach((pane) => {
    pane.hidden = pane.dataset.pane !== name;
  });
}

/** Append a chunk of HTML as a new line in the command-output log. */
export function appendOutput(doc, html) {
  const out = doc.getElementById("output");
  const line = doc.createElement("div");
  line.innerHTML = html;
  out.appendChild(line);
}

/** Echo a typed command, prompt-prefixed, into the output log (input escaped). */
export function echoPrompt(doc, promptStr, input) {
  appendOutput(
    doc,
    `<span class="dim">${escapeHtml(promptStr)}</span> <span class="yellow">${escapeHtml(input)}</span>`,
  );
}

/** Empty the command-output log. */
export function clearOutput(doc) {
  doc.getElementById("output").innerHTML = "";
}

/** Execute a builtin command (help / clear / neofetch / fastfetch). */
export function runBuiltin(ctx, name) {
  const { doc } = ctx;
  switch (name) {
    case "help":
      appendOutput(doc, ctx.helpText.map((l) => escapeHtml(l)).join("<br>"));
      break;
    case "clear":
      clearOutput(doc);
      break;
    case "neofetch":
    case "fastfetch":
      appendOutput(doc, renderNeofetch(ctx.profile, ctx.systemInfo));
      break;
  }
}

/** Resolve, echo, and execute a typed line; record it in history. */
export function executeCommand(ctx, rawInput) {
  const result = resolveCommand(rawInput, {
    tabs: ctx.tabs,
    builtins: ctx.builtins,
  });
  if (result.type === "empty") return;

  echoPrompt(ctx.doc, ctx.promptStr, rawInput.trim());

  switch (result.type) {
    case "tab":
      switchTab(ctx.doc, result.name);
      ctx.setHash(result.name);
      break;
    case "builtin":
      runBuiltin(ctx, result.name);
      break;
    case "unknown":
      appendOutput(
        ctx.doc,
        `<span class="err">command not found: ${escapeHtml(result.input)}</span>`,
      );
      break;
  }

  ctx.history.add(rawInput);
}

/** Focus the prompt input (used on click-anywhere and after commands). */
export function focusInput(doc) {
  const input = doc.getElementById("prompt-input");
  if (input) input.focus();
}

/** Play the boot typewriter: type "whoami" into #boot-command. */
async function playBoot(doc, schedule) {
  const el = doc.getElementById("boot-command");
  if (!el) return;
  await typeText(el, "whoami", 70, schedule);
}

/**
 * Wire the terminal: events, initial hash routing, optional boot typewriter.
 * @param opts.win injected window (defaults to global window)
 * @param opts.doc injected document (defaults to global document)
 * @param opts.typewriter set false in tests to skip the async boot animation
 */
export function bootstrap(opts = {}) {
  const win = opts.win || globalThis.window;
  const doc = opts.doc || globalThis.document;
  const promptStr = `${profile.user}@${profile.host}:~$`;

  const ctx = {
    doc,
    tabs,
    builtins,
    profile,
    helpText,
    systemInfo,
    history: new CommandHistory(),
    promptStr,
    setHash: (name) => {
      win.history.replaceState(null, "", `#${name}`);
    },
  };

  const input = doc.getElementById("prompt-input");
  const form = doc.getElementById("prompt-form");

  // Submit a typed command.
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    executeCommand(ctx, input.value);
    input.value = "";
    const screen = doc.getElementById("screen");
    if (screen) screen.scrollTop = screen.scrollHeight;
  });

  // ↑/↓ history navigation.
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      const prev = ctx.history.prev();
      if (prev !== null) {
        input.value = prev;
        e.preventDefault();
      }
    } else if (e.key === "ArrowDown") {
      input.value = ctx.history.next();
      e.preventDefault();
    }
  });

  // Tab-bar clicks.
  doc.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(doc, btn.dataset.tab);
      ctx.setHash(btn.dataset.tab);
      focusInput(doc);
    });
  });

  // Click anywhere in the terminal focuses the prompt (unless selecting a link).
  const terminal = doc.getElementById("terminal");
  if (terminal) {
    terminal.addEventListener("click", (e) => {
      if (e.target.tagName !== "A") focusInput(doc);
    });
  }

  // Respond to back/forward hash changes.
  win.addEventListener("hashchange", () => {
    switchTab(doc, normalizeHash(win.location.hash, tabs, "about"));
  });

  // Initial routing.
  const initial = normalizeHash(win.location.hash, tabs, "about");
  switchTab(doc, initial);
  focusInput(doc);

  // Boot typewriter only on the about tab, only on real loads.
  if (opts.typewriter !== false && initial === "about") {
    playBoot(doc, opts.schedule);
  }
}
