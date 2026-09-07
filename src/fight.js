export const WIDTH = 1200,
  HEIGHT = 675,
  FIXED_STEP = 1 / 60;
export const AREAS = [
  {
    name: "모니터 앞",
    tag: "THE FIRST FRAME",
    art: "monitor-desk",
    time: 120,
    waves: [
      ["ink", "ink"],
      ["ink", "kick"],
    ],
  },
  {
    name: "스피커 골목",
    tag: "CABLE CROSSING",
    art: "speaker-desk",
    time: 135,
    waves: [
      ["ink", "kick"],
      ["guard", "kick", "ink"],
    ],
  },
  {
    name: "키보드 끝",
    tag: "THE LAST KEY",
    art: "keyboard-desk",
    time: 150,
    waves: [["guard", "kick"], ["boss"]],
  },
];
export const MOVES = {
  jab: {
    length: 0.34,
    contact: 0.115,
    end: 0.19,
    range: 67,
    damage: 13,
    push: 50,
    stun: 0.23,
  },
  cross: {
    length: 0.42,
    contact: 0.15,
    end: 0.24,
    range: 79,
    damage: 18,
    push: 90,
    stun: 0.29,
  },
  kick: {
    length: 0.6,
    contact: 0.24,
    end: 0.34,
    range: 101,
    damage: 27,
    push: 190,
    stun: 0.65,
  },
  airkick: {
    length: 0.47,
    contact: 0.12,
    end: 0.31,
    range: 104,
    damage: 23,
    push: 145,
    stun: 0.5,
  },
  counter: {
    length: 0.48,
    contact: 0.14,
    end: 0.24,
    range: 100,
    damage: 36,
    push: 210,
    stun: 0.7,
  },
  enemyjab: {
    length: 0.78,
    contact: 0.39,
    end: 0.47,
    range: 67,
    damage: 8,
    push: 90,
    stun: 0.3,
  },
  enemykick: {
    length: 0.94,
    contact: 0.48,
    end: 0.6,
    range: 94,
    damage: 11,
    push: 150,
    stun: 0.45,
  },
  bossstrike: {
    length: 1.1,
    contact: 0.55,
    end: 0.7,
    range: 115,
    damage: 16,
    push: 210,
    stun: 0.65,
  },
};
MOVES.bossupper = {
  length: 0.95,
  contact: 0.46,
  end: 0.64,
  range: 90,
  damage: 14,
  push: 135,
  stun: 0.5,
  air: true,
};
export const neutral = () => ({
  left: false,
  right: false,
  up: false,
  down: false,
  attack: false,
  jump: false,
  guard: false,
});
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function fighter(id, x, y, type = "player") {
  const boss = type === "boss";
  return {
    id,
    type,
    x,
    y,
    z: 0,
    vz: 0,
    facing: type === "player" ? 1 : -1,
    hp:
      type === "player"
        ? 100
        : boss
          ? 200
          : type === "guard"
            ? 73
            : type === "kick"
              ? 57
              : 43,
    maxHp:
      type === "player"
        ? 100
        : boss
          ? 200
          : type === "guard"
            ? 73
            : type === "kick"
              ? 57
              : 43,
    action: "idle",
    t: 0,
    walk: 0,
    attack: null,
    stun: 0,
    invulnerable: 0,
    vx: 0,
    guard: false,
    guardAge: 10,
    guardMeter: 100,
    counter: 0,
    cooldown: 0.7 + (id.length % 3) * 0.24,
    down: 0,
    combo: 0,
    comboClock: 0,
    buffer: null,
    bufferLife: 0,
    deadTime: 0,
    bossPhase: 0,
  };
}
export function createGame(practice = false) {
  return {
    mode: "title",
    practice,
    area: 0,
    wave: 0,
    time: AREAS[0].time,
    elapsed: 0,
    player: fighter("player", 395, 479),
    enemies: [],
    score: 0,
    combo: 0,
    bestCombo: 0,
    lastHit: -100,
    defeated: 0,
    totalDefeated: 0,
    hitStop: 0,
    shake: 0,
    sparks: [],
    texts: [],
    serial: 0,
    banner: 2,
    reason: null,
    message: "방향키 이동 · Z 연타 · X 점프 · C 방어",
    previous: neutral(),
    transition: 0,
    history: [],
  };
}
function spawnWave(s) {
  const types = AREAS[s.area].waves[s.wave];
  s.enemies = types.map((type, i) =>
    fighter(
      `a${s.area}w${s.wave}e${i}`,
      i % 2 ? 180 : 595 + i * 145,
      461 + i * 38,
      type,
    ),
  );
  s.banner = 1.4;
  s.message = `${AREAS[s.area].name} · ${s.wave + 1}번째 무리`;
}
export function begin(practice = false) {
  const s = createGame(practice);
  s.mode = "playing";
  spawnWave(s);
  return s;
}
export function clearInput(s) {
  s.previous = neutral();
  s.player.buffer = null;
  s.player.bufferLife = 0;
  s.player.guard = false;
  s.player.guardAge = 10;
}
export function pause(s) {
  if (s.mode !== "playing") return false;
  s.mode = "paused";
  clearInput(s);
  return true;
}
export function resume(s) {
  if (s.mode !== "paused") return false;
  s.mode = "playing";
  clearInput(s);
  return true;
}
export function nextArea(s) {
  if (s.mode !== "cleared") return false;
  s.history.push({
    area: s.area,
    hp: s.player.hp,
    time: s.time,
    score: s.score,
  });
  if (s.area === 2) {
    s.mode = "won";
    return true;
  }
  s.area++;
  s.wave = 0;
  s.time = AREAS[s.area].time;
  s.player.x = 395;
  s.player.y = 479;
  s.player.hp = Math.min(100, s.player.hp + 28);
  s.player.z = 0;
  s.player.vz = 0;
  s.player.action = "idle";
  s.player.attack = null;
  s.player.stun = 0;
  s.player.down = 0;
  s.player.invulnerable = 0;
  s.player.guardMeter = 100;
  s.player.combo = 0;
  s.player.comboClock = 0;
  s.player.vx = 0;
  s.enemies = [];
  s.sparks = [];
  s.texts = [];
  s.hitStop = 0;
  s.mode = "playing";
  clearInput(s);
  spawnWave(s);
  return true;
}
export function canStrike(a, b, move) {
  const forward = (b.x - a.x) * a.facing;
  return (
    b.hp > 0 &&
    b.down <= 0 &&
    forward > -8 &&
    forward < move.range + (b.type === "boss" ? 16 : 9) &&
    Math.abs(b.y - a.y) < 29 &&
    Math.abs(a.z - b.z) < (move === MOVES.airkick || move.air ? 110 : 48)
  );
}
function startMove(f, name) {
  f.attack = { name, t: 0, hits: [] };
  f.action = name;
  f.t = 0;
  f.guard = false;
}
function effects(s, x, y, kind = "hit") {
  s.serial++;
  s.sparks.push({ x, y, life: 0.24, kind, seed: s.serial });
  if (kind === "parry")
    s.texts.push({ x, y: y - 45, text: "받아치기!", life: 0.8 });
}
function hit(s, a, b, move) {
  if (b.invulnerable > 0) return;
  const front = (a.x - b.x) * b.facing > 0,
    parry = b.guard && front && b.guardAge < 0.19;
  if (parry) {
    a.stun = 0.65;
    a.attack = null;
    a.action = "stun";
    a.vx = -a.facing * 100;
    b.counter = 0.8;
    b.guardMeter = Math.min(100, b.guardMeter + 12);
    s.score += 40;
    effects(s, b.x + b.facing * 29, b.y - b.z - 70, "parry");
    s.hitStop = 0.055;
    s.message = "받아치기 성공! Z로 반격";
    return;
  }
  if (b.guard && front && b.guardMeter > 18) {
    b.guardMeter = Math.max(0, b.guardMeter - 22);
    b.vx = a.facing * 35;
    effects(s, b.x, b.y - b.z - 68, "block");
    return;
  }
  const armored =
    b.type === "boss" &&
    b.attack &&
    b.attack.t > 0.25 &&
    a.attack?.name !== "counter";
  b.hp = Math.max(0, b.hp - move.damage);
  b.stun = armored ? 0 : move.stun;
  b.invulnerable = b.type === "player" ? 0.55 : 0.19;
  if (!armored) b.attack = null;
  b.guard = false;
  b.vx = a.facing * move.push * (armored ? 0.15 : 1);
  if (!armored) b.action = "stun";
  const launch =
    !armored &&
    ["kick", "airkick", "counter", "enemykick", "bossstrike"].includes(
      a.attack?.name,
    );
  if (launch) {
    b.down = b.hp === 0 ? 1.2 : 0.55;
    b.action = "down";
    b.z = Math.max(b.z, 8);
    b.vz = 130;
  }
  if (b.hp === 0) {
    b.down = 1.4;
    b.action = "down";
    b.deadTime = 0;
    if (b.type !== "player") {
      s.defeated++;
      s.totalDefeated++;
      s.score += b.type === "boss" ? 600 : 100;
    }
  }
  effects(s, b.x - a.facing * 12, b.y - b.z - 62);
  s.hitStop = 0.045;
  s.shake = launch ? 5 : 2;
  if (a.type === "player") {
    s.combo = s.elapsed - s.lastHit < 1.4 ? s.combo + 1 : 1;
    s.bestCombo = Math.max(s.bestCombo, s.combo);
    s.lastHit = s.elapsed;
    s.score += move.damage * 3;
    s.message = `${s.combo} HIT · ${a.attack?.name === "counter" ? "반격 성공" : a.attack?.name === "airkick" ? "날아차기" : a.attack?.name === "kick" ? "돌려차기" : "연속 타격"}`;
    s.texts.push({
      x: b.x,
      y: b.y - b.z - 110,
      text: `${s.combo} HIT`,
      life: 0.7,
    });
  }
}
function updateBody(f, dt) {
  f.walk += dt;
  f.t += dt;
  f.cooldown = Math.max(0, f.cooldown - dt);
  f.stun = Math.max(0, f.stun - dt);
  f.invulnerable = Math.max(0, f.invulnerable - dt);
  f.counter = Math.max(0, f.counter - dt);
  f.comboClock = Math.max(0, f.comboClock - dt);
  f.bufferLife = Math.max(0, f.bufferLife - dt);
  if (!f.bufferLife) f.buffer = null;
  f.x = clamp(f.x + f.vx * dt, 65, 1135);
  f.vx *= Math.exp(-dt * 10);
  if (f.z > 0 || f.vz > 0) {
    f.z += f.vz * dt;
    f.vz -= 600 * dt;
    if (f.z <= 0) {
      f.z = 0;
      f.vz = 0;
    }
  }
  if (f.down > 0) {
    f.down = Math.max(0, f.down - dt);
    if (f.down === 0 && f.hp > 0) {
      f.action = "rise";
      f.stun = 0.25;
    }
  }
  if (f.hp === 0) f.deadTime += dt;
  if (f.guard) {
    f.guardAge += dt;
    f.guardMeter = Math.max(0, f.guardMeter - dt * 4);
  } else f.guardMeter = Math.min(100, f.guardMeter + dt * 20);
}
function attackTick(s, a, targets, dt) {
  if (!a.attack) return;
  const attack = a.attack,
    move = MOVES[attack.name];
  attack.t += dt;
  a.t = attack.t;
  if (attack.t >= move.contact && attack.t <= move.end) {
    for (const b of targets) {
      if (!attack.hits.includes(b.id) && canStrike(a, b, move)) {
        attack.hits.push(b.id);
        hit(s, a, b, move);
        if (!a.attack) break;
      }
    }
  }
  if (a.attack && attack.t >= move.length) {
    a.attack = null;
    a.action = "idle";
  }
}
function playerTick(s, input, edges, dt) {
  const p = s.player;
  updateBody(p, dt);
  if (p.hp <= 0 || p.down > 0 || p.stun > 0) return;
  if (edges.attack) {
    p.buffer = "attack";
    p.bufferLife = 0.22;
  }
  if (edges.jump) {
    p.buffer = "jump";
    p.bufferLife = 0.16;
  }
  if (input.guard && !p.attack && p.z === 0) {
    if (!p.guard) p.guardAge = 0;
    p.guard = p.guardMeter > 0;
    p.action = "guard";
  } else {
    p.guard = false;
    p.guardAge = 10;
  }
  if (!p.attack && p.buffer === "jump" && p.z === 0) {
    p.z = 0.1;
    p.vz = 315;
    p.action = "jump";
    p.buffer = null;
    p.guard = false;
  }
  if (!p.attack && p.buffer === "attack") {
    let move;
    if (p.counter > 0) {
      move = "counter";
      p.counter = 0;
    } else if (p.z > 6) {
      move = "airkick";
    } else {
      if (p.comboClock <= 0) p.combo = 0;
      move = ["jab", "cross", "kick"][p.combo % 3];
      p.combo = (p.combo + 1) % 3;
      p.comboClock = 0.78;
    }
    startMove(p, move);
    p.buffer = null;
  }
  const dx = Number(input.right) - Number(input.left),
    dy = Number(input.down) - Number(input.up);
  if (!p.attack && !p.guard) {
    const length = Math.hypot(dx, dy) || 1;
    p.x = clamp(p.x + (dx / length) * 215 * dt, 65, 1135);
    p.y = clamp(p.y + (dy / length) * 140 * dt, 430, 557);
    if (dx) p.facing = dx > 0 ? 1 : -1;
    if (p.z === 0) p.action = dx || dy ? "walk" : "idle";
    else p.action = "jump";
  } else if (p.z > 0) {
    p.x = clamp(p.x + dx * 130 * dt, 65, 1135);
    p.y = clamp(p.y + dy * 80 * dt, 430, 557);
  }
  attackTick(s, p, s.enemies, dt);
}
function enemyTick(s, e, dt) {
  updateBody(e, dt);
  if (e.hp <= 0 || e.down > 0 || e.stun > 0) return;
  const p = s.player;
  if (e.attack) {
    attackTick(s, e, [p], dt);
    return;
  }
  const dx = p.x - e.x,
    dy = p.y - e.y;
  e.facing = dx >= 0 ? 1 : -1;
  const distance = Math.abs(dx),
    type = e.type;
  const guard =
    type === "guard" &&
    p.attack &&
    distance < 115 &&
    Math.abs(dy) < 30 &&
    e.cooldown > 0.3;
  e.guard = Boolean(guard);
  e.guardAge = 2;
  if (guard) {
    e.action = "guard";
    return;
  }
  if (distance > (type === "boss" ? 84 : 57) || Math.abs(dy) > 17) {
    e.action = "walk";
    const speed = type === "boss" ? 78 : type === "kick" ? 102 : 86;
    e.x = clamp(
      e.x + Math.sign(dx) * Math.min(distance - 45, speed * dt),
      65,
      1135,
    );
    e.y = clamp(
      e.y + Math.sign(dy) * Math.min(Math.abs(dy), speed * 0.48 * dt),
      430,
      557,
    );
  } else if (e.cooldown <= 0 && p.hp > 0) {
    const name =
      type === "boss"
        ? e.hp < 100 && p.z > 10
          ? "bossupper"
          : "bossstrike"
        : type === "kick"
          ? "enemykick"
          : "enemyjab";
    startMove(e, name);
    e.cooldown = type === "boss" ? 1.7 : 1.35 + (e.id.length % 3) * 0.1;
  } else e.action = "idle";
  if (type === "boss") e.bossPhase = e.hp < 100 ? 1 : 0;
}
export function tick(s, input = neutral(), dt = FIXED_STEP, pressed = {}) {
  if (s.mode !== "playing") return;
  dt = clamp(dt, 0, 1 / 30);
  const edges = {
    attack: (input.attack && !s.previous.attack) || pressed.attack,
    jump: (input.jump && !s.previous.jump) || pressed.jump,
    guard: (input.guard && !s.previous.guard) || pressed.guard,
  };
  s.previous = { ...input };
  if (s.hitStop > 0) {
    s.hitStop = Math.max(0, s.hitStop - dt);
    if (edges.attack) {
      s.player.buffer = "attack";
      s.player.bufferLife = 0.22;
    }
    if (edges.jump) {
      s.player.buffer = "jump";
      s.player.bufferLife = 0.16;
    }
    return;
  }
  s.elapsed += dt;
  s.banner = Math.max(0, s.banner - dt);
  if (!s.practice) s.time = Math.max(0, s.time - dt);
  s.shake = Math.max(0, s.shake - dt * 22);
  playerTick(s, input, edges, dt);
  for (const e of s.enemies) enemyTick(s, e, dt);
  // Separation is depth-aware and gentle. No teleporting attacks or auto-facing player.
  for (const e of s.enemies) {
    if (e.hp <= 0 || e.down > 0) continue;
    const dx = e.x - s.player.x,
      dy = e.y - s.player.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 25) {
      const shift = (24 - Math.abs(dx)) * 0.5;
      e.x = clamp(e.x + (dx >= 0 ? shift : -shift), 65, 1135);
      s.player.x = clamp(s.player.x - (dx >= 0 ? shift : -shift), 65, 1135);
    }
  }
  for (const a of s.sparks) a.life -= dt;
  s.sparks = s.sparks.filter((a) => a.life > 0);
  for (const a of s.texts) {
    a.life -= dt;
    a.y -= dt * 21;
  }
  s.texts = s.texts.filter((a) => a.life > 0);
  if (s.player.hp <= 0 || s.time === 0) {
    s.mode = "failed";
    s.reason = s.player.hp <= 0 ? "knockout" : "time";
    clearInput(s);
    return;
  }
  if (s.enemies.every((e) => e.hp <= 0 && e.deadTime > 0.65)) {
    s.transition += dt;
    if (s.transition > 0.35) {
      s.transition = 0;
      if (s.wave + 1 < AREAS[s.area].waves.length) {
        s.wave++;
        s.player.hp = Math.min(100, s.player.hp + 12);
        spawnWave(s);
        s.message += " · 숨 고르기: 체력 +12";
      } else {
        s.mode = "cleared";
        clearInput(s);
      }
    }
  }
}
