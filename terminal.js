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
