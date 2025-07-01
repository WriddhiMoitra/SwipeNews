// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Import for auth
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYtq21blBS16DBiGmlkixYZ0aR_Adt0Ig",
  authDomain: "swipenews-beb55.firebaseapp.com",
  projectId: "swipenews-beb55",
  storageBucket: "swipenews-beb55.firebasestorage.app",
  messagingSenderId: "596241142925",
  appId: "1:596241142925:web:729ab4768a73cda57cbec4",
  measurementId: "G-L07MF612TD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Conditionally initialize Analytics if supported
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { db, auth };
