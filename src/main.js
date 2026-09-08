import "./style.css";
import {
  createGame,
  begin,
  tick,
  neutral,
  pause,
  resume,
  nextArea,
  clearInput,
  FIXED_STEP,
  AREAS,
} from "./fight.js";
import { render } from "./draw.js";
const $ = (id) => document.getElementById(id),
  canvas = $("game"),
  ctx = canvas.getContext("2d");
let state = createGame(),
  images = {},
  last = null,
  accumulator = 0,
  enabledSound = false,
  audio = null,
  seenSerial = 0,
  lastMode = "title",
  lastMessage = "",
  helpFrom = null;
const held = neutral(),
  pressed = {},
  pointers = new Map(),
  pulses = {},
  motion = matchMedia("(prefers-reduced-motion: reduce)");
const keyMap = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  KeyZ: "attack",
  KeyX: "jump",
  KeyC: "guard",
};
function releaseInputs() {
  for (const k of Object.keys(held)) held[k] = false;
  for (const k of Object.keys(pressed)) delete pressed[k];
  for (const k of Object.keys(pulses)) delete pulses[k];
  for (const [id, { button }] of pointers) {
    try {
      button.releasePointerCapture(id);
    } catch {}
  }
  pointers.clear();
  clearInput(state);
  document
    .querySelectorAll("[data-key]")
    .forEach((b) => b.setAttribute("aria-pressed", "false"));
}
function activate(key) {
  if (!held[key]) pressed[key] = true;
  held[key] = true;
  if (["left", "right", "up", "down"].includes(key))
    pulses[key] = performance.now() + 75;
}
function deactivate(key) {
  held[key] = false;
}
function focus() {
  canvas.focus({ preventScroll: true });
}
function start(practice = false) {
  releaseInputs();
  state = begin(practice);
  last = null;
  accumulator = 0;
  seenSerial = 0;
  helpFrom = null;
  $("title").hidden = true;
  $("instructions").hidden = true;
  sync();
  focus();
}
function doPause() {
  releaseInputs();
  if (state.mode === "playing") pause(state);
  else if (state.mode === "paused" && helpFrom === null) resume(state);
  last = null;
  accumulator = 0;
  sync();
}
function sync() {
  $("pause").disabled = !["playing", "paused"].includes(state.mode);
  $("pause").textContent = state.mode === "paused" ? "계속하기" : "일시정지";
  $("paused").hidden = state.mode !== "paused" || helpFrom !== null;
  const result = ["failed", "cleared", "won"].includes(state.mode);
  $("result").hidden = !result;
  if (result) {
    const fail = state.mode === "failed",
      won = state.mode === "won";
    $("result-bar").textContent = fail
      ? "GAME OVER"
      : won
        ? "ANIMATION COMPLETE"
        : "AREA CLEAR";
    $("result-title").textContent = fail
      ? state.reason === "time"
        ? "시간이 끝났습니다."
        : "한 번 넘어져도, 다시."
      : won
        ? "마지막 프레임까지 살아남았다."
        : `${AREAS[state.area].name} 정리 완료`;
    $("result-copy").textContent = fail
      ? "같은 깊이에서 상대를 바라보세요. 방어를 미리 유지하거나, 맞기 직전 C로 받아친 뒤 Z로 반격해 보세요."
      : won
        ? `${state.score}점 · ${state.totalDefeated}명 제압 · 최고 ${state.bestCombo}연타. 세 책상의 대결을 모두 마쳤습니다.`
        : `남은 체력 ${state.player.hp} · ${state.score}점. 다음 구역에서는 체력 28을 회복합니다.`;
    $("next").hidden = fail || won;
    $("next").textContent = state.area === 2 ? "최종 성적표" : "다음 책상으로";
  }
  if (lastMessage !== state.message) {
    lastMessage = state.message;
    $("status").textContent = state.message;
  }
}
function openHelp() {
  helpFrom = state.mode;
  releaseInputs();
  if (state.mode === "playing") pause(state);
  $("instructions").hidden = false;
  $("paused").hidden = true;
  last = null;
  $("close-help").focus();
}
function closeHelp() {
  if (helpFrom === null) return;
  const from = helpFrom;
  helpFrom = null;
  $("instructions").hidden = true;
  if (from === "playing") resume(state);
  last = null;
  accumulator = 0;
  sync();
  focus();
}
document.addEventListener("keydown", (e) => {
  if (e.code === "Escape" || e.code === "KeyP") {
    if (e.repeat) return;
    e.preventDefault();
    helpFrom !== null ? closeHelp() : doPause();
    return;
  }
  const key = keyMap[e.code];
  if (!key || state.mode !== "playing") return;
  e.preventDefault();
  if (!e.repeat) activate(key);
});
document.addEventListener("keyup", (e) => {
  const key = keyMap[e.code];
  if (key) {
    e.preventDefault();
    deactivate(key);
  }
});
window.addEventListener("blur", () => {
  releaseInputs();
  if (state.mode === "playing") pause(state);
  last = null;
  accumulator = 0;
  sync();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    releaseInputs();
    if (state.mode === "playing") pause(state);
  }
  last = null;
  accumulator = 0;
  sync();
});
canvas.addEventListener("pointerdown", focus);
document.querySelectorAll("[data-key]").forEach((button) => {
  const key = button.dataset.key;
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("pointerdown", (e) => {
    if (state.mode !== "playing") return;
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { button, key });
    activate(key);
    button.setAttribute("aria-pressed", "true");
  });
  const release = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (![...pointers.values()].some((p) => p.key === key)) {
      deactivate(key);
      button.setAttribute("aria-pressed", "false");
    }
  };
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    button.addEventListener(type, release);
  button.addEventListener("click", (e) => {
    if (e.detail === 0 && state.mode === "playing") {
      pressed[key] = true;
      if (["left", "right", "up", "down", "guard"].includes(key))
        pulses[key] = performance.now() + (key === "guard" ? 350 : 120);
      focus();
    }
  });
});
$("start").addEventListener("click", () => start());
$("practice").addEventListener("click", () => start(true));
$("reset").addEventListener("click", () => start(state.practice));
$("retry").addEventListener("click", () => start(state.practice));
$("pause").addEventListener("click", doPause);
$("resume").addEventListener("click", () => {
  doPause();
  focus();
});
$("help").addEventListener("click", openHelp);
$("close-help").addEventListener("click", closeHelp);
$("next").addEventListener("click", () => {
  releaseInputs();
  nextArea(state);
  last = null;
  sync();
  focus();
});
function soundHit() {
  if (!enabledSound) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(155, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(36, audio.currentTime + 0.1);
    g.gain.setValueAtTime(0.09, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.12);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.13);
  } catch {
    enabledSound = false;
    $("sound").textContent = "소리 사용 불가";
  }
}
$("sound").addEventListener("click", () => {
  enabledSound = !enabledSound;
  $("sound").textContent = enabledSound ? "소리 켜짐" : "소리 꺼짐";
  $("sound").setAttribute("aria-pressed", String(enabledSound));
  if (enabledSound) soundHit();
});
function frame(now) {
  const elapsed =
    last === null ? 0 : Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  accumulator += elapsed;
  const input = { ...held };
  for (const [key, expiry] of Object.entries(pulses)) {
    if (expiry > now) input[key] = true;
    else delete pulses[key];
  }
  let consumed = false;
  while (accumulator >= FIXED_STEP) {
    tick(state, input, FIXED_STEP, consumed ? {} : pressed);
    consumed = true;
    accumulator -= FIXED_STEP;
  }
  if (consumed) for (const key of Object.keys(pressed)) delete pressed[key];
  if (seenSerial !== state.serial) {
    seenSerial = state.serial;
    soundHit();
  }
  render(ctx, state, images, motion.matches);
  sync();
  if (lastMode !== state.mode) {
    lastMode = state.mode;
    if (["failed", "cleared", "won"].includes(state.mode)) {
      releaseInputs();
      ($("next").hidden ? $("retry") : $("next")).focus();
    }
  }
  requestAnimationFrame(frame);
}
async function loadImage(name) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve([name, i]);
    i.onerror = reject;
    i.src = `./art/${name}.png`;
  });
}
Promise.all([...AREAS.map((a) => loadImage(a.art)), document.fonts.ready])
  .then((items) => {
    images = Object.fromEntries(items.slice(0, 3));
    requestAnimationFrame(frame);
  })
  .catch(() => {
    $("status").textContent =
      "배경을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.";
  });
