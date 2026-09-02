// Logros por categoría (bronce/plata/oro) derivados de estadísticas acumuladas
// en localStorage. Los logros se calculan siempre a partir de `stats`, nunca
// se guardan como "desbloqueado" por separado.
const KEY = 'mastercinema.stats';
const CATEGORIES = ['directors', 'actors', 'quotes', 'years'];

export const ACHIEVEMENTS = [
  { id: 'directors-bronze', category: 'directors', medal: 'bronze', name: 'Primera Toma', description: 'Acierta 5 de 10 preguntas en una partida de Directores.' },
  { id: 'directors-silver', category: 'directors', medal: 'silver', name: 'Voz de "Corten"', description: 'Acierta 8 de 10 preguntas en una partida de Directores.' },
  { id: 'directors-gold', category: 'directors', medal: 'gold', name: 'Maestro Tras la Cámara', description: 'Consigue una partida perfecta (10/10) en Directores.' },
  { id: 'actors-bronze', category: 'actors', medal: 'bronze', name: 'Reflejos de Estrella', description: 'Responde una pregunta en menos de 5 segundos.' },
  { id: 'actors-silver', category: 'actors', medal: 'silver', name: 'Racha de Reparto', description: 'Encadena 5 aciertos seguidos en Actores y Personajes.' },
  { id: 'actors-gold', category: 'actors', medal: 'gold', name: 'Paseo de la Fama', description: 'Supera 900 puntos acumulados en Actores y Personajes.' },
  { id: 'quotes-bronze', category: 'quotes', medal: 'bronze', name: 'Cinéfilo de Guion', description: 'Juega la categoría Frases Icónicas 3 veces.' },
  { id: 'quotes-silver', category: 'quotes', medal: 'silver', name: 'Palabra Perfecta', description: 'Consigue una partida perfecta (10/10) en Frases Icónicas.' },
  { id: 'quotes-gold', category: 'quotes', medal: 'gold', name: 'Guionista de Oro', description: 'Partida perfecta en Frases Icónicas con más de la mitad del tiempo restante de media.' },
  { id: 'years-bronze', category: 'years', medal: 'bronze', name: 'Cronista de Cine', description: 'Acierta 5 de 10 preguntas en Años de Estreno.' },
  { id: 'years-silver', category: 'years', medal: 'silver', name: 'Maratón sin Fallos', description: 'Encadena 7 aciertos seguidos, sin importar la categoría.' },
  { id: 'years-gold', category: 'years', medal: 'gold', name: 'Leyenda de MasterCinema', description: 'Consigue el logro de oro en Directores, Actores y Frases Icónicas.' }
];

function defaultCategoryStats() {
  return { timesPlayed: 0, bestCorrect: 0, perfectRounds: 0, totalScore: 0, bestStreak: 0, streakRun: 0, fastestAnswerMs: null, perfectAvgRatioMax: 0 };
}

function defaultStats() {
  return CATEGORIES.reduce((stats, category) => {
    stats[category] = defaultCategoryStats();
    return stats;
  }, { crossStreak: { current: 0, best: 0 } });
}

export function loadStats() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    const stats = defaultStats();
    CATEGORIES.forEach(category => { stats[category] = { ...stats[category], ...(value[category] || {}) }; });
    stats.crossStreak = { ...stats.crossStreak, ...(value.crossStreak || {}) };
    return stats;
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats) {
  localStorage.setItem(KEY, JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent('statschange', { detail: stats }));
  return stats;
}

// Se llama tras cada respuesta (acierto o fallo) para actualizar rachas y mejor tiempo.
export function recordAnswer(stats, { category, isCorrect, remainingMs, timeLimitMs }) {
  const cat = stats[category];
  if (isCorrect) {
    stats.crossStreak.current += 1;
    stats.crossStreak.best = Math.max(stats.crossStreak.best, stats.crossStreak.current);
    cat.streakRun += 1;
    cat.bestStreak = Math.max(cat.bestStreak, cat.streakRun);
    const elapsedMs = Math.max(0, timeLimitMs - remainingMs);
    if (cat.fastestAnswerMs === null || elapsedMs < cat.fastestAnswerMs) cat.fastestAnswerMs = elapsedMs;
  } else {
    stats.crossStreak.current = 0;
    cat.streakRun = 0;
  }
  return stats;
}

// Se llama al terminar una ronda de 10 preguntas.
export function recordRoundEnd(stats, { category, correctCount, totalCount, score, avgRemainingRatio }) {
  const cat = stats[category];
  cat.timesPlayed += 1;
  cat.bestCorrect = Math.max(cat.bestCorrect, correctCount);
  cat.totalScore += Math.max(0, Math.floor(Number(score) || 0));
  if (correctCount === totalCount) {
    cat.perfectRounds += 1;
    if (category === 'quotes') cat.perfectAvgRatioMax = Math.max(cat.perfectAvgRatioMax, avgRemainingRatio);
  }
  return stats;
}

export function getAchievementState(stats) {
  const goldDirectors = stats.directors.perfectRounds >= 1;
  const goldActors = stats.actors.totalScore >= 900;
  const goldQuotes = stats.quotes.perfectRounds >= 1 && stats.quotes.perfectAvgRatioMax > 0.5;
  const unlockedById = {
    'directors-bronze': stats.directors.bestCorrect >= 5,
    'directors-silver': stats.directors.bestCorrect >= 8,
    'directors-gold': goldDirectors,
    'actors-bronze': stats.actors.fastestAnswerMs !== null && stats.actors.fastestAnswerMs < 5000,
    'actors-silver': stats.actors.bestStreak >= 5,
    'actors-gold': goldActors,
    'quotes-bronze': stats.quotes.timesPlayed >= 3,
    'quotes-silver': stats.quotes.perfectRounds >= 1,
    'quotes-gold': goldQuotes,
    'years-bronze': stats.years.bestCorrect >= 5,
    'years-silver': stats.crossStreak.best >= 7,
    'years-gold': goldDirectors && goldActors && goldQuotes
  };
  return ACHIEVEMENTS.map(item => ({ ...item, unlocked: Boolean(unlockedById[item.id]) }));
}
