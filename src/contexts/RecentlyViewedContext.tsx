import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Anuncio } from '../models/Anuncio';
import { auth } from '../assets/firebaseConfig';

interface RecentlyViewedContextType {
  recentlyViewed: Anuncio[];
  addToRecentlyViewed: (anuncio: Anuncio) => Promise<void>;
  clearRecentlyViewed: () => Promise<void>;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_RECENTLY_VIEWED = 10;

export const RecentlyViewedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Anuncio[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        loadRecentlyViewed(user.uid);
      } else {
        setUserId(null);
        setRecentlyViewed([]);
      }
    });
    return unsubscribe;
  }, []);

  const getStorageKey = (uid: string) => `@recentlyViewed_${uid}`;

  const loadRecentlyViewed = async (uid: string) => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(uid));
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('RecentlyViewed: Loaded', parsed.length, 'items');
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error('RecentlyViewed: Error loading:', error);
    }
  };

  const addToRecentlyViewed = async (anuncio: Anuncio) => {
    if (!userId || !anuncio.id) {
      console.log('RecentlyViewed: No user or anuncio ID');
      return;
    }

    try {
      // Remove duplicatas (se já existe, traz para o topo)
      const filtered = recentlyViewed.filter(item => item.id !== anuncio.id);
      
      // Adiciona no início
      const updated = [anuncio, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      
      console.log('RecentlyViewed: Adding', anuncio.titulo, '- Total:', updated.length);
      
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch (error) {
      console.error('RecentlyViewed: Error saving:', error);
    }
  };

  const clearRecentlyViewed = async () => {
    if (!userId) return;
    
    try {
      await AsyncStorage.removeItem(getStorageKey(userId));
      setRecentlyViewed([]);
      console.log('RecentlyViewed: Cleared');
    } catch (error) {
      console.error('RecentlyViewed: Error clearing:', error);
    }
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addToRecentlyViewed, clearRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
};