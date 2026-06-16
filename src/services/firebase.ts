import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBOiNndM8e81zWZxT7zw3bZn69Cl3EHhPA",
  authDomain: "ecolens-ai-32912.firebaseapp.com",
  databaseURL: "https://ecolens-ai-32912-default-rtdb.firebaseio.com",
  projectId: "ecolens-ai-32912",
  storageBucket: "ecolens-ai-32912.firebasestorage.app",
  messagingSenderId: "341398854856",
  appId: "1:341398854856:web:bae7e55e3391b119a3d9fd",
  measurementId: "G-CM0NNTR9KN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
