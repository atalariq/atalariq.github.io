// data.js — portfolio content + config. Pure data, no logic.

export const profile = {
  user: "atalariq",
  host: "portfolio",
  name: "Atalariq Barra Hadinugraha",
  tagline: "CS student from Indonesia · platform-engineer-in-training",
};

export const tabs = ["about", "linktree", "projects", "vision", "contact"];

export const builtins = ["help", "clear", "neofetch", "fastfetch"];

export const links = [
  { name: "GitHub", url: "https://github.com/atalariq" },
  { name: "LinkedIn", url: "https://linkedin.com/in/atalariq" },
  { name: "Instagram", url: "https://instagram.com/atalariq.dev" },
  { name: "Journal", url: "https://journal.atalariq.dev" },
  { name: "Medium", url: "https://medium.com/@atalariq" },
];

// Replace/extend with real projects. Content only — not wired to logic.
export const projects = [
  {
    name: "atalariq.github.io",
    desc: "This site — a full terminal-UI portfolio, pure static, no framework.",
    tags: ["html", "css", "vanilla-js", "github-pages"],
  },
  {
    name: "dotfiles",
    desc: "Riced terminal-heavy workflow: editor, shell, multiplexer, the works.",
    tags: ["bash", "neovim", "tmux", "linux"],
  },
];

export const helpText = [
  "available commands:",
  "  about       — whoami: bio, status, stack",
  "  linktree    — ls ~/links: where to find me",
  "  projects    — ls ~/projects: things I've built",
  "  vision      — cat ~/vision.md: where I'm headed",
  "  contact     — cat ~/contact.md: get in touch",
  "  help        — this message",
  "  clear       — clear the screen",
  "  neofetch    — system info (try it)",
  "",
  "tip: use the tab bar above, or type a command. ↑/↓ for history.",
];

export const systemInfo = {
  os: "Everforest Linux x86_64",
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
