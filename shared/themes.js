// Catálogo de temas visuales completos. Cada uno redefine la paleta entera
// (no solo un acento) vía variables CSS aplicadas en [data-theme="id"].
import { Wallet } from './wallet.js';

const KEY = 'mastercinema.themes';
const DEFAULT_THEME = 'hollywood';

export const THEMES = [
  {
    id: 'hollywood',
    name: 'Hollywood Dorado',
    description: 'Negro, dorado y rojo carmesí. La sala de siempre.',
    cost: 0,
    swatch: ['#0b0607', '#d4af37', '#8f1329']
  },
  {
    id: 'drivein',
    name: 'Autocine Neón',
    description: 'Noche azul con rosa neón y cian, ambiente de autocine.',
    cost: 15,
    swatch: ['#060814', '#38e8e0', '#ff2fb0']
  },
  {
    id: 'silent',
    name: 'Cine Mudo B/N',
    description: 'Escala de grises, grano de película y parpadeo de proyector.',
    cost: 20,
    swatch: ['#050505', '#c9c9c9', '#4d4d4d'],
    effect: 'grain'
  },
  {
    id: 'blockbuster',
    name: 'Estreno Blockbuster',
    description: 'Rojo y amarillo de cartel de estreno, con flashes de cámaras.',
    cost: 30,
    badge: 'EXCLUSIVO',
    swatch: ['#1a0500', '#ffcc00', '#e11d1d'],
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
