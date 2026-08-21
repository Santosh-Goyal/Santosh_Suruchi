/* ============================================================
   For You — light -> dark love letter
   All the words you might want to change live in CONFIG.
   ============================================================ */
const CONFIG = {
  herName: "", // optional: put her name, used in the very first line

  // PHASE 1 — light & warm: her smile, beauty, smartness, caring, cuteness
  lightLines: [
    { tag: "your smile", text: "Let's start with your smile — the one that quietly fixes whatever kind of day I'm having." },
    { tag: "your face", text: "You're beautiful in a way that owes nothing to angles or lighting. You just <b>are</b>, and honestly it's unfair." },
    { tag: "your mind", text: "And you're so <b>sharp</b> it catches me off guard — the way you think makes me want to keep up with you." },
    { tag: "your heart", text: "You care with your whole chest. Softly, fully. Even for people who forget to deserve it." },
    { tag: "your cuteness", text: "And then you ruin me completely by doing something so <b>ridiculously cute</b> that I lose my entire point." },
  ],

  // the turn
  pivotLine: "But there's a side of <b>us</b> only the nights ever saw…",

  // PHASE 2 — darker & intimate: the heat, the hunger, those heavy nights
  darkLines: [
    { tag: "past midnight", text: "It's past midnight again… and my mind keeps drifting to the way you feel pressed against me." },
    { tag: "a little too close", text: "The way your breath catches when I pull you in close — I think about that <b>far</b> more than I should admit." },
    { tag: "the hunger", text: "There's a hunger in how we find each other in the dark. The world goes quiet, and it's just warmth, heartbeat, and skin." },
    { tag: "your breath", text: "Those heavy breaths… the little sounds you try so hard to hold back — they <b>undo</b> me every single time." },
    { tag: "still craving", text: "Some nights I still crave you so badly it's hard to breathe. You did that to me… and I'm not even a little sorry." },
    { tag: "come here", text: "So come here. Let me remind you <b>exactly</b> what you do to me." },
  ],

  // the question (button trick)
  question: "Will you let me go crazy again?",
  // The "No" button can't be caught. Every time it's approached or tapped it
  // jumps to a new spot and shows the NEXT line below. Index 0 is the starting
  // label; it advances one line per dodge and STAYS on the last line forever
  // (that final line is the "you smiled" gotcha). Add/remove lines freely —
  // the last one is always the one it settles on.
  noLabels: [
    "No",                            // starting label
    "Please? 🥺",                    // 1st dodge
    "Think again…",                  // 2nd dodge
    "Are you sure? 😳",              // 3rd dodge
    "Don't do this to me 😭",        // 4th dodge
    "It's too late, you smiled… 🤍", // 5th dodge → stays here & keeps moving
  ],

  finale: {
    title: "LET'S GO CRAZY",
    lines: [
      "You said yes to the chaos, the calm,",
      "and every sleepless night in between.",
      "Now you're stuck with me. Happily. 🤍",
    ],
  },
};

if (CONFIG.herName) {
  CONFIG.lightLines[0].text =
    `Let's start with your smile, ${CONFIG.herName} — the one that quietly fixes whatever kind of day I'm having.`;
}

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const vibrate = (p) => navigator.vibrate && navigator.vibrate(p);
// static mode (for previews/screenshots): index.html?still — shows text
// instantly with no word-reveal and pauses the particle loop.
const STILL = /[?&]still\b/.test(location.search);

/* ============================================================
   THEME (drives both CSS and the particle palette)
   ============================================================ */
const THEMES = {
  dawn: { palette: ["#ff8fb3", "#ffc2d6", "#ffd9a8", "#ff9ec4", "#ffe0ec"], alpha: 0.6, rate: 0.4 },
  dusk: { palette: ["#ff6fa0", "#c56bd6", "#9b6bff", "#ffa8c8"], alpha: 0.72, rate: 0.55 },
  ember: { palette: ["#ff4d6d", "#ff6b8a", "#ff8fa3", "#ffb3c1", "#c9184a"], alpha: 0.82, rate: 0.6 },
  night: { palette: ["#ff2d75", "#ff4fa3", "#b14bff", "#8a2be2", "#4f5bd5"], alpha: 0.85, rate: 0.6 },
};
let theme = THEMES.dawn;

function setTheme(name) {
  theme = THEMES[name] || THEMES.night;
  document.body.classList.remove("theme-dawn", "theme-dusk", "theme-ember", "theme-night");
  document.body.classList.add("theme-" + name);
  const barColor =
    name === "dawn" ? "#ffe3ec" : name === "dusk" ? "#40103f" : name === "ember" ? "#2a0512" : "#08010c";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", barColor);
}

/* ============================================================
   PARTICLE FX (floating hearts + confetti) on one canvas
   ============================================================ */
const canvas = $("#fx");
const ctx = canvas.getContext("2d");
let W, H, DPR;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  W = canvas.width = Math.floor(innerWidth * DPR);
  H = canvas.height = Math.floor(innerHeight * DPR);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
}
addEventListener("resize", resize);
resize();

const CONFETTI_COLORS = ["#ff2d75", "#ff4fa3", "#b14bff", "#8a2be2", "#4f5bd5", "#ffd9a8", "#ffffff"];

function drawHeart(x, y, size, rot, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(size, size);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0.5);
  ctx.bezierCurveTo(0.9, -0.2, 0.5, -0.95, 0, -0.35);
  ctx.bezierCurveTo(-0.5, -0.95, -0.9, -0.2, 0, 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

let ambient = [];
let confetti = [];
let ambientBoost = 1;

function spawnAmbient() {
  if (Math.random() < theme.rate * ambientBoost * 0.12) {
    ambient.push({
      x: rand(0, W),
      y: H + 30 * DPR,
      size: rand(8, 20) * DPR,
      spd: rand(0.4, 1.3) * DPR,
      sway: rand(0.4, 1.6),
      swayOff: rand(0, Math.PI * 2),
      rot: rand(-0.4, 0.4),
      color: theme.palette[(Math.random() * theme.palette.length) | 0],
      capAlpha: theme.alpha,
      alpha: 0,
      life: 0,
    });
  }
}

function burstConfetti(cx, cy, amount = 150) {
  for (let i = 0; i < amount; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(4, 15) * DPR;
    const heart = Math.random() < 0.42;
    confetti.push({
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - rand(2, 8) * DPR,
      g: rand(0.15, 0.32) * DPR,
      size: (heart ? rand(9, 18) : rand(6, 12)) * DPR,
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.3, 0.3),
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
      alpha: 1, heart, w: rand(0.5, 1),
    });
  }
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  spawnAmbient();
  for (let i = ambient.length - 1; i >= 0; i--) {
    const p = ambient[i];
    p.life += 0.016;
    p.y -= p.spd;
    p.x += Math.sin(p.life * p.sway + p.swayOff) * 0.6 * DPR;
    p.alpha = clamp(p.alpha + 0.02, 0, p.capAlpha);
    if (p.y < H * 0.14) p.alpha -= 0.02;
    drawHeart(p.x, p.y, p.size, p.rot + Math.sin(p.life) * 0.1, p.color, Math.max(0, p.alpha));
    if (p.y < -40 * DPR || p.alpha <= 0) ambient.splice(i, 1);
  }
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.vy += c.g;
    c.x += c.vx; c.y += c.vy;
    c.rot += c.vr; c.alpha -= 0.008;
    if (c.heart) {
      drawHeart(c.x, c.y, c.size, c.rot, c.color, Math.max(0, c.alpha));
    } else {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, (-c.size * c.w) / 2, c.size, c.size * c.w);
      ctx.restore();
    }
    if (c.alpha <= 0 || c.y > H + 60 * DPR) confetti.splice(i, 1);
  }
  requestAnimationFrame(loop);
}
if (!STILL) loop();

/* ============================================================
   STARFIELD (for dusk / night)
   ============================================================ */
(function makeStars() {
  const box = $("#stars");
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("i");
    s.style.left = rand(0, 100) + "%";
    s.style.top = rand(0, 100) + "%";
    s.style.animationDelay = rand(0, 3.5) + "s";
    s.style.transform = `scale(${rand(0.5, 1.6)})`;
    frag.appendChild(s);
  }
  box.appendChild(frag);
})();

/* ============================================================
   WEB AUDIO — ambient pad + heartbeat (toggle)
   ============================================================ */
const Sound = (() => {
  let actx = null, master = null, padOn = false, heartTimer = null, nodes = [];
  function ensure() {
    if (actx) return;
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = 0.0001;
    master.connect(actx.destination);
  }
  function startPad() {
    ensure();
    if (actx.state === "suspended") actx.resume();
    if (padOn) return;
    padOn = true;
    master.gain.cancelScheduledValues(actx.currentTime);
    master.gain.linearRampToValueAtTime(0.15, actx.currentTime + 1.4);
    const filter = actx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 6;
    filter.connect(master);
    const lfo = actx.createOscillator();
    const lfoGain = actx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 380;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    [220, 277.2, 329.6, 164.8].forEach((f, i) => {
      const o = actx.createOscillator();
      o.type = i === 3 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = rand(-8, 8);
      const g = actx.createGain();
      g.gain.value = i === 3 ? 0.5 : 0.28;
      o.connect(g).connect(filter);
      o.start();
      nodes.push(o, g);
    });
    nodes.push(filter, lfo, lfoGain);
    const beat = () => { thump(0); thump(0.16); };
    beat();
    heartTimer = setInterval(beat, 1150);
  }
  function thump(delay) {
    if (!actx) return;
    const t = actx.currentTime + delay;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.3);
  }
  function stop() {
    if (!actx || !padOn) return;
    padOn = false;
    clearInterval(heartTimer);
    master.gain.linearRampToValueAtTime(0.0001, actx.currentTime + 0.5);
    setTimeout(() => {
      nodes.forEach((n) => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch (e) {} });
      nodes = [];
    }, 600);
  }
  function celebrate() {
    ensure();
    if (actx.state === "suspended") actx.resume();
    const now = actx.currentTime;
    [523.3, 659.3, 784, 1046.5].forEach((f, i) => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      const t = now + i * 0.08;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 1.2);
    });
    if (!padOn) {
      master.gain.setValueAtTime(0.2, now);
      master.gain.linearRampToValueAtTime(0.0001, now + 1.3);
    }
  }
  return {
    toggle() { ensure(); if (padOn) { stop(); return false; } startPad(); return true; },
    isOn: () => padOn,
    celebrate,
  };
})();

const audioBtn = $("#audioBtn");
audioBtn.addEventListener("click", () => {
  audioBtn.classList.toggle("playing", Sound.toggle());
});

/* ============================================================
   SCENE MANAGER
   ============================================================ */
const sceneEls = {};
document.querySelectorAll(".scene").forEach((s) => (sceneEls[s.dataset.scene] = s));
let currentScene = "intro";

const SCENE_THEME = {
  intro: "dawn",
  her: "dawn",
  pivot: "dusk",
  dark: "ember",
  ask: "ember",
  finale: "dawn",
};

function goTo(name) {
  if (name === currentScene) return;
  const from = sceneEls[currentScene];
  const to = sceneEls[name];
  if (from) {
    from.classList.remove("is-active");
    from.classList.add("is-leaving");
    setTimeout(() => from.classList.remove("is-leaving"), 700);
  }
  to.classList.add("is-active");
  currentScene = name;
  if (SCENE_THEME[name]) setTheme(SCENE_THEME[name]);
  onEnter(name);
}

document.querySelectorAll("[data-next]").forEach((b) =>
  b.addEventListener("click", () => goTo(b.dataset.next))
);

function onEnter(name) {
  if (name === "her") startHer();
  if (name === "pivot") revealInto($("#pivotLine"), CONFIG.pivotLine, 0.06);
  if (name === "dark") startDark();
  if (name === "ask") setupAsk();
  if (name === "finale") runFinale();
}

/* ---------- generic story renderer ---------- */
function buildDots(container, count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) frag.appendChild(document.createElement("i"));
  container.appendChild(frag);
  return [...container.children];
}
// wrap each word in a <span class="word"> with a staggered delay so the
// line "types" itself in, one word at a time. Preserves inline <b> tags.
function splitWords(root, step = 0.05, start = 0) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let i = 0;
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (part === "") return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = part;
        span.style.animationDelay = (start + i * step).toFixed(3) + "s";
        i++;
        frag.appendChild(span);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });
}

function revealInto(el, html, step) {
  el.innerHTML = '<span class="line-inner">' + html + "</span>";
  if (!STILL) splitWords(el.querySelector(".line-inner"), step);
}

function renderStory(list, i, els) {
  els.tag.textContent = list[i].tag;
  els.tag.classList.remove("tag-in");
  void els.tag.offsetWidth;
  els.tag.classList.add("tag-in");
  revealInto(els.text, list[i].text, 0.05);
  els.dots.forEach((d, k) => d.classList.toggle("on", k === i));
  els.next.textContent = i === list.length - 1 ? els.lastLabel : "Next";
}

/* ---------- HER (light) ---------- */
const herEls = {
  tag: $("#herTag"),
  text: $("#herText"),
  dots: buildDots($("#herDots"), CONFIG.lightLines.length),
  next: $("#herNext"),
  lastLabel: "there's more →",
};
let herIndex = 0;
function startHer() { herIndex = 0; renderStory(CONFIG.lightLines, 0, herEls); }
herEls.next.addEventListener("click", () => {
  vibrate(8);
  if (herIndex < CONFIG.lightLines.length - 1) {
    herIndex++;
    renderStory(CONFIG.lightLines, herIndex, herEls);
  } else {
    goTo("pivot");
  }
});

/* ---------- DARK (night) ---------- */
const darkEls = {
  tag: $("#darkTag"),
  text: $("#darkText"),
  dots: buildDots($("#darkDots"), CONFIG.darkLines.length),
  next: $("#darkNext"),
  lastLabel: "come closer →",
};
let darkIndex = 0;
function startDark() { darkIndex = 0; renderStory(CONFIG.darkLines, 0, darkEls); }
darkEls.next.addEventListener("click", () => {
  vibrate(8);
  if (darkIndex < CONFIG.darkLines.length - 1) {
    darkIndex++;
    renderStory(CONFIG.darkLines, darkIndex, darkEls);
  } else {
    goTo("ask");
  }
});

/* ============================================================
   ASK — the button trick
   ============================================================ */
const askQuestion = $("#askQuestion");
const yesBtn = $("#yesBtn");
const noBtn = $("#noBtn");
// Where the No button lives before it starts dodging, so we can put it back.
// While loose it must ESCAPE this spot (see dodgeNo): the .scene ancestor uses
// transform / will-change, which would otherwise make position:fixed resolve
// against the scene box instead of the viewport and let it drift off screen.
const noHome = { parent: noBtn.parentNode, next: noBtn.nextSibling };
let noStep = 0;    // which noLabels line we're currently showing
let yesScale = 1;  // Yes button keeps growing as you chase No
let noScale = 1;   // No button keeps shrinking
let lastDodge = 0; // timestamp guard so one interaction = one dodge
askQuestion.textContent = CONFIG.question;

// Return the No button to its home row and drop the loose / fixed state.
function parkNoButton() {
  if (noBtn.parentNode !== noHome.parent) {
    noHome.parent.insertBefore(noBtn, noHome.next);
  }
  noBtn.classList.remove("loose");
  noBtn.style.cssText = "";
}

function setupAsk() {
  noStep = 0;
  yesScale = 1;
  noScale = 1;
  lastDodge = 0;
  parkNoButton();
  noBtn.textContent = CONFIG.noLabels[0];
  yesBtn.style.transform = "scale(1)";
}

// The truly visible viewport. Using visualViewport (when available) means the
// mobile URL/tool bars don't count as usable space, so the button never hides
// behind them.
function visibleViewport() {
  const vv = window.visualViewport;
  return { w: vv ? vv.width : innerWidth, h: vv ? vv.height : innerHeight };
}

// Range of top-left positions that keep the WHOLE button on screen and clear
// of the audio toggle in the top-right corner. Margins scale with the screen so
// the play-area breathes correctly on a small window or a wide laptop panel.
function noBounds() {
  const vp = visibleViewport();
  const mx = clamp(vp.w * 0.035, 12, 48); // side margin ~3.5% of width
  const my = clamp(vp.h * 0.035, 12, 48); // bottom margin ~3.5% of height
  const topSafe = Math.max(my, 66);       // still clear the audio button up top
  const w = noBtn.offsetWidth, h = noBtn.offsetHeight;
  return {
    minX: mx,
    minY: topSafe,
    maxX: Math.max(mx, vp.w - w - mx),
    maxY: Math.max(topSafe, vp.h - h - my),
  };
}

// Keep the loose No button inside the current bounds. Called on move and
// whenever the viewport changes (resize / mobile bar show-hide / zoom).
function clampNoIntoView() {
  if (!noBtn.classList.contains("loose")) return;
  const b = noBounds();
  noBtn.style.left = clamp(parseFloat(noBtn.style.left) || 0, b.minX, b.maxX) + "px";
  noBtn.style.top = clamp(parseFloat(noBtn.style.top) || 0, b.minY, b.maxY) + "px";
}

// How far from the cursor the button must land when it dodges. Scales with the
// screen so the leap feels the same on a 13" laptop and a big external monitor.
function escapeRadius() {
  const vp = visibleViewport();
  return clamp(Math.min(vp.w, vp.h) * 0.28, 130, 380);
}

// Move the No button to a fresh spot that (a) stays fully on screen, (b) doesn't
// cover the Yes button, and (c) lands well away from the cursor. `pointer` is
// the current cursor position {x, y}, or null when there's no hover (touch).
function moveNoAway(pointer) {
  const b = noBounds();
  const w = noBtn.offsetWidth, h = noBtn.offsetHeight;
  const yes = yesBtn.getBoundingClientRect();
  const R = escapeRadius();

  const far = [];                    // spots comfortably away from the cursor
  let fallback = null, fallbackDist = -1;

  for (let i = 0; i < 40; i++) {
    const x = rand(b.minX, b.maxX);
    const y = rand(b.minY, b.maxY);
    // never sit on top of the Yes button
    if (x < yes.right && x + w > yes.left && y < yes.bottom && y + h > yes.top) continue;
    if (!pointer) { far.push({ x, y }); continue; }
    const d = Math.hypot(x + w / 2 - pointer.x, y + h / 2 - pointer.y);
    if (d >= R) far.push({ x, y });
    if (d > fallbackDist) { fallbackDist = d; fallback = { x, y }; } // farthest seen
  }

  // prefer a random "far enough" spot; if the window is too small for that,
  // fall back to the farthest candidate so the cursor can never corner it
  const pick = far.length
    ? far[(Math.random() * far.length) | 0]
    : fallback || { x: rand(b.minX, b.maxX), y: rand(b.minY, b.maxY) };
  noBtn.style.left = pick.x + "px";
  noBtn.style.top = pick.y + "px";
}

function dodgeNo(e) {
  if (e) e.preventDefault();

  // One physical tap can fire pointerenter + pointerdown + click in a burst.
  // Collapse anything within 220ms into a SINGLE dodge so the messages advance
  // one at a time instead of skipping straight to the last line.
  const now = performance.now();
  if (now - lastDodge < 220) return;
  lastDodge = now;

  // first move: detach from the row AND re-parent to <body>. The .scene ancestor
  // has a transform, which makes position:fixed resolve against the scene box
  // instead of the viewport — moving to <body> makes our viewport coordinates
  // correct so the button can never drift off screen.
  if (!noBtn.classList.contains("loose")) {
    const r = noBtn.getBoundingClientRect();
    document.body.appendChild(noBtn);
    noBtn.classList.add("loose");
    noBtn.style.left = r.left + "px";
    noBtn.style.top = r.top + "px";
  }

  // advance the taunt; it sticks on the final "you smiled" line
  noStep = Math.min(noStep + 1, CONFIG.noLabels.length - 1);
  noBtn.textContent = CONFIG.noLabels[noStep];

  // reposition on EVERY dodge (even after the text locks) — leap away from the
  // cursor by a screen-scaled distance so it dodges naturally on a laptop
  const pointer = e && Number.isFinite(e.clientX) ? { x: e.clientX, y: e.clientY } : null;
  moveNoAway(pointer);

  // shrink the No, grow the Yes as the chase drags on
  noScale = clamp(1 - noStep * 0.08, 0.5, 1);
  noBtn.style.transform = `scale(${noScale})`;
  yesScale = clamp(yesScale + 0.14, 1, 2.4);
  yesBtn.style.transform = `scale(${yesScale})`;
  vibrate(6);
}
noBtn.addEventListener("pointerenter", dodgeNo);
noBtn.addEventListener("pointerdown", dodgeNo);
noBtn.addEventListener("click", dodgeNo);

yesBtn.addEventListener("click", () => {
  parkNoButton(); // tuck the dodging No back home so it doesn't linger on the finale
  vibrate([40, 30, 80]);
  Sound.celebrate();
  const r = yesBtn.getBoundingClientRect();
  burstConfetti((r.left + r.width / 2) * DPR, (r.top + r.height / 2) * DPR, 190);
  screenShake();
  ambientBoost = 4;
  setTimeout(() => goTo("finale"), 260);
});

/* ============================================================
   FINALE
   ============================================================ */
const finaleTitle = $("#finaleTitle");
const finaleLines = $("#finaleLines");
const replayBtn = $("#replayBtn");
let typeTimer = null;

function runFinale() {
  finaleTitle.textContent = CONFIG.finale.title;
  for (let i = 0; i < 4; i++) {
    setTimeout(() => burstConfetti(rand(0.2, 0.8) * W, rand(0.15, 0.5) * H, 90), i * 260);
  }
  typewriter(CONFIG.finale.lines.join("\n"));
}
function typewriter(text) {
  clearTimeout(typeTimer);
  finaleLines.innerHTML = "";
  let i = 0;
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.innerHTML = "&nbsp;";
  const type = () => {
    if (i <= text.length) {
      finaleLines.innerHTML = text.slice(0, i).replace(/\n/g, "<br>");
      finaleLines.appendChild(cursor);
      i++;
      typeTimer = setTimeout(type, text[i - 1] === "\n" ? 300 : rand(24, 58));
    }
  };
  type();
}
replayBtn.addEventListener("click", () => {
  ambientBoost = 1;
  confetti = [];
  goTo("intro");
});

/* ============================================================
   MISC
   ============================================================ */
function screenShake() {
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 550);
}

// tactile press feedback: ripple from the tap point + a little pop.
// (skipped for the dodging "No" button; pop skipped for buttons that manage
//  their own transform like "Yes")
document.addEventListener("pointerdown", (e) => {
  const btn = e.target.closest(".btn, .audio-btn");
  if (!btn || btn.id === "noBtn") return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.15;
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 620);
  if (btn.id !== "yesBtn" && btn.classList.contains("btn")) {
    btn.classList.remove("tap-pop");
    void btn.offsetWidth;
    btn.classList.add("tap-pop");
    setTimeout(() => btn.classList.remove("tap-pop"), 380);
  }
});
// Re-clamp the loose No button whenever the viewport changes so it can never
// end up stranded off-screen or behind a mobile browser bar.
addEventListener("resize", clampNoIntoView);
addEventListener("orientationchange", clampNoIntoView);
if (window.visualViewport) {
  visualViewport.addEventListener("resize", clampNoIntoView);
  visualViewport.addEventListener("scroll", clampNoIntoView);
}

/* kick off — supports jumping to a scene via URL hash, e.g. #ask #dark #finale */
(function kickoff() {
  const target = (location.hash || "").replace("#", "");
  if (sceneEls[target] && target !== "intro") {
    sceneEls.intro.classList.remove("is-active");
    sceneEls[target].classList.add("is-active");
    currentScene = target;
    setTheme(SCENE_THEME[target] || "dawn");
    onEnter(target);
  } else {
    setTheme("dawn");
    onEnter("intro");
  }
})();
