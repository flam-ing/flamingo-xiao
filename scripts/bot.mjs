// A deterministic test opponent controller. It only supplies ordinary game inputs.
import { neutral, MOVES, tick, nextArea } from "../src/fight.js";
export function botInput(s, frame) {
  const input = neutral(),
    p = s.player;
  const enemies = s.enemies
    .filter((e) => e.hp > 0 && e.down <= 0)
    .sort(
      (a, b) =>
        Math.abs(a.x - p.x) +
        Math.abs(a.y - p.y) * 2 -
        (Math.abs(b.x - p.x) + Math.abs(b.y - p.y) * 2),
    );
  const target = enemies[0];
  if (!target) return input;
  const dx = target.x - p.x,
    dy = target.y - p.y;
  if (Math.abs(dy) > 10) {
    input.up = dy < 0;
    input.down = dy > 0;
  }
  if (Math.abs(dx) > 62) {
    input.left = dx < 0;
    input.right = dx > 0;
  } else if (Math.sign(dx) !== p.facing) {
    input.left = dx < 0;
    input.right = dx > 0;
  }
  const threat = enemies.find(
    (e) =>
      e.attack &&
      Math.abs(e.x - p.x) < MOVES[e.attack.name].range + 10 &&
      Math.abs(e.y - p.y) < 29 &&
      MOVES[e.attack.name].contact - e.attack.t < 0.14 &&
      MOVES[e.attack.name].contact - e.attack.t > -0.08,
  );
  if (threat && !p.attack && p.z === 0) {
    input.guard = true;
    return input;
  }
  if (Math.abs(dx) < 98 && Math.abs(dy) < 24) {
    if (!p.attack && p.z === 0 && frame % 3 === 0) {
      input.jump = true;
    } else if (p.z > 10 && !p.attack && frame % 3 === 0) {
      input.attack = true;
    } else if (p.counter > 0 && !p.attack) {
      input.attack = frame % 3 === 0;
    }
  }
  return input;
}
export function normalVictory(s, maxFrames = 36000, onFrame) {
  let frame = 0;
  while (!["won", "failed"].includes(s.mode) && frame < maxFrames) {
    if (s.mode === "cleared") nextArea(s);
    const input = botInput(s, frame);
    tick(s, input, 1 / 60);
    onFrame?.(s, frame, input);
    frame++;
  }
  return {
    mode: s.mode,
    frame,
    hp: s.player.hp,
    score: s.score,
    defeated: s.totalDefeated,
    area: s.area,
  };
}
