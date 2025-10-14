import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import {SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header  from "../components/Header";
import BottomNav from "../components/BottomNav";

// Define the RootStackParamList type here
type RootStackParamList = {
  Home: undefined;
  Buscar: undefined;
  Perfil: undefined;
  AnuncioDetail: { anuncioId: string };
  
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;



const recentlyViewed = [
  {
    id: "1",
    title: "Modern Home in Suburbia",
    price: "$450,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCe3tCGTd5Z_GRS3KoUYpvrM66m_8NUHrpZOcdjlzc_hVRxMB3WBIfWPmxMKKNxwxPioqvhAAEHN2g61KoPgTGZ3FxDt9-NxQDPOlaOfvAsaiI62dGLj-q_9yYppjdd3i9wIZLPEhiLgCx8ERyaKLwTuv68FPoSPjsxzfhWSPsnYKQOJ6mqXaD1QYp2m8UNdX03OIQFleZOGNqugxJgEUXmrQ4s70GJ3J4fMvH0Fn0MJoZGYg9AAlfN-6pryYWGgh-vEtiACo2rnug",
  },
  {
    id: "2",
    title: "Cozy Cottage Retreat",
    price: "$275,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAt8atNVwwMEwiuYwWFHG5qD1cWRQgJ1kv5o0G_rjxY42I8KCeEkDEG_p6q618QogJbMbnUGjLhZZGPCyKWjHKYfSfB0iDJWbTaoDxCq2DnG-mC-abLoWRNRcKbS0YrhO3TAuaPuxXs5F3C4mTgGac4oHkcYG0ZuPP1O_OVEooRtO-CBp5zDijoUh7CpRoMVjNMK-C3WZpACuC9l4JAfdt4tI3p3dLh0Nhx5So6Ps59J5QPK0mVw8Fb8iC7SIDUsUTtj-cx-7_1-Aw",
  },
  {
    id: "3",
    title: "Urban Loft Living",
    price: "$320,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtKiWs6Acr22jgJpEQoKEU8rF5dGFD7s479FS0FH_sSLbJUNgJKefIn1WebtDhbWEEt1EKxqptT0AuysOFnfHvXc3DoXTc91BNf__wV-KxczdWzlO2eFVqmrttBdbHXQitFViLFGg2ecIBr5jfH_9mjcLLeJopAIIPyAYN-5dF-Vu6lJdU0ziJTc1eO203OAZidqCWuQwutNKjmbPFsO1AC4dyqtT6YBNZLfwUlOVMHDyaYzsVCSs4PQ1KxdLiBebRW9dDC9dV7Tk",
  },
];

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

        <TouchableOpacity onPress={() => navigation.navigate('AnuncioDetail', { anuncioId: 'algumIDaqui' })}>
          <Text >ver detalhe de anuncio </Text>
        </TouchableOpacity>

        {/* Recently Viewed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vistos Recentemente</Text>
          <FlatList
            data={recentlyViewed}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardPrice}>{item.price}</Text>
              </View>
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
      <TouchableOpacity style={styles.fab}>
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
    bottom: 90, // Adjust to be above the BottomNav
    backgroundColor: '#137fec',
    borderRadius: 40,
    elevation: 8, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
    lineHeight: 70, // Added to center the '+' vertically
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
