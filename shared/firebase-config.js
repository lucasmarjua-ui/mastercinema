// El SDK de Firebase se carga desde el CDN de Google con import() dinámico, nunca
// con un import estático: si gstatic.com está bloqueado (bloqueadores de anuncios,
// proxies corporativos, sin conexión), un import estático rompería todo el grafo
// de módulos y la página quedaría en blanco. Así el juego sigue funcionando como
// invitado y solo se desactivan cuentas, sincronización y rankings.
const SDK = 'https://www.gstatic.com/firebasejs/10.13.0';

export const firebaseConfig = {
  apiKey: 'AIzaSyAeLkAJwfj3UzAgExn35oP5EHAUoesU6QE',
  authDomain: 'mastercinema-trivia.firebaseapp.com',
  projectId: 'mastercinema-trivia',
  storageBucket: 'mastercinema-trivia.firebasestorage.app',
  messagingSenderId: '313647258196',
  appId: '1:313647258196:web:c45fc3d98173c090c0abc1',
};

let firebasePromise = null;

// Devuelve { auth, db, authApi, firestoreApi }, o null si el SDK no se puede cargar.
// Se cachea: todos los módulos comparten una única instancia.
export function loadFirebase() {
  if (!firebasePromise) {
    firebasePromise = Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-auth.js`),
      import(`${SDK}/firebase-firestore.js`),
    ])
      .then(([appApi, authApi, firestoreApi]) => {
        const app = appApi.initializeApp(firebaseConfig);
        return { auth: authApi.getAuth(app), db: firestoreApi.getFirestore(app), authApi, firestoreApi };
      })
      .catch(error => {
        console.warn('MasterCinema: Firebase no disponible, modo invitado', error);
        return null;
      });
  }
  return firebasePromise;
}
