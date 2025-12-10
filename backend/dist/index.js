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
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const admin = __importStar(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
const serviceAccountPath = path_1.default.resolve(__dirname, "../../ServiceAccountKey.json");
const serviceAccount = require(serviceAccountPath);
const AnuncioController_1 = require("./controllers/AnuncioController");
const UserController_1 = require("./controllers/UserController");
const verifyToken_1 = require("./verifyToken"); // usar só esta
const CommentController_1 = require("./controllers/CommentController");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });
}
const db = admin.firestore();
// ---------------- ROTAS COMENTÁRIOS ----------------
app.get("/anuncios/:id/comentarios", CommentController_1.listComments);
app.post("/anuncios/:id/comentarios", verifyToken_1.authenticate, CommentController_1.createComment);
app.put("/anuncios/:id/comentarios/:comentarioId", verifyToken_1.authenticate, CommentController_1.updateComment);
app.delete("/anuncios/:id/comentarios/:comentarioId", verifyToken_1.authenticate, CommentController_1.deleteComment);
console.log('Rotas de comentários registradas: GET/POST/PUT/DELETE /anuncios/:id/comentarios');
// ---------------- ROTAS ANÚNCIOS ----------------
app.post("/anuncios", verifyToken_1.authenticate, async (req, res) => {
    try {
        const { anuncioData } = req.body;
        const userId = req.user?.uid;
        if (!anuncioData || !userId) {
            return res.status(400).send({ message: "Missing anuncioData or userId" });
        }
        const novo = await (0, AnuncioController_1.createAnuncio)(db, anuncioData, userId);
        res.status(201).send(novo);
    }
    catch (e) {
        res.status(500).send({ message: "Error creating anuncio", error: e.message });
    }
});
app.get("/anuncios", verifyToken_1.authenticate, async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const lista = await (0, AnuncioController_1.getAnuncios)(db, searchQuery);
        res.status(200).send(lista);
    }
    catch (e) {
        res.status(500).send({ message: "Error getting anuncios", error: e.message });
    }
});
app.get("/anuncios/:id", async (req, res) => {
    try {
        const anuncio = await (0, AnuncioController_1.getAnuncioById)(db, req.params.id);
        if (!anuncio)
            return res.status(404).send({ message: "Anuncio not found" });
        res.status(200).send(anuncio);
    }
    catch (e) {
        res.status(500).send({ message: "Error getting anuncio by ID", error: e.message });
    }
});
app.put("/anuncios/:id", verifyToken_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId)
            return res.status(400).send({ message: "Missing userId" });
        await (0, AnuncioController_1.updateAnuncio)(db, req.params.id, req.body);
        res.status(200).send({ message: "Anuncio updated successfully" });
    }
    catch (e) {
        res.status(500).send({ message: "Error updating anuncio", error: e.message });
    }
});
app.delete("/anuncios/:id", verifyToken_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId)
            return res.status(400).send({ message: "Missing userId" });
        await (0, AnuncioController_1.deleteAnuncio)(db, req.params.id);
        res.status(200).send({ message: "Anuncio deleted successfully" });
    }
    catch (e) {
        res.status(500).send({ message: "Error deleting anuncio", error: e.message });
    }
});
app.get("/anuncios/user/:userId", verifyToken_1.authenticate, async (req, res) => {
    try {
        const lista = await (0, AnuncioController_1.getAnunciosByUserId)(db, req.params.userId);
        res.status(200).send(lista);
    }
    catch (e) {
        res.status(500).send({ message: "Error getting anuncios by user ID", error: e.message });
    }
});
// ---------------- ROTAS USUÁRIO ----------------
app.get("/users/:uid", verifyToken_1.authenticate, async (req, res) => {
    try {
        const dados = await (0, UserController_1.fetchUserData)(req.params.uid);
        if (!dados)
            return res.status(404).send({ message: "User not found" });
        res.status(200).send(dados);
    }
    catch (e) {
        res.status(500).send({ message: "Error getting user data", error: e.message });
    }
});
// ---------------- START ----------------
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
