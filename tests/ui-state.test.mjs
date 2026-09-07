import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { begin, nextArea } from "../src/fight.js";

test("native hidden always outranks modal and button display rules", () => {
  const css = readFileSync(
    new URL("../src/style.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important\s*;/);
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  for (const id of ["paused", "instructions", "result"]) {
    assert.match(html, new RegExp(`<div[^>]*id="${id}"[^>]*hidden`));
  }
});

test("next action rejects failed and final-win state fixtures", () => {
  for (const mode of ["failed", "won"]) {
    const s = begin();
    s.mode = mode;
    const before = JSON.stringify(s);
    assert.equal(nextArea(s), false);
    assert.equal(JSON.stringify(s), before);
  }
});
