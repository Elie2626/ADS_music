import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Clés client publiques (la sécurité se fait via les règles Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyCFzKwsCRVqx2eOhAyZEQxOtV0kcjx_y20",
  authDomain: "onde-a52dc.firebaseapp.com",
  projectId: "onde-a52dc",
  storageBucket: "onde-a52dc.firebasestorage.app",
  messagingSenderId: "930456041702",
  appId: "1:930456041702:web:b51dca329aeab737362327",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
