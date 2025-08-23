
// Import the functions you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9VwyyZhknmLS5uUCNwg6mrfI_PkijDos",
  authDomain: "memorease-gib5l.firebaseapp.com",
  projectId: "memorease-gib5l",
  storageBucket: "memorease-gib5l.firebasestorage.app",
  messagingSenderId: "515290708085",
  appId: "1:515290708085:web:810514e2da44bae171a03c"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Export SINGLETONS of auth + firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
