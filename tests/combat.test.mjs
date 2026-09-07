import test from "node:test";
import assert from "node:assert/strict";
import { begin, tick, neutral, MOVES, clearInput } from "../src/fight.js";
import { pose } from "../src/poses.js";
import { normalVictory } from "../scripts/bot.mjs";
const step = (s, input = neutral()) => tick(s, input, 1 / 60);
function advance(s, n, input = neutral()) {
  for (let i = 0; i < n; i++) step(s, input);
}
test("ordinary-input controller completes three areas, twelve opponents and final boss", () => {
  const s = begin(),
    result = normalVictory(s);
  assert.equal(result.mode, "won");
  assert.equal(result.defeated, 12);
  assert.equal(s.history.length, 3);
  assert.ok(s.history.every((h) => h.time > 0 && h.hp > 0));
  assert.ok(s.score > 3000);
  assert.ok(s.bestCombo >= 2);
  assert.ok(result.frame < 36000);
});
test("full normal run is deterministic, not based on wall clock or random state", () => {
  const a = begin(),
    b = begin();
  assert.deepEqual(normalVictory(a), normalVictory(b));
  assert.deepEqual(a.history, b.history);
});
test("buffered Z in recovery links to cross without a held-key repeat", () => {
  const s = begin();
  step(s, { ...neutral(), attack: true });
  advance(s, 11);
  step(s, { ...neutral(), attack: true });
  advance(s, 10);
  assert.equal(s.player.attack?.name, "cross");
});
test("an early buffered attack expires instead of firing long after release", () => {
  const s = begin();
  step(s, { ...neutral(), attack: true });
  step(s);
  step(s, { ...neutral(), attack: true });
  advance(s, 30);
  assert.equal(s.player.attack, null);
  assert.equal(s.player.buffer, null);
});
test("a correctly timed front guard parries a real approaching attacker", () => {
  const s = begin();
  let parried = false;
  for (let frame = 0; frame < 450; frame++) {
    const input = neutral();
    const threat = s.enemies.find(
      (e) =>
        e.attack &&
        e.x > s.player.x &&
        Math.abs(e.y - s.player.y) < 29 &&
        MOVES[e.attack.name].contact - e.attack.t < 0.12,
    );
    if (threat) input.guard = true;
    step(s, input);
    if (s.player.counter > 0) {
      parried = true;
      break;
    }
  }
  assert.ok(parried);
  assert.ok(s.sparks.some((e) => e.kind === "parry"));
  assert.ok(s.score >= 40);
  step(s, { ...neutral(), attack: true });
  advance(s, 6);
  assert.equal(s.player.attack?.name, "counter");
});
test("holding front guard early produces blocks instead of endless parries", () => {
  const s = begin();
  let blocks = 0;
  for (let i = 0; i < 300 && s.mode === "playing"; i++) {
    step(s, { ...neutral(), guard: true });
    blocks += s.sparks.some((e) => e.kind === "block") ? 1 : 0;
  }
  assert.ok(blocks > 0);
  assert.ok(s.player.guardMeter < 100);
});
test("released input queue cannot launch an old jump after focus restoration", () => {
  const s = begin();
  step(s, { ...neutral(), attack: true });
  step(s, { ...neutral(), jump: true });
  assert.equal(s.player.buffer, "jump");
  clearInput(s);
  advance(s, 45);
  assert.equal(s.player.z, 0);
  assert.equal(s.player.buffer, null);
});
test("timer expiration unit fixture ends a live fight without changing health", () => {
  const s = begin();
  s.time = 0.02;
  advance(s, 3);
  assert.equal(s.mode, "failed");
  assert.equal(s.reason, "time");
  assert.equal(s.player.hp, 100);
});
test("all joint tracks retain eleven finite joints throughout each move", () => {
  const p = begin().player;
  for (const [name, move] of Object.entries(MOVES)) {
    for (let n = 0; n <= 20; n++) {
      const pts = pose({ ...p, attack: { name, t: (move.length * n) / 20 } });
      assert.equal(pts.length, 22);
      assert.ok(pts.every(Number.isFinite));
    }
  }
});
test("impact poses extend the striking limb after anticipation", () => {
  const p = begin().player,
    jabWind = pose({ ...p, attack: { name: "jab", t: 0.075 } }),
    jabHit = pose({ ...p, attack: { name: "jab", t: 0.115 } }),
    kickCoil = pose({ ...p, attack: { name: "kick", t: 0.16 } }),
    kickHit = pose({ ...p, attack: { name: "kick", t: 0.24 } });
  assert.ok(jabHit[12] - jabWind[12] > 50);
  assert.ok(kickHit[20] - kickCoil[20] > 70);
});
test("one-frame X edge survives unconsumed hit-stop ticks", () => {
  const s = begin();
  s.hitStop = 0.06;
  tick(s, neutral(), 1 / 60, { jump: true });
  assert.equal(s.player.buffer, "jump");
  advance(s, 6);
  assert.ok(s.player.z > 0);
});
test("queued hit-stop action is discarded by pause/blur reset hook", () => {
  const s = begin();
  s.hitStop = 0.06;
  tick(s, neutral(), 1 / 60, { jump: true });
  clearInput(s);
  advance(s, 6);
  assert.equal(s.player.z, 0);
  assert.equal(s.player.buffer, null);
});
