import { getState, setState } from '../store';
import { say, hush } from './voice';
import { sfx } from './audio';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const coarsePointer = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

// Mutable game state shared by the render loop. React reads the parts it shows through the store.
export const world = { P: { x: 0, z: 40 }, yaw: 0, pitch: 0, zone: 'campus', busy: false, camera: null, keys: {}, joy: { x: 0, y: 0 }, t: 480, cur: null };

const BND = { campus: [-70, 70, -70, 60], class: [294.5, 305.5, -4.5, 4.5], cafe: [-306.5, -293.5, -4.5, 4.5] };
const COLS = {
  campus: [[-13, -37, 13, -23], [-37, -11, -19, 1], [19, -11, 37, 1]],
  class: [], cafe: [[-305, -3.6, -295, -2.8], [-297.65, -1.05, -296.35, .25], [-303.65, -1.05, -302.35, .25], [-297.65, 1.75, -296.35, 3.05], [-303.65, 1.75, -302.35, 3.05]],
};
for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { if (r === 1 && c === 1) continue; const x = 296 + c * 2.6, z = -1 + r * 1.8 - .5; COLS.class.push([x - .6, z - .25, x + .6, z + .25]); }

const SLOTS = [
  { name: 'GST 101 (Use of English)', from: 480, to: 600, end: 600, lines: ['Good morning, class. Today we look at the use of English in academic writing.', 'A good paragraph has one main idea, supported by clear evidence.', 'Your assignment: write a short paragraph about life at Uniuyo. Class dismissed.'] },
  { name: 'MTH 101 (Calculus)', from: 840, to: 1020, end: 1020, lines: ['Good afternoon. Today we begin with limits in calculus.', 'A limit tells us the value a function approaches as the input gets closer.', 'Please attempt questions one to five before the next class. Thank you.'] },
];
export const currentSlot = (t) => SLOTS.find((s) => t >= s.from && t < s.to) || null;
export const MENU = [
  ['Jollof rice & chicken', 2500, 35], ['Afang soup & pounded yam', 3500, 45], ['Edikang Ikong & fufu', 3500, 45],
  ['Fried plantain & eggs', 1500, 25], ['Suya', 1500, 20], ['Zobo drink', 500, 8],
];

let toastTimer = 0;
export function toast(msg) { setState({ toast: msg }); clearTimeout(toastTimer); toastTimer = setTimeout(() => setState({ toast: null }), 2600); }
const go = (zone, x, z, yaw) => { world.zone = zone; world.P.x = x; world.P.z = z; world.yaw = yaw; world.pitch = 0; sfx.click(); setState({ zone }); };

const TRIG = [
  { z: 'campus', x: -18, y: -5, r: 3.2, m: () => 'Press E to enter Lecture Theatre 1', f: () => go('class', 300, 3.2, 0) },
  { z: 'campus', x: 18, y: -5, r: 3.2, m: () => 'Press E to enter the Cafeteria', f: () => { const t = world.t; if (t < 660 || t > 1000) return toast('The cafeteria serves from 11:00 to 16:40.'); go('cafe', -300, 3.6, 0); say('Server', 'Welcome! What will you eat?', { delay: 0.4 }); } },
  { z: 'class', x: 300, y: 4.3, r: 1.7, m: () => 'Press E to leave class', f: () => go('campus', -16, -5, -Math.PI / 2) },
  { z: 'class', x: 298.6, y: .9, r: 1.5, m: () => (currentSlot(world.t) ? 'Press E to sit for ' + currentSlot(world.t).name : 'No lecture now. Next: GST 101 at 08:00, MTH 101 at 14:00'), f: startLecture },
  { z: 'cafe', x: -300, y: 4.6, r: 1.7, m: () => 'Press E to leave', f: () => go('campus', 16, -5, Math.PI / 2) },
  { z: 'cafe', x: -300, y: -1.9, r: 2.2, m: () => 'Press E to order food', f: () => { setState({ menuOpen: true }); sfx.click(); } },
  { z: 'cafe', x: -300, y: 1.0, r: 3.4, m: () => (getState().tray ? 'Press E to sit and eat ' + getState().tray[0] : 'Order food at the counter first'), f: eat },
];

function startLecture() {
  const s = getState(), slot = currentSlot(world.t);
  if (!slot) return toast('There is no lecture right now.');
  if (s.energy < 15) return toast('You are too tired. Get some food first.');
  world.busy = true; world.P.x = 298.6; world.P.z = .9; world.yaw = 0; world.pitch = -.05;
  let i = 0;
  const next = () => {
    if (i >= slot.lines.length) {
      world.busy = false; world.t = Math.max(world.t, slot.end);
      setState((st) => ({ lectures: st.lectures + 1, energy: Math.max(0, st.energy - 12) })); toast('Lecture over. You now have ' + getState().notes + ' notes.'); return check();
    }
    const line = slot.lines[i++]; say('Lecturer', line); world.t += 25; setState((st) => ({ notes: st.notes + 15 }));
    setTimeout(next, Math.max(4200, line.length * 80));
  };
  next();
}
function eat() {
  const tray = getState().tray; if (!tray) return toast('Order food at the counter first.');
  world.busy = true; world.P.x = -297; world.P.z = 1.0; world.yaw = Math.PI / 2; toast('Eating ' + tray[0] + '...');
  setTimeout(() => { world.busy = false; world.t += 40; setState((st) => ({ energy: Math.min(100, st.energy + tray[2]), tray: null, ate: true })); toast('Delicious. Energy restored.'); check(); }, 5000);
}
export function buy(i) {
  const s = getState(), it = MENU[i];
  if (s.money < it[1]) { toast('Not enough money for ' + it[0] + '.'); return; }
  setState({ money: s.money - it[1], tray: it, menuOpen: false }); sfx.chime(); say('Server', 'Here is your ' + it[0] + '. Enjoy.'); toast('Paid ₦' + it[1] + '. Find a table.');
}
export const closeMenu = () => setState({ menuOpen: false });
let finished = false;
function check() { const s = getState(); if (!finished && s.lectures >= 2 && s.ate) { finished = true; setTimeout(() => setState({ summary: true }), 1200); } }
export const closeSummary = () => setState({ summary: false });
export const act = () => { const s = getState(); if (world.cur && !world.busy && !s.menuOpen && !s.summary && s.phase === 'play') world.cur.f(); };

export function lock() { const c = world.canvas; if (!c || getState().touchUI || !c.requestPointerLock) return; try { const p = c.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* optional */ } }
export function startGame() { sfx.init(); lock(); setState({ phase: 'play' }); say('Announcement', 'Welcome to the University of Uyo. Your first lecture holds at eight.', { delay: 0.5 }); }

export function attachInput(canvas) {
  world.canvas = canvas;
  const K = world.keys, ptr = {};
  const onKeyDown = (e) => { K[e.code] = true; if (e.code.startsWith('Arrow')) e.preventDefault(); if (e.code === 'KeyE' || e.code === 'Enter') act(); if (e.code === 'KeyM') { sfx.setMuted(!getState().muted); setState({ muted: !getState().muted }); } };
  const onKeyUp = (e) => { K[e.code] = false; };
  const onBlur = () => { for (const k in K) K[k] = false; };
  const lookBy = (dx, dy) => { const sn = getState().settings.sensitivity; world.yaw -= dx * .0024 * sn; world.pitch = clamp(world.pitch - dy * .0024 * sn, -1.2, 1.2); };
  const onMouseMove = (e) => { if (document.pointerLockElement === canvas) lookBy(e.movementX, e.movementY); };
  const onLock = () => setState({ locked: document.pointerLockElement === canvas });
  const down = (e) => {
    if (e.pointerType === 'touch') { if (!getState().touchUI) setState({ touchUI: true }); ptr[e.pointerId] = { x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY, mv: e.clientX < innerWidth / 2 }; canvas.setPointerCapture?.(e.pointerId); }
    else { ptr[e.pointerId] = { x: e.clientX, y: e.clientY, mv: false, mouse: true }; if (getState().phase === 'play') lock(); }
  };
  const move = (e) => {
    const p = ptr[e.pointerId]; if (!p) return;
    if (p.mv) { world.joy.x = clamp((e.clientX - p.ox) / 50, -1, 1); world.joy.y = clamp((e.clientY - p.oy) / 50, -1, 1); }
    else if (!p.mouse || document.pointerLockElement !== canvas) { lookBy((e.clientX - p.x) * 1.4, (e.clientY - p.y) * 1.4); p.x = e.clientX; p.y = e.clientY; }
  };
  const up = (e) => { if (ptr[e.pointerId]?.mv) { world.joy.x = 0; world.joy.y = 0; } delete ptr[e.pointerId]; };
  addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp); addEventListener('blur', onBlur);
  document.addEventListener('mousemove', onMouseMove); document.addEventListener('pointerlockchange', onLock);
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  return () => {
    removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp); removeEventListener('blur', onBlur);
    document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('pointerlockchange', onLock);
    canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up);
  };
}

const blocked = (x, z) => {
  const B = BND[world.zone]; if (x < B[0] || x > B[1] || z < B[2] || z > B[3]) return true;
  return COLS[world.zone].some((c) => x > c[0] - .4 && x < c[2] + .4 && z > c[1] - .4 && z < c[3] + .4);
};
let syncT = 0, stepT = 0;
export function frame(dt) {
  dt = Math.min(0.05, dt);
  const s = getState(), P = world.P, K = world.keys, playing = s.phase === 'play' && !s.menuOpen && !s.summary;
  if (playing && !world.busy) {
    if (K.ArrowLeft) world.yaw += dt * 1.8; if (K.ArrowRight) world.yaw -= dt * 1.8;
    let f = (K.KeyW || K.ArrowUp ? 1 : 0) - (K.KeyS || K.ArrowDown ? 1 : 0) - world.joy.y, sd = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0) + world.joy.x;
    const l = Math.hypot(f, sd); if (l > 1) { f /= l; sd /= l; }
    const sp = (K.ShiftLeft ? 5.2 : 3.4) * dt, dx = (-Math.sin(world.yaw) * f + Math.cos(world.yaw) * sd) * sp, dz = (-Math.cos(world.yaw) * f - Math.sin(world.yaw) * sd) * sp;
    if (!blocked(P.x + dx, P.z)) P.x += dx; if (!blocked(P.x, P.z + dz)) P.z += dz;
    if (l > 0.1) { stepT -= dt; if (stepT <= 0) { stepT = .5; try { sfx.step(); } catch (e) { /* optional */ } } setState({ energy: Math.max(0, s.energy - dt * .12) }); }
  }
  if (playing && !world.busy) world.t += dt * 0.8;
  const cam = world.camera;
  if (cam) {
    const seated = world.busy && world.zone === 'class';
    cam.position.set(P.x, seated ? 1.2 : 1.62, P.z); cam.rotation.set(world.pitch, world.yaw, 0);
  }
  let best = null, bd = 99;
  if (playing && !world.busy) for (const a of TRIG) { if (a.z !== world.zone) continue; const d = Math.hypot(P.x - a.x, P.z - a.y); if (d < a.r && d < bd) { bd = d; best = a; } }
  world.cur = best;
  syncT -= dt;
  if (syncT <= 0) { syncT = .2; const slot = currentSlot(world.t); setState({ clock: Math.floor(world.t), slot: slot ? slot.name : null, prompt: best ? best.m() : null }); }
}
export { hush };
