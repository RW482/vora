
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAuai2UnzX_Nifleh5BRyO9u8wqm5m5gkY",
  authDomain: "vora-transport.firebaseapp.com",
  projectId: "vora-transport",
  storageBucket: "vora-transport.firebasestorage.app",
  messagingSenderId: "518715904501",
  appId: "1:518715904501:web:188d57017077c3701590bc",
  measurementId: "G-S3D1JSN46J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
