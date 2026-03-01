import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyD1A5uPPPJxKUaRGvjWPtBYa_E4w3aVijs',
  authDomain: 'hydrogrow-52aca.firebaseapp.com',
  databaseURL: 'https://hydrogrow-52aca-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hydrogrow-52aca',
  storageBucket: 'hydrogrow-52aca.firebasestorage.app',
  messagingSenderId: '522148405522',
  appId: '1:522148405522:web:0244aa00ef9af36a2053cb',
  measurementId: 'G-F3P1PZRP88',
};

// Inicjalizuj Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const database = getDatabase(app); // Uzyskujemy instancję bazy danych

export { app, database };