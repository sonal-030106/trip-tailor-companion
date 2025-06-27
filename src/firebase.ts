// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
    apiKey: "AIzaSyC4f_vFwZmd18NWVNPQZTDDYloKz0xOYD0",
    authDomain: "smart-trip-planner-2d842.firebaseapp.com",
    projectId: "smart-trip-planner-2d842",
    storageBucket: "smart-trip-planner-2d842.firebasestorage.app",
    messagingSenderId: "1020455814664",
    appId: "1:1020455814664:web:e022c38835e93d326b33bd",
    measurementId: "G-WS1D24CV4D"
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);