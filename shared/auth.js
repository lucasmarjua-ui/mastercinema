import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { firebaseApp } from './firebase-config.js';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const DATA_KEYS = ['mastercinema.wallet', 'mastercinema.themes', 'mastercinema.stats'];
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,16}$/;
let currentUser = null;
let listeners = [];
let syncing = false;

function isValidUsername(username) {
  return typeof username === 'string' && USERNAME_PATTERN.test(username.trim());
}
function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@mastercinema.local`;
}
function readLocal() {
  return DATA_KEYS.reduce((data, key) => { const value = localStorage.getItem(key); if (value !== null) data[key] = value; return data; }, {});
}
function writeLocal(data) { Object.entries(data || {}).forEach(([key, value]) => localStorage.setItem(key, String(value))); }

function mergeThemes(local, cloud) {
  return {
    owned: [...new Set(['hollywood', ...(cloud.owned || []), ...(local.owned || [])])],
    equipped: local.equipped || cloud.equipped || 'hollywood'
  };
}
function mergeCategoryStats(local = {}, cloud = {}) {
  return {
    timesPlayed: Math.max(local.timesPlayed || 0, cloud.timesPlayed || 0),
    bestCorrect: Math.max(local.bestCorrect || 0, cloud.bestCorrect || 0),
    perfectRounds: Math.max(local.perfectRounds || 0, cloud.perfectRounds || 0),
    totalScore: Math.max(local.totalScore || 0, cloud.totalScore || 0),
    bestStreak: Math.max(local.bestStreak || 0, cloud.bestStreak || 0),
    streakRun: 0,
    fastestAnswerMs: local.fastestAnswerMs == null ? cloud.fastestAnswerMs ?? null : cloud.fastestAnswerMs == null ? local.fastestAnswerMs : Math.min(local.fastestAnswerMs, cloud.fastestAnswerMs),
    perfectAvgRatioMax: Math.max(local.perfectAvgRatioMax || 0, cloud.perfectAvgRatioMax || 0)
  };
}
function mergeStats(local, cloud) {
  const merged = { crossStreak: { current: 0, best: Math.max(local.crossStreak?.best || 0, cloud.crossStreak?.best || 0) } };
  ['directors', 'actors', 'quotes', 'years'].forEach(category => { merged[category] = mergeCategoryStats(local[category], cloud[category]); });
  return merged;
}
function mergeData(local, cloud) {
  const merged = { ...local, ...cloud };
  const localWallet = Number.parseInt(local['mastercinema.wallet'] || '0', 10) || 0;
  const cloudWallet = Number.parseInt(cloud['mastercinema.wallet'] || '0', 10) || 0;
  if (local['mastercinema.wallet'] || cloud['mastercinema.wallet']) merged['mastercinema.wallet'] = String(Math.max(localWallet, cloudWallet));
  ['mastercinema.themes', 'mastercinema.stats'].forEach(key => {
    try {
      const localValue = JSON.parse(local[key] || '{}');
      const cloudValue = JSON.parse(cloud[key] || '{}');
      merged[key] = JSON.stringify(key === 'mastercinema.themes' ? mergeThemes(localValue, cloudValue) : mergeStats(localValue, cloudValue));
    } catch { /* Preserve the valid side if old local data is malformed. */ }
  });
  return merged;
}
async function loadUserData(user) {
  const local = readLocal();
  const hasLocalProgress = Object.keys(local).length > 0;
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  if (!snapshot.exists()) { await saveUserData(user); return; }
  const cloud = snapshot.data().data || {};
  const keepLocal = hasLocalProgress && window.confirm('¿Conservar y fusionar tu progreso local con esta cuenta?');
  const merged = keepLocal ? mergeData(local, cloud) : cloud;
  writeLocal(merged);
  window.dispatchEvent(new CustomEvent('cloudsync', { detail: merged }));
  if (keepLocal) await setDoc(doc(db, 'users', user.uid), { data: merged, username: user.displayName }, { merge: true });
}
async function saveUserData(user = currentUser) {
  if (!user || syncing) return;
  syncing = true;
  try {
    await setDoc(doc(db, 'users', user.uid), { data: readLocal(), username: user.displayName, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn('No se pudo sincronizar MasterCinema:', error);
  } finally {
    syncing = false;
  }
}
export async function registerUser(username, password) {
  if (!isValidUsername(username)) { const error = new Error('Invalid username'); error.code = 'auth/invalid-username'; throw error; }
  const credential = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
  await updateProfile(credential.user, { displayName: username.trim() });
  return credential;
}
export async function loginUser(username, password) {
  if (!isValidUsername(username)) { const error = new Error('Invalid username'); error.code = 'auth/invalid-username'; throw error; }
  return signInWithEmailAndPassword(auth, usernameToEmail(username), password);
}
export async function logoutUser() { return signOut(auth); }
export function getCurrentUser() { return currentUser; }
export function onUserChange(listener) { listeners.push(listener); listener(currentUser); return () => { listeners = listeners.filter(item => item !== listener); }; }
export function syncCurrentUser() { return saveUserData(); }
window.addEventListener('walletchange', () => saveUserData());
window.addEventListener('themechange', () => saveUserData());
window.addEventListener('statschange', () => saveUserData());
onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (user) {
    try { await loadUserData(user); } catch (error) { console.warn('No se pudo cargar el progreso:', error); }
  }
  listeners.forEach(listener => listener(currentUser));
});
