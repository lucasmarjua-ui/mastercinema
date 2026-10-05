import { loadFirebase } from './firebase-config.js';
import { getCurrentUser } from './auth.js';

let db, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc;
const firebaseReady = loadFirebase().then(firebase => {
  if (!firebase) return false;
  ({ db } = firebase);
  ({ collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } = firebase.firestoreApi);
  return true;
});

// Envía la puntuación al ranking público de la categoría, solo si mejora la guardada.
export async function submitScore(category, score) {
  if (!(await firebaseReady)) return false;
  const user = getCurrentUser();
  const value = Math.max(0, Math.floor(Number(score) || 0));
  if (!user || !value) return false;
  const entry = doc(db, 'leaderboards', category, 'entries', user.uid);
  const current = await getDoc(entry);
  if (current.exists() && Number(current.data().score || 0) >= value) return false;
  await setDoc(entry, { username: user.displayName || 'JUGADOR', score: value, updatedAt: Date.now() });
  return true;
}

export async function getTopScores(category, max = 10) {
  if (!(await firebaseReady)) return [];
  const scores = await getDocs(query(collection(db, 'leaderboards', category, 'entries'), orderBy('score', 'desc'), limit(Math.max(1, Math.min(50, max)))));
  return scores.docs.map(entry => ({ username: entry.data().username || 'JUGADOR', score: Number(entry.data().score || 0) }));
}

// Ranking global de mejor racha del modo Maratón: misma colección genérica
// `leaderboards/{categoria}/entries`, usando la racha como "score".
export const MARATHON_STREAK_CATEGORY = 'marathon-streak';
export async function submitMarathonStreak(streak) { return submitScore(MARATHON_STREAK_CATEGORY, streak); }
export async function getMarathonLeaderboard(max = 10) { return getTopScores(MARATHON_STREAK_CATEGORY, max); }
