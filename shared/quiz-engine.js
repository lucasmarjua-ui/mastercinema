// Lógica de partida de MasterCinema: selección de preguntas, orden de opciones y puntuación.
import { QUESTIONS } from './questions.js';

export const ROUND_SIZE = 10;
export const TIME_LIMIT_MS = 15000;

// Fisher-Yates sobre una copia, nunca muta el array recibido.
export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Arma una ronda de `roundSize` preguntas para una categoría. Si el banco tiene
// menos preguntas que `roundSize`, recicla el banco barajado de nuevo evitando
// repetir la misma pregunta dos veces seguidas.
export function buildRound(categoryKey, roundSize = ROUND_SIZE) {
  const category = QUESTIONS[categoryKey];
  const items = category.items;
  const sequence = [];
  let pool = shuffle(items);
  while (sequence.length < roundSize) {
    if (!pool.length) pool = shuffle(items);
    if (sequence.length && pool[0] === sequence[sequence.length - 1] && pool.length > 1) {
      [pool[0], pool[1]] = [pool[1], pool[0]];
    }
    sequence.push(pool.shift());
  }
  return sequence.map(item => ({
    question: item.q,
    correctAnswer: item.correct,
    options: shuffle([item.correct, ...item.wrong])
  }));
}

// Puntuación: 0 si falla o se agota el tiempo; si acierta, entre 50 y 150 puntos
// según cuánto tiempo le quedaba (más rápido = más puntos).
export function computeScore(isCorrect, remainingMs, timeLimitMs = TIME_LIMIT_MS) {
  if (!isCorrect) return 0;
  const ratio = Math.max(0, Math.min(1, remainingMs / timeLimitMs));
  return Math.round(50 + ratio * 100);
}

// ============ Modo Maratón ============
// Mazo con preguntas de las 4 categorías mezcladas, sin repetir hasta agotar
// el pool completo (y entonces se vuelve a barajar).
export function createMarathonDeck() {
  let pool = [];
  function refill() {
    pool = shuffle(Object.entries(QUESTIONS).flatMap(([categoryKey, category]) => category.items.map(item => ({ ...item, categoryKey }))));
  }
  return {
    next() {
      if (!pool.length) refill();
      const item = pool.shift();
      return {
        question: item.q,
        correctAnswer: item.correct,
        options: shuffle([item.correct, ...item.wrong]),
        categoryKey: item.categoryKey
      };
    }
  };
}

// Multiplicador de puntos según la racha actual: x1 (0-4), x1.5 (5-9), x2 (10-19), x3 (20+).
export function marathonMultiplier(streak) {
  if (streak >= 20) return 3;
  if (streak >= 10) return 2;
  if (streak >= 5) return 1.5;
  return 1;
}

// Puntuación de una respuesta correcta en Maratón. `assisted` (comodín Chivato)
// ignora el bonus por rapidez y usa una base plana reducida a la mitad.
export function computeMarathonScore(remainingMs, streakBeforeAnswer, { timeLimitMs = TIME_LIMIT_MS, assisted = false } = {}) {
  const base = assisted ? 25 : computeScore(true, remainingMs, timeLimitMs);
  return Math.round(base * marathonMultiplier(streakBeforeAnswer));
}
