// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyArdrIm72De0MPjMDpfxZb945_2nUhNduM",
  authDomain: "sample-firebase-ai-app-90bfe.firebaseapp.com",
  projectId: "sample-firebase-ai-app-90bfe",
  storageBucket: "sample-firebase-ai-app-90bfe.firebasestorage.app",
  messagingSenderId: "106187920336",
  appId: "1:106187920336:web:927ef56829c7c42e3b1fd5"
};
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);