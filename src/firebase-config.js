// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-BikUEzAqzNTHzq67ytg2mrKsu5XqxvY",
  authDomain: "arpit-form.firebaseapp.com",
  projectId: "arpit-form",
  storageBucket: "arpit-form.firebasestorage.app",
  messagingSenderId: "409051258584",
  appId: "1:409051258584:web:e8b89432753dd25f37c1ad"
};



const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;