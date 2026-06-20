import { test, expect } from "bun:test";
import { CommandHistory } from "../terminal.js";

test("prev() on empty history returns null", () => {
  const h = new CommandHistory();
  expect(h.prev()).toBe(null);
});

test("prev() walks backward from most recent to oldest", () => {
  const h = new CommandHistory();
  h.add("about");
  h.add("projects");
  expect(h.prev()).toBe("projects");
  expect(h.prev()).toBe("about");
  expect(h.prev()).toBe("about"); // clamps at oldest
});

test("next() walks forward and returns '' past the newest", () => {
  const h = new CommandHistory();
  h.add("about");
  h.add("projects");
  h.prev(); // -> projects
  h.prev(); // -> about
  expect(h.next()).toBe("projects");
  expect(h.next()).toBe(""); // past newest = blank input
});

test("add() ignores blank entries", () => {
  const h = new CommandHistory();
  h.add("   ");
  h.add("");
  expect(h.prev()).toBe(null);
});

test("add() collapses consecutive duplicates", () => {
  const h = new CommandHistory();
  h.add("help");
  h.add("help");
  expect(h.prev()).toBe("help");
  expect(h.prev()).toBe("help"); // only one entry, clamps
});

test("adding a command after browsing resets the cursor to the end", () => {
  const h = new CommandHistory();
  h.add("about");
  h.add("projects");
  h.prev(); // browsing
  h.add("vision");
  expect(h.prev()).toBe("vision");
});
