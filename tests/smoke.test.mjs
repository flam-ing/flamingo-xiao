import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  begin,
  tick,
  neutral,
  canStrike,
  MOVES,
  pause,
  resume,
  nextArea,
} from "../src/fight.js";
function run(s, seconds, input = neutral()) {
  for (let t = 0; t < seconds; t += 1 / 60) tick(s, input, 1 / 60);
}
test("title has no timer or movement", () => {
  const s = createGame(),
    before = JSON.stringify(s);
  run(s, 5, { ...neutral(), right: true });
  assert.equal(JSON.stringify(s), before);
});
test("normal arrow input changes only bounded position and facing", () => {
  const s = begin();
  run(s, 0.3, { ...neutral(), right: true });
  assert.ok(s.player.x > 395);
  assert.equal(s.player.facing, 1);
  run(s, 0.3, { ...neutral(), left: true });
  assert.equal(s.player.facing, -1);
  run(s, 10, { ...neutral(), up: true });
  assert.equal(s.player.y, 430);
});
test("attack edge begins anticipation; holding attack does not repeat", () => {
  const s = begin();
  tick(s, { ...neutral(), attack: true });
  assert.equal(s.player.attack.name, "jab");
  assert.ok(s.player.attack.t < MOVES.jab.contact);
  run(s, 0.8, { ...neutral(), attack: true });
  assert.equal(s.player.attack, null);
});
test("jump leaves the ground; airborne Z chooses flying kick", () => {
  const s = begin();
  tick(s, { ...neutral(), jump: true });
  run(s, 0.12);
  assert.ok(s.player.z > 10);
  tick(s, { ...neutral(), attack: true });
  assert.equal(s.player.attack.name, "airkick");
  run(s, 1);
  assert.equal(s.player.z, 0);
});
test("strike requires front-facing range and same depth lane", () => {
  const a = { x: 300, y: 470, z: 0, facing: 1 },
    b = { x: 350, y: 470, z: 0, hp: 10, down: 0, type: "ink" };
  assert.ok(canStrike(a, b, MOVES.jab));
  assert.equal(canStrike(a, { ...b, x: 240 }, MOVES.jab), false);
  assert.equal(canStrike(a, { ...b, y: 530 }, MOVES.jab), false);
  assert.equal(canStrike(a, { ...b, x: 500 }, MOVES.jab), false);
  assert.equal(canStrike(a, { ...b, z: 100 }, MOVES.jab), false);
});
test("pause clears held guard and input buffer then freezes all simulation", () => {
  const s = begin();
  tick(s, { ...neutral(), guard: true });
  pause(s);
  assert.equal(s.player.guard, false);
  const before = JSON.stringify(s);
  run(s, 5, { ...neutral(), attack: true });
  assert.equal(JSON.stringify(s), before);
  resume(s);
  assert.equal(s.mode, "playing");
  assert.equal(s.previous.attack, false);
});
test("practice freezes deadline but not enemy attack", () => {
  const s = begin(true),
    time = s.time;
  run(s, 12);
  assert.equal(s.time, time);
  assert.ok(s.player.hp < 100);
});
test("idle player eventually loses through actual enemy attacks", () => {
  const s = begin();
  run(s, 80);
  assert.equal(s.mode, "failed");
  assert.equal(s.reason, "knockout");
  assert.equal(s.player.hp, 0);
});
test("cannot advance during active fight", () => {
  const s = begin();
  assert.equal(nextArea(s), false);
  assert.equal(s.area, 0);
});
test("new session is clean and does not retain old inputs/score", () => {
  const s = begin();
  run(s, 7, { ...neutral(), guard: true });
  const clean = begin();
  assert.equal(clean.player.hp, 100);
  assert.equal(clean.score, 0);
  assert.equal(clean.player.guard, false);
  assert.equal(clean.totalDefeated, 0);
  assert.equal(clean.time, 120);
});
