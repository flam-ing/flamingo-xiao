// Hand-authored joint tracks. Coordinates are relative to the grounded foot plane.
// hip, shoulder, head, rear elbow/wrist, front elbow/wrist, rear knee/foot, front knee/foot.
const idle = [
  0, -52, 5, -79, 19, -116, -17, -61, 7, -59, 27, -69, 40, -88, -19, -27, -32,
  0, 16, -24, 34, 0,
];
const wind = [
  -8, -51, -5, -78, 8, -115, -26, -67, -4, -83, 8, -64, 16, -83, -21, -27, -35,
  0, 11, -23, 31, 0,
];
const jab = [
  10, -52, 23, -80, 35, -115, -3, -61, 22, -66, 49, -83, 78, -85, -10, -26, -33,
  0, 32, -29, 40, 0,
];
const cross = [
  13, -53, 25, -82, 39, -117, 45, -84, 87, -88, 15, -61, 26, -81, -8, -22, -34,
  0, 28, -28, 42, 0,
];
const coil = [
  -8, -54, -10, -82, 0, -116, -31, -67, -25, -88, 6, -64, 29, -86, -22, -26,
  -25, 0, 28, -52, 15, -27,
];
const kick = [
  -12, -53, -29, -79, -19, -118, -48, -66, -55, -90, -5, -83, 11, -103, -17,
  -27, -23, 0, 44, -66, 99, -70,
];
const jump = [
  0, -57, -2, -85, 11, -121, -20, -72, -28, -95, 19, -70, 33, -92, -30, -48,
  -43, -27, 27, -44, 9, -20,
];
const airkick = [
  -9, -59, -24, -87, -13, -123, -39, -75, -52, -96, -3, -76, 7, -98, -28, -35,
  -43, -40, 40, -66, 101, -76,
];
const guard = [
  -4, -51, -3, -77, 7, -112, 13, -65, 29, -94, 24, -65, 31, -104, -23, -27, -35,
  0, 18, -27, 29, 0,
];
const stunned = [
  -9, -49, -22, -74, -28, -104, -38, -57, -31, -34, 2, -55, 16, -34, -25, -26,
  -40, 0, 11, -24, 36, 0,
];
const down = [
  0, -12, -32, -17, -59, -28, -31, -4, -63, -2, -21, -2, -1, 5, 33, -7, 66, -1,
  20, -19, 52, -23,
];
const victory = [
  0, -56, 1, -84, 16, -121, -19, -75, -37, -90, 22, -109, 29, -144, -16, -28,
  -29, 0, 17, -28, 28, 0,
];
const upper = [
  10, -58, 11, -90, 25, -124, -7, -63, 18, -76, 36, -115, 48, -156, -13, -31,
  -32, 0, 28, -32, 43, 0,
];
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function track(t, keys) {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const previous = keys[i - 1],
        next = keys[i];
      let f = (t - previous[0]) / (next[0] - previous[0]);
      f = Math.max(0, Math.min(1, f));
      return lerp(previous[1], next[1], f);
    }
  }
  return keys.at(-1)[1];
}
export function pose(f) {
  const t = f.attack?.t ?? f.t;
  if (f.hp <= 0 || f.down > 0) return down;
  if (f.action === "rise")
    return track(Math.min(t, 0.25), [
      [0, down],
      [0.25, idle],
    ]);
  if (f.stun > 0 || f.action === "stun") return stunned;
  if (f.action === "victory") return victory;
  if (f.guard || f.action === "guard") return guard;
  const name = f.attack?.name;
  if (name === "jab")
    return track(t, [
      [0, idle],
      [0.075, wind],
      [0.115, jab],
      [0.18, jab],
      [0.34, idle],
    ]);
  if (name === "cross")
    return track(t, [
      [0, idle],
      [0.1, wind],
      [0.15, cross],
      [0.23, cross],
      [0.42, idle],
    ]);
  if (name === "kick" || name === "counter")
    return track(t, [
      [0, idle],
      [name === "counter" ? 0.08 : 0.16, coil],
      [name === "counter" ? 0.14 : 0.24, kick],
      [name === "counter" ? 0.23 : 0.34, kick],
      [name === "counter" ? 0.48 : 0.6, idle],
    ]);
  if (name === "airkick")
    return track(t, [
      [0, jump],
      [0.08, coil],
      [0.12, airkick],
      [0.31, airkick],
      [0.47, jump],
    ]);
  if (name === "enemyjab")
    return track(t, [
      [0, idle],
      [0.2, wind],
      [0.37, wind],
      [0.4, cross],
      [0.47, cross],
      [0.78, idle],
    ]);
  if (name === "enemykick")
    return track(t, [
      [0, idle],
      [0.25, coil],
      [0.45, coil],
      [0.49, kick],
      [0.6, kick],
      [0.94, idle],
    ]);
  if (name === "bossstrike")
    return track(t, [
      [0, idle],
      [0.26, coil],
      [0.5, coil],
      [0.55, kick],
      [0.7, kick],
      [1.1, idle],
    ]);
  if (name === "bossupper")
    return track(t, [
      [0, idle],
      [0.24, coil],
      [0.43, coil],
      [0.46, upper],
      [0.64, upper],
      [0.95, idle],
    ]);
  if (f.z > 0) return jump;
  if (f.action === "walk") {
    const p = [...idle],
      phase = f.walk * 12,
      s = Math.sin(phase),
      co = Math.cos(phase);
    p[0] = Math.sin(phase * 2) * 2;
    p[1] -= Math.abs(s) * 3;
    p[14] = -s * 26;
    p[15] = -29 + Math.max(0, co) * 4;
    p[16] = -s * 36;
    p[17] = -Math.max(0, co) * 14;
    p[18] = s * 26;
    p[19] = -29 + Math.max(0, -co) * 4;
    p[20] = s * 36;
    p[21] = -Math.max(0, -co) * 14;
    p[6] = -s * 24;
    p[8] = s * 12 + 5;
    p[10] = s * 24 + 10;
    p[12] = -s * 14 + 15;
    return p;
  }
  const p = [...idle],
    breath = Math.sin(f.walk * 3) * 1.3;
  for (let i = 1; i < 14; i += 2) p[i] += breath;
  return p;
}
function stroke(c, points, color, width) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
}
function ellipse(c, x, y, rx, ry, color) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
export function drawFighter(c, f, options = {}) {
  const p = pose(f),
    j = (i) => [p[i * 2], p[i * 2 + 1]],
    scale = f.type === "boss" ? 1.32 : 1;
  const ink =
    f.type === "player"
      ? "#101519"
      : f.type === "boss"
        ? "#1c4249"
        : f.type === "guard"
          ? "#3d436e"
          : f.type === "kick"
            ? "#9c3482"
            : "#70227d"; // unslop-ignore: the source game's opponent ink is deliberately purple.
  c.save();
  c.translate(f.x, f.y - f.z);
  c.scale(f.facing * scale, scale);
  if (f.hp === 0) c.globalAlpha = Math.max(0.15, 1 - f.deadTime * 0.42);
  // Back limbs precede body; grounded feet have a flattened toe rather than icon dots.
  stroke(c, [j(0), j(7), j(8)], ink, 7);
  stroke(c, [j(1), j(3), j(4)], ink, 7);
  ellipse(c, ...j(4), 5.5, 5, ink);
  stroke(c, [j(0), j(1)], ink, 12);
  c.fillStyle = ink;
  c.beginPath();
  c.moveTo(p[0] - 2, p[1] - 10);
  c.lineTo(p[0] - 23, p[1] - 19);
  c.lineTo(p[0] - 15, p[1] - 3);
  c.closePath();
  c.fill();
  stroke(c, [j(0), j(9), j(10)], ink, 8);
  stroke(
    c,
    [
      [p[16] - 5, p[17]],
      [p[16] + 9, p[17] + 1],
    ],
    ink,
    7,
  );
  stroke(
    c,
    [
      [p[20] - 4, p[21]],
      [p[20] + 10, p[21] + 1],
    ],
    ink,
    7,
  );
  stroke(c, [j(1), j(5), j(6)], ink, 8);
  ellipse(c, ...j(6), 6, 5.5, ink);
  // Curved flamingo neck, small avian head and down-hooked beak, never a circle-stick icon.
  const shoulder = j(1),
    head = j(2);
  c.beginPath();
  c.moveTo(shoulder[0] + 3, shoulder[1] - 1);
  c.bezierCurveTo(
    head[0] - 27,
    head[1] + 29,
    head[0] - 24,
    head[1] + 8,
    head[0] - 3,
    head[1] + 2,
  );
  c.strokeStyle = ink;
  c.lineWidth = 9;
  c.stroke();
  ellipse(c, head[0], head[1], 12, 9, ink);
  c.beginPath();
  c.moveTo(head[0] + 8, head[1] - 3);
  c.quadraticCurveTo(head[0] + 26, head[1] - 1, head[0] + 24, head[1] + 12);
  c.lineTo(head[0] + 15, head[1] + 5);
  c.closePath();
  c.fillStyle = f.type === "player" ? "#e88d9c" : "#c5a3b5";
  c.fill();
  c.beginPath();
  c.moveTo(head[0] + 24, head[1] + 4);
  c.lineTo(head[0] + 24, head[1] + 12);
  c.lineTo(head[0] + 19, head[1] + 7);
  c.closePath();
  c.fillStyle = ink;
  c.fill();
  ellipse(c, head[0] + 5, head[1] - 3, 1.8, 1.6, "#eee5cc");
  if (f.type === "player" || f.type === "boss") {
    stroke(
      c,
      [
        [head[0] - 8, head[1] - 4],
        [head[0] + 9, head[1] - 5],
      ],
      f.type === "player" ? "#e7c642" : "#c98738",
      3,
    );
    stroke(
      c,
      [
        [head[0] - 9, head[1] - 3],
        [head[0] - 26, head[1] + Math.sin(f.walk * 8) * 5 - 2],
      ],
      f.type === "player" ? "#e7c642" : "#c98738",
      2.5,
    );
  }
  if (f.type === "guard") {
    stroke(
      c,
      [
        [p[12] - 5, p[13] - 3],
        [p[12] + 5, p[13] + 2],
      ],
      "#bec5c6",
      5,
    );
  }
  c.restore();
  if (!options.noMarkers && f.hp > 0 && f.type !== "player") {
    const width = f.type === "boss" ? 85 : 43;
    c.fillStyle = "#271d2699";
    c.fillRect(
      f.x - width / 2,
      f.y - f.z - (f.type === "boss" ? 183 : 149),
      width,
      4,
    );
    c.fillStyle = f.type === "boss" ? "#dd864d" : "#d2b649";
    c.fillRect(
      f.x - width / 2,
      f.y - f.z - (f.type === "boss" ? 183 : 149),
      (width * f.hp) / f.maxHp,
      4,
    );
  }
}
