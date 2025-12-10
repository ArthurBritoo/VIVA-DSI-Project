import React, { createContext, ReactNode, useContext, useState } from 'react';
import { auth } from '../assets/firebaseConfig';
import { Comentario } from '../models/Comentario';

interface ComentariosContextType {
  comentarios: Comentario[];
  loading: boolean;
  loadComentarios: (anuncioId: string) => Promise<void>;
  addComentario: (anuncioId: string, titulo: string, descricao: string, rating: number) => Promise<void>;
  updateComentario: (anuncioId: string, comentarioId: string, titulo: string, descricao: string, rating: number) => Promise<void>; // <-- ADICIONE anuncioId
  deleteComentario: (anuncioId: string, comentarioId: string) => Promise<void>; // <-- ADICIONE anuncioId
}

const ComentariosContext = createContext<ComentariosContextType | undefined>(undefined);

const BASE_URL = "https://privative-unphysiological-lamonica.ngrok-free.dev";

export const ComentariosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Obter token quando componente monta
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
    });

    return unsubscribe;
  }, []);

  const loadComentarios = async (anuncioId: string) => {
    if (!idToken) {
      console.log('ComentariosContext: No token available');
      return;
    }

    setLoading(true);
    try {
      console.log('ComentariosContext: Loading from:', `${BASE_URL}/anuncios/${anuncioId}/comentarios`);
      
      const response = await fetch(`${BASE_URL}/anuncios/${anuncioId}/comentarios`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });

      console.log('ComentariosContext: Response status:', response.status);

      if (response.status === 403) {
        console.error('❌ 403 Forbidden');
        setComentarios([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const error = await response.text();
        console.error('Error response:', error);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ ComentariosContext: Loaded comentarios:', data); // <-- VEJA OS IDs
      setComentarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('ComentariosContext: Error loading comentarios:', error);
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  };

  const addComentario = async (anuncioId: string, titulo: string, descricao: string, rating: number) => {
    if (!idToken) {
      console.error('ComentariosContext: No token available');
      return;
    }

    try {
      console.log('ComentariosContext: Creating comentario');

      const response = await fetch(`${BASE_URL}/anuncios/${anuncioId}/comentarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          titulo, 
          texto: descricao, // <-- MUDE descricao PARA texto
          rating 
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        console.error('❌ Error:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const newComentario = JSON.parse(responseText);
      setComentarios([...comentarios, newComentario]);
      console.log('✅ Comentario created:', newComentario.id);
    } catch (error) {
      console.error('ComentariosContext: Error creating comentario:', error);
      throw error;
    }
  };

  const updateComentario = async (anuncioId: string, comentarioId: string, titulo: string, descricao: string, rating: number) => { // <-- ADICIONE anuncioId
    if (!idToken) {
      console.error('ComentariosContext: No token available');
      return;
    }

    try {
      console.log('ComentariosContext: Updating comentario:', comentarioId);
      
      const response = await fetch(`${BASE_URL}/anuncios/${anuncioId}/comentarios/${comentarioId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo, texto: descricao, rating }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        console.error('❌ Error:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const updatedComentario = JSON.parse(responseText);
      setComentarios(comentarios.map(c => c.id === comentarioId ? updatedComentario : c));
      console.log('✅ Comentario updated:', comentarioId);
    } catch (error) {
      console.error('ComentariosContext: Error updating comentario:', error);
      throw error;
    }
  };

  const deleteComentario = async (anuncioId: string, comentarioId: string) => { // <-- ADICIONE anuncioId
    if (!idToken) {
      console.error('ComentariosContext: No token available');
      return;
    }

    try {
      console.log('ComentariosContext: Deleting comentario:', comentarioId);
      
      const response = await fetch(`${BASE_URL}/anuncios/${anuncioId}/comentarios/${comentarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        console.error('❌ Error:', response.status, responseText);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      setComentarios(comentarios.filter(c => c.id !== comentarioId));
      console.log('✅ Comentario deleted:', comentarioId);
    } catch (error) {
      console.error('ComentariosContext: Error deleting comentario:', error);
      throw error;
    }
  };

  return (
    <ComentariosContext.Provider value={{ comentarios, loading, loadComentarios, addComentario, updateComentario, deleteComentario }}>
      {children}
    </ComentariosContext.Provider>
  );
};

export const useComentarios = () => {
  const context = useContext(ComentariosContext);
  if (!context) {
    throw new Error('useComentarios deve ser usado dentro de ComentariosProvider');
  }
  return context;
};