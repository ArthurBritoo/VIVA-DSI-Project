import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from "firebase/firestore";

export interface Anuncio {
  id?: string;
  titulo: string;
  descricao: string;
  preco: number;
  imageUrl: string;
  userId: string;
  createdAt: Date;
}

const anunciosCollectionRef = collection(db, "anuncio");

// criar novo anuncio
export const createAnuncio = async (anuncioData: Omit<Anuncio, 'id' | 'createdAt'>, userId: string): Promise<Anuncio> => {
  try {
    const newAnuncio: Anuncio = {
      ...anuncioData,
      userId: userId,
      createdAt: new Date(),
    };
    const docRef = await addDoc(anunciosCollectionRef, newAnuncio);
    return { id: docRef.id, ...newAnuncio };
  } catch (error) {
    console.error("Error creating anuncio: ", error);
    throw error;
  }
};


// obter todos anuncios
export const getAnuncios = async (): Promise<Anuncio[]> => {
  try {
    const querySnapshot = await getDocs(anunciosCollectionRef);
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
export const getAnuncioById = async (id: string): Promise<Anuncio | null> => {
  try {
    const docRef = doc(db, "anuncios", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() as Omit<Anuncio, 'id'> };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting anuncio by ID: ", error);
    throw error;
  }
};

// atualizar anuncio
export const updateAnuncio = async (id: string, updatedData: Partial<Omit<Anuncio, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  try {
    const anuncioRef = doc(db, "anuncios", id);
    await updateDoc(anuncioRef, updatedData);
  } catch (error) {
    console.error("Error updating anuncio: ", error);
    throw error;
  }
};

export const deleteAnuncio = async (id: string): Promise<void> => {
  try {
    const anuncioRef = doc(db, "anuncios", id);
    await deleteDoc(anuncioRef);
  } catch (error) {
    console.error("Error deleting anuncio: ", error);
    throw error;
  }
};

// obter anúncios de um usuário específico
export const getAnunciosByUserId = async (userId: string): Promise<Anuncio[]> => {
  try {
    const q = query(anunciosCollectionRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Anuncio, 'id'>
    }));
  } catch (error) {
    console.error("Error getting anuncios by user ID: ", error);
    throw error;
  }
};
