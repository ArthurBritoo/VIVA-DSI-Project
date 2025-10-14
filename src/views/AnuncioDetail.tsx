import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomNav from '../components/BottomNav';
import Header from "../components/Header";


const { width } = Dimensions.get('window');

// Define a RootStackParamList type para navegação
type RootStackParamList = {
  Home: undefined;
  Buscar: undefined;
  Perfil: undefined;
  AnuncioDetail: { anuncioId: string }; // Exemplo: esperando um ID de anúncio
  // Adicione outras rotas conforme necessário
};

type AnuncioDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnuncioDetail'>;
type AnuncioDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AnuncioDetail'>;

interface AnuncioDetailProps {
  route: AnuncioDetailScreenRouteProp;
  navigation: AnuncioDetailScreenNavigationProp;
}

// Dados mockados para simular um anúncio
const mockAnuncio = {
  id: "1",
  titulo: "Apartamento Moderno no Centro",
  descricao: "Este deslumbrante apartamento de 2 quartos e 2 banheiros apresenta um design moderno com uma planta aberta, cozinha gourmet e um espaçoso quintal. Aceita animais de estimação e está localizado em um bairro desejável.",
  preco: "$1,200,000",
  endereco: "234 Elm Street, Anytown, CA",
  caracteristicas: ["2 Beds", "2 Baths", "Pet Friendly"],
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuKRMH2yrXA8R5dhstzuxT0UaiZ_AhmuIGmNDGIIcghNLMTKIupyIZh6L3SJ-_iuGBgZ9mXKrCu0FFt4EJwSX-9GReQ4J8c6SviZMVetQhu_6US0oU07iQ5zVfbY5cDsKJiV1n34ChHlMXjozay-X1qRBG_gp9DodDDzAhooH_GvZDtdCbrc9WQG_Rf1XFD4UKrjLGcNvt275fjEjRGES6xqdqMrdY9y_sifWTz_ktMAgQBiHc4yaDIpqccAeVgLj5Tu0kbiEFPc4",
  mapImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLL02BYUuUzkcAjxCexivrvKvMYZAFj0YzuEnuNxWCfrxEDnjjrNZisOVtC9eEzJquuFt0VqH1h7q40QDKRMGI7chl6A_nFLdWWG2tyZlrn8XGV1omUMKpJU7bsHa8yX3yMC1IWxPYOo9G_exKoO8gRcUesUYGa9_2DjuGe6RZEgexzAYtBI4Z2q4aEmtSClqz4KQiEyA2qSK_cX4W8Y81wyXaivHxfg_24sCKlROIa8zJDBY1SDb-bvyllsnUPfnjlkcKCjKX-eh4",
};

export default function AnuncioDetail({ route }: AnuncioDetailProps) {
  const navigation = useNavigation<AnuncioDetailScreenNavigationProp>();
  // const { anuncioId } = route.params; // No futuro, usaria isso para buscar dados reais

  // Você buscaria os dados reais do anúncio aqui usando anuncioId
  const anuncio = mockAnuncio;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Detalhe do anúncio" onMenuPress={() => {}} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageGallery}>
          <Image source={{ uri: anuncio.imageUrl }} style={styles.mainImage} />
          {/* Indicadores de slide (pontos) - Simplificado por enquanto */}
          <View style={styles.paginationContainer}>
            <View style={styles.paginationDotActive}></View>
            <View style={styles.paginationDot}></View>
            <View style={styles.paginationDot}></View>
            <View style={styles.paginationDot}></View>
            <View style={styles.paginationDot}></View>
          </View>
        </View>

        <View style={styles.contentPadding}>
          <View style={styles.infoCard}>
            <Text style={styles.priceText}>{anuncio.preco}</Text>
            <Text style={styles.addressText}>{anuncio.endereco}</Text>
            <View style={styles.featuresContainer}>
              {anuncio.caracteristicas.map((carac, index) => (
                <View key={index} style={styles.featurePill}>
                  <Text style={styles.featureText}>{carac}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.descriptionText}>{anuncio.descricao}</Text>
          </View>

          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <Image source={{ uri: anuncio.mapImageUrl }} style={styles.mapImage} />
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7f8", // background-light
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f6f7f8", // bg-background-light/80
    // Em React Native, backdrop-blur-sm não é direto, precisaria de uma lib ou opacidade manual.
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // rounded-full
    backgroundColor: "#f6f7f8", // bg-background-light
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24, // material-symbols-outlined default size
    color: "#000", // text-black
    fontFamily: "Material Symbols Outlined", // Se você tiver a fonte instalada
  },
  imageGallery: {
    position: "relative",
    height: 320, // h-80 (80 * 4 = 320px)
    width: "100%",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8, // gap-2 (tailwind)
  },
  paginationDot: {
    width: 24, // w-6 (6 * 4 = 24px)
    height: 6, // h-1.5 (1.5 * 4 = 6px)
    borderRadius: 3, // rounded-full
    backgroundColor: "rgba(255,255,255,0.5)", // bg-white/50
  },
  paginationDotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff", // bg-white
  },
  contentPadding: {
    padding: 16,
  },
  infoCard: {
    borderRadius: 12, // rounded-xl
    backgroundColor: "#fff", // bg-background-light (assuming white for card in light mode)
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, // shadow-sm
  },
  priceText: {
    fontSize: 28, // text-3xl
    fontWeight: "bold",
    color: "#000", // text-black
  },
  addressText: {
    marginTop: 4,
    fontSize: 16, // text-base
    color: "#4b5563", // gray-600
  },
  featuresContainer: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // gap-2
  },
  featurePill: {
    borderRadius: 9999, // rounded-full
    backgroundColor: "rgba(19, 127, 236, 0.1)", // bg-primary/10
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
  },
  featureText: {
    fontSize: 14, // text-sm
    fontWeight: "500", // font-medium
    color: "#137fec", // text-primary
  },
  descriptionText: {
    marginTop: 16,
    fontSize: 16, // text-base
    color: "#374151", // gray-700
  },
  locationCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, // shadow-sm
  },
  locationTitle: {
    fontSize: 20, // text-xl
    fontWeight: "bold",
    color: "#000", // text-black
  },
  mapContainer: {
    marginTop: 12,
    aspectRatio: 16 / 9, // aspect-video
    width: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8, // rounded-lg
    resizeMode: "cover",
  },
  // BottomNav estilos já devem vir do componente
});
