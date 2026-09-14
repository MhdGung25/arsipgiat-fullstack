import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAo9qrTi2qRHuWyMM7-KAwEr3huRiVaWpQ",
  authDomain: "arsipgiat-firebase.firebaseapp.com",
  projectId: "arsipgiat-firebase",
  storageBucket: "arsipgiat-firebase.firebasestorage.app",
  messagingSenderId: "56530689390",
  appId: "1:56530689390:web:16e4973a22a04984e4757f",
  measurementId: "G-MG4TLFN9SN"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);