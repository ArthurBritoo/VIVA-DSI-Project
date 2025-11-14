import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../assets/firebaseConfig';
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import { Anuncio } from '../models/Anuncio';
import { RootStackParamList } from '../types/navigation';

const BASE_URL = "https://contrite-graspingly-ligia.ngrok-free.dev";

export default function Buscar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Anuncio[]>([]);
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

  const searchAnuncios = async (query: string) => {
    if (!query.trim() || !idToken) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/anuncios?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('A resposta da rede não foi boa');
      }
      const data = await response.json();
      setResults(Array.isArray(data) ? data : data.anuncios || []);
    } catch (e) {
      console.error(e);
      setError('Falha ao buscar anúncios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      searchAnuncios(searchQuery);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, idToken]);

  const renderItem = ({ item }: { item: Anuncio }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('AnuncioDetail', { anuncioId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.titulo}</Text>
        <Text style={styles.itemPrice}>R$ {item.preco.toLocaleString('pt-BR')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Buscar" onMenuPress={() => { }} />
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou descrição..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#137fec" style={{ marginTop: 20 }}/>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            searchQuery.trim().length > 0 ? (
              <Text style={styles.emptyText}>Nenhum anúncio encontrado para "{searchQuery}"</Text>
            ) : (
              <Text style={styles.emptyText}>Digite algo para começar a buscar.</Text>
            )
          }
        />
      )}
      
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
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
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6b7280',
    fontSize: 16,
  },
});
