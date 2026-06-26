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

// Split argv into single-char flags (-l, -la) and positional operands.
function splitArgs(args) {
  const flags = [];
  const operands = [];
  for (const a of args) {
    if (a.startsWith("-") && a.length > 1) flags.push(...a.slice(1).split(""));
    else operands.push(a);
  }
  return { flags, operands };
}

// `ls -l`: one row per entry — mode, name, and an optional description column,
// monospace-aligned. Descriptions live on the content node (see content.js).
function renderLong(node) {
  const entries = node.children;
  const width = Math.max(
    0,
    ...entries.map((e) => e.name.length + (e.type === "dir" ? 1 : 0)),
  );
  const rows = entries.map((e) => {
    const mode = e.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
    const display = e.name + (e.type === "dir" ? "/" : "");
    const pad = " ".repeat(width - display.length + 2);
    const nameHtml =
      e.type === "dir"
        ? `<span class="green">${escapeHtml(display)}</span>`
        : escapeHtml(display);
    const desc = e.desc ? `<span class="dim">${escapeHtml(e.desc)}</span>` : "";
    return `<span class="dim">${mode}</span>  ${nameHtml}${pad}${desc}`;
  });
  return `<pre class="long">${rows.join("\n")}</pre>`;
}

function ls(args, env) {
  const { flags, operands } = splitArgs(args);
  const arg = operands[0];
  const target = resolvePath(env.root, env.cwd, arg);
  if (!target) return { error: `ls: no such file or directory: ${arg}` };
  const { node } = target;
  if (node.type === "file")
    return { html: `<p>${escapeHtml(node.name)}</p>`, tab: tabForTarget(node) };
  if (flags.includes("l"))
    return { html: renderLong(node), tab: tabForTarget(node) };
  const cells = listDir(node).map((e) =>
    e.type === "dir"
      ? `<span class="green">${escapeHtml(e.name)}/</span>`
      : `<span>${escapeHtml(e.name)}</span>`,
  );
  return {
    html: `<div class="ls">${cells.join("")}</div>`,
    tab: tabForTarget(node),
  };
}

// Recursively render a dir as `tree`-style branches. Nodes carrying a `url`
// (the links/) render the name plus a clickable address.
function renderTree(node, prefix = "") {
  const kids = node.children || [];
  const lines = [];
  kids.forEach((child, i) => {
    const last = i === kids.length - 1;
    const branch = last ? "└── " : "├── ";
    let label;
    if (child.url) {
      const shown = child.url.replace(/^https?:\/\/(www\.)?/, "");
      label =
        `<span class="green">${escapeHtml(child.name)}</span> ` +
        `<a href="${escapeHtml(child.url)}">${escapeHtml(shown)}</a>`;
    } else if (child.type === "dir") {
      label = `<span class="green">${escapeHtml(child.name)}/</span>`;
    } else {
      label = escapeHtml(child.name);
    }
    lines.push(`${prefix}${branch}${label}`);
    if (child.type === "dir") {
      lines.push(...renderTree(child, prefix + (last ? "    " : "│   ")));
    }
  });
  return lines;
}

function countTree(node) {
  let dirs = 0;
  let files = 0;
  for (const c of node.children || []) {
    if (c.type === "dir") {
      dirs++;
      const s = countTree(c);
      dirs += s.dirs;
      files += s.files;
    } else files++;
  }
  return { dirs, files };
}

function tree(args, env) {
  const { operands } = splitArgs(args);
  const arg = operands[0];
  const target = resolvePath(env.root, env.cwd, arg);
  if (!target) return { error: `tree: ${arg}: No such file or directory` };
  if (target.node.type !== "dir")
    return { error: `tree: ${arg}: Not a directory` };
  const header = `<span class="green">${escapeHtml(formatCwd(target.path))}</span>`;
  const body = renderTree(target.node).join("\n");
  const { dirs, files } = countTree(target.node);
  const footer =
    `<span class="dim">${dirs} director${dirs === 1 ? "y" : "ies"}, ` +
    `${files} file${files === 1 ? "" : "s"}</span>`;
  return {
    html: `<pre class="tree">${header}\n${body}\n\n${footer}</pre>`,
    tab: tabForTarget(target.node),
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

// Filesystem commands; system/theme/easter-egg handlers are registered below.
export const COMMANDS = { ls, cat, cd, pwd, tree };

/** Resolve, dispatch, and return a descriptor (or null for empty input). */
export function runCommand(input, env) {
  const tok = tokenize(input);
  if (!tok) return null;
  // Section aliases (about, linktree, …) expand to their canonical command;
  // extra args are ignored, the way a shell ignores args to an unknown alias.
  if (sectionCommands[tok.cmd]) {
    return runCommand(sectionCommands[tok.cmd], env);
  }
  const handler = COMMANDS[tok.cmd];
  if (!handler) return { error: `command not found: ${tok.cmd}` };
  return handler(tok.args, env) || {};
}

/** neofetch/fastfetch easter-egg output as an HTML string. */
export function renderNeofetch(profile, info) {
  const title = `${profile.user}@${profile.host}`;
  const rows = Object.entries(info)
    .map(
      ([k, v]) =>
        `<span class="nf-key">${escapeHtml(k)}</span>: ${escapeHtml(v)}`,
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
    `<div class="neofetch"><pre class="nf-logo">${logo}</pre>` +
    `<pre class="nf-info"><span class="nf-title">${escapeHtml(title)}</span>\n` +
    `${"-".repeat(title.length)}\n${rows}</pre></div>`
  );
}

function whoami(_a, env) {
  return {
    html: `<p><span class="green">${escapeHtml(env.profile.name)}</span> — ${escapeHtml(env.profile.tagline)}</p>`,
  };
}
function help(_a, env) {
  return { html: env.helpText.map((l) => escapeHtml(l)).join("<br>") };
}
function clear() {
  return { clear: true };
}
function neofetch(_a, env) {
  return { html: renderNeofetch(env.profile, env.systemInfo) };
}
function history(_a, env) {
  const lines = env.history.entries.map(
    (e, i) => `${String(i + 1).padStart(3)}  ${escapeHtml(e)}`,
  );
  return { html: `<pre>${lines.join("\n")}</pre>` };
}
function echo(args) {
  return { html: `<p>${escapeHtml(args.join(" "))}</p>` };
}
function date(_a, env) {
  return { html: `<p>${escapeHtml(env.now().toString())}</p>` };
}
function uname(args, env) {
  const base = "Wana Linux";
  if (args.includes("-a")) {
    return {
      html: `<p>${base} ${env.systemInfo.kernel} ${env.profile.host} x86_64 GNU/Linux</p>`,
    };
  }
  return { html: `<p>${base}</p>` };
}
function theme(args) {
  const mode = (args[0] || "toggle").toLowerCase();
  if (!["light", "dark", "toggle"].includes(mode)) {
    return { error: "theme: usage: theme light|dark|toggle" };
  }
  return { theme: mode };
}

// ── Easter eggs ──
function sudo() {
  return {
    html: `<p class="err">[sudo] password for atalariq: </p><p>atalariq is not in the sudoers file. This incident will be reported.</p>`,
  };
}
function vim() {
  return {
    html: `<p>To exit vim: press <span class="yellow">Esc</span>, then type <span class="yellow">:q!</span> and Enter.</p><p class="dim"># (you can also just close the tab 😉)</p>`,
  };
}
function sl() {
  return {
    html: `<pre>      ====        ________\n  _D _|  |_______/        \\__\n   |(_)---  |   H\\________/ |   |\n   /     |  |   H  |  |     |   |\n  |      |  |   H  |__--------------|\n  | ________|___H__/__|_____/[][]~\\\n  |/ |   |-----------I_____I [][] []\n__/ =| o |=-O=====O=====O=====O\\ ____\n |/-=|___|=    ||    ||    ||    |_____/\n  \\_/      \\O=====O=====O=====O_/</pre>`,
  };
}
function cowsay(args) {
  const msg = args.join(" ") || "moo";
  const bar = "-".repeat(msg.length + 2);
  return {
    html: `<pre> ${bar}\n< ${escapeHtml(msg)} >\n ${bar}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||</pre>`,
  };
}
const FORTUNES = [
  "The best way to predict the future is to implement it.",
  "Weeks of coding can save you hours of planning.",
  "rm -rf doubt/",
  "There are two hard things in CS: cache invalidation, naming, and off-by-one errors.",
];
function fortune(_a, env) {
  const i = Math.floor(env.rand() * FORTUNES.length) % FORTUNES.length;
  return { html: `<p>${escapeHtml(FORTUNES[i])}</p>` };
}
function exit() {
  return {
    html: `<p class="dim">There is no escape — this is a website. (Ctrl+W if you insist.)</p>`,
  };
}

Object.assign(COMMANDS, {
  whoami,
  help,
  clear,
  neofetch,
  fastfetch: neofetch,
  history,
  echo,
  date,
  uname,
  theme,
  sudo,
  vim,
  sl,
  cowsay,
  fortune,
  exit,
});

/** All completable command words (registry + section aliases). */
export function commandNames() {
  return [...Object.keys(COMMANDS), ...Object.keys(sectionCommands)];
}

function commonPrefix(strs) {
  if (strs.length === 0) return "";
  let p = strs[0];
  for (const s of strs) {
    while (!s.startsWith(p)) p = p.slice(0, -1);
  }
  return p;
}

// Replace the trailing `frag` of `input` with a completion drawn from candidates.
function completeFrom(input, frag, candidates) {
  const matches = candidates.filter((c) => c.startsWith(frag));
  if (matches.length === 0) return { value: input, candidates: [] };
  const head = input.slice(0, input.length - frag.length);
  if (matches.length === 1) {
    const c = matches[0];
    // dirs end with "/" (keep typing); everything else gets a space.
    return { value: head + c + (c.endsWith("/") ? "" : " "), candidates: [] };
  }
  return { value: head + commonPrefix(matches), candidates: matches };
}

/**
 * Complete the current input. First token → command names; an argument →
 * filesystem entries under the cwd (descending any dir prefix in the fragment).
 */
export function complete(input, env) {
  const lastSpace = input.lastIndexOf(" ");
  if (lastSpace === -1) {
    return completeFrom(input, input, commandNames());
  }
  const frag = input.slice(lastSpace + 1);
  const slash = frag.lastIndexOf("/");
  const dirArg = slash === -1 ? undefined : frag.slice(0, slash);
  const base = slash === -1 ? frag : frag.slice(slash + 1);
  const target = resolvePath(env.root, env.cwd, dirArg);
  const entries =
    target && target.node.type === "dir" ? listDir(target.node) : [];
  const names = entries.map((e) => (e.type === "dir" ? e.name + "/" : e.name));
  return completeFrom(input, base, names);
}
