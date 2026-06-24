// test/content.test.js
import { test, expect } from "bun:test";
import { tree, links, projects, certs, experience } from "../content.js";
import { resolvePath, readFile, listDir } from "../filesystem.js";

test("tree root is ~ and holds the five sections", () => {
  expect(tree.name).toBe("~");
  const names = listDir(tree).map((e) => e.name);
  expect(names).toEqual([
    "about.md",
    "vision.md",
    "contact.md",
    "links",
    "projects",
  ]);
});

test("about/vision/contact are renderable files with real content", () => {
  expect(readFile(resolvePath(tree, [], "about.md").node)).toContain(
    "Atalariq Barra Hadinugraha",
  );
  expect(readFile(resolvePath(tree, [], "vision.md").node)).toContain("vision");
  expect(readFile(resolvePath(tree, [], "contact.md").node)).toContain("@");
});

test("links/ lists one node per link, each rendering its url", () => {
  const dir = resolvePath(tree, [], "links").node;
  expect(listDir(dir).length).toBe(links.length);
  const gh = resolvePath(tree, ["links"], "github").node;
  expect(readFile(gh)).toContain("github.com/atalariq");
});

test("projects/ lists one node per project, each rendering its tags", () => {
  const dir = resolvePath(tree, [], "projects").node;
  expect(listDir(dir).length).toBe(projects.length);
  const node = resolvePath(tree, ["projects"], projects[0].name).node;
  expect(readFile(node)).toContain(projects[0].tags[0]);
});

test("certs and experience are exported as arrays (extension placeholders)", () => {
  expect(Array.isArray(certs)).toBe(true);
  expect(Array.isArray(experience)).toBe(true);
});
