import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkQtiQlCPW5csmwrqNMLl9uEyZbPKUfWk",
  authDomain: "check-in-system-ad362.firebaseapp.com",
  projectId: "check-in-system-ad362",
  storageBucket: "check-in-system-ad362.firebasestorage.app",
  messagingSenderId: "1052761621854",
  appId: "1:1052761621854:web:db803aa741f254b472bbcf",
  measurementId: "G-Y3KFZ2N4EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
