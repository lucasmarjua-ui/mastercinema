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
