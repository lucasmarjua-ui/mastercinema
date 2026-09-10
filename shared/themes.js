// Catálogo de temas visuales completos. Cada uno redefine la paleta entera
// (no solo un acento) vía variables CSS aplicadas en [data-theme="id"].
import { Wallet } from './wallet.js';

const KEY = 'mastercinema.themes';
const DEFAULT_THEME = 'leader';

export const THEMES = [
  {
    id: 'leader',
    name: 'Leader',
    description: 'Negro de sala, papel y ámbar de cuenta atrás. La proyección de siempre.',
    cost: 0,
    swatch: ['#0a0a0b', '#ff7a1a', '#f2ede2']
  },
  {
    id: 'bars',
    name: 'Bandas SMPTE',
    description: 'Magenta y cian de calibración de imagen, como el patrón de barras.',
    cost: 15,
    swatch: ['#0a0a0c', '#ff2e7e', '#22e0d8']
  },
  {
    id: 'noir',
    name: 'Cinerama Noir',
    description: 'Blanco y negro, grano de película y parpadeo de proyector.',
    cost: 20,
    swatch: ['#050505', '#c9c9c9', '#4a4a4a'],
    effect: 'grain'
  },
  {
    id: 'grindhouse',
    name: 'Sesión Grindhouse',
    description: 'Rojo y ámbar saturados de copia quemada, con flashes de cámaras.',
    cost: 30,
    badge: 'EXCLUSIVO',
    swatch: ['#180400', '#ff3b1f', '#ffcc00'],
    effect: 'flash'
  }
];

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      owned: Array.isArray(value.owned) && value.owned.length ? [...new Set([DEFAULT_THEME, ...value.owned])] : [DEFAULT_THEME],
      equipped: value.equipped || DEFAULT_THEME
    };
  } catch {
    return { owned: [DEFAULT_THEME], equipped: DEFAULT_THEME };
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('themechange', { detail: state }));
  return state;
}

export function getThemeState() { return read(); }

export function buyTheme(id) {
  const theme = THEMES.find(item => item.id === id);
  const state = read();
  if (!theme || state.owned.includes(id) || !Wallet.spend(theme.cost)) return state;
  state.owned.push(id);
  return write(state);
}

export function equipTheme(id) {
  const state = read();
  if (!state.owned.includes(id)) return state;
  state.equipped = id;
  return write(state);
}

// Aplica el tema equipado al documento y dispara los efectos especiales (grano/flash).
export function applyTheme() {
  const state = read();
  const theme = THEMES.find(item => item.id === state.equipped) || THEMES[0];
  document.documentElement.dataset.theme = theme.id;

  if (theme.effect === 'flash') {
    const overlay = document.createElement('div');
    overlay.className = 'fx-flash-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
  }
  return theme;
}
