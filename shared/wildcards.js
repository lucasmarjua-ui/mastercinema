// Comodines del modo Maratón: catálogo, usos base y compra de usos extra con bobinas.
import { Wallet } from './wallet.js';

const KEY = 'mastercinema.wildcards';
const BASE_USES = 1;

export const WILDCARDS = [
  { id: 'fifty', name: '50:50', description: 'Elimina 2 respuestas incorrectas.', cost: 10 },
  { id: 'skip', name: 'Pasar', description: 'Descarta la pregunta actual sin penalización.', cost: 10 },
  { id: 'reveal', name: 'Chivato', description: 'Resalta la respuesta correcta (puntos reducidos).', cost: 10 }
];

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return WILDCARDS.reduce((state, item) => { state[item.id] = Math.max(0, Math.floor(Number(value[item.id]) || 0)); return state; }, {});
  } catch {
    return WILDCARDS.reduce((state, item) => { state[item.id] = 0; return state; }, {});
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('wildcardchange', { detail: state }));
  return state;
}

// Usos extra comprados de forma permanente (por tipo de comodín).
export function getWildcardUpgrades() { return read(); }

export function buyWildcardUpgrade(id) {
  const wildcard = WILDCARDS.find(item => item.id === id);
  const state = read();
  if (!wildcard || !Wallet.spend(wildcard.cost)) return state;
  state[id] = (state[id] || 0) + 1;
  return write(state);
}

// Usos con los que arranca cada partida de Maratón: 1 base + los extra comprados.
export function getStartingUses() {
  const upgrades = read();
  return WILDCARDS.reduce((starting, item) => { starting[item.id] = BASE_USES + (upgrades[item.id] || 0); return starting; }, {});
}
