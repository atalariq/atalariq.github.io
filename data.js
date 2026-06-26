// data.js — config + system metadata. Pure data, no logic.
// Site CONTENT (bio, projects, links, filesystem) lives in content.js.

export const profile = {
  user: "atalariq",
  host: "portfolio",
  name: "Atalariq Barra Hadinugraha",
  tagline: "aspiring software engineer · lifelong learner · vimmer",
};

// Structured bio facts, reused by the `resume` command (about.md keeps prose).
export const bio = {
  education: "Software Engineering — UGM Sekolah Vokasi",
  location: "Yogyakarta, Indonesia",
  email: "hi@atalariq.dev",
  stack: ["TS/JS", "Go", "Python", "Bash/Fish", "Lua", "Typst"],
};

// One entry per command, read by `man` and `whatis`.
export const manpages = {
  ls: { usage: "ls [-l] [path]", summary: "list directory contents" },
  tree: { usage: "tree [path]", summary: "list a directory as a tree" },
  cat: { usage: "cat <file>", summary: "print a file" },
  cd: { usage: "cd <path>", summary: "change directory" },
  pwd: { usage: "pwd", summary: "print the working directory" },
  whoami: { usage: "whoami", summary: "print a one-line identity" },
  cheat: { usage: "cheat <topic>", summary: "show a command cheatsheet" },
  resume: { usage: "resume", summary: "print a short CV" },
  repo: { usage: "repo", summary: "link to this site's source" },
  keys: { usage: "keys", summary: "open the keyboard-shortcut overlay" },
  man: { usage: "man <cmd>", summary: "show the manual for a command" },
  whatis: { usage: "whatis <cmd>", summary: "one-line command description" },
  theme: {
    usage: "theme light|dark|toggle",
    summary: "switch the color theme",
  },
  neofetch: { usage: "neofetch", summary: "print a system-info banner" },
  history: { usage: "history", summary: "show command history" },
  echo: { usage: "echo <text>", summary: "print a line of text" },
  clear: { usage: "clear", summary: "clear the screen" },
  help: { usage: "help", summary: "list available commands" },
};

export const tabs = ["about", "linktree", "projects", "vision", "contact"];

// Each tab (and tab-bar click) injects its canonical shell command.
export const sectionCommands = {
  about: "cat about.md",
  linktree: "tree links",
  projects: "ls -l projects",
  vision: "cat vision.md",
  contact: "cat contact.md",
};

export const systemInfo = {
  os: "Wana Linux x86_64",
  host: "atalariq@portfolio",
  kernel: "agentic-workflows-6.20",
  shell: "vanilla-js",
  de: "terminal-ui",
  terminal: "atalariq.dev",
  cpu: "Curiosity (overclocked)",
  memory: "vim · git · docker · advanced-cli",
  focus: "Platform Engineering / DevOps / Cloud / SRE",
  langs: "Go · JS/TS (Bun)",
};

export const helpText = [
  "available commands:",
  "  ls [-l] [path] — list a directory (try: ls, ls -l projects)",
  "  tree [path]   — list a directory as a tree (try: tree links)",
  "  cat <file>    — print a file (try: cat about.md)",
  "  cd <path>     — change directory; pwd — print working dir",
  "  about linktree projects vision contact — jump to a section",
  "  whoami        — short bio          history — command history",
  "  cheat <topic> — command cheatsheet (try: cheat git)",
  "  man <cmd>     — manual for a command; whatis <cmd> — one-liner",
  "  resume / cv   — short CV           repo — this site's source",
  "  keys          — keyboard-shortcut overlay (or press Ctrl+/)",
  "  theme <mode>  — light | dark | toggle",
  "  echo / date / uname / neofetch / fastfetch",
  "  clear         — clear the screen   help — this message",
  "",
  "tip: Tab completes commands & paths. ↑/↓ history. Ctrl+L clears.",
];
