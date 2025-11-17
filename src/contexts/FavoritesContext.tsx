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
      console.warn("FavoritesContext: Cannot add favorite - missing token or anuncio ID");
      return;
    }

    console.log("FavoritesContext: Adding favorite (optimistic):", anuncio.id);
    const previousFavorites = [...favorites];
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
        const errorText = await response.text();
        console.error(`FavoritesContext: Failed to add favorite - HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("FavoritesContext: Favorite added successfully");
    } catch (error) {
      console.error("FavoritesContext: Error adding favorite, reverting", error);
      setFavorites(previousFavorites);
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