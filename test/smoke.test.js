import { test, expect } from "bun:test";

test("harness runs", () => {
  expect(1 + 1).toBe(2);
});

test("happy-dom provides a document", () => {
  document.body.innerHTML = `<p id="x">hi</p>`;
  expect(document.getElementById("x").textContent).toBe("hi");
});
