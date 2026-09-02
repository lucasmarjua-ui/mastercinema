import { getFirestore, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { firebaseApp } from './firebase-config.js';
import { getCurrentUser } from './auth.js';

const db = getFirestore(firebaseApp);

// Envía la puntuación al ranking público de la categoría, solo si mejora la guardada.
export async function submitScore(category, score) {
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
  const scores = await getDocs(query(collection(db, 'leaderboards', category, 'entries'), orderBy('score', 'desc'), limit(Math.max(1, Math.min(50, max)))));
  return scores.docs.map(entry => ({ username: entry.data().username || 'JUGADOR', score: Number(entry.data().score || 0) }));
}
