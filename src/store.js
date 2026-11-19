import { useSyncExternalStore } from 'react';

const SETTINGS_KEY = 'uniuyolife.settings.v1';
export const DEFAULT_SETTINGS = { sensitivity: 1, fov: 70, sfx: 0.8, music: 0.5, voices: true };
function loadSettings() {
  try { const raw = localStorage.getItem(SETTINGS_KEY); return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }; }
  catch (e) { return { ...DEFAULT_SETTINGS }; }
}

// A tiny external store: the game loop writes to it, React components read from it.
let state = {
  phase: 'loading', // loading | intro | play
  zone: 'campus', // campus | class | cafe
  clock: 480, // minutes since midnight
  money: 5000,
  energy: 80,
  notes: 0,
  lectures: 0,
  ate: false,
  tray: null,
  slot: null, // current lecture slot name
  menuOpen: false,
  summary: false,
  locked: false,
  touchUI: false,
  muted: false,
  toast: null,
  subtitle: null,
  prompt: null,
  settings: loadSettings(),
};
const listeners = new Set();
export const getState = () => state;
export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  let changed = false;
  for (const k in next) if (state[k] !== next[k]) { changed = true; break; }
  if (!changed) return;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
export const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const useStore = (sel) => useSyncExternalStore(subscribe, () => sel(state));
