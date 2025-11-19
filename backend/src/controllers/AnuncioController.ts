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
export async function getAnuncios(db: Firestore, searchQuery?: string) {
  console.log('AnuncioController: Fetching anuncios, searchQuery:', searchQuery);
  
  let query = db.collection("anuncio").orderBy("createdAt", "desc");
  
  const snap = await query.get();
  console.log(`AnuncioController: Found ${snap.docs.length} anuncios in collection "anuncio"`);
  
  let anuncios = snap.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data 
    } as Anuncio;
  });

  // Se houver busca, buscar nome do anunciante também
  if (searchQuery && searchQuery.trim()) {
    const searchLower = searchQuery.toLowerCase().trim();
    console.log('AnuncioController: Filtering by query:', searchLower);
    
    // Buscar informações dos usuários para incluir nome do anunciante
    const userIds = [...new Set(anuncios.map(a => a.userId).filter(Boolean))];
    const usersMap = new Map<string, any>();
    
    if (userIds.length > 0) {
      const usersSnap = await db.collection("users").where('__name__', 'in', userIds.slice(0, 10)).get();
      usersSnap.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data());
      });
    }
    
    anuncios = anuncios.filter(anuncio => {
      // Busca no título
      if (anuncio.titulo?.toLowerCase().includes(searchLower)) return true;
      
      // Busca na descrição
      if (anuncio.descricao?.toLowerCase().includes(searchLower)) return true;
      
      // Busca no endereço
      if (anuncio.endereco) {
        if (anuncio.endereco.logradouro?.toLowerCase().includes(searchLower)) return true;
        if (anuncio.endereco.bairro?.toLowerCase().includes(searchLower)) return true;
        if (anuncio.endereco.cidade?.toLowerCase().includes(searchLower)) return true;
        if (anuncio.endereco.estado?.toLowerCase().includes(searchLower)) return true;
        if (anuncio.endereco.cep?.toLowerCase().includes(searchLower)) return true;
      }
      
      // Busca no nome do anunciante
      if (anuncio.userId) {
        const user = usersMap.get(anuncio.userId);
        if (user?.nome?.toLowerCase().includes(searchLower)) return true;
        if (user?.email?.toLowerCase().includes(searchLower)) return true;
      }
      
      // Busca no preço (se digitar número)
      if (anuncio.preco && anuncio.preco.toString().includes(searchLower)) return true;
      
      return false;
    });
    
    console.log(`AnuncioController: Found ${anuncios.length} results after filtering`);
  }
  
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
}

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