import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSqw_mqmOu2mmJPEsTkzK1cqh9mRlTZ0k",
  authDomain: "dsi-viva.firebaseapp.com",
  projectId: "dsi-viva",
  storageBucket: "dsi-viva.firebasestorage.app",
  messagingSenderId: "1042230590289",
  appId: "1:1042230590289:web:412d865ccd8223299cf170",
  measurementId: "G-EGJTRZBHX3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);