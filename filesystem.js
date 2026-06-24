// filesystem.js — pure helpers over a content node tree. No DOM, no data import.
// file: { type:"file", name, render:()=>html }   dir: { type:"dir", name, children:[] }
// cwd is an array of dir names under the root "~", e.g. ["projects"].

function childByName(dir, name) {
  if (!dir || dir.type !== "dir") return null;
  return dir.children.find((c) => c.name === name) || null;
}

// Build the raw segment list from cwd + a path argument.
function pathSegments(cwd, arg) {
  const a = (arg || "").trim();
  if (a === "") return [...cwd];
  if (a === "~" || a.startsWith("~/")) return a.slice(1).split("/");
  if (a.startsWith("/")) return a.split("/");
  return [...cwd, ...a.split("/")];
}

/**
 * Resolve a path against cwd. Supports ~, ., .., trailing slashes, relative
 * and ~/-rooted paths.
 * @returns {{node, path:string[]}} on success, or null if not found.
 */
export function resolvePath(root, cwd, arg) {
  const segments = pathSegments(cwd, arg);
  const stack = [root];
  const names = [];
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      if (stack.length > 1) {
        stack.pop();
        names.pop();
      }
      continue;
    }
    const next = childByName(stack[stack.length - 1], seg);
    if (!next) return null;
    stack.push(next);
    names.push(seg);
  }
  return { node: stack[stack.length - 1], path: names };
}

/** Child {name,type} entries for a dir, or null for a file. */
export function listDir(node) {
  if (!node || node.type !== "dir") return null;
  return node.children.map((c) => ({ name: c.name, type: c.type }));
}

/** Rendered HTML for a file, or null for a dir. */
export function readFile(node) {
  if (!node || node.type !== "file") return null;
  return node.render();
}

/** Display string for a cwd path: "~" or "~/projects". */
export function formatCwd(path) {
  return path.length ? "~/" + path.join("/") : "~";
}
