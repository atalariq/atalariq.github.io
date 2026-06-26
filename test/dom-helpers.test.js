import { test, expect, beforeEach } from "bun:test";
import {
  switchTab,
  appendOutput,
  echoPrompt,
  clearOutput,
} from "../terminal.js";

beforeEach(() => {
  document.body.innerHTML = `
    <button data-tab="about" aria-selected="true"></button>
    <button data-tab="projects" aria-selected="false"></button>
    <div id="output"></div>
  `;
});

test("switchTab updates aria-selected on the tab buttons", () => {
  switchTab(document, "projects");
  expect(
    document
      .querySelector('[data-tab="projects"]')
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(
    document.querySelector('[data-tab="about"]').getAttribute("aria-selected"),
  ).toBe("false");
});

test("appendOutput appends an html node to #output", () => {
  appendOutput(document, `<span class="err">boom</span>`);
  expect(document.querySelector("#output .err").textContent).toBe("boom");
});

test("echoPrompt appends the prompt info plus the (escaped) command", () => {
  echoPrompt(document, "atalariq", [], "<b>hi</b>");
  const line = document.querySelector("#output").textContent;
  expect(line).toContain("atalariq");
  expect(line).toContain("<b>hi</b>");
  expect(document.querySelector("#output b")).toBeNull();
});

test("clearOutput empties #output", () => {
  appendOutput(document, "<p>one</p>");
  clearOutput(document);
  expect(document.getElementById("output").innerHTML).toBe("");
});
