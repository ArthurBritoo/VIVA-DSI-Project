import * as admin from "firebase-admin";

export interface Endereco {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: number | string;
  longitude: number | string;
}

export interface Anuncio {
  id?: string;
  titulo: string;
  descricao: string;
  preco: number;
  imageUrl: string;
  userId: string;
  createdAt?: Date;
  endereco: Endereco; // <-- Adicione esta linha
}

// Functions now accept 'db' as an argument

// criar novo anuncio
export const createAnuncio = async (db: admin.firestore.Firestore, anuncioData: Omit<Anuncio, 'id' | 'createdAt'>, userId: string): Promise<Anuncio> => {
  try {
    const anunciosCollectionRef = db.collection("anuncio");
    const newAnuncio: Anuncio = {
      ...anuncioData,
      userId: userId,
      createdAt: new Date(),
    };
    const docRef = await anunciosCollectionRef.add(newAnuncio);
    return { id: docRef.id, ...newAnuncio };
  } catch (error) {
    console.error("Error creating anuncio: ", error);
    throw error;
  }
};


// obter todos anuncios
export const getAnuncios = async (db: admin.firestore.Firestore): Promise<Anuncio[]> => {
  try {
    const anunciosCollectionRef = db.collection("anuncio");
    const querySnapshot = await anunciosCollectionRef.get();
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Anuncio, 'id'>
    }));
  } catch (error) {
    console.error("Error getting anuncios: ", error);
    throw error;
  }
};

//obter anuncio especifico
export const getAnuncioById = async (db: admin.firestore.Firestore, id: string): Promise<Anuncio | null> => {
  try {
    console.log("Attempting to fetch anuncio with ID:", id);
    const docRef = db.collection("anuncio").doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log("Anuncio found!");
      return { id: docSnap.id, ...docSnap.data() as Omit<Anuncio, 'id'> };
    } else {
      console.log("No such document in Firestore for ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Error getting anuncio by ID: ", error);
    throw error;
  }
};

// atualizar anuncio
export const updateAnuncio = async (db: admin.firestore.Firestore, id: string, updatedData: Partial<Omit<Anuncio, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  try {
    const anuncioRef = db.collection("anuncio").doc(id);
    await anuncioRef.update(updatedData);
  } catch (error) {
    console.error("Error updating anuncio: ", error);
    throw error;
  }
};

export const deleteAnuncio = async (db: admin.firestore.Firestore, id: string): Promise<void> => {
  try {
    const anuncioRef = db.collection("anuncio").doc(id);
    await anuncioRef.delete();
  } catch (error) {
    console.error("Error deleting anuncio: ", error);
    throw error;
  }
};

// obter anúncios de um usuário específico
export const getAnunciosByUserId = async (db: admin.firestore.Firestore, userId: string): Promise<Anuncio[]> => {
  try {
    const anunciosCollectionRef = db.collection("anuncio");
    const querySnapshot = await anunciosCollectionRef.where("userId", "==", userId).get();
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Anuncio, 'id'>
    }));
  } catch (error) {
    console.error("Error getting anuncios by user ID: ", error);
    throw error;
  }
};