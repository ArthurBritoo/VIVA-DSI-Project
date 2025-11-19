import cors from 'cors';
import express, { Request, Response } from 'express';
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
import { authenticate, AuthenticatedRequest } from './verifyToken';
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

function loadServiceAccount() {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.resolve(__dirname, '../../ServiceAccountKey.json'), // RAIZ
    path.resolve(__dirname, '../ServiceAccountKey.json'),   // backend
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      if (!raw.trim()) continue;
      const json = JSON.parse(raw);
      console.log('Using service account from:', p);
      return json;
    } catch (e: any) {
      console.log(`Tentou ${p}: ${e.message}`);
    }
  }
  throw new Error('ServiceAccountKey.json não encontrado ou inválido.');
}

if (!admin.apps.length) {
  const serviceAccount = loadServiceAccount();
  const credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);
  admin.initializeApp({
    credential: credential,
    projectId: serviceAccount.project_id,
  });
  console.log('Firebase Admin SDK initialized successfully');
} else {
  console.log('Firebase Admin SDK already initialized');
}

console.log('Number of Firebase Admin SDK apps initialized:', admin.apps.length);
if (admin.apps.length > 0) {
  const defaultApp = admin.app();
  console.log('Default Firebase Admin SDK app name:', defaultApp.name);
  console.log('Default Firebase Admin SDK app options (partial):', {
    projectId: defaultApp.options.projectId,
  });
}

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.locals.db = db;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.send('API is running'));

// ---------- COMENTÁRIOS ----------
app.get('/anuncios/:id/comentarios', listComments);
app.post('/anuncios/:id/comentarios', authenticate, createComment);
app.put('/anuncios/:id/comentarios/:comentarioId', authenticate, updateComment);
app.delete('/anuncios/:id/comentarios/:comentarioId', authenticate, deleteComment);

// ---------- ANÚNCIOS ----------
app.post('/anuncios', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  console.log('Rota /anuncios POST chamada!');
  console.log('Usuário autenticado:', req.user?.uid);
  console.log('Recebido no backend:', req.body);
  try {
    const { anuncioData } = req.body;
    const userId = req.user?.uid;
    if (!anuncioData || !userId) {
      return res.status(400).send({ message: 'Missing anuncioData or userId' });
    }
    const novo = await createAnuncio(db, anuncioData, userId);
    res.status(201).send(novo);
  } catch (e: any) {
    console.error('Error creating anuncio:', e);
    res.status(500).send({ message: 'Error creating anuncio', error: e.message });
  }
});

app.get('/anuncios', authenticate, async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string | undefined;
    console.log('Received request to get all anuncios with query:', searchQuery);
    const lista = await getAnuncios(db, searchQuery);
    res.status(200).send(lista);
  } catch (e: any) {
    console.error('Error getting anuncios:', e);
    res.status(500).send({ message: 'Error getting anuncios', error: e.message });
  }
});

app.get('/anuncios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Received request for anuncio ID:', id);
    const anuncio = await getAnuncioById(db, id);
    if (anuncio) {
      console.log('Anuncio found for ID:', id);
      res.status(200).send(anuncio);
    } else {
      console.log('Anuncio not found for ID:', id);
      res.status(404).send({ message: 'Anuncio not found' });
    }
  } catch (e: any) {
    console.error('Error getting anuncio by ID:', e);
    res.status(500).send({ message: 'Error getting anuncio by ID', error: e.message });
  }
});

app.put('/anuncios/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const userId = req.user?.uid;
    if (!updatedData || !userId) {
      return res.status(400).send({ message: 'Missing updatedData or userId' });
    }
    await updateAnuncio(db, id, updatedData);
    res.status(200).send({ message: 'Anuncio updated successfully' });
  } catch (e: any) {
    console.error('Error updating anuncio:', e);
    res.status(500).send({ message: 'Error updating anuncio', error: e.message });
  }
});

app.delete('/anuncios/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(400).send({ message: 'Missing userId from authenticated token' });
    }
    await deleteAnuncio(db, id);
    res.status(200).send({ message: 'Anuncio deleted successfully' });
  } catch (e: any) {
    console.error('Error deleting anuncio:', e);
    res.status(500).send({ message: 'Error deleting anuncio', error: e.message });
  }
});

app.get('/anuncios/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const lista = await getAnunciosByUserId(db, userId);
    res.status(200).send(lista);
  } catch (e: any) {
    console.error('Error getting anuncios by user ID:', e);
    res.status(500).send({ message: 'Error getting anuncios by user ID', error: e.message });
  }
});

// ---------- FAVORITOS ----------
app.get('/favorites', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(400).send({ message: 'Missing userId from authenticated token' });
    }
    console.log('Fetching favorites for user:', userId);
    const favorites = await getUserFavorites(db, userId);
    console.log('Favorites fetched:', favorites.length);
    res.status(200).send(favorites);
  } catch (e: any) {
    console.error('Error getting favorites:', e);
    res.status(500).send({ message: 'Error getting favorites', error: e.message });
  }
});

app.post('/favorites', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { anuncioId } = req.body;
    if (!userId) {
      return res.status(400).send({ message: 'Missing userId from authenticated token' });
    }
    if (!anuncioId) {
      return res.status(400).send({ message: 'Missing anuncioId in request body' });
    }
    console.log('Adding favorite:', { userId, anuncioId });
    await addFavorite(db, userId, anuncioId);
    res.status(200).send({ message: 'Favorite added successfully' });
  } catch (e: any) {
    console.error('Error adding favorite:', e);
    res.status(500).send({ message: 'Error adding favorite', error: e.message });
  }
});

app.delete('/favorites/:anuncioId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { anuncioId } = req.params;
    if (!userId) {
      return res.status(400).send({ message: 'Missing userId from authenticated token' });
    }
    console.log('Removing favorite:', { userId, anuncioId });
    await removeFavorite(db, userId, anuncioId);
    res.status(200).send({ message: 'Favorite removed successfully' });
  } catch (e: any) {
    console.error('Error removing favorite:', e);
    res.status(500).send({ message: 'Error removing favorite', error: e.message });
  }
});

app.patch('/favorites/order', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { anuncioIds } = req.body;
    if (!userId) {
      return res.status(400).send({ message: 'Missing userId from authenticated token' });
    }
    if (!anuncioIds || !Array.isArray(anuncioIds)) {
      return res.status(400).send({ message: 'Missing or invalid anuncioIds array in request body' });
    }
    console.log('Updating favorites order for user:', userId, 'with', anuncioIds.length, 'items');
    await setFavoritesOrder(db, userId, anuncioIds);
    res.status(200).send({ message: 'Favorites order updated successfully' });
  } catch (e: any) {
    console.error('Error updating favorites order:', e);
    res.status(500).send({ message: 'Error updating favorites order', error: e.message });
  }
});

// ---------- USER ----------
app.get('/users/:uid', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.params;
    console.log('Fetching user data for UID:', uid);
    const userData = await fetchUserData(db, uid);
    if (userData) {
      res.status(200).send(userData);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (e: any) {
    console.error('Error getting user data:', e);
    res.status(500).send({ message: 'Error getting user data', error: e.message });
  }
});

// ---------- START ----------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});