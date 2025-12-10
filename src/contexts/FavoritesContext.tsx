import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../assets/firebaseConfig';
import { Anuncio } from '../models/Anuncio';

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

// ATUALIZE ESTA URL COM SUA URL DO NGROK ATUAL
const BASE_URL = "https://privative-unphysiological-lamonica.ngrok-free.dev";

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          console.log("FavoritesContext: ID token obtained");
          setIdToken(token);
        } catch (error) {
          console.error("FavoritesContext: Error getting ID token:", error);
          setIdToken(null);
        }
      } else {
        console.log("FavoritesContext: User logged out, clearing favorites");
        setIdToken(null);
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (idToken) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [idToken]);

  const loadFavorites = async () => {
    if (!idToken) {
      console.log("FavoritesContext: No token available, skipping favorites fetch");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("FavoritesContext: Fetching favorites from", "https://privative-unphysiological-lamonica.ngrok-free.dev/favorites");
      const response = await fetch("https://privative-unphysiological-lamonica.ngrok-free.dev/favorites", {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true', // <-- adicione esta linha
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`FavoritesContext: HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("FavoritesContext: Favorites loaded:", data.length);
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FavoritesContext: Failed to load favorites from backend", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (anuncio: Anuncio) => {
    if (!idToken || !anuncio.id) {
      console.error('FavoritesContext: No token or anuncio ID available');
      return;
    }

    try {
      console.log('FavoritesContext: Adding favorite', anuncio.id);
      
      // PRIMEIRO: atualizar UI imediatamente (otimistic update)
      if (!favorites.find(fav => fav.id === anuncio.id)) {
        setFavorites([...favorites, anuncio]);
        console.log('FavoritesContext: UI updated immediately');
      }

      // DEPOIS: enviar para backend
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anuncioId: anuncio.id }),
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.error('❌ 401 - Recarregando token...');
        const newToken = await auth.currentUser?.getIdToken(true);
        if (newToken) {
          setIdToken(newToken);
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log('FavoritesContext: Favorite saved to backend');
    } catch (error) {
      console.error('FavoritesContext: Error:', error);
    }
  };

  const removeFavorite = async (anuncioId: string) => {
    if (!idToken) {
      console.warn("FavoritesContext: Cannot remove favorite - missing token");
      return;
    }

    console.log("FavoritesContext: Removing favorite (optimistic):", anuncioId);
    const previousFavorites = [...favorites];
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
        const errorText = await response.text();
        console.error(`FavoritesContext: Failed to remove favorite - HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("FavoritesContext: Favorite removed successfully");
    } catch (error) {
      console.error("FavoritesContext: Error removing favorite, reverting", error);
      setFavorites(previousFavorites);
    }
  };

  const updateFavorite = async (anuncio: Anuncio) => {
    if (!anuncio.id) {
      console.warn("FavoritesContext: Cannot update favorite - missing anuncio ID");
      return;
    }
    
    console.log("FavoritesContext: Updating favorite locally:", anuncio.id);
    const newFavorites = favorites.map(fav => (fav.id === anuncio.id ? anuncio : fav));
    setFavorites(newFavorites);
  };

  const setFavoritesOrder = async (reorderedFavorites: Anuncio[]) => {
    if (!idToken) {
      console.warn("FavoritesContext: Cannot reorder favorites - missing token");
      return;
    }

    console.log("FavoritesContext: Reordering favorites (optimistic)");
    const previousFavorites = [...favorites];
    setFavorites(reorderedFavorites);

    try {
      const anuncioIds = reorderedFavorites
        .map(fav => fav.id)
        .filter(id => id !== undefined) as string[];

      console.log("FavoritesContext: Sending new order to backend:", anuncioIds.length, "items");
      const response = await fetch(`${BASE_URL}/favorites/order`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anuncioIds }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`FavoritesContext: Failed to update order - HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("FavoritesContext: Favorites order updated successfully");
    } catch (error) {
      console.error("FavoritesContext: Error updating favorites order, reloading from backend", error);
      // Reverte e recarrega do backend para garantir consistência
      setFavorites(previousFavorites);
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