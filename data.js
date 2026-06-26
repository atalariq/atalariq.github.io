// data.js — config + system metadata. Pure data, no logic.
// Site CONTENT (bio, projects, links, filesystem) lives in content.js.

export const profile = {
  user: "atalariq",
  host: "portfolio",
  name: "Atalariq Barra Hadinugraha",
  tagline: "aspiring software engineer · lifelong learner · vimmer",
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
  "  theme <mode>  — light | dark | toggle",
  "  echo / date / uname / neofetch / fastfetch",
  "  clear         — clear the screen   help — this message",
  "",
  "tip: Tab completes commands & paths. ↑/↓ history. Ctrl+L clears.",
];
