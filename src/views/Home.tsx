import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../assets/firebaseConfig";
import BottomNav from "../components/BottomNav";
import FavoriteButton from '../components/FavoriteButton';
import Header from "../components/Header";
import { useFavorites } from '../contexts/FavoritesContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext'; // <-- NOVO
import { RootStackParamList } from "../types/navigation";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function App() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const { favorites } = useFavorites();
  const { recentlyViewed } = useRecentlyViewed(); // <-- NOVO

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

<<<<<<< HEAD
=======
  // 🔹 Função de busca dos anúncios
  const fetchAnuncios = useCallback(async () => {
    if (!idToken) {
      console.log("IdToken não disponível, pulando chamada de API.");
      return;
    }

    try {
      const response = await fetch("https://privative-unphysiological-lamonica.ngrok-free.dev/anuncios", { // A MAIOR DOR DE CABEÇA FOI AQUI
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      console.log("Status da resposta da API:", response.status);
      const data = await response.json();
      console.log("Dados recebidos da API:", data);

      let anunciosToProcess: any[] = [];

      if (Array.isArray(data)) {
        anunciosToProcess = data;
      } else if (data && Array.isArray(data.anuncios)) {
        anunciosToProcess = data.anuncios;
      } else {
        console.warn("Resposta inesperada da API:", data);
        setRecentlyViewed([]);
        return;
      }

      const anunciosList: Anuncio[] = anunciosToProcess.map((anuncio: any) => ({
        id: anuncio.id,
        titulo: anuncio.titulo,
        preco: anuncio.preco || 0,
        imageUrl: anuncio.imageUrl,
        descricao: anuncio.descricao || '',
        userId: anuncio.userId || '',
      }));

      setRecentlyViewed(anunciosList);
    } catch (error) {
      console.error("Erro ao buscar anúncios:", error);
      setRecentlyViewed([]);
    }
  }, [idToken]);

  // 🔹 Busca inicial quando o token é carregado
  useEffect(() => {
    if (idToken) {
      fetchAnuncios();
    }
  }, [idToken, fetchAnuncios]);

  // 🔹 Atualiza anúncios sempre que a tela volta ao foco
  useFocusEffect(
    useCallback(() => {
      if (idToken) {
        console.log("Tela em foco — atualizando anúncios.");
        fetchAnuncios();
      }
    }, [idToken, fetchAnuncios])
  );

  // 🔹 Navegação entre telas
>>>>>>> cf9c1f2cecfc6cf5c9e3428ba82ae12755536cdb
  const handlePress = (tabName: keyof RootStackParamList, anuncioId?: string) => {
    if (tabName === "AnuncioDetail") {
      navigation.navigate("AnuncioDetail", { anuncioId });
    } else {
      navigation.navigate(tabName as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Home" onMenuPress={() => {}} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cidade, bairro, endereço..."
            placeholderTextColor="#9ca3af"
            onFocus={() => navigation.navigate('Buscar')}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {["Preço", "Localização", "Tipo"].map((f, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.filterButton, idx === 0 && styles.filterActive]}
            >
              <Text
                style={[
                  styles.filterText,
                  idx === 0 && { color: "#137fec", fontWeight: "600" },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recently Viewed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vistos Recentemente</Text>
          {recentlyViewed.length > 0 ? (
            <FlatList
              data={recentlyViewed}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id!}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handlePress('AnuncioDetail', item.id)} style={styles.card}>
                  <FavoriteButton anuncio={item} style={styles.favoriteIcon} />
                  <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/160x180' }} style={styles.cardImage} />
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.titulo}
                  </Text>
                  <Text style={styles.cardPrice}>R$ {item.preco?.toLocaleString('pt-BR') || '0'}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhum anúncio visualizado recentemente.</Text>
          )}
        </View>

        {/* Saved Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favoritos</Text>
          {favorites.length > 0 ? (
            <FlatList
              data={favorites}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id!}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handlePress('AnuncioDetail', item.id)} style={styles.card}>
                  <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/160x180' }} style={styles.cardImage} />
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.titulo}
                  </Text>
                  <Text style={styles.cardPrice}>R$ {item.preco?.toLocaleString('pt-BR') || '0'}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>Você ainda não tem favoritos.</Text>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => handlePress('AnuncioDetail')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
  searchContainer: { padding: 16 },
  searchInput: {
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterActive: { backgroundColor: "#dbeafe" },
  filterText: { fontSize: 14, color: "#111" },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  card: { width: 160, marginRight: 12 },
  cardImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: "bold" },
  cardPrice: { fontSize: 12, color: "#6b7280" },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 135,
    backgroundColor: '#137fec',
    borderRadius: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
});