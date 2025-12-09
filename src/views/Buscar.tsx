import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../assets/firebaseConfig';
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import FavoriteButton from '../components/FavoriteButton';
import { Anuncio } from '../models/Anuncio';
import { RootStackParamList } from '../types/navigation';

const BASE_URL = "https://780b4acc7749.ngrok-free.app";

export default function Buscar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Anuncio[]>([]);
  const [allAnuncios, setAllAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
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

  // Carregar todos os anúncios quando a tela abrir
  useEffect(() => {
    if (idToken) {
      loadAllAnuncios();
    }
  }, [idToken]);

  const loadAllAnuncios = async () => {
    if (!idToken) {
      console.log('Buscar: No token available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const url = `${BASE_URL}/anuncios`;
    console.log('Buscar: Fetching from:', url);
    console.log('Buscar: Token (first 20):', idToken.substring(0, 20) + '...');
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      console.log('Buscar: Response status:', response.status);
      console.log('Buscar: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Buscar: Error response:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Buscar: Received', data.length, 'anuncios');
      
      const anunciosList = Array.isArray(data) ? data : [];
      setAllAnuncios(anunciosList);
      setResults(anunciosList);
    } catch (e: any) {
      console.error('Buscar: Error loading anuncios:', e);
      console.error('Buscar: Error message:', e.message);
      setError('Falha ao carregar anúncios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const searchAnuncios = async (query: string) => {
    if (!query.trim()) {
      console.log('Buscar: Empty query, showing all');
      setResults(allAnuncios);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const url = `${BASE_URL}/anuncios?q=${encodeURIComponent(query)}`;
    console.log('Buscar: Searching with URL:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      console.log('Buscar: Search response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Buscar: Search error:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Buscar: Search found', data.length, 'results');
      setResults(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Buscar: Search error:', e);
      setError('Falha ao buscar anúncios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!idToken) return; // <-- ADICIONE ESTA LINHA
    
    const handler = setTimeout(() => {
      searchAnuncios(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, idToken, allAnuncios]); // <-- ADICIONE allAnuncios NAS DEPENDÊNCIAS

  const renderItem = ({ item }: { item: Anuncio }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('AnuncioDetail', { anuncioId: item.id })}
    >
      <FavoriteButton anuncio={item} style={styles.favoriteIcon} />
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/160x180' }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.cardPrice}>
          R$ {item.preco?.toLocaleString('pt-BR') || '0'}
        </Text>
        {item.endereco && (
          <>
            {item.endereco.bairro && (
              <Text style={styles.cardLocation} numberOfLines={1}>
                📍 {item.endereco.bairro}
              </Text>
            )}
            {item.endereco.cidade && (
              <Text style={styles.cardLocation} numberOfLines={1}>
                🏙️ {item.endereco.cidade}{item.endereco.estado ? ` - ${item.endereco.estado}` : ''}
              </Text>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Buscar" onMenuPress={() => {}} />
      
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, cidade ou descrição..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#137fec" />
          <Text style={styles.loadingText}>Carregando anúncios...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadAllAnuncios}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                {searchQuery.trim().length > 0 
                  ? `Nenhum anúncio encontrado para "${searchQuery}"`
                  : 'Nenhum anúncio disponível'}
              </Text>
            </View>
          }
        />
      )}
      
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f6f7f8" 
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
  },
  listContainer: {
    padding: 12,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#137fec',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#137fec',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 24,
  },
});
