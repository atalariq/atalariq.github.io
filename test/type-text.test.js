import { test, expect } from "bun:test";
import { typeText } from "../terminal.js";

test("types the full text into the element character by character", async () => {
  document.body.innerHTML = `<span id="t"></span>`;
  const el = document.getElementById("t");
  const sync = (fn) => fn(); // run scheduled ticks immediately
  await typeText(el, "whoami", 0, sync);
  expect(el.textContent).toBe("whoami");
});

test("resolves a promise when done", async () => {
  document.body.innerHTML = `<span id="t"></span>`;
  const el = document.getElementById("t");
  const result = await typeText(el, "hi", 0, (fn) => fn());
  expect(result).toBeUndefined(); // resolves with no value
});

test("handles empty string", async () => {
  document.body.innerHTML = `<span id="t"></span>`;
  const el = document.getElementById("t");
  await typeText(el, "", 0, (fn) => fn());
  expect(el.textContent).toBe("");
});
