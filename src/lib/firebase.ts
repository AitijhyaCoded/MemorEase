// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB-gVU9AfICMwlQy5OEBisePXryRQmdZg",
  authDomain: "memorease-mqw2g.firebaseapp.com",
  projectId: "memorease-mqw2g",
  storageBucket: "memorease-mqw2g.appspot.com",
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

export { app };
