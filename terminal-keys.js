// terminal-keys.js — keyboard handling for the prompt input, extracted so it
// can be unit-tested without a full bootstrap.
import { complete } from "./commands.js";
import { tree } from "./content.js";
import { appendOutput, clearOutput, escapeHtml } from "./terminal.js";

/** Handle a keydown on the prompt input. ctx carries doc, cwd, history. */
export function handleKey(ctx, input, e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const r = complete(input.value, { root: tree, cwd: ctx.cwd });
    input.value = r.value;
    if (r.candidates.length > 1) {
      appendOutput(
        ctx.doc,
        `<p class="dim">${r.candidates.map(escapeHtml).join("&nbsp;&nbsp;")}</p>`,
      );
    }
    return;
  }
  if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
    e.preventDefault();
    clearOutput(ctx.doc);
    return;
  }
  if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
    e.preventDefault();
    input.value = "";
    return;
  }
  if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
    e.preventDefault();
    appendOutput(ctx.doc, `<span class="dim">^C</span>`);
    input.value = "";
    return;
  }
  if (e.ctrlKey && (e.key === "a" || e.key === "A")) {
    e.preventDefault();
    input.setSelectionRange(0, 0);
    return;
  }
  if (e.ctrlKey && (e.key === "e" || e.key === "E")) {
    e.preventDefault();
    const n = input.value.length;
    input.setSelectionRange(n, n);
    return;
  }
  if (e.key === "ArrowUp") {
    const prev = ctx.history.prev();
    if (prev !== null) {
      input.value = prev;
      e.preventDefault();
    }
    return;
  }
  if (e.key === "ArrowDown") {
    input.value = ctx.history.next();
    e.preventDefault();
  }
}
