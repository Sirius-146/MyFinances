import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfF-OaL9Dye0Dp7iHP4s90QGZ_CGpzqpU",
  authDomain: "myfinances-90c76.firebaseapp.com",
  projectId: "myfinances-90c76",
  storageBucket: "myfinances-90c76.firebasestorage.app",
  messagingSenderId: "34624107400",
  appId: "1:34624107400:web:af90696a57c018f155c03d",
  measurementId: "G-EWXRHBDRMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const db = getFirestore(app);

export { db };
