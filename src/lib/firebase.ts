// Import the functions you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB-gVU9AfICMwlQy5OEBisePXryRQmdZg",
  authDomain: "memorease-mqw2g.firebaseapp.com",
  projectId: "memorease-mqw2g",
  storageBucket: "memorease-mqw2g.firebasestorage.app",
  messagingSenderId: "704409412703",
  appId: "1:704409412703:web:fbcfcdc1318a58f3f8a7ea"
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
