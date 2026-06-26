// content.js — portfolio content + virtual filesystem tree.
// THIS IS THE FILE YOU EDIT to update the site. Logic lives in commands.js /
// filesystem.js / terminal.js. Renderers return trusted, static HTML strings.

export const links = [
  { name: "GitHub", url: "https://github.com/atalariq" },
  { name: "GitLab", url: "https://gitlab.com/atalariq" },
  { name: "LinkedIn", url: "https://linkedin.com/in/atalariq" },
  { name: "Instagram", url: "https://instagram.com/atalariq.dev" },
  { name: "Journey", url: "https://journey.atalariq.dev" },
  { name: "Medium", url: "https://medium.com/@atalariq" },
  { name: "YouTube", url: "https://youtube.com/@atalariq26" },
  { name: "Last.fm", url: "https://www.last.fm/user/atalariq" },
  { name: "Letterboxd", url: "https://letterboxd.com/atalariq" },
];

export const projects = [
  {
    name: "wana",
    desc: "A personal CSS design system. One file of OKLCH tokens, no build step.",
    tags: ["css", "design-tokens", "oklch"],
  },
  {
    name: "dev-journey",
    desc: "My digital garden and weekly journal. Astro, content symlinked from a private notes vault.",
    tags: ["astro", "typescript", "bun", "cloudflare"],
  },
  {
    name: "wayfinder",
    desc: "A quiz that suggests which software engineering role suits you, scored by a plain function.",
    tags: ["astro", "svelte", "vercel"],
    url: "https://wayfinder.atalariq.dev",
  },
  {
    name: "laptopval",
    desc: "Scores used-laptop listings so you can tell if a price is fair.",
    tags: ["sveltekit", "drizzle", "postgres"],
  },
  {
    name: "awesome-browser",
    desc: "A curated list of browsers, engines, extensions, and browser tooling.",
    tags: ["awesome-list", "markdown"],
  },
  {
    name: "dotfiles",
    desc: "My dotfiles: fish, neovim, kitty, tmux, deployed with a symlink script.",
    tags: ["bash", "fish", "lua", "linux"],
  },
];

// Curated cheatsheets for the `cheat` command. Topics not listed here link out
// to cht.sh. Keep these practical and short — the tools atalariq is re-learning.
export const cheatsheets = {
  git: [
    "# git — everyday",
    "git status                 working tree status",
    "git add -p                 stage hunks interactively",
    'git commit -m "msg"        commit staged changes',
    "git switch -c <branch>     create + switch branch",
    "git restore <file>         discard unstaged changes",
    "git log --oneline --graph  compact history",
    "git rebase -i <base>       interactive rebase",
    "git stash / stash pop      shelve / restore changes",
  ],
  vim: [
    "# vim — survival",
    ":w  :q  :wq  :q!           write / quit / both / force-quit",
    "i  a  o                    insert before / after / new line",
    "dd  yy  p                  delete / yank / paste line",
    "/pattern   n  N            search, next / prev match",
    ":%s/old/new/g              replace in file",
    "gg  G                      top / bottom of file",
    'ciw   ci"                  change inner word / quotes',
    ":noh                       clear search highlight",
  ],
  tmux: [
    "# tmux  (prefix = Ctrl-b)",
    "tmux new -s <name>         new named session",
    "prefix c   prefix ,        new window / rename window",
    'prefix %   prefix "        split vertical / horizontal',
    "prefix <arrow>             move between panes",
    "prefix z                   zoom pane toggle",
    "prefix d                   detach session",
    "tmux a -t <name>           attach session",
  ],
  fish: [
    "# fish shell",
    "funcsave <name>            persist a function",
    "abbr -a g git              add an abbreviation",
    "set -Ux VAR value          universal exported var",
    "type <cmd>                 what a command resolves to",
    "alt+.                      insert last argument",
    "fish_config               open the web config",
  ],
  docker: [
    "# docker",
    "docker ps -a               list containers",
    "docker compose up -d       start services detached",
    "docker compose logs -f     follow logs",
    "docker exec -it <c> sh     shell into a container",
    "docker images              list images",
    "docker system prune        reclaim space",
  ],
  tar: [
    "# tar",
    "tar -czf out.tgz dir/      create gzip archive",
    "tar -xzf out.tgz           extract gzip archive",
    "tar -tzf out.tgz           list archive contents",
    "tar -xzf a.tgz -C /dest    extract to a directory",
  ],
  ssh: [
    "# ssh",
    "ssh user@host              connect",
    "ssh-keygen -t ed25519      new key pair",
    "ssh-copy-id user@host      install your key",
    "~/.ssh/config              per-host options",
    "ssh -L 8080:localhost:80 h local port forward",
    "scp file user@host:/path   copy over ssh",
  ],
  fzf: [
    "# fzf",
    "fzf                        fuzzy-find stdin",
    "ctrl-r                     fuzzy history (with binding)",
    "ctrl-t                     fuzzy file into command line",
    "vim $(fzf)                 open a chosen file",
    "fzf --preview 'cat {}'     preview the selection",
  ],
};

// ── Extension placeholders ───────────────────────────────────────────────
// To add a section later: fill one of these arrays AND add a node to `tree`
// below. Example for certs:
//   { type: "dir", name: "certs",
//     children: certs.map((c) => ({
//       type: "file", name: c.name.toLowerCase().replace(/\s+/g, "-"),
//       render: () => `<p>${c.name} — ${c.issuer} (${c.year})</p>`,
//     })) }
export const certs = []; // { name, issuer, year, url }
export const experience = []; // { role, org, period, summary }

// ── Prose renderers (return HTML strings) ────────────────────────────────
export function renderAbout() {
  return [
    `<p><span class="green">Atalariq Barra Hadinugraha</span>. Aspiring software engineer, lifelong learner, vimmer.</p>`,
    `<p class="dim"># whereami</p>`,
    `<p>Software Engineering student at UGM Sekolah Vokasi, in Yogyakarta.</p>`,
    `<p class="dim"># status</p>`,
    `<p>I spend most of my time on agentic workflows: building harnesses and loops with AI agents, and using them to learn. My fundamentals are still shaky, so I'm going back through vim, git, docker, and the shell properly.</p>`,
    `<p class="dim"># stack</p>`,
    `<p>TS/JS and Go, mostly. Python, Bash/Fish, and Lua for dotfiles. Typst when I need to typeset something.</p>`,
    `<p class="dim"># interests</p>`,
    `<p>agentic ai, platform engineering, ricing, writing, hiking, plus books, music, and film.</p>`,
  ].join("");
}

export function renderVision() {
  return [
    `<h2 class="green"># vision</h2>`,
    `<p class="dim">## north star</p>`,
    `<p>I want to end up in infrastructure or platform engineering, mostly Go and TypeScript, working close to deployment and reliability. Realistically that's a few years out, around when I graduate.</p>`,
    `<p class="dim">## how i work</p>`,
    `<p>Most of what I build now, I build with AI agents. That lets me ship things I couldn't on my own yet, but it also means my own fundamentals lag behind, so I'm working on those in parallel. I learn fast and I don't mind changing my mind.</p>`,
    `<p class="dim">## learning in public</p>`,
    `<p>I write about what I'm learning on Journey and share bits on social. Video will come once I can afford a new laptop. Further out, I'd like to build a Kinnu-style app for learning things in small pieces.</p>`,
    `<p class="dim">## the long game</p>`,
    `<p>Graduate, get a job, start contributing to open source. Away from code: read more, listen to more music, watch more films.</p>`,
  ].join("");
}

export function renderContact() {
  return [
    `<p class="dim"># get in touch</p>`,
    `<p><a href="mailto:hi@atalariq.dev">hi@atalariq.dev</a></p>`,
    `<p class="dim"># status</p>`,
    `<p>open to internships and collaboration.</p>`,
    `<p class="dim"># elsewhere</p>`,
    `<p>the rest of my links are in <a href="#linktree">~/links</a> (run: tree links).</p>`,
  ].join("");
}

function renderProject(p) {
  const tags = p.tags.map((t) => `[${t}]`).join(" ");
  const link = p.url
    ? `<p><a href="${p.url}">${p.url.replace(/^https?:\/\/(www\.)?/, "")}</a></p>`
    : "";
  return (
    `<article class="project"><h2 class="green">${p.name}</h2>` +
    `<p>${p.desc}</p>${link}<p class="tags">${tags}</p></article>`
  );
}

function linkSlug(l) {
  return l.name.toLowerCase();
}

// ── The virtual filesystem ───────────────────────────────────────────────
export const tree = {
  type: "dir",
  name: "~",
  children: [
    { type: "file", name: "about.md", render: renderAbout },
    { type: "file", name: "vision.md", render: renderVision },
    { type: "file", name: "contact.md", render: renderContact },
    {
      type: "dir",
      name: "links",
      children: links.map((l) => ({
        type: "file",
        name: linkSlug(l),
        url: l.url,
        render: () =>
          `<p><a href="${l.url}">${l.url.replace(/^https?:\/\/(www\.)?/, "")}</a></p>`,
      })),
    },
    {
      type: "dir",
      name: "projects",
      children: projects.map((p) => ({
        type: "file",
        name: p.name,
        desc: p.desc,
        tags: p.tags,
        url: p.url,
        render: () => renderProject(p),
      })),
    },
  ],
};
