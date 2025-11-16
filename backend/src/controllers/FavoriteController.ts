import * as admin from "firebase-admin";
import { Anuncio } from "./AnuncioController";

interface Favorite {
  anuncioId: string;
  orderIndex?: number;
  addedAt: FirebaseFirestore.Timestamp;
}

/**
 * Busca todos os favoritos de um usuário com detalhes dos anúncios
 * @param db Instância do Firestore
 * @param userId UID do usuário
 * @returns Array de Anuncio ordenado
 */
export const getUserFavorites = async (
  db: admin.firestore.Firestore,
  userId: string
): Promise<Anuncio[]> => {
  try {
    const favoritesRef = db.collection(`users/${userId}/favorites`);
    
    // Busca favoritos ordenados por orderIndex (asc), ou addedAt (desc) como fallback
    const favoritesSnapshot = await favoritesRef
      .orderBy("orderIndex", "asc")
      .get();

    if (favoritesSnapshot.empty) {
      console.log(`No favorites found for user ${userId}`);
      return [];
    }

    const favorites = favoritesSnapshot.docs.map(doc => ({
      anuncioId: doc.id,
      ...doc.data() as Omit<Favorite, 'anuncioId'>
    }));

    // Se alguns favoritos não têm orderIndex, reordena por addedAt
    const favoritesWithOrder = favorites.filter(f => f.orderIndex !== undefined);
    const favoritesWithoutOrder = favorites.filter(f => f.orderIndex === undefined);
    
    favoritesWithoutOrder.sort((a, b) => 
      b.addedAt.toMillis() - a.addedAt.toMillis()
    );

    const orderedFavoriteIds = [
      ...favoritesWithOrder.map(f => f.anuncioId),
      ...favoritesWithoutOrder.map(f => f.anuncioId)
    ];

    // Busca os anúncios correspondentes
    const anuncios: Anuncio[] = [];
    
    // Firestore limita 'in' queries a 10 itens, então processamos em lotes
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

    // Reordena os anúncios conforme a ordem dos favoritos
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

/**
 * Adiciona um anúncio aos favoritos do usuário
 * @param db Instância do Firestore
 * @param userId UID do usuário
 * @param anuncioId ID do anúncio
 */
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
      return; // Idempotente
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

/**
 * Remove um anúncio dos favoritos do usuário
 * @param db Instância do Firestore
 * @param userId UID do usuário
 * @param anuncioId ID do anúncio
 */
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

/**
 * Atualiza a ordem dos favoritos do usuário
 * @param db Instância do Firestore
 * @param userId UID do usuário
 * @param anuncioIds Array de IDs na ordem desejada
 */
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
