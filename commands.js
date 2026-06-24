// commands.js — pure command layer. Handlers take (args, env) and return a
// DESCRIPTOR (html / clear / theme / cd / tab / error). No DOM here.
import { resolvePath, listDir, readFile, formatCwd } from "./filesystem.js";
import { escapeHtml } from "./util.js";
import { sectionCommands } from "./data.js";

export function tokenize(input) {
  const raw = (input || "").trim();
  if (raw === "") return null;
  const parts = raw.split(/\s+/);
  return { cmd: parts[0].toLowerCase(), args: parts.slice(1), raw };
}

// Which tab a resolved node belongs to (keeps tab highlight in sync).
const TAB_BY_FILE = {
  "about.md": "about",
  "vision.md": "vision",
  "contact.md": "contact",
};
const TAB_BY_DIR = { links: "linktree", projects: "projects" };
function tabForTarget(node) {
  if (!node) return null;
  if (node.type === "file") return TAB_BY_FILE[node.name] || null;
  if (node.type === "dir") return TAB_BY_DIR[node.name] || null;
  return null;
}

function ls(args, env) {
  const arg = args[0];
  const target = resolvePath(env.root, env.cwd, arg);
  if (!target) return { error: `ls: no such file or directory: ${arg}` };
  const { node } = target;
  if (node.type === "file")
    return { html: `<p>${escapeHtml(node.name)}</p>`, tab: tabForTarget(node) };
  const cells = listDir(node).map((e) =>
    e.type === "dir"
      ? `<span class="green">${escapeHtml(e.name)}/</span>`
      : escapeHtml(e.name),
  );
  return {
    html: `<p class="ls">${cells.join("&nbsp;&nbsp;")}</p>`,
    tab: tabForTarget(node),
  };
}

function cat(args, env) {
  const arg = args[0];
  if (!arg) return { error: "cat: missing file operand" };
  const target = resolvePath(env.root, env.cwd, arg);
  if (!target) return { error: `cat: ${arg}: No such file or directory` };
  if (target.node.type === "dir")
    return { error: `cat: ${arg}: Is a directory` };
  return { html: readFile(target.node), tab: tabForTarget(target.node) };
}

function cd(args, env) {
  const arg = args[0] || "~";
  const target = resolvePath(env.root, env.cwd, arg);
  if (!target) return { error: `cd: ${arg}: No such file or directory` };
  if (target.node.type !== "dir")
    return { error: `cd: ${arg}: not a directory` };
  return { cd: target.path, tab: tabForTarget(target.node) };
}

function pwd(_args, env) {
  return { html: `<p>${formatCwd(env.cwd)}</p>` };
}

// Registry is completed in Task 6; filesystem commands live here.
export const COMMANDS = { ls, cat, cd, pwd };

/** Resolve, dispatch, and return a descriptor (or null for empty input). */
export function runCommand(input, env) {
  const tok = tokenize(input);
  if (!tok) return null;
  if (sectionCommands[tok.cmd] && tok.args.length === 0) {
    return runCommand(sectionCommands[tok.cmd], env);
  }
  const handler = COMMANDS[tok.cmd];
  if (!handler) return { error: `command not found: ${tok.cmd}` };
  return handler(tok.args, env) || {};
}
