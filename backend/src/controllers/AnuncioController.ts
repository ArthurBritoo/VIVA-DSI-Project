import { Firestore } from "firebase-admin/firestore";

export interface Endereco {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}

export interface Anuncio {
  id?: string;
  titulo: string;
  descricao: string;
  preco: number;
  tipo?: string;
  userId: string;
  createdAt: string;
  imageUrl?: string;
  endereco?: Endereco;
}

// criar novo anuncio
export const createAnuncio = async (db: Firestore, anuncioData: Omit<Anuncio, 'id' | 'createdAt'>, userId: string): Promise<Anuncio> => {
  try {
    console.log('AnuncioController: Creating anuncio for user:', userId);
    const novoAnuncio = { ...anuncioData, userId, createdAt: new Date().toISOString() };
    const docRef = await db.collection("anuncio").add(novoAnuncio);
    console.log('AnuncioController: Anuncio created with ID:', docRef.id);
    return { id: docRef.id, ...novoAnuncio };
  } catch (error) {
    console.error("Error creating anuncio: ", error);
    throw error;
  }
};

// obter todos anuncios
export const getAnuncios = async (db: Firestore, searchQuery?: string): Promise<Anuncio[]> => {
  try {
    console.log('AnuncioController: Fetching anuncios, searchQuery:', searchQuery);
    
    let query = db.collection("anuncio").orderBy("createdAt", "desc");
    
    if (searchQuery) {
      console.log('AnuncioController: Applying search filter for:', searchQuery);
      query = query.where("titulo", ">=", searchQuery).where("titulo", "<=", searchQuery + "\uf8ff");
    }
    
    const snap = await query.get();
    console.log(`AnuncioController: Found ${snap.docs.length} anuncios in collection "anuncio"`);
    
    const anuncios = snap.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data 
      } as Anuncio;
    });
    
    if (anuncios.length > 0) {
      console.log('AnuncioController: First anuncio:', {
        id: anuncios[0].id,
        titulo: anuncios[0].titulo,
        preco: anuncios[0].preco,
        userId: anuncios[0].userId
      });
    } else {
      console.warn('AnuncioController: No anuncios found in database');
    }
    
    return anuncios;
  } catch (error) {
    console.error("Error getting anuncios: ", error);
    throw error;
  }
};

//obter anuncio especifico
export const getAnuncioById = async (db: Firestore, id: string): Promise<Anuncio | null> => {
  try {
    console.log('AnuncioController: Fetching anuncio by ID:', id);
    const doc = await db.collection("anuncio").doc(id).get();
    
    if (!doc.exists) {
      console.warn('AnuncioController: Anuncio not found for ID:', id);
      return null;
    }
    
    const anuncio = { id: doc.id, ...doc.data() } as Anuncio;
    console.log('AnuncioController: Anuncio found:', anuncio.titulo);
    return anuncio;
  } catch (error) {
    console.error("Error getting anuncio by ID: ", error);
    throw error;
  }
};

// atualizar anuncio
export const updateAnuncio = async (db: Firestore, id: string, updatedData: Partial<Omit<Anuncio, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  try {
    console.log('AnuncioController: Updating anuncio:', id);
    await db.collection("anuncio").doc(id).update(updatedData);
    console.log('AnuncioController: Anuncio updated successfully');
  } catch (error) {
    console.error("Error updating anuncio: ", error);
    throw error;
  }
};

export const deleteAnuncio = async (db: Firestore, id: string): Promise<void> => {
  try {
    console.log('AnuncioController: Deleting anuncio:', id);
    await db.collection("anuncio").doc(id).delete();
    console.log('AnuncioController: Anuncio deleted successfully');
  } catch (error) {
    console.error("Error deleting anuncio: ", error);
    throw error;
  }
};

// obter anúncios de um usuário específico
export const getAnunciosByUserId = async (db: Firestore, userId: string): Promise<Anuncio[]> => {
  try {
    console.log('AnuncioController: Fetching anuncios for user:', userId);
    const snap = await db.collection("anuncio").where("userId", "==", userId).get();
    const anuncios = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Anuncio[];
    console.log(`AnuncioController: Found ${anuncios.length} anuncios for user ${userId}`);
    return anuncios;
  } catch (error) {
    console.error("Error getting anuncios by user ID: ", error);
    throw error;
  }
};