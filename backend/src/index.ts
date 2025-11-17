import cors from "cors";
import express, { Request, Response } from "express";
import * as admin from "firebase-admin";
import path from "path";

const serviceAccountPath = path.resolve(__dirname, "../../ServiceAccountKey.json");
const serviceAccount = require(serviceAccountPath);

import {
  createAnuncio,
  deleteAnuncio,
  getAnuncioById,
  getAnuncios,
  getAnunciosByUserId,
  updateAnuncio
} from "./controllers/AnuncioController";
import { fetchUserData } from "./controllers/UserController";
import { authenticate } from "./verifyToken"; // usar só esta
import {
  listComments,
  createComment,
  updateComment,
  deleteComment
} from "./controllers/CommentController";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

// ---------------- ROTAS COMENTÁRIOS ----------------
app.get("/anuncios/:id/comentarios", listComments);
app.post("/anuncios/:id/comentarios", authenticate, createComment);
app.put("/anuncios/:id/comentarios/:comentarioId", authenticate, updateComment);
app.delete("/anuncios/:id/comentarios/:comentarioId", authenticate, deleteComment);
console.log('Rotas de comentários registradas: GET/POST/PUT/DELETE /anuncios/:id/comentarios');

// ---------------- ROTAS ANÚNCIOS ----------------
app.post("/anuncios", authenticate, async (req: Request, res: Response) => {
  try {
    const { anuncioData } = req.body;
    const userId = (req as any).user?.uid;
    if (!anuncioData || !userId) {
      return res.status(400).send({ message: "Missing anuncioData or userId" });
    }
    const novo = await createAnuncio(db, anuncioData, userId);
    res.status(201).send(novo);
  } catch (e: any) {
    res.status(500).send({ message: "Error creating anuncio", error: e.message });
  }
});

app.get("/anuncios", authenticate, async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string | undefined;
    const lista = await getAnuncios(db, searchQuery);
    res.status(200).send(lista);
  } catch (e: any) {
    res.status(500).send({ message: "Error getting anuncios", error: e.message });
  }
});

app.get("/anuncios/:id", async (req: Request, res: Response) => {
  try {
    const anuncio = await getAnuncioById(db, req.params.id);
    if (!anuncio) return res.status(404).send({ message: "Anuncio not found" });
    res.status(200).send(anuncio);
  } catch (e: any) {
    res.status(500).send({ message: "Error getting anuncio by ID", error: e.message });
  }
});

app.put("/anuncios/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) return res.status(400).send({ message: "Missing userId" });
    await updateAnuncio(db, req.params.id, req.body);
    res.status(200).send({ message: "Anuncio updated successfully" });
  } catch (e: any) {
    res.status(500).send({ message: "Error updating anuncio", error: e.message });
  }
});

app.delete("/anuncios/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) return res.status(400).send({ message: "Missing userId" });
    await deleteAnuncio(db, req.params.id);
    res.status(200).send({ message: "Anuncio deleted successfully" });
  } catch (e: any) {
    res.status(500).send({ message: "Error deleting anuncio", error: e.message });
  }
});

app.get("/anuncios/user/:userId", authenticate, async (req: Request, res: Response) => {
  try {
    const lista = await getAnunciosByUserId(db, req.params.userId);
    res.status(200).send(lista);
  } catch (e: any) {
    res.status(500).send({ message: "Error getting anuncios by user ID", error: e.message });
  }
});

// ---------------- ROTAS USUÁRIO ----------------
app.get("/users/:uid", authenticate, async (req: Request, res: Response) => {
  try {
    const dados = await fetchUserData(req.params.uid);
    if (!dados) return res.status(404).send({ message: "User not found" });
    res.status(200).send(dados);
  } catch (e: any) {
    res.status(500).send({ message: "Error getting user data", error: e.message });
  }
});

// ---------------- START ----------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
