import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

import {
  createAnuncio,
  deleteAnuncio,
  getAnuncioById,
  getAnuncios,
  getAnunciosByUserId,
  updateAnuncio
} from './controllers/AnuncioController';
import { fetchUserData } from './controllers/UserController';
import { authenticate } from './verifyToken';
import {
  listComments,
  createComment,
  updateComment,
  deleteComment
} from './controllers/CommentController';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  setFavoritesOrder
} from './controllers/FavoriteController';

interface AuthenticatedRequest extends Request {
  user?: { uid: string; [k: string]: any };
}

const serviceAccountPath = path.resolve(__dirname, '../../ServiceAccountKey.json');
let serviceAccount: any;
try {
  const raw = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(raw);
} catch (e) {
  console.error('Falha ao carregar ServiceAccountKey.json:', (e as any).message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.send('API running'));

// ---------- COMENTÁRIOS ----------
app.get('/anuncios/:id/comentarios', listComments);
app.post('/anuncios/:id/comentarios', authenticate, createComment);
app.put('/anuncios/:id/comentarios/:comentarioId', authenticate, updateComment);
app.delete('/anuncios/:id/comentarios/:comentarioId', authenticate, deleteComment);

// ---------- ANÚNCIOS ----------
app.post('/anuncios', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { anuncioData } = req.body;
    const userId = req.user?.uid;
    if (!anuncioData || !userId) {
      return res.status(400).send({ message: 'Missing anuncioData or userId' });
    }
    const novo = await createAnuncio(db, anuncioData, userId);
    res.status(201).send(novo);
  } catch (e: any) {
    res.status(500).send({ message: 'Error creating anuncio', error: e.message });
  }
});

app.get('/anuncios', authenticate, async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string | undefined;
    const lista = await getAnuncios(db, searchQuery);
    res.status(200).send(lista);
  } catch (e: any) {
    res.status(500).send({ message: 'Error getting anuncios', error: e.message });
  }
});

app.get('/anuncios/:id', async (req: Request, res: Response) => {
  try {
    const anuncio = await getAnuncioById(db, req.params.id);
    if (!anuncio) return res.status(404).send({ message: 'Anuncio not found' });
    res.status(200).send(anuncio);
  } catch (e: any) {
    res.status(500).send({ message: 'Error getting anuncio by ID', error: e.message });
  }
});

app.put('/anuncios/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) return res.status(400).send({ message: 'Missing userId' });
    await updateAnuncio(db, req.params.id, req.body);
    res.status(200).send({ message: 'Anuncio updated' });
  } catch (e: any) {
    res.status(500).send({ message: 'Error updating anuncio', error: e.message });
  }
});

app.delete('/anuncios/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) return res.status(400).send({ message: 'Missing userId' });
    await deleteAnuncio(db, req.params.id);
    res.status(200).send({ message: 'Anuncio deleted' });
  } catch (e: any) {
    res.status(500).send({ message: 'Error deleting anuncio', error: e.message });
  }
});

app.get('/anuncios/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const lista = await getAnunciosByUserId(db, req.params.userId);
    res.status(200).send(lista);
  } catch (e: any) {
    res.status(500).send({ message: 'Error getting anuncios by user', error: e.message });
  }
});

// ---------- FAVORITOS ----------
app.get('/favorites', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(400).send({ message: 'Missing userId' });
    const favorites = await getUserFavorites(db, userId);
    res.status(200).send(favorites);
  } catch (e: any) {
    res.status(500).send({ message: 'Error getting favorites', error: e.message });
  }
});

app.post('/favorites', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { anuncioId } = req.body;
    if (!userId || !anuncioId) return res.status(400).send({ message: 'Missing userId or anuncioId' });
    await addFavorite(db, userId, anuncioId);
    res.status(200).send({ message: 'Favorite added' });
  } catch (e: any) {
    res.status(500).send({ message: 'Error adding favorite', error: e.message });
  }
});

app.delete('/favorites/:anuncioId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(400).send({ message: 'Missing userId' });
    await removeFavorite(db, userId, req.params.anuncioId);
    res.status(200).send({ message: 'Favorite removed' });
  } catch (e: any) {
    res.status(500).send({ message: 'Error removing favorite', error: e.message });
  }
});

app.patch('/favorites/order', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { anuncioIds } = req.body;
    if (!userId || !Array.isArray(anuncioIds)) return res.status(400).send({ message: 'Missing userId or anuncioIds[]' });
    await setFavoritesOrder(db, userId, anuncioIds);
    res.status(200).send({ message: 'Favorites order updated' });
  } catch (e: any) {
    res.status(500).send({ message: 'Error updating favorites order', error: e.message });
  }
});

// ---------- USER ----------
app.get('/users/:uid', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dados = await fetchUserData(req.params.uid);
    if (!dados) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(dados);
  } catch (e: any) {
    res.status(500).send({ message: 'Error getting user data', error: e.message });
  }
});

// ---------- START ----------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});