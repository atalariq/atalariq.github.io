// content.js — portfolio content + virtual filesystem tree.
// THIS IS THE FILE YOU EDIT to update the site. Logic lives in commands.js /
// filesystem.js / terminal.js. Renderers return trusted, static HTML strings.

export const links = [
  { name: "GitHub", url: "https://github.com/atalariq" },
  { name: "LinkedIn", url: "https://linkedin.com/in/atalariq" },
  { name: "Instagram", url: "https://instagram.com/atalariq.dev" },
  { name: "Journal", url: "https://journal.atalariq.dev" },
  { name: "Medium", url: "https://medium.com/@atalariq" },
];

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
    `<p><span class="green">Atalariq Barra Hadinugraha</span> — CS student from Indonesia.</p>`,
    `<p class="dim"># status</p>`,
    `<p>exploring agentic workflows, harness &amp; loop engineering.</p>`,
    `<p>re-learning vim, git, docker, and advanced CLI from the ground up.</p>`,
    `<p class="dim"># stack</p>`,
    `<p>Go · JS/TS (Bun) · Linux · Docker</p>`,
  ].join("");
}

export function renderVision() {
  return [
    `<h2 class="green"># vision</h2>`,
    `<p>Become a Platform Engineer — Go + JS/TS (Bun), DevOps, Cloud, SRE.</p>`,
    `<h2 class="green"># teaching</h2>`,
    `<p>Build an MIT "Missing Semester"-style curriculum for Indonesian students: the practical tooling no one teaches in class.</p>`,
  ].join("");
}

export function renderContact() {
  return [
    `<p># get in touch</p>`,
    `<p><a href="mailto:rfachrizal98@gmail.com">rfachrizal98@gmail.com</a></p>`,
    `<p class="dim">or find me on any of the links in <a href="#linktree">~/links</a>.</p>`,
  ].join("");
}

function renderProject(p) {
  const tags = p.tags.map((t) => `[${t}]`).join(" ");
  return (
    `<article class="project"><h2 class="green">${p.name}</h2>` +
    `<p>${p.desc}</p><p class="tags">${tags}</p></article>`
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
        render: () =>
          `<p><a href="${l.url}">${l.url.replace(/^https?:\/\//, "")}</a></p>`,
      })),
    },
    {
      type: "dir",
      name: "projects",
      children: projects.map((p) => ({
        type: "file",
        name: p.name,
        render: () => renderProject(p),
      })),
    },
  ],
};
