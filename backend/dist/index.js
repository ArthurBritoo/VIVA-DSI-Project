"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
// import { db } from "./firebaseConfig"; // The 'db' here would be from the client SDK, not Admin SDK
// Import the service account key
const serviceAccount = __importStar(require("./serviceAccountKey.json")); // Updated path
// Import the AnuncioController functions
const AnuncioController_1 = require("./controllers/AnuncioController");
// Import UserController functions
const UserController_1 = require("./controllers/UserController");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
// RESTful API for Anuncios
// Create a new anuncio
app.post("/anuncios", async (req, res) => {
    try {
        const { anuncioData, userId } = req.body;
        if (!anuncioData || !userId) {
            return res.status(400).send({ message: "Missing anuncioData or userId" });
        }
        // createAnuncio now uses admin.firestore() directly from the initialized admin app
        const newAnuncio = await (0, AnuncioController_1.createAnuncio)(anuncioData, userId);
        res.status(201).send(newAnuncio);
    }
    catch (error) {
        console.error("Error creating anuncio:", error);
        res.status(500).send({ message: "Error creating anuncio", error: error instanceof Error ? error.message : String(error) });
    }
});
// Get all anuncios
app.get("/anuncios", async (req, res) => {
    try {
        const anuncios = await (0, AnuncioController_1.getAnuncios)();
        res.status(200).send(anuncios);
    }
    catch (error) {
        console.error("Error getting anuncios:", error);
        res.status(500).send({ message: "Error getting anuncios", error: error instanceof Error ? error.message : String(error) });
    }
});
// Get a specific anuncio by ID
app.get("/anuncios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const anuncio = await (0, AnuncioController_1.getAnuncioById)(id);
        if (anuncio) {
            res.status(200).send(anuncio);
        }
        else {
            res.status(404).send({ message: "Anuncio not found" });
        }
    }
    catch (error) {
        console.error("Error getting anuncio by ID:", error);
        res.status(500).send({ message: "Error getting anuncio by ID", error: error instanceof Error ? error.message : String(error) });
    }
});
// Update an anuncio
app.put("/anuncios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        if (!updatedData) {
            return res.status(400).send({ message: "Missing updatedData" });
        }
        await (0, AnuncioController_1.updateAnuncio)(id, updatedData);
        res.status(200).send({ message: "Anuncio updated successfully" });
    }
    catch (error) {
        console.error("Error updating anuncio:", error);
        res.status(500).send({ message: "Error updating anuncio", error: error instanceof Error ? error.message : String(error) });
    }
});
// Delete an anuncio
app.delete("/anuncios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await (0, AnuncioController_1.deleteAnuncio)(id);
        res.status(200).send({ message: "Anuncio deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting anuncio:", error);
        res.status(500).send({ message: "Error deleting anuncio", error: error instanceof Error ? error.message : String(error) });
    }
});
// Get anuncios by user ID
app.get("/anuncios/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const anuncios = await (0, AnuncioController_1.getAnunciosByUserId)(userId);
        res.status(200).send(anuncios);
    }
    catch (error) {
        console.error("Error getting anuncios by user ID:", error);
        res.status(500).send({ message: "Error getting anuncios by user ID", error: error instanceof Error ? error.message : String(error) });
    }
});
// RESTful API for User
// Get user data by email
app.get("/users/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const userData = await (0, UserController_1.fetchUserData)(email);
        if (userData) {
            res.status(200).send(userData);
        }
        else {
            res.status(404).send({ message: "User not found" });
        }
    }
    catch (error) {
        console.error("Error getting user data:", error);
        res.status(500).send({ message: "Error getting user data", error: error instanceof Error ? error.message : String(error) });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
