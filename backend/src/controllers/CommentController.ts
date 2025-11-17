import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

export interface Comentario {
  id?: string;
  anuncioId: string;
  userId: string;
  texto: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

const comentariosCol = (db: admin.firestore.Firestore, anuncioId: string) =>
  db.collection('anuncio').doc(anuncioId).collection('comentarios');

export const listComments = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db as admin.firestore.Firestore;
    const anuncioId = req.params.id;
    const snap = await comentariosCol(db, anuncioId)
      .orderBy('createdAt', 'asc')
      .get();

    const comentarios: Comentario[] = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Comentario, 'id'>),
    }));
    res.json(comentarios);
  } catch (e: any) {
    res.status(500).json({ error: e.message, message: 'Erro ao listar comentários' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db as admin.firestore.Firestore;
    const anuncioId = req.params.id;
    const { texto } = req.body;
    const userId = (req as any).user?.uid;
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });
    if (!texto || !texto.trim()) return res.status(400).json({ error: 'Texto é obrigatório' });

    const userSnap = await db.collection('users').doc(userId).get();
    const userData = userSnap.exists ? userSnap.data() : {};

    const now = admin.firestore.Timestamp.now();
    const ref = await comentariosCol(db, anuncioId).add({
      anuncioId,
      userId,
      texto: texto.trim(),
      userName: userData?.nome || null,
      userPhoto: userData?.foto || null,
      createdAt: now,
      updatedAt: now,
    });

    const saved = await ref.get();
    res.status(201).json({ id: ref.id, ...(saved.data() as object) });
  } catch (e: any) {
    res.status(500).json({ error: e.message, message: 'Erro ao criar comentário' });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db as admin.firestore.Firestore;
    const { id: anuncioId, comentarioId } = req.params;
    const { texto } = req.body;
    const userId = (req as any).user?.uid;
    if (!texto || !texto.trim()) return res.status(400).json({ error: 'Texto é obrigatório' });

    const ref = comentariosCol(db, anuncioId).doc(comentarioId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Comentário não encontrado' });
    if (snap.data()?.userId !== userId) return res.status(403).json({ error: 'Sem permissão' });

    await ref.update({
      texto: texto.trim(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    const updated = await ref.get();
    res.json({ id: ref.id, ...(updated.data() as object) });
  } catch (e: any) {
    res.status(500).json({ error: e.message, message: 'Erro ao atualizar comentário' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db as admin.firestore.Firestore;
    const { id: anuncioId, comentarioId } = req.params;
    const userId = (req as any).user?.uid;
    const ref = comentariosCol(db, anuncioId).doc(comentarioId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Comentário não encontrado' });
    if (snap.data()?.userId !== userId) return res.status(403).json({ error: 'Sem permissão' });

    await ref.delete();
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message, message: 'Erro ao excluir comentário' });
  }
};