> Live at [`atalariq.dev`](https://atalariq.dev)

# atalariq.github.io

A full terminal-UI personal portfolio — the whole page is a terminal.
Pure static site: HTML + CSS + native ES modules, no framework, no bundler.

## Develop

- Serve locally: `bun run dev` (the site uses ES modules — it must be served
  over HTTP, not opened as a `file://` path)
- Run unit tests: `bun test`
- Run E2E tests: `bun run test:e2e` (Playwright against the real site at
  desktop + mobile viewports; uses the system Chrome, no browser download)

Content lives in `content.js` — the virtual filesystem tree plus the prose
renderers (edit this to update the site); `data.js` holds config. The terminal
engine is split across `terminal.js` (DOM + bootstrap), `commands.js` (command
registry), `filesystem.js` (path resolution), and `terminal-keys.js` (key
bindings). Colors come from the wana design system via `tokens/base.css`.
