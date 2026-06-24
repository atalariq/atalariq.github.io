// test/filesystem.test.js
import { test, expect } from "bun:test";
import { resolvePath, listDir, readFile, formatCwd } from "../filesystem.js";

const root = {
  type: "dir",
  name: "~",
  children: [
    { type: "file", name: "about.md", render: () => "<p>about</p>" },
    {
      type: "dir",
      name: "projects",
      children: [{ type: "file", name: "dotfiles", render: () => "<p>df</p>" }],
    },
  ],
};

test("resolvePath with no arg returns the cwd node", () => {
  expect(resolvePath(root, [], undefined).node).toBe(root);
  expect(resolvePath(root, ["projects"], "").node.name).toBe("projects");
});

test("resolvePath resolves a relative child", () => {
  expect(resolvePath(root, [], "about.md").node.name).toBe("about.md");
  expect(resolvePath(root, [], "projects").path).toEqual(["projects"]);
});

test("resolvePath handles ~, .. and absolute-ish paths", () => {
  expect(resolvePath(root, ["projects"], "~").node).toBe(root);
  expect(resolvePath(root, ["projects"], "..").node).toBe(root);
  expect(resolvePath(root, [], "~/projects/dotfiles").node.name).toBe(
    "dotfiles",
  );
  expect(resolvePath(root, ["projects"], "../about.md").node.name).toBe(
    "about.md",
  );
});

test("resolvePath returns null for a missing path", () => {
  expect(resolvePath(root, [], "nope")).toBeNull();
  expect(resolvePath(root, [], "about.md/x")).toBeNull();
});

test("listDir lists child name+type, null for a file", () => {
  expect(listDir(root)).toEqual([
    { name: "about.md", type: "file" },
    { name: "projects", type: "dir" },
  ]);
  expect(listDir(resolvePath(root, [], "about.md").node)).toBeNull();
});

test("readFile renders a file, null for a dir", () => {
  expect(readFile(resolvePath(root, [], "about.md").node)).toBe("<p>about</p>");
  expect(readFile(root)).toBeNull();
});

test("formatCwd prints ~ or ~/path", () => {
  expect(formatCwd([])).toBe("~");
  expect(formatCwd(["projects"])).toBe("~/projects");
});
