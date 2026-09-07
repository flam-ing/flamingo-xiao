import { WIDTH, HEIGHT, AREAS, MOVES } from "./fight.js";
import { drawFighter } from "./poses.js";
function text(c, t, x, y, size = 16, color = "#eee3ca", align = "left") {
  c.font = `${size}px Galmuri, monospace`;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = "middle";
  c.fillText(t, x, y);
}
function ellipse(c, x, y, rx, ry, fill) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}
function monitor(c, s) {
  if (s.area !== 0) return;
  c.save();
  c.beginPath();
  c.rect(376, 72, 466, 132);
  c.clip();
  c.fillStyle = "#c7ccc6";
  c.fillRect(376, 72, 466, 132);
  c.fillStyle = "#788e9a";
  c.fillRect(376, 72, 466, 14);
  text(c, "untitled_fight · frame editor", 386, 80, 8, "#f1f4e7");
  c.fillStyle = "#979b96";
  c.fillRect(380, 91, 36, 105);
  for (let j = 0; j < 8; j++) {
    c.strokeStyle = "#606a67";
    c.strokeRect(385 + (j % 2) * 14, 94 + Math.floor(j / 2) * 20, 9, 12);
  }
  c.fillStyle = "#f1f2e5";
  c.fillRect(422, 111, 328, 78);
  c.fillStyle = "#92988e";
  c.fillRect(755, 92, 78, 108);
  for (let i = 0; i < 7; i++) {
    c.fillStyle = i === Math.floor(s.elapsed * 5) % 7 ? "#ddb761" : "#c6ccc0";
    c.fillRect(425 + i * 44, 91, 41, 14);
  }
  const mini = {
    ...s.player,
    x: 563,
    y: 182,
    z: 0,
    walk: s.elapsed,
    action: s.player.action,
  };
  c.save();
  c.translate(465, 175);
  c.scale(0.28, 0.28);
  drawFighter(c, { ...mini, x: 180, y: 0 }, { noMarkers: true });
  drawFighter(
    c,
    {
      ...(s.enemies[0] ?? s.player),
      x: 365,
      y: 0,
      z: 0,
      type: "ink",
      hp: 40,
      maxHp: 40,
      facing: -1,
    },
    { noMarkers: true },
  );
  c.restore();
  for (let i = 0; i < 5; i++) {
    c.fillStyle = "#d5d9ce";
    c.fillRect(761, 100 + i * 18, 65, 10);
  }
  c.restore();
}
function hud(c, s) {
  c.fillStyle = "#1b2027d9";
  c.fillRect(20, 17, 428, 66);
  c.fillStyle = "#bd3037";
  c.fillRect(97, 31, 331, 15);
  c.fillStyle = "#e7d34b";
  c.fillRect(97, 31, (331 * s.player.hp) / 100, 15);
  c.strokeStyle = "#f1ead1";
  c.lineWidth = 1;
  c.strokeRect(97, 31, 331, 15);
  text(c, "1P", 34, 40, 22, "#dcecf1");
  text(c, "홍학 먹선", 98, 65, 12, "#dbe1d5");
  text(c, `${s.player.hp} / 100`, 427, 65, 12, "#e9d979", "right");
  c.fillStyle = "#151d23";
  c.fillRect(28, 95, 168, 8);
  c.fillStyle = s.player.counter > 0 ? "#fff9b0" : "#98b8b2";
  c.fillRect(28, 95, (168 * s.player.guardMeter) / 100, 8);
  text(
    c,
    s.player.counter > 0 ? "COUNTER READY" : "GUARD",
    204,
    100,
    9,
    "#f1f0d1",
  );
  c.fillStyle = "#21252de0";
  c.fillRect(535, 16, 130, 75);
  text(c, "TIME", 600, 33, 12, "#cbb8c6", "center");
  text(
    c,
    s.practice ? "∞" : String(Math.ceil(s.time)).padStart(3, "0"),
    600,
    61,
    31,
    "#eeeac7",
    "center",
  );
  c.fillStyle = "#1b2027d9";
  c.fillRect(752, 17, 428, 66);
  text(c, `0${s.area + 1} · ${AREAS[s.area].name}`, 771, 36, 16, "#ecdfad");
  text(
    c,
    `${String(s.score).padStart(6, "0")} PTS`,
    1160,
    36,
    17,
    "#eee5ce",
    "right",
  );
  const alive = s.enemies.filter((e) => e.hp > 0).length;
  text(
    c,
    `무리 ${s.wave + 1}/${AREAS[s.area].waves.length}   남은 적 ${alive}`,
    771,
    65,
    12,
    "#d5d6ce",
  );
  text(c, `BEST ${s.bestCombo} HIT`, 1160, 65, 12, "#e5bf5b", "right");
  const boss = s.enemies.find((e) => e.type === "boss" && e.hp > 0);
  if (boss) {
    c.fillStyle = "#232327db";
    c.fillRect(387, 112, 426, 30);
    text(c, "키보드 수문장", 398, 127, 11, "#f8e8bf");
    c.fillStyle = "#733838";
    c.fillRect(498, 122, 300, 10);
    c.fillStyle = "#d19251";
    c.fillRect(498, 122, (300 * boss.hp) / boss.maxHp, 10);
  }
}
export function render(c, s, images = {}, reducedMotion = false) {
  c.clearRect(0, 0, WIDTH, HEIGHT);
  c.fillStyle = "#b8874a";
  c.fillRect(0, 0, WIDTH, HEIGHT);
  c.save();
  if (!reducedMotion && s.shake)
    c.translate(
      Math.sin(s.elapsed * 137) * s.shake,
      Math.cos(s.elapsed * 100) * s.shake * 0.5,
    );
  const image = images[AREAS[s.area].art];
  if (image) c.drawImage(image, 0, 0, WIDTH, HEIGHT);
  monitor(c, s);
  // Thin pencil construction lines show real depth lanes subtly, not a flat 1-D duel.
  c.strokeStyle = "#3f291019";
  c.lineWidth = 1;
  for (const y of [442, 490, 546]) {
    c.beginPath();
    c.moveTo(65, y + 4);
    c.lineTo(1135, y + 4);
    c.stroke();
  }
  const fighters = [s.player, ...s.enemies]
    .filter((f) => f.hp > 0 || f.deadTime < 2)
    .sort((a, b) => a.y - b.y);
  for (const f of fighters) {
    ellipse(
      c,
      f.x,
      f.y + 3,
      26 * (f.type === "boss" ? 1.3 : 1),
      6,
      `rgba(35,21,12,${Math.max(0.06, 0.23 - f.z * 0.001)})`,
    );
  }
  for (const f of fighters) {
    drawFighter(c, f);
    if (
      f.attack &&
      f.type !== "player" &&
      f.attack.t < MOVES[f.attack.name].contact
    ) {
      const t = f.attack.t / MOVES[f.attack.name].contact,
        x = f.x,
        y = f.y - f.z - (f.type === "boss" ? 192 : 160);
      c.globalAlpha = 0.5 + t * 0.5;
      text(c, "!", x, y, 25, "#e94538", "center");
      c.globalAlpha = 1;
    }
  }
  for (const hit of s.sparks) {
    const phase = 1 - hit.life / 0.24,
      r = 10 + phase * 31;
    c.save();
    c.translate(hit.x, hit.y);
    c.rotate(hit.seed);
    c.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8,
        rr = i % 2 ? r * 0.35 : r * (i % 3 ? 0.85 : 1.2);
      i
        ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
        : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
    c.globalAlpha = 1 - phase;
    c.fillStyle =
      hit.kind === "parry"
        ? "#e9fdde"
        : hit.kind === "block"
          ? "#badfe1"
          : "#fff16e";
    c.fill();
    c.strokeStyle = hit.kind === "hit" ? "#d4a52b" : "#79adba";
    c.lineWidth = 2;
    c.stroke();
    c.restore();
  }
  for (const t of s.texts) {
    c.globalAlpha = Math.min(1, t.life * 3);
    c.strokeStyle = "#3e2630";
    c.lineWidth = 4;
    c.font = "bold 19px Galmuri, monospace";
    c.textAlign = "center";
    c.strokeText(t.text, t.x, t.y);
    text(c, t.text, t.x, t.y, 19, "#fff17d", "center");
  }
  c.globalAlpha = 1;
  c.restore();
  hud(c, s);
  if (s.banner > 0 && s.mode === "playing") {
    const alpha = Math.min(1, s.banner);
    c.globalAlpha = alpha;
    c.fillStyle = "#1b1f24d9";
    c.fillRect(370, 243, 460, 70);
    text(c, AREAS[s.area].tag, 600, 268, 16, "#e0c251", "center");
    text(c, `${s.wave + 1}번째 무리`, 600, 294, 12, "#e7e9d8", "center");
    c.globalAlpha = 1;
  }
  if (s.mode === "playing" && s.player.hp < 25) {
    text(
      c,
      "체력 주의 · C로 막고 빈틈에 반격",
      600,
      638,
      13,
      "#fff3b4",
      "center",
    );
  }
}
