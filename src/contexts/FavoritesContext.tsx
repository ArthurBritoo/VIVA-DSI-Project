import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Anuncio } from '../models/Anuncio';

interface FavoritesContextType {
  favorites: Anuncio[];
  addFavorite: (anuncio: Anuncio) => Promise<void>;
  removeFavorite: (anuncioId: string) => Promise<void>;
  isFavorite: (anuncioId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@viva_favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Failed to load favorites from storage", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const saveFavorites = async (newFavorites: Anuncio[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to save favorites to storage", error);
    }
  };

  const addFavorite = async (anuncio: Anuncio) => {
    const newFavorites = [...favorites, anuncio];
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (anuncioId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== anuncioId);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (anuncioId: string) => {
    return favorites.some(fav => fav.id === anuncioId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, loading }}>
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
