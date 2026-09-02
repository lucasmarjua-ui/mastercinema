import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyAeLkAJwfj3UzAgExn35oP5EHAUoesU6QE',
  authDomain: 'mastercinema-trivia.firebaseapp.com',
  projectId: 'mastercinema-trivia',
  storageBucket: 'mastercinema-trivia.firebasestorage.app',
  messagingSenderId: '313647258196',
  appId: '1:313647258196:web:c45fc3d98173c090c0abc1',
};

export const firebaseApp = initializeApp(firebaseConfig);
