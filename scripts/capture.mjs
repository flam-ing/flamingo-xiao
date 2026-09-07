// Offline captures: same draw code/assets, NOT browser screenshots or human-play evidence.
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { writeFile, mkdir } from "node:fs/promises";
import { begin, tick, AREAS, neutral, MOVES } from "../src/fight.js";
import { render } from "../src/draw.js";
import { drawFighter } from "../src/poses.js";
import { normalVictory } from "./bot.mjs";
GlobalFonts.registerFromPath(
  "node_modules/galmuri/dist/Galmuri11.ttf",
  "Galmuri",
);
const images = Object.fromEntries(
  await Promise.all(
    AREAS.map(async (a) => [a.art, await loadImage(`public/art/${a.art}.png`)]),
  ),
);
const canvas = createCanvas(1200, 675),
  c = canvas.getContext("2d");
await mkdir("docs/cpu-previews", { recursive: true });
const s = begin(),
  saved = new Set(),
  writes = [];
normalVictory(s, 36000, (s, frame) => {
  if (
    s.banner === 0 &&
    s.player.attack &&
    s.player.attack.t >= MOVES[s.player.attack.name].contact &&
    !saved.has(s.area)
  ) {
    render(c, s, images);
    saved.add(s.area);
    writes.push(
      writeFile(
        `docs/cpu-previews/area-${s.area + 1}.jpg`,
        canvas.toBuffer("image/jpeg", 90),
      ),
    );
  }
});
await Promise.all(writes);
const poses = createCanvas(1200, 620),
  p = poses.getContext("2d");
p.fillStyle = "#d9d4bd";
p.fillRect(0, 0, 1200, 620);
const moves = ["jab", "cross", "kick", "airkick"];
moves.forEach((name, row) => {
  for (let i = 0; i < 6; i++) {
    const f = {
      ...begin().player,
      x: 60 + i * 200,
      y: 147 + row * 152,
      z: 0,
      attack: { name, t: (i * MOVES[name].length) / 5 },
      action: name,
    };
    drawFighter(p, f, { noMarkers: true });
    p.fillStyle = "#403830";
    p.font = "10px Galmuri";
    p.fillText(
      `${name} ${Math.round(((i * MOVES[name].length) / 5) * 1000)}ms`,
      f.x - 20,
      f.y + 12,
    );
  }
});
await writeFile(
  "docs/cpu-previews/joint-tracks.jpg",
  poses.toBuffer("image/jpeg", 90),
);
console.log(
  `Offline captures: ${saved.size} desk areas plus hand-authored joint tracks; normal run ended ${s.mode}.`,
);
