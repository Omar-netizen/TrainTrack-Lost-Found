import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyAfsXlhBdsrtykWswC0Xk1OxoUQNzf9CBM",
  authDomain: "lost-and-found-app-c73c5.firebaseapp.com",
  projectId: "lost-and-found-app-c73c5",
  storageBucket: "lost-and-found-app-c73c5.firebasestorage.app",
  messagingSenderId: "321455476661",
  appId: "1:321455476661:web:05ace34fa1e1bcc925d3fc",
  
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
