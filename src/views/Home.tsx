import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from "react";
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
import Header from "../components/Header";
import { RootStackParamList } from "../types/navigation";


type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Anuncio {
  id: string;
  titulo: string;
  price: string;
  imageUrl: string;
}

const savedProperties = [
  {
    id: "1",
    featured: true,
    title: "Luxury Apartment with City Views",
    details: "2 beds · 2 baths · 1,200 sq ft",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAC2N2JwiUvCl_ti9LPXZWLUqcX9jW-emlV40cIctx75XHefGGD8KiA9chy5rGIzdC0uX_2kKh845TCf2w0Kq4YpTO_MU_PUpmKPRjVN165sEq9DhTZ9O4uRKa9Fd_g_oOChiYHiR4dUB8TPrQm8dEYFf0u6btlexobLoOC2pbT_-5Ct8APPTj0MVa09xfc5ulWsGnZh4Z0FBMn1toE7xf601DXLKqoll9tmFMf_EJ--G5KxpHdfjQo4uAkSLwQ1c0caNXdofq21xs",
  },
  {
    id: "2",
    featured: false,
    title: "Charming Townhouse in Historic District",
    details: "3 beds · 2.5 baths · 1,800 sq ft",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAZzRxWRTDHYYO-NnT9Tbz4hfaNQKyg7Nh4MNd1UlfZDj3iCUUQy4_jfetdjaV1NLpjiZpj5u49RDoPw-3aYLTTiEbTUAVKMsJzquodc8dnuUY8yttVWJQpnVavdOWvUUG9sl5cpQnln8ojgF6x0tFlGbnCRF9lgZU_cvL_4mvWfX17dzde0IR-mR9cHSX_DVTL1pFRCp7qPrjKlsLpnLWUl3WHfQtzKcPQa6_kICmTk_Vtls7eCNlcgFzhMCThRiX5X8iIzl1XJ8",
  },
];

export default function App() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [recentlyViewed, setRecentlyViewed] = useState<Anuncio[]>([]);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // 🔹 Atualiza token de autenticação quando o usuário muda
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (!user) {
        setIdToken(null);
        return;
      }

      try {
        const token = await user.getIdToken(true); // força refresh
        setIdToken(token);
      } catch (error) {
        console.error("Erro ao obter ID token:", error);
        setIdToken(null);
      }
    });

    return unsubscribe;
  }, []);

  // 🔹 Função de busca dos anúncios
  const fetchAnuncios = useCallback(async () => {
    if (!idToken) {
      console.log("IdToken não disponível, pulando chamada de API.");
      return;
    }

    try {
      const response = await fetch("https://privative-unphysiological-lamonica.ngrok-free.dev/anuncios", {
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
        price: anuncio.preco,
        imageUrl: anuncio.imageUrl,
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
  const handlePress = (tabName: keyof RootStackParamList, anuncioId?: string) => {
    if (tabName === "AnuncioDetail") {
      navigation.navigate("AnuncioDetail", { anuncioId });
    } else {
      navigation.navigate(tabName as any);
    }
  };

  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Home" onMenuPress={() => {}} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city, neighborhood, address"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {["Price", "Location", "Property Type"].map((f, idx) => (
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
          <FlatList
            data={recentlyViewed}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handlePress('AnuncioDetail', item.id)} style={styles.card}>
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.titulo}
                </Text>
                <Text style={styles.cardPrice}>{item.price}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Saved Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favoritos</Text>
          {savedProperties.map((item) => (
            <View key={item.id} style={styles.savedCard}>
              <View style={{ flex: 1 }}>
                {item.featured && (
                  <Text style={styles.featuredText}>Featured</Text>
                )}
                <Text style={styles.savedTitle}>{item.title}</Text>
                <Text style={styles.savedDetails}>{item.details}</Text>
              </View>
              <Image source={{ uri: item.image }} style={styles.savedImage} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() =>  handlePress('AnuncioDetail')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Bottom Nav */}
      <BottomNav/>
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

  fab: {
    position: 'absolute',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 135, // Adjust to be above the BottomNav
    backgroundColor: '#137fec',
    borderRadius: 40,
    elevation: 8, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    lineHeight: 60, // Added to center the '+' vertically
  },

  filterActive: { backgroundColor: "#dbeafe" },
  filterText: { fontSize: 14, color: "#111" },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  card: { width: 160, marginRight: 12 },
  cardImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: "bold" },
  cardPrice: { fontSize: 12, color: "#6b7280" },
  savedCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  featuredText: { fontSize: 12, fontWeight: "600", color: "#137fec" },
  savedTitle: { fontSize: 14, fontWeight: "bold" },
  savedDetails: { fontSize: 12, color: "#6b7280" },
  savedImage: { width: 100, height: 80, borderRadius: 8 },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    height: 64,
    backgroundColor: "#f6f7f8",
  },
  navItem: { alignItems: "center" },
  navIcon: { fontSize: 20, color: "#6b7280" },
  navLabel: { fontSize: 12, color: "#6b7280" },
});