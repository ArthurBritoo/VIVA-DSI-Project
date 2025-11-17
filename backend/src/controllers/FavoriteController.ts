import * as admin from "firebase-admin";
import { Anuncio } from "./AnuncioController";

interface Favorite {
  anuncioId: string;
  orderIndex?: number;
  addedAt: FirebaseFirestore.Timestamp;
}

export const getUserFavorites = async (
  db: admin.firestore.Firestore,
  userId: string
): Promise<Anuncio[]> => {
  try {
    const favoritesRef = db.collection(`users/${userId}/favorites`);
    const favoritesSnapshot = await favoritesRef.get();

    if (favoritesSnapshot.empty) {
      console.log(`No favorites found for user ${userId}`);
      return [];
    }

    const favorites = favoritesSnapshot.docs.map(doc => ({
      anuncioId: doc.id,
      ...doc.data() as Omit<Favorite, 'anuncioId'>
    }));

    const favoritesWithOrder = favorites.filter(f => f.orderIndex !== undefined);
    const favoritesWithoutOrder = favorites.filter(f => f.orderIndex === undefined);
    
    favoritesWithoutOrder.sort((a, b) => 
      b.addedAt.toMillis() - a.addedAt.toMillis()
    );

    favoritesWithOrder.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    const orderedFavoriteIds = [
      ...favoritesWithOrder.map(f => f.anuncioId),
      ...favoritesWithoutOrder.map(f => f.anuncioId)
    ];

    const anuncios: Anuncio[] = [];
    
    const batchSize = 10;
    for (let i = 0; i < orderedFavoriteIds.length; i += batchSize) {
      const batch = orderedFavoriteIds.slice(i, i + batchSize);
      const anunciosSnapshot = await db.collection("anuncio")
        .where(admin.firestore.FieldPath.documentId(), "in", batch)
        .get();
      
      anunciosSnapshot.docs.forEach(doc => {
        anuncios.push({
          id: doc.id,
          ...doc.data() as Omit<Anuncio, 'id'>
        });
      });
    }

    const anunciosMap = new Map(anuncios.map(a => [a.id, a]));
    const orderedAnuncios = orderedFavoriteIds
      .map(id => anunciosMap.get(id))
      .filter(a => a !== undefined) as Anuncio[];

    return orderedAnuncios;
  } catch (error) {
    console.error("Error getting user favorites:", error);
    throw error;
  }
};

export const addFavorite = async (
  db: admin.firestore.Firestore,
  userId: string,
  anuncioId: string
): Promise<void> => {
  try {
    const favoriteRef = db.doc(`users/${userId}/favorites/${anuncioId}`);
    const favoriteDoc = await favoriteRef.get();

    if (favoriteDoc.exists) {
      console.log(`Favorite ${anuncioId} already exists for user ${userId}`);
      return;
    }

    await favoriteRef.set({
      anuncioId: anuncioId,
      addedAt: admin.firestore.Timestamp.now(),
    });

    console.log(`Favorite ${anuncioId} added for user ${userId}`);
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const removeFavorite = async (
  db: admin.firestore.Firestore,
  userId: string,
  anuncioId: string
): Promise<void> => {
  try {
    const favoriteRef = db.doc(`users/${userId}/favorites/${anuncioId}`);
    await favoriteRef.delete();
    console.log(`Favorite ${anuncioId} removed for user ${userId}`);
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

export const setFavoritesOrder = async (
  db: admin.firestore.Firestore,
  userId: string,
  anuncioIds: string[]
): Promise<void> => {
  try {
    const batch = db.batch();

    anuncioIds.forEach((anuncioId, index) => {
      const favoriteRef = db.doc(`users/${userId}/favorites/${anuncioId}`);
      batch.update(favoriteRef, { orderIndex: index });
    });

    await batch.commit();
    console.log(`Favorites order updated for user ${userId}`);
  } catch (error) {
    console.error("Error updating favorites order:", error);
    throw error;
  }
};