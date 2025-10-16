// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage"; // Importar getStorage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSqw_mqmOu2mmJPEsTkzK1cqh9mRlTZ0k",
  authDomain: "dsi-viva.firebaseapp.com",
  projectId: "dsi-viva",
  storageBucket: "dsi-viva.firebasestorage.app",
  messagingSenderId: "1042230590289",
  appId: "1:1042230590289:web:412d865ccd8223299cf170",
  measurementId: "G-EGJTRZBHX3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with persistence for Auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app); // Exportar Firebase Storage
