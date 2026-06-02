import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut, inMemoryPersistence, setPersistence } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_DOMINIO",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Forzamos persistencia en memoria volátil por seguridad Nivel Dios
setPersistence(auth, inMemoryPersistence).catch((error) => console.error("Error persistencia:", error));

export { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut };

