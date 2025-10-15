"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.db = exports.auth = void 0;
// Import the functions you need from the Firebase SDKs
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const functions_1 = require("firebase/functions");
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
const app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase services
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.functions = (0, functions_1.getFunctions)(app);
