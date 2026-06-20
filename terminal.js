// terminal.js — pure logic + thin DOM wrappers. No top-level side effects.

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
