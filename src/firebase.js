import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBV5O0Mwg-w-TC0wt5fUcLhNNbQTJrnm1w",
  authDomain: "linkon-chatapp.firebaseapp.com",
  projectId: "linkon-chatapp",
  storageBucket: "linkon-chatapp.appspot.com",
  messagingSenderId: "4941493210",
  appId: "1:4941493210:web:f3b833569ba3c3f9c706e3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()
