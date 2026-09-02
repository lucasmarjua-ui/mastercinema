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
  { id: 'years-gold', category: 'years', medal: 'gold', name: 'Leyenda de MasterCinema', description: 'Consigue el logro de oro en Directores, Actores y Frases Icónicas.' },
  { id: 'marathon-fire', category: 'marathon', medal: 'bronze', name: 'Racha de Fuego', description: 'Alcanza una racha de 10 en el modo Maratón.' },
  { id: 'marathon-noassist', category: 'marathon', medal: 'silver', name: 'Sin Ayuda', description: 'Alcanza una racha de al menos 10 en Maratón sin usar ningún comodín.' },
  { id: 'marathon-strategist', category: 'marathon', medal: 'silver', name: 'Estratega', description: 'Usa los 3 comodines en una misma partida de Maratón.' },
  { id: 'marathon-legend', category: 'marathon', medal: 'gold', name: 'Leyenda del Cine', description: 'Alcanza una racha de 25 en el modo Maratón.' }
];

function defaultCategoryStats() {
  return { timesPlayed: 0, bestCorrect: 0, perfectRounds: 0, totalScore: 0, bestStreak: 0, streakRun: 0, fastestAnswerMs: null, perfectAvgRatioMax: 0 };
}

function defaultMarathonStats() {
  return { gamesPlayed: 0, bestStreak: 0, noHelpBestStreak: 0, usedAllThreeInOneRun: false };
}

function defaultStats() {
  return CATEGORIES.reduce((stats, category) => {
    stats[category] = defaultCategoryStats();
    return stats;
  }, { crossStreak: { current: 0, best: 0 }, marathon: defaultMarathonStats() });
}

export function loadStats() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    const stats = defaultStats();
    CATEGORIES.forEach(category => { stats[category] = { ...stats[category], ...(value[category] || {}) }; });
    stats.crossStreak = { ...stats.crossStreak, ...(value.crossStreak || {}) };
    stats.marathon = { ...stats.marathon, ...(value.marathon || {}) };
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

// Se llama al terminar una partida de Maratón (al fallar sin comodín que la salve).
export function recordMarathonRun(stats, { finalStreak, noHelpStreak, usedAllThree }) {
  const marathon = stats.marathon;
  marathon.gamesPlayed += 1;
  marathon.bestStreak = Math.max(marathon.bestStreak, finalStreak);
  marathon.noHelpBestStreak = Math.max(marathon.noHelpBestStreak, noHelpStreak);
  if (usedAllThree) marathon.usedAllThreeInOneRun = true;
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
    'years-gold': goldDirectors && goldActors && goldQuotes,
    'marathon-fire': stats.marathon.bestStreak >= 10,
    'marathon-noassist': stats.marathon.noHelpBestStreak >= 10,
    'marathon-strategist': stats.marathon.usedAllThreeInOneRun,
    'marathon-legend': stats.marathon.bestStreak >= 25
  };
  return ACHIEVEMENTS.map(item => ({ ...item, unlocked: Boolean(unlockedById[item.id]) }));
}
