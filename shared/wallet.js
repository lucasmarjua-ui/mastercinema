// Monedero de "bobinas" (moneda del juego), persistido en localStorage.
const WALLET_KEY = 'mastercinema.wallet';

export const Wallet = {
  get() {
    return Number.parseInt(localStorage.getItem(WALLET_KEY) || '0', 10) || 0;
  },
  add(amount) {
    const safeAmount = Math.floor(Number(amount) || 0);
    const total = Math.max(0, this.get() + safeAmount);
    localStorage.setItem(WALLET_KEY, String(total));
    window.dispatchEvent(new CustomEvent('walletchange', { detail: total }));
    return total;
  },
  spend(amount) {
    const cost = Math.floor(Number(amount) || 0);
    if (cost <= 0 || this.get() < cost) return false;
    this.add(-cost);
    return true;
  }
};

// Bobinas ganadas al terminar una partida, en función de la puntuación conseguida.
export function reelsForScore(score) {
  return Math.max(5, Math.round(Math.max(0, Number(score) || 0) / 15));
}
