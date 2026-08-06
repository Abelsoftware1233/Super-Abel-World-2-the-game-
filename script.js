'use strict';

// ============================================================
// KORREL — een origineel sprong-avontuur
// Alles wordt met canvas-primitieven getekend (geen externe assets).
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const TILE = 36;

ctx.imageSmoothingEnabled = false;

// ---------- Screens ----------
const screens = {
  start: document.getElementById('screen-start'),
  levels: document.getElementById('screen-levels'),
  intro: document.getElementById('screen-intro'),
  clear: document.getElementById('screen-clear'),
  over: document.getElementById('screen-over'),
  win: document.getElementById('screen-win'),
};
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  if (name) screens[name].classList.remove('hidden');
}

// ---------- HUD ----------
const hud = {
  level: document.getElementById('hud-level'),
  orbs: document.getElementById('hud-orbs'),
  lives: document.getElementById('hud-lives'),
  time: document.getElementById('hud-time'),
};

// ============================================================
// LEVEL DATA
// Legend: # ground, ~ platform, ^ spike, o orb, F flag, S start,
//         E enemy (loper), W enemy (vlieger), 
//         P power-up: snelheid, D power-up: dubbelspringen, H power-up: schild
// ============================================================

function row(str) { return str; }

const LEVELS = [
  // ---- Wereld 1: Ontwaken ----
  {
    name: 'HET ONTWAKEN',
    sub: 'Leer springen. Verzamel de korrels, vermijd de doornen.',
    bg: 'meadow',
    width: 46,
    rows: [
      '..............................................',
      '..........................W....................',
      '..............................................',
      '.......o..........o..............o...........',
      '......###.........###.......F................',
      '..............P................###.............',
      '..S....o.....^^.......o..E........o...........',
      '###########################...#####...########',
    ],
  },
  // ---- Wereld 2: Kloven ----
  {
    name: 'DE KLOVEN',
    sub: 'Grotere sprongen, kruipende vijanden, meer diepte.',
    bg: 'canyon',
    width: 54,
    rows: [
      '......................................................',
      '..............................o.......W...............',
      '..........o..........~~~....###.......F...............',
      '.....o...###..P....E...........###...###..H...........',
      '..S..........^^^^..............................E......',
      '###....########........########........##########.####',
    ],
  },
  // ---- Wereld 3: Torens ----
  {
    name: 'DE TORENS',
    sub: 'Verticale sprongen tussen platformen in de lucht.',
    bg: 'sky',
    width: 50,
    rows: [
      '..................................................',
      '.........o..............W...o....................',
      '.......###........o.......###.......F............',
      '..................###..............###...........',
      '....o......E....D......E...........P....o........',
      '..###....######.....###........###.....###.......',
      '.S.................................................',
      '####...........####..........####........#########',
    ],
  },
  // ---- Wereld 4: Doornbos ----
  {
    name: 'HET DOORNBOS',
    sub: 'Nauwe paden vol doornen. Timing is alles.',
    bg: 'thorn',
    width: 56,
    rows: [
      '........................................................',
      '..............o..............W........o.................',
      '....o..###..........o.......###..H................F......',
      '..S....^^^^....E.........^^^^^^....E....P...###..........',
      '###########..####################......########..########',
    ],
  },
  // ---- Wereld 5: Sterrenkoepel (finale van deel 1) ----
  {
    name: 'DE STERRENKOEPEL',
    sub: 'Alles wat je tot nu toe leerde, in één grote beklimming.',
    bg: 'star',
    width: 60,
    rows: [
      '............................................................',
      '..................o......................o..W.............',
      '..............###.......E.......###..............F........',
      '........o..........W...................###.....H..........',
      '..S..###.......^^^...o..D...###..E....P....o..............',
      '..............................###.....................####',
      '####........########..........................############',
    ],
  },
  // ---- Wereld 6: IJsvlakte ----
  {
    name: 'DE IJSVLAKTE',
    sub: 'Gladde afstanden, meer vliegers in formatie.',
    bg: 'ice',
    width: 58,
    rows: [
      '..........................................................',
      '...................W.............W......................',
      '.......o.......................................F........',
      '....o..###..P.......o.......###..........###.............',
      '..S....................###........o....H.......o.........',
      '..............E.........E..........E..............E......',
      '###....########..####........########........#############',
    ],
  },
  // ---- Wereld 7: Het Moeras ----
  {
    name: 'HET MOERAS',
    sub: 'Dichte doornstruiken en lage plafonds. Blijf laag, blijf scherp.',
    bg: 'swamp',
    width: 56,
    rows: [
      '........................................................',
      '.......o.........###...................###..............',
      '....o..###..E.........W......o.....E..........F..........',
      '..S............^^^^^^....D..........^^^^..P...###.........',
      '###.####..################......################..#######',
    ],
  },
  // ---- Wereld 8: Emberkloof ----
  {
    name: 'DE EMBERKLOOF',
    sub: 'Smalle richels boven een gloeiende diepte.',
    bg: 'ember',
    width: 62,
    rows: [
      '..............................................................',
      '..................o.................o...................o.....',
      '..............###.......W.......###..........W.....###........',
      '........o..................E...........###.............F......',
      '..S..###.......H....E......###..P............###...D..........',
      '..............................................................',
      '####........####..........####..........####........#########',
    ],
  },
  // ---- Wereld 9: Kristalgrot ----
  {
    name: 'DE KRISTALGROT',
    sub: 'Nauwe gangen, veel vliegers, weinig ruimte om te falen.',
    bg: 'crystal',
    width: 60,
    rows: [
      '............................................................',
      '..............W..................W......................',
      '.......o...###......o.......###.......F..................',
      '....o..................###.........###....o...............',
      '..S..###..E....^^^^..D.....E....H...^^^^.......P..........',
      '...........................................................',
      '####..########....####........########....####...#########',
    ],
  },
  // ---- Wereld 10: De Kern (grote finale) ----
  {
    name: 'DE KERN',
    sub: 'De laatste korrels wachten in het hart van de ster.',
    bg: 'core',
    width: 66,
    rows: [
      '..................................................................',
      '..................o..........W..............o..........W........',
      '..............###.......E.......###..............###............',
      '........o..........W...........................###......F......',
      '..S..###..P....^^^...o..D...###..E....H....E......o.............',
      '..............................###..............###..............',
      '####........########..............####............#############',
    ],
  },
];

// ============================================================
// PARSE LEVEL -> tiles/entities
// ============================================================
function parseLevel(def) {
  const solids = [];      // {x,y,w,h}
  const platforms = [];   // one-way platforms (~)
  const spikes = [];
  const orbs = [];
  let flag = null;
  let start = { x: TILE * 2, y: 0 };
  const enemies = [];
  const powerups = [];

  const rowsArr = def.rows.map(r => r.padEnd(def.width, '.'));
  const gridH = rowsArr.length;

  for (let r = 0; r < gridH; r++) {
    const line = rowsArr[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      const x = c * TILE;
      const y = r * TILE;
      if (ch === '#') solids.push({ x, y, w: TILE, h: TILE });
      else if (ch === '~') platforms.push({ x, y, w: TILE, h: 12 });
      else if (ch === '^') spikes.push({ x, y: y + TILE - 16, w: TILE, h: 16 });
      else if (ch === 'o') orbs.push({ x: x + TILE / 2, y: y + TILE / 2, taken: false, id: `${r}-${c}` });
      else if (ch === 'F') flag = { x: x + TILE / 2, y: y };
      else if (ch === 'S') start = { x, y: y - TILE };
      else if (ch === 'E') enemies.push({ x, y: y - 4, baseX: x, baseY: y - 4, dir: 1, range: 100, w: 30, h: 26, alive: true, kind: 'walker' });
      else if (ch === 'W') enemies.push({ x, y: y - 4, baseX: x, baseY: y - 4, dir: 1, range: 90, w: 30, h: 24, alive: true, kind: 'flyer', phase: Math.random() * Math.PI * 2 });
      else if (ch === 'P') powerups.push({ x: x + TILE / 2, y: y + TILE / 2, taken: false, id: `p-${r}-${c}`, kind: 'speed' });
      else if (ch === 'D') powerups.push({ x: x + TILE / 2, y: y + TILE / 2, taken: false, id: `p-${r}-${c}`, kind: 'doublejump' });
      else if (ch === 'H') powerups.push({ x: x + TILE / 2, y: y + TILE / 2, taken: false, id: `p-${r}-${c}`, kind: 'shield' });
    }
  }
  return { solids, platforms, spikes, orbs, flag, start, enemies, powerups, worldW: def.width * TILE, worldH: gridH * TILE, bg: def.bg, name: def.name, sub: def.sub };
}

const parsedLevels = LEVELS.map(parseLevel);

// ============================================================
// GAME STATE
// ============================================================
const progress = { unlocked: 1, cleared: [] };

const state = {
  currentLevel: 0,
  level: null,
  player: null,
  camX: 0,
  keys: { left: false, right: false, jump: false },
  orbsTotal: 0,
  orbsTaken: 0,
  lives: 3,
  timeMs: 0,
  running: false,
  particles: [],
  flagReached: false,
};

function makePlayer(start) {
  return {
    x: start.x, y: start.y, w: 26, h: 32,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    invuln: 0,
    animT: 0,
    dead: false,
    speedBoost: 0,     // ms remaining
    doubleJump: false, // permanent for the level once picked up
    usedExtraJump: false,
    shield: 0,         // number of hits absorbed
  };
}

// ============================================================
// INPUT
// ============================================================
window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) state.keys.left = true;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) state.keys.right = true;
  if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { state.keys.jump = true; e.preventDefault(); }
});
window.addEventListener('keyup', (e) => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) state.keys.left = false;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) state.keys.right = false;
  if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) state.keys.jump = false;
});

// Touch controls
const touchControls = document.getElementById('touch-controls');
if ('ontouchstart' in window) touchControls.classList.add('active');
function bindHold(id, onDown, onUp) {
  const el = document.getElementById(id);
  el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
  el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
  el.addEventListener('mousedown', onDown);
  el.addEventListener('mouseup', onUp);
}
bindHold('t-left', () => state.keys.left = true, () => state.keys.left = false);
bindHold('t-right', () => state.keys.right = true, () => state.keys.right = false);
bindHold('jump-btn', () => state.keys.jump = true, () => state.keys.jump = false);

// ============================================================
// PHYSICS
// ============================================================
const GRAVITY = 0.85;
const MOVE_ACCEL = 0.9;
const MAX_SPEED = 4.6;
const FRICTION = 0.82;
const JUMP_VELOCITY = -14.5;
const MAX_FALL = 15;

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updatePlayer(dt) {
  const p = state.player;
  const lvl = state.level;
  if (p.dead) return;

  const speedMult = p.speedBoost > 0 ? 1.6 : 1;
  const curMaxSpeed = MAX_SPEED * speedMult;
  const curAccel = MOVE_ACCEL * speedMult;

  // horizontal input
  if (state.keys.left) { p.vx -= curAccel; p.facing = -1; }
  if (state.keys.right) { p.vx += curAccel; p.facing = 1; }
  p.vx *= FRICTION;
  if (Math.abs(p.vx) > curMaxSpeed) p.vx = curMaxSpeed * Math.sign(p.vx);
  if (Math.abs(p.vx) < 0.05) p.vx = 0;

  // jump (with optional double jump)
  const jumpPressed = state.keys.jump && !state.keys._jumpWasDown;
  if (jumpPressed) {
    if (p.onGround) {
      p.vy = JUMP_VELOCITY;
      p.onGround = false;
      p.usedExtraJump = false;
      spawnParticles(p.x + p.w / 2, p.y + p.h, 6, 'dust');
    } else if (p.doubleJump && !p.usedExtraJump) {
      p.vy = JUMP_VELOCITY * 0.85;
      p.usedExtraJump = true;
      spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 10, 'sparkle');
    }
  }
  state.keys._jumpWasDown = state.keys.jump;

  // gravity
  p.vy += GRAVITY;
  if (p.vy > MAX_FALL) p.vy = MAX_FALL;

  // move X, resolve collisions
  p.x += p.vx;
  for (const s of lvl.solids) {
    if (rectsOverlap(p, s)) {
      if (p.vx > 0) p.x = s.x - p.w;
      else if (p.vx < 0) p.x = s.x + s.w;
      p.vx = 0;
    }
  }
  p.x = Math.max(0, Math.min(lvl.worldW - p.w, p.x));

  // move Y, resolve collisions
  p.onGround = false;
  p.y += p.vy;
  for (const s of lvl.solids) {
    if (rectsOverlap(p, s)) {
      if (p.vy > 0) { p.y = s.y - p.h; p.onGround = true; }
      else if (p.vy < 0) { p.y = s.y + s.h; }
      p.vy = 0;
    }
  }
  // one-way platforms: only stop if falling onto top
  for (const pl of lvl.platforms) {
    const wasAbove = p.y + p.h - p.vy <= pl.y + 2;
    if (p.vy >= 0 && wasAbove && rectsOverlap(p, { x: pl.x, y: pl.y, w: pl.w, h: pl.h + 6 })) {
      p.y = pl.y - p.h;
      p.vy = 0;
      p.onGround = true;
    }
  }

  // fell off world
  if (p.y > lvl.worldH + 200) {
    killPlayer();
    return;
  }

  // spikes
  if (p.invuln <= 0) {
    for (const sp of lvl.spikes) {
      if (rectsOverlap(p, sp)) { hurtPlayer(); break; }
    }
  }

  // orbs
  for (const o of lvl.orbs) {
    if (!o.taken) {
      const dx = (p.x + p.w / 2) - o.x, dy = (p.y + p.h / 2) - o.y;
      if (dx * dx + dy * dy < 26 * 26) {
        o.taken = true;
        state.orbsTaken++;
        spawnParticles(o.x, o.y, 10, 'sparkle');
        updateHud();
      }
    }
  }

  // power-ups
  for (const pu of lvl.powerups) {
    if (!pu.taken) {
      const dx = (p.x + p.w / 2) - pu.x, dy = (p.y + p.h / 2) - pu.y;
      if (dx * dx + dy * dy < 28 * 28) {
        pu.taken = true;
        applyPowerup(pu.kind);
        spawnParticles(pu.x, pu.y, 14, 'sparkle');
      }
    }
  }
  if (p.speedBoost > 0) p.speedBoost -= dt;

  // enemies
  if (p.invuln <= 0) {
    for (const en of lvl.enemies) {
      if (!en.alive) continue;
      if (rectsOverlap(p, en)) {
        const stomping = en.kind === 'walker' && p.vy > 2 && (p.y + p.h) - en.y < 16;
        if (stomping) {
          en.alive = false;
          p.vy = JUMP_VELOCITY * 0.6;
          spawnParticles(en.x + en.w / 2, en.y, 8, 'dust');
        } else if (p.shield > 0) {
          p.shield--;
          p.invuln = 900;
          spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 12, 'sparkle');
          updateHud();
        } else {
          hurtPlayer();
        }
      }
    }
  }

  // flag
  if (!state.flagReached && lvl.flag) {
    const fRect = { x: lvl.flag.x - 10, y: lvl.flag.y, w: 20, h: TILE * 2 };
    if (rectsOverlap(p, fRect)) {
      state.flagReached = true;
      onLevelClear();
    }
  }

  if (p.invuln > 0) p.invuln -= dt;
  p.animT += dt;

  // camera
  const targetCamX = p.x - W / 2 + p.w / 2;
  state.camX += (targetCamX - state.camX) * 0.12;
  state.camX = Math.max(0, Math.min(lvl.worldW - W, state.camX));
}

function applyPowerup(kind) {
  const p = state.player;
  if (kind === 'speed') {
    p.speedBoost = 6000;
  } else if (kind === 'doublejump') {
    p.doubleJump = true;
  } else if (kind === 'shield') {
    p.shield = Math.min(3, p.shield + 1);
  }
  updateHud();
}

function updateEnemies(dt) {
  for (const en of state.level.enemies) {
    if (!en.alive) continue;
    if (en.kind === 'walker') {
      en.x += en.dir * 1.1;
      if (en.x < en.baseX - en.range || en.x > en.baseX + en.range) en.dir *= -1;
    } else if (en.kind === 'flyer') {
      en.phase += dt / 500;
      en.x = en.baseX + Math.sin(en.phase) * en.range;
      en.y = en.baseY + Math.cos(en.phase * 0.7) * 22;
      en.dir = Math.cos(en.phase) >= 0 ? 1 : -1;
    }
  }
}

function hurtPlayer() {
  const p = state.player;
  if (p.invuln > 0) return;
  p.invuln = 1500;
  p.vy = -8;
  p.vx = -6 * p.facing;
  state.lives--;
  updateHud();
  spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 10, 'hurt');
  if (state.lives <= 0) {
    setTimeout(() => onGameOver(), 400);
  }
}

function killPlayer() {
  state.player.dead = true;
  state.lives--;
  updateHud();
  if (state.lives <= 0) {
    setTimeout(() => onGameOver(), 300);
  } else {
    setTimeout(() => resetPlayerPosition(), 500);
  }
}

function resetPlayerPosition() {
  state.player = makePlayer(state.level.start);
}

// ---------- Particles ----------
function spawnParticles(x, y, n, kind) {
  for (let i = 0; i < n; i++) {
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 4 - 1,
      life: 500 + Math.random() * 300,
      maxLife: 800,
      kind,
    });
  }
}
function updateParticles(dt) {
  for (const p of state.particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.2;
    p.life -= dt;
  }
  state.particles = state.particles.filter(p => p.life > 0);
}

// ============================================================
// RENDERING
// ============================================================
const BG_THEMES = {
  meadow: { top: '#3a2b6b', bot: '#ff8f6b', hill: '#3d2f6e' },
  canyon: { top: '#2b1f4a', bot: '#e0704a', hill: '#5a3a2a' },
  sky:    { top: '#1a2a5e', bot: '#6fa8ff', hill: '#2b3f7a' },
  thorn:  { top: '#1f1530', bot: '#7a3b5e', hill: '#2a1a3a' },
  star:   { top: '#0a0a2a', bot: '#3a2b6b', hill: '#1a1440' },
  ice:    { top: '#0e2a3d', bot: '#7fd6e8', hill: '#123a52' },
  swamp:  { top: '#1a2818', bot: '#5a7a3a', hill: '#233a1e' },
  ember:  { top: '#2a0e14', bot: '#e8562f', hill: '#3a1410' },
  crystal:{ top: '#160b3a', bot: '#7a4dff', hill: '#231460' },
  core:   { top: '#050208', bot: '#ff2d6e', hill: '#1a0410' },
};

function draw() {
  const lvl = state.level;
  const theme = BG_THEMES[lvl.bg];

  // sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, theme.top);
  grad.addColorStop(1, theme.bot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // stars (parallax, only for star/sky/canyon themes look nice)
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137 - state.camX * 0.2) % (W + 100);
    const sy = (i * 53) % (H * 0.5);
    ctx.fillRect(((sx % (W + 100)) + (W + 100)) % (W + 100), sy, 2, 2);
  }

  // parallax hills
  ctx.fillStyle = theme.hill;
  const hillOffset = -state.camX * 0.4;
  for (let i = -1; i < 6; i++) {
    const hx = i * 260 + (hillOffset % 260);
    ctx.beginPath();
    ctx.ellipse(hx + 130, H - 40, 160, 90, 0, Math.PI, 0, true);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(-state.camX, 0);

  // solids
  for (const s of lvl.solids) drawTile(s.x, s.y, s.w, s.h);
  // platforms
  ctx.fillStyle = '#8a6a3f';
  for (const pl of lvl.platforms) {
    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    ctx.fillStyle = '#c99a55';
    ctx.fillRect(pl.x, pl.y, pl.w, 3);
    ctx.fillStyle = '#8a6a3f';
  }
  // spikes
  ctx.fillStyle = '#e8e8f0';
  for (const sp of lvl.spikes) {
    for (let i = 0; i < sp.w; i += 12) {
      ctx.beginPath();
      ctx.moveTo(sp.x + i, sp.y + sp.h);
      ctx.lineTo(sp.x + i + 6, sp.y);
      ctx.lineTo(sp.x + i + 12, sp.y + sp.h);
      ctx.closePath();
      ctx.fill();
    }
  }
  // orbs
  const t = performance.now() / 300;
  for (const o of lvl.orbs) {
    if (o.taken) continue;
    const bob = Math.sin(t + o.id.length) * 4;
    drawOrb(o.x, o.y + bob);
  }
  // power-ups
  for (const pu of lvl.powerups) {
    if (pu.taken) continue;
    const bob = Math.sin(t * 1.3 + pu.id.length) * 5;
    drawPowerup(pu.x, pu.y + bob, pu.kind);
  }
  // flag
  if (lvl.flag) drawFlag(lvl.flag.x, lvl.flag.y, state.flagReached);
  // enemies
  for (const en of lvl.enemies) if (en.alive) drawEnemy(en);
  // particles
  for (const p of state.particles) drawParticle(p);
  // player
  if (!state.player.dead) drawPlayer(state.player);

  ctx.restore();
}

function drawTile(x, y, w, h) {
  ctx.fillStyle = '#4a3560';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#6a4d85';
  ctx.fillRect(x, y, w, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x, y + h - 4, w, 4);
}

function drawOrb(x, y) {
  ctx.save();
  ctx.translate(x, y);
  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 14);
  grad.addColorStop(0, '#fff9e0');
  grad.addColorStop(0.5, '#ffd25a');
  grad.addColorStop(1, 'rgba(255,210,90,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

const POWERUP_COLORS = {
  speed: '#5ac8ff',
  doublejump: '#c88cff',
  shield: '#ff9a5c',
};
function drawPowerup(x, y, kind) {
  ctx.save();
  ctx.translate(x, y);
  const col = POWERUP_COLORS[kind];
  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, col);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#1c1533';
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.beginPath();
  // rotate a little square/diamond as the icon body
  ctx.save();
  ctx.rotate(Math.PI / 4);
  ctx.rect(-7, -7, 14, 14);
  ctx.restore();
  ctx.fillStyle = '#241a3d';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const glyph = kind === 'speed' ? '»' : kind === 'doublejump' ? '↑↑' : '◆';
  ctx.font = kind === 'doublejump' ? 'bold 8px sans-serif' : 'bold 12px sans-serif';
  ctx.fillText(glyph, 0, 1);
  ctx.restore();
}

function drawFlag(x, y, reached) {
  ctx.fillStyle = '#c9a35a';
  ctx.fillRect(x - 2, y, 4, TILE * 2);
  ctx.fillStyle = reached ? '#5cd68a' : '#ff6b6b';
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 4);
  ctx.lineTo(x + 34, y + 14);
  ctx.lineTo(x + 2, y + 24);
  ctx.closePath();
  ctx.fill();
}

function drawEnemy(en) {
  if (en.kind === 'flyer') { drawFlyer(en); return; }
  ctx.save();
  ctx.translate(en.x + en.w / 2, en.y + en.h / 2);
  ctx.scale(en.dir, 1);
  // body
  ctx.fillStyle = '#8a3b5e';
  ctx.beginPath();
  ctx.ellipse(0, 2, en.w / 2, en.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // spikes on back
  ctx.fillStyle = '#5e2340';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 8, -en.h / 2 + 4);
    ctx.lineTo(i * 8 - 4, -en.h / 2 - 6);
    ctx.lineTo(i * 8 + 4, -en.h / 2 - 6);
    ctx.closePath();
    ctx.fill();
  }
  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(en.w / 4, -2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0a20';
  ctx.beginPath(); ctx.arc(en.w / 4 + 1, -2, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawFlyer(en) {
  ctx.save();
  ctx.translate(en.x + en.w / 2, en.y + en.h / 2);
  ctx.scale(en.dir, 1);
  const flap = Math.sin(performance.now() / 90) * 10;

  // wings
  ctx.fillStyle = 'rgba(255,210,90,0.55)';
  ctx.beginPath();
  ctx.ellipse(-4, -2 - flap * 0.3, 16, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-4, 6 + flap * 0.3, 16, 7, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // body
  ctx.fillStyle = '#5e3b8a';
  ctx.beginPath();
  ctx.ellipse(0, 2, en.w / 2 - 4, en.h / 2 - 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(en.w / 4 - 2, -1, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0a20';
  ctx.beginPath(); ctx.arc(en.w / 4 - 1, -1, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawParticle(p) {
  const alpha = Math.max(0, p.life / p.maxLife);
  ctx.globalAlpha = alpha;
  if (p.kind === 'sparkle') ctx.fillStyle = '#ffd25a';
  else if (p.kind === 'hurt') ctx.fillStyle = '#ff5f7e';
  else ctx.fillStyle = '#e8ddc8';
  ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  ctx.globalAlpha = 1;
}

function drawPlayer(p) {
  ctx.save();
  const blink = p.invuln > 0 && Math.floor(p.invuln / 100) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.4;

  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;

  // shield ring
  if (p.shield > 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(255,154,92,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24 + Math.sin(performance.now() / 150) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // speed trail
  if (p.speedBoost > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#5ac8ff';
    ctx.fillRect(cx - p.facing * 22, cy - 6, 14, 12);
    ctx.restore();
  }

  ctx.translate(cx, cy);
  ctx.scale(p.facing, 1);

  const squash = p.onGround ? 1 : (p.vy < 0 ? 1.08 : 0.94);

  // body (little glowing creature)
  ctx.fillStyle = '#5cd68a';
  ctx.beginPath();
  ctx.ellipse(0, 2, (p.w / 2) * (2 - squash), (p.h / 2) * squash, 0, 0, Math.PI * 2);
  ctx.fill();

  // belly
  ctx.fillStyle = '#eafff0';
  ctx.beginPath();
  ctx.ellipse(2, 6, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // eye
  ctx.fillStyle = '#123018';
  ctx.beginPath(); ctx.arc(6, -3, 3, 0, Math.PI * 2); ctx.fill();

  // little antenna glow
  const bob = Math.sin(p.animT / 150) * 2;
  ctx.strokeStyle = p.doubleJump ? '#c88cff' : '#5cd68a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -p.h / 2);
  ctx.lineTo(2, -p.h / 2 - 8 + bob);
  ctx.stroke();
  ctx.fillStyle = p.doubleJump ? '#c88cff' : '#ffd25a';
  ctx.beginPath(); ctx.arc(2, -p.h / 2 - 8 + bob, 3, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// ============================================================
// HUD / FLOW
// ============================================================
function updateHud() {
  hud.level.textContent = state.currentLevel + 1;
  hud.orbs.textContent = `${state.orbsTaken}/${state.orbsTotal}`;
  hud.lives.textContent = Math.max(0, state.lives);
  hud.time.textContent = Math.floor(state.timeMs / 1000);
}

function buildLevelGrid() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';
  parsedLevels.forEach((lvl, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    btn.textContent = i + 1;
    const locked = i + 1 > progress.unlocked;
    if (locked) btn.classList.add('locked');
    if (progress.cleared.includes(i)) btn.classList.add('cleared');
    btn.disabled = locked;
    btn.addEventListener('click', () => openLevelIntro(i));
    grid.appendChild(btn);
  });
}

function openLevelIntro(i) {
  state.currentLevel = i;
  document.getElementById('intro-title').textContent = `WERELD ${i + 1}: ${parsedLevels[i].name}`;
  document.getElementById('intro-sub').textContent = parsedLevels[i].sub;
  showScreen('intro');
}

function loadLevel(i) {
  const def = parsedLevels[i];
  // deep-ish reset (orbs/enemies mutate at runtime)
  state.level = JSON.parse(JSON.stringify(def));
  state.player = makePlayer(state.level.start);
  state.camX = 0;
  state.orbsTotal = state.level.orbs.length;
  state.orbsTaken = 0;
  state.lives = 3;
  state.timeMs = 0;
  state.flagReached = false;
  state.particles = [];
  updateHud();
}

function onLevelClear() {
  state.running = false;
  const idx = state.currentLevel;
  if (!progress.cleared.includes(idx)) progress.cleared.push(idx);
  progress.unlocked = Math.max(progress.unlocked, idx + 2);
  document.getElementById('clear-stats').textContent =
    `Korrels: ${state.orbsTaken}/${state.orbsTotal} · Tijd: ${Math.floor(state.timeMs / 1000)}s`;

  if (idx + 1 >= parsedLevels.length) {
    setTimeout(() => showScreen('win'), 400);
  } else {
    setTimeout(() => showScreen('clear'), 400);
  }
}

function onGameOver() {
  state.running = false;
  document.getElementById('over-stats').textContent =
    `Wereld ${state.currentLevel + 1} · Korrels: ${state.orbsTaken}/${state.orbsTotal}`;
  showScreen('over');
}

// ---------- Buttons ----------
document.getElementById('btn-play').addEventListener('click', () => {
  buildLevelGrid();
  showScreen('levels');
});
document.getElementById('btn-back-from-levels').addEventListener('click', () => showScreen('start'));
document.getElementById('btn-begin-level').addEventListener('click', () => {
  loadLevel(state.currentLevel);
  showScreen(null);
  state.running = true;
});
document.getElementById('btn-next-level').addEventListener('click', () => {
  openLevelIntro(state.currentLevel + 1);
});
document.getElementById('btn-clear-to-levels').addEventListener('click', () => {
  buildLevelGrid();
  showScreen('levels');
});
document.getElementById('btn-retry').addEventListener('click', () => {
  loadLevel(state.currentLevel);
  showScreen(null);
  state.running = true;
});
document.getElementById('btn-over-to-levels').addEventListener('click', () => {
  buildLevelGrid();
  showScreen('levels');
});
document.getElementById('btn-win-restart').addEventListener('click', () => {
  progress.unlocked = 1;
  progress.cleared = [];
  buildLevelGrid();
  showScreen('levels');
});

// ============================================================
// MAIN LOOP
// ============================================================
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(40, now - lastTime);
  lastTime = now;

  if (state.running) {
    state.timeMs += dt;
    updatePlayer(dt);
    updateEnemies(dt);
    updateParticles(dt);
    updateHud();
    draw();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
