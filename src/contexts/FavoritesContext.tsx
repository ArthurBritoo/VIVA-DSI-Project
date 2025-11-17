import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Anuncio } from '../models/Anuncio';
import { auth } from '../assets/firebaseConfig';

interface FavoritesContextType {
  favorites: Anuncio[];
  addFavorite: (anuncio: Anuncio) => Promise<void>;
  removeFavorite: (anuncioId: string) => Promise<void>;
  updateFavorite: (anuncio: Anuncio) => Promise<void>;
  setFavoritesOrder: (reorderedFavorites: Anuncio[]) => Promise<void>;
  isFavorite: (anuncioId: string) => boolean;
  loading: boolean;
  reloadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// URL base do backend
const BASE_URL = "https://contrite-graspingly-ligia.ngrok-free.dev";

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Monitora autenticação e obtém token
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          setIdToken(token);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
        setFavorites([]); // Limpa favoritos ao deslogar
      }
    });

    return () => unsubscribe();
  }, []);

  // Carrega favoritos quando o token está disponível
  useEffect(() => {
    if (idToken) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [idToken]);

  const loadFavorites = async () => {
    if (!idToken) {
      console.log("No token available, skipping favorites fetch");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load favorites from backend", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (anuncio: Anuncio) => {
    if (!idToken || !anuncio.id) {
      console.warn("Cannot add favorite: missing token or anuncio ID");
      return;
    }

    // Optimistic update
    const newFavorites = [...favorites, anuncio];
    setFavorites(newFavorites);

    try {
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anuncioId: anuncio.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mantém estado otimista; backend confirmará em segundo plano
      // Opcional: poderíamos agendar um reload com debounce se necessário
    } catch (error) {
      console.error("Failed to add favorite", error);
      // Reverte optimistic update em caso de erro
      setFavorites(favorites);
    }
  };

  const removeFavorite = async (anuncioId: string) => {
    if (!idToken) {
      console.warn("Cannot remove favorite: missing token");
      return;
    }

    // Optimistic update
    const newFavorites = favorites.filter(fav => fav.id !== anuncioId);
    setFavorites(newFavorites);

    try {
      const response = await fetch(`${BASE_URL}/favorites/${anuncioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to remove favorite", error);
      // Reverte optimistic update em caso de erro
      setFavorites(favorites);
    }
  };

  const updateFavorite = async (anuncio: Anuncio) => {
    if (!anuncio.id) return;
    
    // Atualiza no estado local (mantém a lógica atual)
    const newFavorites = favorites.map(fav => (fav.id === anuncio.id ? anuncio : fav));
    setFavorites(newFavorites);
    
    // Nota: updateFavorite não precisa chamar o backend, pois apenas atualiza 
    // os detalhes do anúncio em memória. O backend já terá os dados atualizados
    // quando recarregarmos os favoritos.
  };

  const setFavoritesOrder = async (reorderedFavorites: Anuncio[]) => {
    if (!idToken) {
      console.warn("Cannot reorder favorites: missing token");
      return;
    }

    // Optimistic update
    setFavorites(reorderedFavorites);

    try {
      const anuncioIds = reorderedFavorites
        .map(fav => fav.id)
        .filter(id => id !== undefined) as string[];

      const response = await fetch(`${BASE_URL}/favorites/order`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anuncioIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to update favorites order", error);
      // Reverte optimistic update em caso de erro
      await loadFavorites();
    }
  };

  const isFavorite = (anuncioId: string) => {
    return favorites.some(fav => fav.id === anuncioId);
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      updateFavorite, 
      setFavoritesOrder,
      isFavorite, 
      loading, 
      reloadFavorites: loadFavorites 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
